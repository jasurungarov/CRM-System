"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { AuditLog } from "@/models/AuditLog";
import { getSession, requireRole } from "@/lib/auth";
import { runDeadlineScan, runPaymentReminderScan, runLeadReminderScan } from "@/lib/notifications-scanner";

/**
 * Foydalanuvchiga tegishli bildirishnomalar:
 * - shaxsan o'ziga yo'llanganlar (recipientId === o'z ID'si)
 * - HAMMAGA yo'llangan e'lonlar (recipientId:"all", recipientRole:"all")
 * - o'z roliga yo'llangan e'lonlar (recipientId:"all", recipientRole === o'z roli)
 */
function buildRecipientQuery(userId: string, role: string) {
  return {
    $or: [
      { recipientId: userId },
      { recipientId: "all", recipientRole: "all" },
      { recipientId: "all", recipientRole: role },
    ],
  };
}

export async function getNotifications(limit = 50) {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");

  await connectDB();
  const notifications = await Notification.find(buildRecipientQuery(session.id, session.role))
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return notifications.map((n) => ({
    _id: String(n._id),
    title: n.title,
    message: n.message,
    type: n.type,
    priority: n.priority,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
    link: n.link ?? null,
    clientId: n.clientId ? String(n.clientId) : null,
    clientName: n.clientName ?? null,
    clientPin: n.clientPin ?? null,
  }));
}

export async function getUnreadCount() {
  const session = await getSession();
  if (!session) return 0;

  await connectDB();
  return Notification.countDocuments({
    ...buildRecipientQuery(session.id, session.role),
    isRead: false,
  });
}

export async function markAsReadAction(notificationId: string) {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");

  await connectDB();
  await Notification.updateOne({ _id: notificationId }, { isRead: true, readAt: new Date() });
  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllAsReadAction() {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");

  await connectDB();
  await Notification.updateMany(
    { ...buildRecipientQuery(session.id, session.role), isRead: false },
    { isRead: true, readAt: new Date() }
  );
  revalidatePath("/notifications");
  return { success: true };
}

/** Admin/menejer skanerlarni qo'lda ishga tushirishi mumkin (Vercel Cron kutmasdan) */
export async function runManualScanAction() {
  await requireRole(["admin", "manager"]);
  const [deadlineResult, reminderResult, leadResult] = await Promise.all([
    runDeadlineScan("manual"),
    runPaymentReminderScan("manual"),
    runLeadReminderScan("manual"),
  ]);
  revalidatePath("/notifications");
  return {
    notificationsCreated:
      deadlineResult.notificationsCreated + reminderResult.remindersCreated + leadResult.remindersSent,
    deadlinesScanned: deadlineResult.deadlinesScanned,
    remindersCreated: reminderResult.remindersCreated,
    clientsScanned: reminderResult.clientsScanned,
    leadsScanned: leadResult.leadsScanned,
    leadRemindersSent: leadResult.remindersSent,
  };
}

const broadcastSchema = z.object({
  title: z.string().min(3, "Sarlavha kamida 3 belgidan iborat bo'lishi kerak"),
  message: z.string().min(3, "Xabar matni kiritilishi shart"),
  audience: z.enum(["all", "manager", "consultant"]),
});

export type BroadcastFormState = { error?: string; success?: boolean };

const AUDIENCE_LABELS: Record<string, string> = {
  all: "barcha xodimlarga",
  manager: "menejerlarga",
  consultant: "konsultantlarga",
};

/** Faqat admin yoza oladigan umumiy e'lon/xabar */
export async function createBroadcastNotificationAction(
  _prev: BroadcastFormState,
  formData: FormData
): Promise<BroadcastFormState> {
  const session = await requireRole(["admin"]);

  const parsed = broadcastSchema.safeParse({
    title: formData.get("title"),
    message: formData.get("message"),
    audience: formData.get("audience") || "all",
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  await connectDB();

  await Notification.create({
    recipientId: "all",
    recipientRole: parsed.data.audience,
    title: parsed.data.title.trim(),
    message: parsed.data.message.trim(),
    type: "system_alert",
    priority: "yuqori",
  });

  await AuditLog.create({
    action: "notification.broadcast",
    actionTitle: "Admin e'lon yubordi",
    category: "system",
    severity: "info",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "Notification", id: "broadcast", name: parsed.data.title },
    details: `"${parsed.data.title}" ${AUDIENCE_LABELS[parsed.data.audience]} yuborildi`,
  });

  revalidatePath("/notifications");
  return { success: true };
}