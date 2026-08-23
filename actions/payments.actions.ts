"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Payment } from "@/models/Payment";
import { Client } from "@/models/Client";
import { User } from "@/models/User";
import { Tariff } from "@/models/Tariff";
import { AuditLog } from "@/models/AuditLog";
import { getSession } from "@/lib/auth";
import { generateReceiptNumber } from "@/lib/sequence-number";
import { getPaymentSummaryForClient } from "@/lib/payment-summary";
import type { PaymentMethod } from "@/lib/enums";

export type PaymentFilters = {
  search?: string;
  paymentMethod?: string;
  status?: string;
};

export async function getPayments(filters: PaymentFilters = {}) {
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
  if (filters.paymentMethod && filters.paymentMethod !== "all") query.paymentMethod = filters.paymentMethod;
  if (filters.status && filters.status !== "all") query.status = filters.status;

  const payments = await Payment.find(query).sort({ createdAt: -1 }).lean();

  const clientIds = [...new Set(payments.map((p) => String(p.clientId)))];
  const creatorIds = [...new Set(payments.map((p) => String(p.createdBy)))];
  const [clients, creators] = await Promise.all([
    Client.find({ _id: { $in: clientIds } }).lean(),
    User.find({ _id: { $in: creatorIds } }).lean(),
  ]);
  const clientMap = new Map(clients.map((c) => [String(c._id), c]));
  const creatorMap = new Map(creators.map((u) => [String(u._id), u]));
  const tariffIds = [...new Set(clients.map((c) => String(c.tariffId)))];
  const tariffs = await Tariff.find({ _id: { $in: tariffIds } }).lean();
  const tariffMap = new Map(tariffs.map((t) => [String(t._id), t]));

  let enriched = payments.map((p) => {
    const client = clientMap.get(String(p.clientId));
    const tariff = client ? tariffMap.get(String(client.tariffId)) : null;
    return {
      ...p,
      _id: String(p._id),
      client: client
        ? {
            _id: String(client._id),
            fullName: client.fullName,
            phone: client.phone,
            pin: client.pin,
            tariffName: tariff?.name ?? "Standart",
          }
        : null,
      createdByUser: creatorMap.get(String(p.createdBy))
        ? { name: creatorMap.get(String(p.createdBy))!.name }
        : null,
    };
  });

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    enriched = enriched.filter(
      (p) =>
        p.receiptNumber.toLowerCase().includes(q) ||
        p.client?.fullName.toLowerCase().includes(q) ||
        p.client?.pin.includes(q)
    );
  }

  return enriched;
}

/** PIN orqali mijoz va to'liq moliyaviy tarixni topish (kassir uchun tez qidiruv) */
export async function getClientByPinWithLedger(pin: string) {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");
  if (!pin || pin.trim().length !== 6) throw new Error("PIN 6 xonali raqam bo'lishi kerak");

  await connectDB();
  const client = await Client.findOne({ pin: pin.trim() }).lean();
  if (!client) throw new Error(`PIN: ${pin} bo'yicha hech qanday mijoz topilmadi`);

  if (session.role === "consultant" && String(client.assignedTo) !== session.id) {
    throw new Error("Ruxsat yo'q. Bu PIN boshqa konsultantga biriktirilgan mijozga tegishli.");
  }

  const [tariff, consultant, summary, payments] = await Promise.all([
    Tariff.findById(client.tariffId).lean(),
    User.findById(client.assignedTo).lean(),
    getPaymentSummaryForClient(String(client._id)),
    Payment.find({ clientId: client._id }).sort({ createdAt: -1 }).lean(),
  ]);

  return {
    client: {
      _id: String(client._id),
      fullName: client.fullName,
      phone: client.phone,
      email: client.email,
      pin: client.pin,
      profileCompletionPercent: client.profileCompletionPercent,
      tariff: tariff ? { name: tariff.name, price: tariff.price } : null,
      assignedToUser: consultant ? { name: consultant.name } : null,
    },
    summary,
    payments: payments.map((p) => ({
      _id: String(p._id),
      receiptNumber: p.receiptNumber,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      status: p.status,
      note: p.note ?? "",
      createdAt: p.createdAt.toISOString(),
    })),
  };
}

const createPaymentSchema = z.object({
  clientId: z.string().min(1),
  amount: z.coerce.number().positive("To'lov summasi musbat bo'lishi kerak"),
  paymentMethod: z.enum(["naqd", "karta", "bank_otkazma", "payme", "click", "boshqa"]),
  note: z.string().optional(),
});

export type PaymentFormState = { error?: string; success?: boolean; receiptNumber?: string; paymentId?: string };

export async function createPaymentAction(
  _prev: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const session = await getSession();
  if (!session) return { error: "Sessiya tugagan, qayta kiring" };

  const parsed = createPaymentSchema.safeParse({
    clientId: formData.get("clientId"),
    amount: formData.get("amount"),
    paymentMethod: formData.get("paymentMethod") || "naqd",
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  await connectDB();
  const client = await Client.findById(parsed.data.clientId).lean();
  if (!client) return { error: "Mijoz topilmadi" };

  if (session.role === "consultant" && String(client.assignedTo) !== session.id) {
    return { error: "Ruxsat yo'q. Konsultant faqat o'z mijoziga to'lov qabul qila oladi." };
  }

  const receiptNumber = await generateReceiptNumber();
  const payment = await Payment.create({
    clientId: parsed.data.clientId,
    amount: parsed.data.amount,
    paymentMethod: parsed.data.paymentMethod as PaymentMethod,
    status: "tasdiqlangan",
    receiptNumber,
    pin: client.pin,
    createdBy: session.id,
    note: parsed.data.note ?? "",
  });

  await AuditLog.create({
    action: "payment.create",
    actionTitle: "To'lov qabul qilindi",
    category: "payment",
    severity: "info",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "Payment", id: String(payment._id), name: receiptNumber },
    details: `${client.fullName} — ${parsed.data.amount.toLocaleString("uz-UZ")} so'm (${receiptNumber})`,
  });

  revalidatePath("/payments");
  revalidatePath(`/clients/${client._id}`);
  return { success: true, receiptNumber, paymentId: String(payment._id) };
}

export async function getReceiptData(paymentId: string) {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");

  await connectDB();
  const payment = await Payment.findById(paymentId).lean();
  if (!payment) throw new Error("To'lov hujjati topilmadi");

  const client = await Client.findById(payment.clientId).lean();
  if (!client) throw new Error("Mijoz ma'lumotlari topilmadi");

  if (session.role === "consultant" && String(client.assignedTo) !== session.id) {
    throw new Error("Ruxsat yo'q. Chekni ko'rish imkoniyati yo'q.");
  }

  const [tariff, summary, cashier] = await Promise.all([
    Tariff.findById(client.tariffId).lean(),
    getPaymentSummaryForClient(String(client._id)),
    User.findById(payment.createdBy).lean(),
  ]);

  return {
    receiptNumber: payment.receiptNumber,
    date: payment.createdAt,
    clientName: client.fullName,
    clientPin: client.pin,
    clientPhone: client.phone,
    tariffName: tariff?.name ?? "Standart",
    tariffPrice: tariff?.price ?? 0,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    totalPaid: summary.totalPaid,
    remainingDebt: summary.remainingDebt,
    paymentStatus: summary.paymentStatus,
    cashierName: cashier?.name ?? session.fullName,
    note: payment.note ?? "",
  };
}
