"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { getSession, requireRole } from "@/lib/auth";
import { runDeadlineScan } from "@/lib/notifications-scanner";

/** Foydalanuvchiga tegishli bildirishnomalar: o'ziga shaxsan yo'llanganlar + "all" (hamma xodimlarga) */
export async function getNotifications(limit = 50) {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");

  await connectDB();
  const notifications = await Notification.find({
    $or: [{ recipientId: session.id }, { recipientId: "all" }],
  })
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
    $or: [{ recipientId: session.id }, { recipientId: "all" }],
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
    { $or: [{ recipientId: session.id }, { recipientId: "all" }], isRead: false },
    { isRead: true, readAt: new Date() }
  );
  revalidatePath("/notifications");
  return { success: true };
}

/** Admin/menejer deadline skanerini qo'lda ishga tushirishi mumkin (Vercel Cron kutmasdan) */
export async function runManualScanAction() {
  await requireRole(["admin", "manager"]);
  const result = await runDeadlineScan("manual");
  revalidatePath("/notifications");
  return result;
}
