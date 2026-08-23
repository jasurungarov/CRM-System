import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { Notification } from "@/models/Notification";
import { CronJobLog } from "@/models/CronJobLog";
import { getPaymentSummaryForClient } from "@/lib/payment-summary";

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
 *
 * Shuningdek qarzdorligi bor mijozlar bo'yicha ham bildirishnoma yaratadi.
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

    // Qarzdorlik bildirishnomasi (kunlik bitta marta — sana bo'yicha dedupe)
    const summary = await getPaymentSummaryForClient(String(client._id));
    if (summary.remainingDebt > 0) {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const alreadyNotifiedToday = await Notification.exists({
        clientId: client._id,
        type: "payment_debt",
        createdAt: { $gte: todayStart },
      });
      if (!alreadyNotifiedToday) {
        await Notification.create({
          recipientId: String(client.assignedTo),
          recipientRole: "all",
          clientId: client._id,
          clientName: client.fullName,
          clientPin: client.pin,
          title: `Qarzdorlik: ${client.fullName}`,
          message: `${client.fullName} (PIN: ${client.pin}) — ${summary.remainingDebt.toLocaleString("uz-UZ")} so'm qarzdorligi bor.`,
          type: "payment_debt",
          priority: "orta",
          link: "/payments",
          metadata: { amountDue: summary.remainingDebt },
        });
        notificationsCreated++;
      }
    }
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
