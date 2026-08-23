import { getNotifications } from "@/actions/notifications.actions";
import { getSession } from "@/lib/auth";
import { NotificationsListClient } from "@/components/notifications/NotificationsListClient";
import { ManualScanButton } from "@/components/notifications/ManualScanButton";

export default async function NotificationsPage() {
  const [notifications, session] = await Promise.all([getNotifications(100), getSession()]);
  const canRunScan = session?.role === "admin" || session?.role === "manager";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-display font-semibold sm:text-2xl">Bildirishnomalar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Muddatlar va qarzdorlik bo&apos;yicha avtomatik ogohlantirishlar
          </p>
        </div>
        {canRunScan && <ManualScanButton />}
      </div>

      <NotificationsListClient initialNotifications={notifications as never} />
    </div>
  );
}
