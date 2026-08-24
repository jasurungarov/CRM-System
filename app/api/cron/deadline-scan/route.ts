import { NextRequest, NextResponse } from "next/server";
import { runDeadlineScan, runPaymentReminderScan } from "@/lib/notifications-scanner";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: "Ruxsat etilmagan" }, { status: 401 });
  }

  const isVercelCron = request.headers.get("user-agent")?.includes("vercel-cron") ?? false;
  const triggeredBy = isVercelCron ? "vercel_cron" : "manual";

  const [deadlineResult, reminderResult] = await Promise.all([
    runDeadlineScan(triggeredBy),
    runPaymentReminderScan(triggeredBy),
  ]);

  return NextResponse.json({ success: true, deadlineResult, reminderResult });
}