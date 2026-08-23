"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { User } from "@/models/User";
import { Tariff } from "@/models/Tariff";
import { AuditLog } from "@/models/AuditLog";
import { getSession, requireRole } from "@/lib/auth";
import { generateUniquePin } from "@/lib/pin";
import { calculateProfileCompletion } from "@/lib/profile-completion";

export type ClientFilters = {
  search?: string;
  tariffId?: string;
  status?: string;
  consultantId?: string;
  startDate?: string;
  endDate?: string;
};

/**
 * Mijozlar ro'yxati — RBAC bilan (konsultant faqat o'ziga biriktirilganlarni
 * ko'radi), qidiruv va filtrlar bilan.
 */
export async function getClients(filters: ClientFilters = {}) {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");

  await connectDB();

  const query: Record<string, unknown> = {};

  if (session.role === "consultant") {
    query.assignedTo = session.id;
  } else if (filters.consultantId && filters.consultantId !== "all") {
    query.assignedTo = filters.consultantId;
  }

  if (filters.tariffId && filters.tariffId !== "all") {
    query.tariffId = filters.tariffId;
  }

  if (filters.status && filters.status !== "all") {
    query["universities.submissionStatus"] = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    const createdAt: Record<string, Date> = {};
    if (filters.startDate) createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) createdAt.$lte = new Date(new Date(filters.endDate).getTime() + 86_400_000);
    query.createdAt = createdAt;
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    const regex = new RegExp(q, "i");
    query.$or = [{ fullName: regex }, { phone: regex }, { email: regex }, { pin: regex }];
  }

  const clients = await Client.find(query).sort({ createdAt: -1 }).lean();

  const consultantIds = [...new Set(clients.map((c) => String(c.assignedTo)))];
  const tariffIds = [...new Set(clients.map((c) => String(c.tariffId)))];

  const [consultants, tariffs] = await Promise.all([
    User.find({ _id: { $in: consultantIds } }).lean(),
    Tariff.find({ _id: { $in: tariffIds } }).lean(),
  ]);
  const consultantMap = new Map(consultants.map((u) => [String(u._id), u]));
  const tariffMap = new Map(tariffs.map((t) => [String(t._id), t]));

  return clients.map((c) => ({
    ...c,
    _id: String(c._id),
    tariffId: String(c.tariffId),
    assignedTo: String(c.assignedTo),
    createdBy: String(c.createdBy),
    assignedToUser: consultantMap.get(String(c.assignedTo))
      ? {
          id: String(consultantMap.get(String(c.assignedTo))!._id),
          name: consultantMap.get(String(c.assignedTo))!.name,
        }
      : null,
    tariff: tariffMap.get(String(c.tariffId)) ?? null,
  }));
}

export async function getClientById(id: string) {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");

  await connectDB();
  const client = await Client.findById(id).lean();
  if (!client) throw new Error("Mijoz topilmadi");

  if (session.role === "consultant" && String(client.assignedTo) !== session.id) {
    throw new Error("FORBIDDEN");
  }

  const [consultant, creator, tariff] = await Promise.all([
    User.findById(client.assignedTo).lean(),
    User.findById(client.createdBy).lean(),
    Tariff.findById(client.tariffId).lean(),
  ]);

  return {
    ...client,
    _id: String(client._id),
    assignedToUser: consultant ? { id: String(consultant._id), name: consultant.name } : null,
    createdByUser: creator ? { id: String(creator._id), name: creator.name } : null,
    tariff: tariff ?? null,
  };
}

const createClientSchema = z.object({
  fullName: z.string().min(3, "F.I.SH kamida 3 belgidan iborat bo'lishi kerak"),
  phone: z.string().min(7, "Telefon raqami noto'g'ri"),
  email: z.string().email("Email noto'g'ri formatda"),
  tariffId: z.string().min(1, "Tarif tanlanishi shart"),
  assignedTo: z.string().optional(),
});

export type ClientFormState = { error?: string; success?: boolean };

export async function createClientAction(
  _prev: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const session = await getSession();
  if (!session) return { error: "Sessiya tugagan, qayta kiring" };

  const parsed = createClientSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    tariffId: formData.get("tariffId"),
    assignedTo: formData.get("assignedTo") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  }

  await connectDB();

  // Konsultant har doim o'ziga biriktiradi; admin/menejer boshqasiga ham biriktira oladi
  let targetAssignedTo = session.id;
  if (session.role === "admin" || session.role === "manager") {
    targetAssignedTo = parsed.data.assignedTo || session.id;
  }

  const targetUser = await User.findById(targetAssignedTo).lean();
  if (!targetUser) return { error: "Biriktirilayotgan xodim topilmadi" };

  const pin = await generateUniquePin();
  const clientData = {
    fullName: parsed.data.fullName.trim(),
    phone: parsed.data.phone.trim(),
    email: parsed.data.email.trim().toLowerCase(),
    assignedTo: targetAssignedTo,
    tariffId: parsed.data.tariffId,
    universities: [],
    pin,
    createdBy: session.id,
  };
  const profileCompletionPercent = calculateProfileCompletion(clientData);

  const client = await Client.create({ ...clientData, profileCompletionPercent });

  await AuditLog.create({
    action: "client.create",
    actionTitle: "Yangi mijoz qo'shildi",
    category: "client",
    severity: "info",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "Client", id: String(client._id), name: client.fullName },
    details: `${client.fullName} qo'shildi. PIN: ${pin}`,
  });

  revalidatePath("/clients");
  return { success: true };
}

const updateClientSchema = z.object({
  clientId: z.string().min(1),
  fullName: z.string().min(3),
  phone: z.string().min(7),
  email: z.string().email(),
  tariffId: z.string().min(1),
  assignedTo: z.string().optional(),
});

export async function updateClientAction(
  _prev: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const session = await getSession();
  if (!session) return { error: "Sessiya tugagan, qayta kiring" };

  const parsed = updateClientSchema.safeParse({
    clientId: formData.get("clientId"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    tariffId: formData.get("tariffId"),
    assignedTo: formData.get("assignedTo") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  }

  await connectDB();
  const existing = await Client.findById(parsed.data.clientId);
  if (!existing) return { error: "Mijoz topilmadi" };

  if (session.role === "consultant" && String(existing.assignedTo) !== session.id) {
    return { error: "Ruxsat yo'q. Konsultant faqat o'ziga biriktirilgan mijozni tahrirlashi mumkin." };
  }

  let targetAssignedTo = existing.assignedTo;
  if ((session.role === "admin" || session.role === "manager") && parsed.data.assignedTo) {
    targetAssignedTo = parsed.data.assignedTo as unknown as typeof existing.assignedTo;
  }

  existing.fullName = parsed.data.fullName.trim();
  existing.phone = parsed.data.phone.trim();
  existing.email = parsed.data.email.trim().toLowerCase();
  existing.tariffId = parsed.data.tariffId as unknown as typeof existing.tariffId;
  existing.assignedTo = targetAssignedTo;
  existing.profileCompletionPercent = calculateProfileCompletion(existing);
  await existing.save();

  await AuditLog.create({
    action: "client.update",
    actionTitle: "Mijoz ma'lumotlari tahrirlandi",
    category: "client",
    severity: "info",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "Client", id: String(existing._id), name: existing.fullName },
    details: `${existing.fullName} ma'lumotlari yangilandi`,
  });

  revalidatePath("/clients");
  return { success: true };
}

export async function reassignClientAction(clientId: string, newAssignedTo: string) {
  const session = await requireRole(["admin", "manager"]);

  await connectDB();
  const targetUser = await User.findById(newAssignedTo).lean();
  if (!targetUser) throw new Error("Ko'rsatilgan xodim topilmadi");

  const client = await Client.findById(clientId);
  if (!client) throw new Error("Mijoz topilmadi");

  const prevAssignee = String(client.assignedTo);
  client.assignedTo = newAssignedTo as unknown as typeof client.assignedTo;
  await client.save();

  await AuditLog.create({
    action: "client.reassign",
    actionTitle: "Mijoz boshqa konsultantga biriktirildi",
    category: "client",
    severity: "info",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "Client", id: String(client._id), name: client.fullName },
    details: `${client.fullName} — ${targetUser.name}ga biriktirildi`,
    changes: [{ field: "assignedTo", fieldLabel: "Konsultant", oldValue: prevAssignee, newValue: newAssignedTo }],
  });

  revalidatePath("/clients");
  return { success: true, clientName: client.fullName, newConsultantName: targetUser.name };
}

export async function deleteClientAction(clientId: string) {
  const session = await requireRole(["admin"]);

  await connectDB();
  const client = await Client.findById(clientId);
  if (!client) throw new Error("Mijoz topilmadi");

  await Client.deleteOne({ _id: clientId });

  await AuditLog.create({
    action: "client.delete",
    actionTitle: "Mijoz o'chirildi",
    category: "client",
    severity: "warning",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "Client", id: clientId, name: client.fullName },
    details: `${client.fullName} tizimdan o'chirildi`,
  });

  revalidatePath("/clients");
  return { success: true };
}

export async function getConsultantsList() {
  await requireRole(["admin", "manager"]);
  await connectDB();
  const users = await User.find({ isActive: true }).select("name role").lean();
  return users.map((u) => ({ id: String(u._id), name: u.name, role: u.role }));
}

export async function getTariffsList() {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");
  await connectDB();
  const tariffs = await Tariff.find({ isActive: true }).sort({ price: 1 }).lean();
  return tariffs.map((t) => ({ ...t, _id: String(t._id) }));
}
