import { NextRequest, NextResponse } from "next/server";
import { runDeadlineScan } from "@/lib/notifications-scanner";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: "Ruxsat etilmagan" }, { status: 401 });
  }

  const isVercelCron = request.headers.get("user-agent")?.includes("vercel-cron") ?? false;
  const result = await runDeadlineScan(isVercelCron ? "vercel_cron" : "manual");

  return NextResponse.json({ success: true, result });
}
