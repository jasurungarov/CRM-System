"use server";

import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { Tariff } from "@/models/Tariff";
import { User } from "@/models/User";
import { ClientConfirmation } from "@/models/ClientConfirmation";
import { AuditLog } from "@/models/AuditLog";
import { getSession } from "@/lib/auth";
import { generateContractNumber } from "@/lib/sequence-number";
import { getPaymentSummaryForClient } from "@/lib/payment-summary";
import { sendTelegramMessage } from "@/lib/telegram";

const EXPIRY_DAYS = 14;

function getAppUrl(): string {
  return process.env.APP_URL || "http://localhost:3000";
}

export type ConfirmationFormState = { error?: string; success?: boolean; confirmationUrl?: string };

export async function createConfirmationAction(
  _prev: ConfirmationFormState,
  formData: FormData
): Promise<ConfirmationFormState> {
  const session = await getSession();
  if (!session) return { error: "Sessiya tugagan, qayta kiring" };

  const clientId = formData.get("clientId") as string;
  const notes = (formData.get("notes") as string) || undefined;
  const telegramChatId = (formData.get("telegramChatId") as string) || undefined;

  if (!clientId) return { error: "Mijoz aniqlanmadi" };

  await connectDB();
  const client = await Client.findById(clientId).lean();
  if (!client) return { error: "Mijoz topilmadi" };
  if (session.role === "consultant" && String(client.assignedTo) !== session.id) {
    return { error: "Ruxsat yo'q. Faqat o'zingizga biriktirilgan mijozga shartnoma yubora olasiz." };
  }

  const [tariff, consultant, summary] = await Promise.all([
    Tariff.findById(client.tariffId).lean(),
    User.findById(client.assignedTo).lean(),
    getPaymentSummaryForClient(clientId),
  ]);
  if (!tariff) return { error: "Mijozga biriktirilgan tarif topilmadi" };

  const token = randomBytes(24).toString("hex");
  const contractNumber = await generateContractNumber();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const confirmation = await ClientConfirmation.create({
    contractNumber,
    clientId,
    token,
    status: "yuborildi",
    sentAt: now,
    expiresAt,
    createdBy: session.id,
    notes,
    telegramChatId,
    clientData: {
      fullName: client.fullName,
      phone: client.phone,
      email: client.email,
      pin: client.pin,
      tariffName: tariff.name,
      tariffPrice: tariff.price,
      totalPaid: summary.totalPaid,
      remainingDebt: summary.remainingDebt,
      assignedConsultantName: consultant ? `${consultant.name} (${consultant.role})` : "Ansor Edu Konsultant",
      universities: client.universities.map((u) => ({
        name: u.universityName,
        program: u.program,
        deadline: u.submissionDeadline,
      })),
    },
  });

  const confirmationUrl = `${getAppUrl()}/confirm/${token}`;

  if (telegramChatId) {
    const message =
      `Assalomu alaykum, ${client.fullName}!\n\n` +
      `Ansor Edu Consulting sizga rasmiy shartnoma-tasdiqnoma yubordi.\n` +
      `Shartnoma raqami: ${contractNumber}\n\n` +
      `Iltimos, quyidagi havola orqali shartnoma bilan tanishib, tasdiqlang:\n${confirmationUrl}\n\n` +
      `Havola ${EXPIRY_DAYS} kun amal qiladi.`;
    const result = await sendTelegramMessage(telegramChatId, message);
    if (result.ok) {
      confirmation.telegramSentAt = new Date();
      await confirmation.save();
    }
  }

  await AuditLog.create({
    action: "confirmation.create",
    actionTitle: "Shartnoma-tasdiqnoma yuborildi",
    category: "confirmation",
    severity: "info",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "Client", id: clientId, name: client.fullName },
    details: `${contractNumber} yaratildi (${client.fullName})`,
  });

  revalidatePath("/confirmations");
  return { success: true, confirmationUrl };
}

export async function getConfirmations() {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");

  await connectDB();

  let clientIdFilter: string[] | undefined;
  if (session.role === "consultant") {
    const myClients = await Client.find({ assignedTo: session.id }).select("_id").lean();
    clientIdFilter = myClients.map((c) => String(c._id));
  }

  const query: Record<string, unknown> = {};
  if (clientIdFilter) query.clientId = { $in: clientIdFilter };

  const confirmations = await ClientConfirmation.find(query).sort({ sentAt: -1 }).lean();

  // Muddati o'tganlarni belgilash (real-vaqtda hisoblanadi, saqlanган status
  // faqat foydalanuvchi qayta kirganda "muddati_otgan"ga yangilanadi)
  const now = Date.now();
  return confirmations.map((c) => ({
    _id: String(c._id),
    contractNumber: c.contractNumber,
    status: c.status,
    sentAt: c.sentAt.toISOString(),
    expiresAt: c.expiresAt.toISOString(),
    confirmedAt: c.confirmedAt ? c.confirmedAt.toISOString() : null,
    clientAcceptedName: c.clientAcceptedName ?? null,
    telegramChatId: c.telegramChatId ?? null,
    notes: c.notes ?? null,
    clientData: c.clientData,
    isExpiredNow: c.status === "yuborildi" && new Date(c.expiresAt).getTime() < now,
  }));
}

export async function cancelConfirmationAction(confirmationId: string) {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");

  await connectDB();
  const confirmation = await ClientConfirmation.findById(confirmationId);
  if (!confirmation) throw new Error("Tasdiqnoma topilmadi");

  if (confirmation.status === "tasdiqlandi") {
    throw new Error("Allaqachon tasdiqlangan shartnomani bekor qilib bo'lmaydi");
  }

  confirmation.status = "bekor_qilingan";
  await confirmation.save();

  await AuditLog.create({
    action: "confirmation.cancel",
    actionTitle: "Shartnoma bekor qilindi",
    category: "confirmation",
    severity: "warning",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "ClientConfirmation", id: confirmationId, name: confirmation.contractNumber },
    details: `${confirmation.contractNumber} bekor qilindi`,
  });

  revalidatePath("/confirmations");
  return { success: true };
}

export async function resendTelegramAction(confirmationId: string) {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");

  await connectDB();
  const confirmation = await ClientConfirmation.findById(confirmationId);
  if (!confirmation) throw new Error("Tasdiqnoma topilmadi");
  if (!confirmation.telegramChatId) {
    throw new Error("Bu tasdiqnoma uchun Telegram Chat ID kiritilmagan");
  }

  const confirmationUrl = `${getAppUrl()}/confirm/${confirmation.token}`;
  const message =
    `Eslatma: shartnoma-tasdiqnomangiz hali tasdiqlanmagan.\n` +
    `Shartnoma raqami: ${confirmation.contractNumber}\n\n${confirmationUrl}`;
  const result = await sendTelegramMessage(confirmation.telegramChatId, message);
  if (!result.ok) throw new Error(result.error || "Telegram orqali yuborib bo'lmadi");

  confirmation.telegramSentAt = new Date();
  await confirmation.save();
  return { success: true };
}

// ==================== PUBLIC (mijoz uchun, auth talab qilinmaydi) ====================

export async function getConfirmationByToken(token: string) {
  await connectDB();
  const confirmation = await ClientConfirmation.findOne({ token }).lean();
  if (!confirmation) return null;

  if (confirmation.status === "yuborildi" && new Date(confirmation.expiresAt).getTime() < Date.now()) {
    await ClientConfirmation.updateOne({ token }, { status: "muddati_otgan" });
    confirmation.status = "muddati_otgan";
  }

  return { ...confirmation, _id: String(confirmation._id) };
}

export type AcceptFormState = { error?: string; success?: boolean };

export async function acceptConfirmationAction(
  token: string,
  _prev: AcceptFormState,
  formData: FormData
): Promise<AcceptFormState> {
  const clientAcceptedName = (formData.get("clientAcceptedName") as string)?.trim();
  if (!clientAcceptedName || clientAcceptedName.length < 3) {
    return { error: "Iltimos, tasdiqlash uchun to'liq Familiya, Ism va Otangizning ismini kiriting." };
  }

  await connectDB();
  const confirmation = await ClientConfirmation.findOne({ token });
  if (!confirmation) return { error: "Tasdiqnoma havolasi topilmadi" };

  if (confirmation.status === "tasdiqlandi") {
    return { success: true };
  }
  if (confirmation.status === "muddati_otgan" || new Date(confirmation.expiresAt).getTime() < Date.now()) {
    confirmation.status = "muddati_otgan";
    await confirmation.save();
    return { error: "Ushbu shartnoma-tasdiqnomaning amal qilish muddati tugagan. Konsultantingizdan yangi havola so'rang." };
  }
  if (confirmation.status === "bekor_qilingan") {
    return { error: "Ushbu shartnoma bekor qilingan." };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "noma'lum";
  const userAgent = headerList.get("user-agent") || "noma'lum";

  confirmation.status = "tasdiqlandi";
  confirmation.confirmedAt = new Date();
  confirmation.clientAcceptedName = clientAcceptedName;
  confirmation.clientIp = ip;
  confirmation.clientUserAgent = userAgent;
  confirmation.termsAccepted = {
    serviceScopeAccepted: true,
    paymentObligationsAccepted: true,
    refundPolicyAccepted: true,
    dataProcessingAccepted: true,
  };
  await confirmation.save();

  await AuditLog.create({
    action: "confirmation.accept",
    actionTitle: "Mijoz shartnomani tasdiqladi",
    category: "confirmation",
    severity: "info",
    performedBy: {
      userId: confirmation.createdBy,
      name: clientAcceptedName,
      email: confirmation.clientData.email,
      role: "consultant",
    },
    targetResource: { type: "ClientConfirmation", id: String(confirmation._id), name: confirmation.contractNumber },
    details: `${clientAcceptedName} tomonidan ${confirmation.contractNumber} elektron tasdiqlandi (IP: ${ip})`,
  });

  return { success: true };
}
