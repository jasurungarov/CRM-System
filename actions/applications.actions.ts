"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { AuditLog } from "@/models/AuditLog";
import { getSession, requireRole } from "@/lib/auth";
import { getPaymentSummaryForClient } from "@/lib/payment-summary";
import { calculateProfileCompletion } from "@/lib/profile-completion";
import { SAUDI_UNIVERSITIES_CATALOG } from "@/lib/data/saudi-universities";
import type { ApplicationStatus, FailureReason } from "@/lib/enums";

export async function getSaudiUniversitiesCatalog() {
  return SAUDI_UNIVERSITIES_CATALOG;
}

type UrgencyLevel = "expired" | "urgent" | "warning" | "normal";

function computeUrgency(deadline: Date): { daysLeft: number; urgency: UrgencyLevel } {
  const diffMs = deadline.getTime() - Date.now();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  let urgency: UrgencyLevel = "normal";
  if (daysLeft < 0) urgency = "expired";
  else if (daysLeft <= 3) urgency = "urgent";
  else if (daysLeft <= 7) urgency = "warning";
  return { daysLeft, urgency };
}

export type ApplicationFilters = {
  search?: string;
  status?: string;
  urgency?: string;
  refundOnly?: boolean;
};

/**
 * Barcha mijozlarning universitet arizalarini "yassi" (flat) ro'yxat
 * ko'rinishida qaytaradi — har bir ariza o'ziga tegishli mijoz ma'lumoti
 * bilan birga (dashboard/jadval uchun qulay).
 */
export async function getApplications(filters: ApplicationFilters = {}) {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");

  await connectDB();
  const query: Record<string, unknown> = {};
  if (session.role === "consultant") query.assignedTo = session.id;

  const clients = await Client.find(query).populate("tariffId").lean();

  type FlatApp = {
    applicationId: string;
    universityName: string;
    country: string;
    program: string;
    submissionDeadline: Date;
    submissionStatus: ApplicationStatus;
    failureReason: FailureReason;
    refundEligible: boolean;
    refund?: unknown;
    daysLeft: number;
    urgency: UrgencyLevel;
    client: { _id: string; fullName: string; phone: string; pin: string; assignedTo: string };
  };

  let applications: FlatApp[] = [];
  for (const c of clients) {
    for (const uni of c.universities) {
      const { daysLeft, urgency } = computeUrgency(new Date(uni.submissionDeadline));
      applications.push({
        applicationId: String(uni._id),
        universityName: uni.universityName,
        country: uni.country,
        program: uni.program,
        submissionDeadline: uni.submissionDeadline,
        submissionStatus: uni.submissionStatus as ApplicationStatus,
        failureReason: uni.failureReason as FailureReason,
        refundEligible: uni.refundEligible,
        refund: uni.refund,
        daysLeft,
        urgency,
        client: {
          _id: String(c._id),
          fullName: c.fullName,
          phone: c.phone,
          pin: c.pin,
          assignedTo: String(c.assignedTo),
        },
      });
    }
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    applications = applications.filter(
      (a) =>
        a.client.fullName.toLowerCase().includes(q) ||
        a.client.pin.includes(q) ||
        a.universityName.toLowerCase().includes(q) ||
        a.program.toLowerCase().includes(q)
    );
  }
  if (filters.status && filters.status !== "all") {
    applications = applications.filter((a) => a.submissionStatus === filters.status);
  }
  if (filters.urgency && filters.urgency !== "all") {
    applications = applications.filter((a) => a.urgency === filters.urgency);
  }
  if (filters.refundOnly) {
    applications = applications.filter((a) => a.refundEligible);
  }

  return applications.sort((a, b) => a.daysLeft - b.daysLeft);
}

export async function getApplicationStats() {
  const applications = await getApplications();
  return {
    total: applications.length,
    notSubmitted: applications.filter((a) => a.submissionStatus === "topshirilmagan").length,
    submitted: applications.filter((a) => a.submissionStatus === "topshirilgan").length,
    accepted: applications.filter((a) => a.submissionStatus === "qabul_qilindi").length,
    rejected: applications.filter((a) => a.submissionStatus === "rad_etildi").length,
    refundEligible: applications.filter((a) => a.refundEligible).length,
    urgentDeadlines: applications.filter((a) => a.urgency === "urgent" || a.urgency === "warning").length,
    expiredDeadlines: applications.filter((a) => a.urgency === "expired").length,
  };
}

const addApplicationSchema = z.object({
  clientId: z.string().min(1),
  universityName: z.string().min(2, "Universitet nomi kiritilishi shart"),
  country: z.string().optional(),
  program: z.string().min(2, "Yo'nalish kiritilishi shart"),
  submissionDeadline: z.string().min(1, "Muddat (deadline) kiritilishi shart"),
});

export type ApplicationFormState = { error?: string; success?: boolean };

export async function addUniversityApplicationAction(
  _prev: ApplicationFormState,
  formData: FormData
): Promise<ApplicationFormState> {
  const session = await getSession();
  if (!session) return { error: "Sessiya tugagan, qayta kiring" };

  const parsed = addApplicationSchema.safeParse({
    clientId: formData.get("clientId"),
    universityName: formData.get("universityName"),
    country: formData.get("country") || "Saudi Arabia",
    program: formData.get("program"),
    submissionDeadline: formData.get("submissionDeadline"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  await connectDB();
  const client = await Client.findById(parsed.data.clientId);
  if (!client) return { error: "Mijoz topilmadi" };
  if (session.role === "consultant" && String(client.assignedTo) !== session.id) {
    return { error: "Ruxsat yo'q. Faqat o'zingizga biriktirilgan mijozga ariza qo'shishingiz mumkin." };
  }

  client.universities.push({
    universityName: parsed.data.universityName,
    country: parsed.data.country || "Saudi Arabia",
    program: parsed.data.program,
    submissionDeadline: new Date(parsed.data.submissionDeadline),
    submissionStatus: "topshirilmagan",
    failureReason: null,
    refundEligible: false,
    deadlineWarningSent: false,
  } as never);
  client.profileCompletionPercent = calculateProfileCompletion(client);
  await client.save();

  await AuditLog.create({
    action: "application.create",
    actionTitle: "Universitet arizasi qo'shildi",
    category: "application",
    severity: "info",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "Client", id: String(client._id), name: client.fullName },
    details: `${parsed.data.universityName} (${parsed.data.program}) qo'shildi`,
  });

  revalidatePath("/applications");
  revalidatePath(`/clients/${client._id}`);
  return { success: true };
}

const VALID_STATUSES: ApplicationStatus[] = [
  "topshirilmagan",
  "topshirilgan",
  "rad_etildi",
  "qabul_qilindi",
];

export async function updateApplicationStatusAction(
  clientId: string,
  universityId: string,
  status: ApplicationStatus,
  failureReason: FailureReason,
  note?: string
) {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");
  if (!VALID_STATUSES.includes(status)) throw new Error("Noto'g'ri status");

  await connectDB();
  const client = await Client.findById(clientId);
  if (!client) throw new Error("Mijoz topilmadi");
  if (session.role === "consultant" && String(client.assignedTo) !== session.id) {
    throw new Error("Ruxsat yo'q. Faqat o'z mijozingiz arizasi holatini o'zgartira olasiz.");
  }

  const uni = client.universities.id(universityId);
  if (!uni) throw new Error("Ariza topilmadi");

  const prevStatus = uni.submissionStatus;
  uni.submissionStatus = status;
  uni.failureReason = failureReason;
  // Biznes qoidasi: rad etilish sababi "menejer_aybi" bo'lsa — avtomatik refund huquqi beriladi
  uni.refundEligible = failureReason === "menejer_aybi";
  await client.save();

  await AuditLog.create({
    action: "application.status_change",
    actionTitle: "Ariza holati o'zgartirildi",
    category: "application",
    severity: uni.refundEligible ? "warning" : "info",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "Client", id: String(client._id), name: client.fullName },
    details: `${uni.universityName}: "${prevStatus}" → "${status}"${note ? ` — ${note}` : ""}${
      uni.refundEligible ? " (avtomatik refund huquqi berildi)" : ""
    }`,
    changes: [{ field: "submissionStatus", oldValue: prevStatus, newValue: status }],
  });

  revalidatePath("/applications");
  revalidatePath(`/clients/${clientId}`);
  return { success: true, refundEligible: uni.refundEligible };
}

export async function processRefundAction(
  clientId: string,
  universityId: string,
  refundedAmount: number,
  note?: string
) {
  // Faqat Admin va Menejer refundni tasdiqlay oladi
  const session = await requireRole(["admin", "manager"]);
  if (!refundedAmount || refundedAmount <= 0) {
    throw new Error("Qaytariladigan to'g'ri summa ko'rsatilishi shart");
  }

  await connectDB();
  const client = await Client.findById(clientId);
  if (!client) throw new Error("Mijoz topilmadi");

  const summary = await getPaymentSummaryForClient(clientId);
  if (refundedAmount > summary.totalPaid) {
    throw new Error(
      `Qaytariladigan summa (${refundedAmount.toLocaleString("uz-UZ")} UZS) mijozning jami to'lagan summasidan (${summary.totalPaid.toLocaleString("uz-UZ")} UZS) oshib ketishi mumkin emas.`
    );
  }

  const uni = client.universities.id(universityId);
  if (!uni) throw new Error("Ariza topilmadi");
  if (!uni.refundEligible) throw new Error("Bu ariza refund uchun mos emas");

  uni.refund = {
    isRefunded: true,
    refundedAmount,
    refundedBy: session.id as never,
    refundedAt: new Date(),
    note,
  };
  await client.save();

  await AuditLog.create({
    action: "application.refund",
    actionTitle: "Refund amalga oshirildi",
    category: "application",
    severity: "warning",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "Client", id: String(client._id), name: client.fullName },
    details: `${uni.universityName} bo'yicha ${refundedAmount.toLocaleString("uz-UZ")} UZS qaytarildi${note ? ` — ${note}` : ""}`,
  });

  revalidatePath("/applications");
  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

export async function removeUniversityApplicationAction(clientId: string, universityId: string) {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");

  await connectDB();
  const client = await Client.findById(clientId);
  if (!client) throw new Error("Mijoz topilmadi");
  if (session.role === "consultant" && String(client.assignedTo) !== session.id) {
    throw new Error("Ruxsat yo'q. Faqat o'zingizga biriktirilgan mijoz arizasini o'chira olasiz.");
  }

  const uni = client.universities.id(universityId);
  if (!uni) throw new Error("Ariza topilmadi");
  const uniName = uni.universityName;
  uni.deleteOne();
  await client.save();

  await AuditLog.create({
    action: "application.delete",
    actionTitle: "Universitet arizasi o'chirildi",
    category: "application",
    severity: "info",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "Client", id: String(client._id), name: client.fullName },
    details: `${uniName} o'chirildi`,
  });

  revalidatePath("/applications");
  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}
