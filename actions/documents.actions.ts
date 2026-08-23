"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { ClientDocument } from "@/models/ClientDocument";
import { AuditLog } from "@/models/AuditLog";
import { getSession, requireRole } from "@/lib/auth";
import { DOCUMENT_CHECKLIST_TEMPLATE } from "@/lib/data/document-checklist";
import { buildDocumentKey, uploadBufferToR2, deleteObjectFromR2 } from "@/lib/r2";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

async function ensureChecklistInitialized(clientId: string) {
  const existing = await ClientDocument.countDocuments({ clientId });
  if (existing > 0) return;

  await ClientDocument.insertMany(
    DOCUMENT_CHECKLIST_TEMPLATE.map((item) => ({
      clientId,
      docType: item.docType,
      title: item.title,
      description: item.description,
      isRequired: item.isRequired,
      status: "yuklanmagan",
      version: 1,
    }))
  );
}

export async function getClientDocuments(clientId: string) {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");

  await connectDB();
  const client = await Client.findById(clientId).lean();
  if (!client) throw new Error("Mijoz topilmadi");
  if (session.role === "consultant" && String(client.assignedTo) !== session.id) {
    throw new Error("Ruxsat yo'q");
  }

  await ensureChecklistInitialized(clientId);
  const docs = await ClientDocument.find({ clientId }).sort({ isRequired: -1, title: 1 }).lean();
  return docs.map((d) => ({ ...d, _id: String(d._id) }));
}

export type UploadDocumentState = { error?: string; success?: boolean };

export async function uploadDocumentAction(
  _prev: UploadDocumentState,
  formData: FormData
): Promise<UploadDocumentState> {
  const session = await getSession();
  if (!session) return { error: "Sessiya tugagan, qayta kiring" };

  const clientId = formData.get("clientId") as string;
  const documentId = formData.get("documentId") as string;
  const file = formData.get("file") as File | null;

  if (!clientId || !documentId) return { error: "Ma'lumotlar to'liq emas" };
  if (!file || file.size === 0) return { error: "Fayl tanlanmadi" };
  if (file.size > MAX_FILE_SIZE) return { error: "Fayl hajmi 15 MB dan oshmasligi kerak" };
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { error: "Faqat PDF, JPG, PNG yoki WEBP formatidagi fayllar qabul qilinadi" };
  }

  await connectDB();
  const client = await Client.findById(clientId).lean();
  if (!client) return { error: "Mijoz topilmadi" };
  if (session.role === "consultant" && String(client.assignedTo) !== session.id) {
    return { error: "Ruxsat yo'q. Faqat o'zingizga biriktirilgan mijoz hujjatini yuklashingiz mumkin." };
  }

  const docRecord = await ClientDocument.findById(documentId);
  if (!docRecord) return { error: "Hujjat qatori topilmadi" };

  // Eski fayl mavjud bo'lsa — R2'dan o'chiramiz (versiyalash: eskisi almashtiriladi)
  if (docRecord.r2Key) {
    await deleteObjectFromR2(`${process.env.R2_PUBLIC_URL}/${docRecord.r2Key}`).catch(() => {});
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = buildDocumentKey(clientId, documentId, file.name);

  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_BUCKET_NAME) {
    return {
      error:
        "Fayl saqlash xizmati (Cloudflare R2) hali sozlanmagan. .env faylida R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME va R2_PUBLIC_URL to'ldirilishi kerak.",
    };
  }

  let fileUrl: string;
  try {
    fileUrl = await uploadBufferToR2(key, buffer, file.type);
  } catch {
    return { error: "Faylni saqlashda xatolik yuz berdi. R2 sozlamalarini tekshiring." };
  }

  docRecord.fileName = file.name;
  docRecord.fileSize = file.size;
  docRecord.mimeType = file.type;
  docRecord.r2Key = key;
  docRecord.fileUrl = fileUrl;
  docRecord.uploadedAt = new Date();
  docRecord.uploadedBy = session.id as never;
  docRecord.status = "kutilmoqda";
  docRecord.version += 1;
  docRecord.rejectionReason = undefined;
  await docRecord.save();

  await AuditLog.create({
    action: "document.upload",
    actionTitle: "Hujjat yuklandi",
    category: "document",
    severity: "info",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "Client", id: clientId, name: client.fullName },
    details: `${docRecord.title} yuklandi (${file.name})`,
  });

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/documents");
  return { success: true };
}

export async function reviewDocumentAction(
  documentId: string,
  decision: "qabul_qilindi" | "rad_etildi",
  rejectionReason?: string
) {
  const session = await requireRole(["admin", "manager"]);

  await connectDB();
  const docRecord = await ClientDocument.findById(documentId);
  if (!docRecord) throw new Error("Hujjat topilmadi");
  if (decision === "rad_etildi" && !rejectionReason?.trim()) {
    throw new Error("Rad etish sababini kiritish shart");
  }

  docRecord.status = decision;
  docRecord.reviewedAt = new Date();
  docRecord.reviewedBy = session.id as never;
  docRecord.rejectionReason = decision === "rad_etildi" ? rejectionReason?.trim() : undefined;
  await docRecord.save();

  await AuditLog.create({
    action: "document.review",
    actionTitle: decision === "qabul_qilindi" ? "Hujjat qabul qilindi" : "Hujjat rad etildi",
    category: "document",
    severity: decision === "rad_etildi" ? "warning" : "info",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "ClientDocument", id: documentId, name: docRecord.title },
    details:
      decision === "rad_etildi" ? `${docRecord.title} rad etildi: ${rejectionReason}` : `${docRecord.title} tasdiqlandi`,
  });

  revalidatePath(`/clients/${docRecord.clientId}`);
  revalidatePath("/documents");
  return { success: true };
}

export async function addCustomDocumentAction(clientId: string, title: string, description?: string) {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");
  if (!title?.trim()) throw new Error("Hujjat nomi kiritilishi shart");

  await connectDB();
  const client = await Client.findById(clientId).lean();
  if (!client) throw new Error("Mijoz topilmadi");
  if (session.role === "consultant" && String(client.assignedTo) !== session.id) {
    throw new Error("Ruxsat yo'q");
  }

  await ensureChecklistInitialized(clientId);
  const doc = await ClientDocument.create({
    clientId,
    docType: "boshqa",
    title: title.trim(),
    description: description?.trim() ?? "",
    isRequired: false,
    status: "yuklanmagan",
    version: 1,
  });

  revalidatePath(`/clients/${clientId}`);
  return { success: true, id: String(doc._id) };
}

/** Barcha mijozlar bo'yicha hujjatlar holati statistikasi (Documents dashboard uchun) */
export async function getDocumentsOverview() {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");

  await connectDB();
  const clientQuery = session.role === "consultant" ? { assignedTo: session.id } : {};
  const clients = await Client.find(clientQuery).select("_id fullName pin").lean();

  const results = [];
  for (const c of clients) {
    await ensureChecklistInitialized(String(c._id));
    const docs = await ClientDocument.find({ clientId: c._id }).lean();
    const required = docs.filter((d) => d.isRequired);
    const accepted = required.filter((d) => d.status === "qabul_qilindi").length;
    const pending = docs.filter((d) => d.status === "kutilmoqda").length;
    const rejected = docs.filter((d) => d.status === "rad_etildi").length;
    results.push({
      clientId: String(c._id),
      clientName: c.fullName,
      pin: c.pin,
      requiredTotal: required.length,
      requiredAccepted: accepted,
      pendingReview: pending,
      rejected,
      completionPercent: required.length > 0 ? Math.round((accepted / required.length) * 100) : 100,
    });
  }

  return results.sort((a, b) => a.completionPercent - b.completionPercent);
}
