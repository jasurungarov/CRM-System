"use server";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import type { EducationLevel, LeadStatus } from "@/lib/enums";
import { generateUniquePin } from "@/lib/pin";
import { calculateProfileCompletion } from "@/lib/profile-completion";
import { AuditLog } from "@/models/AuditLog";
import { Client } from "@/models/Client";
import { Lead } from "@/models/Lead";
import { User } from "@/models/User";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type LeadFilters = {
  search?: string;
  status?: string;
};

export async function getLeads(filters: LeadFilters = {}) {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");

  await connectDB();
  const query: Record<string, unknown> = {};
  if (session.role === "consultant") query.assignedTo = session.id;
  if (filters.status && filters.status !== "all") query.status = filters.status;
  if (filters.search?.trim()) {
    const regex = new RegExp(filters.search.trim(), "i");
    query.$or = [{ fullName: regex }, { phone: regex }];
  }

  const leads = await Lead.find(query).sort({ createdAt: -1 }).lean();
  const consultantIds = [...new Set(leads.map((l) => String(l.assignedTo)))];
  const consultants = await User.find({ _id: { $in: consultantIds } }).lean();
  const consultantMap = new Map(
    consultants.map((u) => [String(u._id), u.name]),
  );

  return leads.map((l) => ({
    _id: String(l._id),
    fullName: l.fullName,
    phone: l.phone,
    telegramUsername: l.telegramUsername ?? null,
    telegramPhone: l.telegramPhone ?? null,
    country: l.country,
    direction: l.direction,
    educationLevel: l.educationLevel,
    educationLevelOther: l.educationLevelOther ?? null,
    status: l.status,
    objection: l.objection ?? null,
    lastResult: l.lastResult ?? null,
    nextContactDate: l.nextContactDate ? l.nextContactDate.toISOString() : null,
    assignedToName: consultantMap.get(String(l.assignedTo)) ?? "—",
    convertedToClientId: l.convertedToClientId
      ? String(l.convertedToClientId)
      : null,
    createdAt: l.createdAt.toISOString(),
  }));
}

export async function getLeadStats() {
  const leads = await getLeads();
  return {
    total: leads.length,
    yangi: leads.filter((l) => l.status === "yangi").length,
    boglanildi: leads.filter((l) => l.status === "boglanildi").length,
    qiziqmoqda: leads.filter((l) => l.status === "qiziqmoqda").length,
    tayyor: leads.filter((l) => l.status === "tayyor").length,
    rad_etdi: leads.filter((l) => l.status === "rad_etdi").length,
  };
}

const createLeadSchema = z.object({
  fullName: z.string().min(3, "Ism kamida 3 belgidan iborat bo'lishi kerak"),
  phone: z.string().min(7, "Telefon raqami noto'g'ri"),
  telegramUsername: z.string().optional(),
  telegramPhone: z.string().optional(),
  country: z.string().optional(),
  direction: z.string().optional(),
  educationLevel: z.enum([
    "maktab_bitiruvchisi",
    "kollej_litsey",
    "bakalavriat",
    "magistratura",
    "boshqa",
  ]),
  educationLevelOther: z.string().optional(),
});

export type LeadFormState = { error?: string; success?: boolean };

export async function createLeadAction(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const session = await getSession();
  if (!session) return { error: "Sessiya tugagan, qayta kiring" };

  const telegramUsername = (formData.get("telegramUsername") as string) || "";
  const telegramPhone = (formData.get("telegramPhone") as string) || "";
  if (!telegramUsername.trim() && !telegramPhone.trim()) {
    return {
      error:
        "Telegram username yoki Telegram raqamdan kamida bittasi kiritilishi shart",
    };
  }

  const parsed = createLeadSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    telegramUsername,
    telegramPhone,
    country: formData.get("country") || "",
    direction: formData.get("direction") || "",
    educationLevel: formData.get("educationLevel") || "boshqa",
    educationLevelOther: formData.get("educationLevelOther") || "",
  });
  if (!parsed.success)
    return {
      error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri",
    };

  await connectDB();
  const lead = await Lead.create({
    fullName: parsed.data.fullName.trim(),
    phone: parsed.data.phone.trim(),
    telegramUsername: parsed.data.telegramUsername?.trim() || undefined,
    telegramPhone: parsed.data.telegramPhone?.trim() || undefined,
    country: parsed.data.country?.trim() || "",
    direction: parsed.data.direction?.trim() || "",
    educationLevel: parsed.data.educationLevel as EducationLevel,
    educationLevelOther: parsed.data.educationLevelOther?.trim() || undefined,
    assignedTo: session.id,
    createdBy: session.id,
  });

  await AuditLog.create({
    action: "lead.create",
    actionTitle: "Yangi lid qo'shildi",
    category: "client",
    severity: "info",
    performedBy: {
      userId: session.id,
      name: session.fullName,
      email: session.email,
      role: session.role,
    },
    targetResource: { type: "Lead", id: String(lead._id), name: lead.fullName },
    details: `${lead.fullName} SRM'ga qo'shildi`,
  });

  revalidatePath("/leads");
  return { success: true };
}

const updateLeadSchema = z.object({
  leadId: z.string().min(1),
  status: z.enum(["yangi", "boglanildi", "qiziqmoqda", "tayyor", "rad_etdi"]),
  objection: z.string().optional(),
  lastResult: z.string().optional(),
  nextContactDate: z.string().optional(),
});

export async function updateLeadAction(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const session = await getSession();
  if (!session) return { error: "Sessiya tugagan, qayta kiring" };

  const parsed = updateLeadSchema.safeParse({
    leadId: formData.get("leadId"),
    status: formData.get("status"),
    objection: formData.get("objection") || "",
    lastResult: formData.get("lastResult") || "",
    nextContactDate: formData.get("nextContactDate") || "",
  });
  if (!parsed.success)
    return {
      error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri",
    };

  await connectDB();
  const lead = await Lead.findById(parsed.data.leadId);
  if (!lead) return { error: "Lid topilmadi" };
  if (session.role === "consultant" && String(lead.assignedTo) !== session.id) {
    return {
      error:
        "Ruxsat yo'q. Faqat o'zingizga biriktirilgan lidni yangilay olasiz.",
    };
  }

  const prevStatus = lead.status;
  lead.status = parsed.data.status as LeadStatus;
  lead.objection = parsed.data.objection?.trim() || undefined;
  lead.lastResult = parsed.data.lastResult?.trim() || undefined;
  lead.nextContactDate = parsed.data.nextContactDate
    ? new Date(parsed.data.nextContactDate)
    : undefined;
  lead.lastContactAt = new Date();
  await lead.save();

  await AuditLog.create({
    action: "lead.update",
    actionTitle: "Lid ma'lumoti yangilandi",
    category: "client",
    severity: "info",
    performedBy: {
      userId: session.id,
      name: session.fullName,
      email: session.email,
      role: session.role,
    },
    targetResource: { type: "Lead", id: String(lead._id), name: lead.fullName },
    details: `${lead.fullName}: "${prevStatus}" → "${lead.status}"`,
    changes: [{ field: "status", oldValue: prevStatus, newValue: lead.status }],
  });

  revalidatePath("/leads");
  return { success: true };
}

const convertLeadSchema = z.object({
  leadId: z.string().min(1),
  email: z.string().email("Email noto'g'ri formatda"),
  tariffId: z.string().min(1, "Tarif tanlanishi shart"),
  assignedTo: z.string().optional(),
});

export type ConvertLeadFormState = {
  error?: string;
  success?: boolean;
  clientId?: string;
};

export async function convertLeadToClientAction(
  _prev: ConvertLeadFormState,
  formData: FormData,
): Promise<ConvertLeadFormState> {
  const session = await getSession();
  if (!session) return { error: "Sessiya tugagan, qayta kiring" };

  const parsed = convertLeadSchema.safeParse({
    leadId: formData.get("leadId"),
    email: formData.get("email"),
    tariffId: formData.get("tariffId"),
    assignedTo: formData.get("assignedTo") || undefined,
  });
  if (!parsed.success)
    return {
      error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri",
    };

  await connectDB();
  const lead = await Lead.findById(parsed.data.leadId);
  if (!lead) return { error: "Lid topilmadi" };
  if (session.role === "consultant" && String(lead.assignedTo) !== session.id) {
    return { error: "Ruxsat yo'q" };
  }
  if (lead.convertedToClientId)
    return { error: "Bu lid allaqachon mijozga aylantirilgan" };

  const targetAssignedTo =
    (session.role === "admin" || session.role === "manager") &&
    parsed.data.assignedTo
      ? parsed.data.assignedTo
      : String(lead.assignedTo);

  const pin = await generateUniquePin();
  const clientData = {
    fullName: lead.fullName,
    phone: lead.phone,
    email: parsed.data.email.trim().toLowerCase(),
    assignedTo: targetAssignedTo,
    tariffId: parsed.data.tariffId,
    universities: [],
    pin,
    createdBy: session.id,
  };
  const profileCompletionPercent = calculateProfileCompletion(clientData);
  const client = await Client.create({
    ...clientData,
    profileCompletionPercent,
  });

  const clientObjectId = new Types.ObjectId(String(client._id));
  lead.convertedToClientId = clientObjectId;
  lead.convertedAt = new Date();
  lead.status = "tayyor";
  await lead.save();

  await AuditLog.create({
    action: "lead.convert",
    actionTitle: "Lid mijozga aylantirildi",
    category: "client",
    severity: "info",
    performedBy: {
      userId: session.id,
      name: session.fullName,
      email: session.email,
      role: session.role,
    },
    targetResource: {
      type: "Client",
      id: String(client._id),
      name: client.fullName,
    },
    details: `${lead.fullName} lid'dan mijozga aylantirildi. PIN: ${pin}`,
  });

  revalidatePath("/leads");
  revalidatePath("/clients");
  return { success: true, clientId: String(client._id) };
}
