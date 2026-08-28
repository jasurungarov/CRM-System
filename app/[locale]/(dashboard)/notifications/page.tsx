"use server";

import { getNotifications } from "@/actions/notifications.actions";
import { BroadcastNotificationModal } from "@/components/notifications/BroadcastNotificationModal";
import { ManualScanButton } from "@/components/notifications/ManualScanButton";
import { NotificationsListClient } from "@/components/notifications/NotificationsListClient";
import { getSession } from "@/lib/auth";
import { getTranslations } from "next-intl/server";

export default async function NotificationsPage() {
  const t = await getTranslations("notifications");
  const [notifications, session] = await Promise.all([
    getNotifications(100),
    getSession(),
  ]);
  const canRunScan = session?.role === "admin" || session?.role === "manager";
  const isAdmin = session?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-display font-semibold sm:text-2xl">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && <BroadcastNotificationModal />}
          {canRunScan && <ManualScanButton />}
        </div>
      </div>

      <NotificationsListClient initialNotifications={notifications as never} />
    </div>
  );
}
