import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { Payment } from "@/models/Payment";
import { Notification } from "@/models/Notification";
import { AuditLog } from "@/models/AuditLog";
import { CronJobLog } from "@/models/CronJobLog";
import { getOrCreateSystemUser } from "@/lib/system-user";

export interface ScanResult {
  success: boolean;
  notificationsCreated: number;
  deadlinesScanned: number;
  urgentCount: number;
  approachingCount: number;
  details: string;
  logs: string[];
}

/**
 * Barcha mijozlarning topshirilmagan universitet arizalarini tekshirib,
 * muddati yaqinlashganda (7 kun) yoki o'tib ketganda bitta marta
 * bildirishnoma yaratadi (Client.universities[].deadlineWarningSent
 * bayrog'i orqali takrorlanishning oldi olinadi).
 */
export async function runDeadlineScan(
  triggeredBy: "vercel_cron" | "manual" | "system" = "manual"
): Promise<ScanResult> {
  await connectDB();
  const now = new Date();
  const logs: string[] = [`[${now.toISOString()}] Deadline skanerlash boshlandi (${triggeredBy})`];

  let deadlinesScanned = 0;
  let notificationsCreated = 0;
  let urgentCount = 0;
  let approachingCount = 0;

  const clients = await Client.find({});

  for (const client of clients) {
    let clientModified = false;

    for (const uni of client.universities) {
      if (uni.submissionStatus !== "topshirilmagan") continue;
      deadlinesScanned++;

      const diffDays = Math.ceil(
        (new Date(uni.submissionDeadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays > 7 || uni.deadlineWarningSent) continue;

      const isUrgent = diffDays <= 3;
      if (isUrgent) urgentCount++;
      else approachingCount++;

      await Notification.create({
        recipientId: String(client.assignedTo),
        recipientRole: "all",
        clientId: client._id,
        clientName: client.fullName,
        clientPin: client.pin,
        title: isUrgent
          ? `Shoshilinch: ${uni.universityName} muddati yaqinlashmoqda`
          : `Diqqat: ${uni.universityName} muddati yaqinlashmoqda`,
        message: `${client.fullName} (PIN: ${client.pin}) uchun ${uni.universityName} — ${uni.program} yo'nalishiga hujjat topshirish muddati ${diffDays <= 0 ? "bugun tugaydi" : `${diffDays} kundan so'ng tugaydi`}.`,
        type: isUrgent ? "deadline_urgent" : "deadline_warning",
        priority: isUrgent ? "shoshilinch" : "yuqori",
        link: "/applications",
        metadata: {
          daysLeft: diffDays,
          universityName: uni.universityName,
          program: uni.program,
        },
      });

      uni.deadlineWarningSent = true;
      clientModified = true;
      notificationsCreated++;
    }

    if (clientModified) await client.save();
  }

  logs.push(
    `Skanerlash yakunlandi: ${deadlinesScanned} ta ariza tekshirildi, ${notificationsCreated} ta bildirishnoma yaratildi (${urgentCount} shoshilinch, ${approachingCount} diqqat).`
  );

  await CronJobLog.create({
    executedAt: now,
    triggeredBy,
    status: "success",
    notificationsCreated,
    deadlinesScanned,
    urgentCount,
    approachingCount,
    details: logs[logs.length - 1],
    logs,
  });

  return {
    success: true,
    notificationsCreated,
    deadlinesScanned,
    urgentCount,
    approachingCount,
    details: logs[logs.length - 1],
    logs,
  };
}

export interface PaymentReminderResult {
  success: boolean;
  clientsScanned: number;
  remindersCreated: number;
  details: string;
}

/**
 * Hali birorta ham to'lov qilmagan mijozlar bo'yicha HAMMA xodimga
 * (recipientId:"all") kunlik eslatma yaratadi. Kuniga bir marta (sana
 * bo'yicha dedupe) va mijoz to'lov qilguncha har kuni takrorlanadi.
 * Har bir eslatma Audit logga ham "Tizim" hisobi nomidan yoziladi.
 */
export async function runPaymentReminderScan(
  triggeredBy: "vercel_cron" | "manual" | "system" = "manual"
): Promise<PaymentReminderResult> {
  await connectDB();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const clients = await Client.find({}).lean();
  const systemUser = await getOrCreateSystemUser();

  let remindersCreated = 0;

  for (const client of clients) {
    const paymentCount = await Payment.countDocuments({
      clientId: client._id,
      status: "tasdiqlangan",
    });
    if (paymentCount > 0) continue;

    const alreadyRemindedToday = await Notification.exists({
      clientId: client._id,
      type: "payment_debt",
      createdAt: { $gte: todayStart },
    });
    if (alreadyRemindedToday) continue;

    await Notification.create({
      recipientId: "all",
      recipientRole: "all",
      clientId: client._id,
      clientName: client.fullName,
      clientPin: client.pin,
      title: `To'lov qilinmagan: ${client.fullName}`,
      message: `${client.fullName} (PIN: ${client.pin}) hali birorta ham to'lov qilmagan. Mijoz bilan bog'lanib, to'lovni eslatish tavsiya etiladi.`,
      type: "payment_debt",
      priority: "yuqori",
      link: "/payments",
    });

    await AuditLog.create({
      action: "notification.payment_reminder",
      actionTitle: "To'lov eslatmasi yuborildi",
      category: "payment",
      severity: "warning",
      performedBy: {
        userId: systemUser._id,
        name: systemUser.name,
        email: systemUser.email,
        role: systemUser.role,
      },
      targetResource: { type: "Client", id: String(client._id), name: client.fullName },
      details: `${client.fullName} (PIN: ${client.pin}) hali to'lov qilmagani uchun barcha xodimlarga avtomatik eslatma yuborildi (ishga tushiruvchi: ${triggeredBy})`,
    });

    remindersCreated++;
  }

  return {
    success: true,
    clientsScanned: clients.length,
    remindersCreated,
    details: `${clients.length} ta mijoz tekshirildi, ${remindersCreated} ta eslatma yuborildi.`,
  };
}