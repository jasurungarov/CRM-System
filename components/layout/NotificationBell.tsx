"use client";

import {
  getNotifications,
  getUnreadCount,
  markAllAsReadAction,
  markAsReadAction,
} from "@/actions/notifications.actions";
import { Link } from "@/i18n/navigation";
import * as Popover from "@radix-ui/react-popover";
import { Bell, CheckCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";

type NotificationRow = Awaited<ReturnType<typeof getNotifications>>[number];

const PRIORITY_DOT: Record<string, string> = {
  shoshilinch: "bg-destructive",
  yuqori: "bg-accent",
  orta: "bg-primary",
  past: "bg-muted-foreground",
};

export function NotificationBell() {
  const t = useTranslations("notifications");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  async function refresh() {
    const [list, count] = await Promise.all([
      getNotifications(10),
      getUnreadCount(),
    ]);
    setItems(list);
    setUnreadCount(count);
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000); // Har daqiqada yangilanadi
    return () => clearInterval(interval);
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) refresh();
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllAsReadAction();
      refresh();
    });
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          aria-label="Bildirishnomalar"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-secondary">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-40 w-80 max-w-[90vw] rounded-md border border-border bg-card shadow-md">
          <div className="flex items-center justify-between border-b border-border p-3">
            <p className="text-sm font-semibold">{t("bellTitle")}</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="flex items-center gap-1 text-xs text-primary hover:underline">
                <CheckCheck className="h-3.5 w-3.5" />
                {t("markAllRead")}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">
                {t("noNotifications")}
              </p>
            )}
            {items.map((n) => (
              <button
                key={n._id}
                onClick={() => {
                  if (!n.isRead) {
                    markAsReadAction(n._id).then(refresh);
                  }
                }}
                className={`block w-full border-b border-border px-3 py-2.5 text-left text-sm hover:bg-secondary/50 ${
                  n.isRead ? "opacity-60" : ""
                }`}>
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOT[n.priority] ?? "bg-muted-foreground"}`}
                  />
                  <div>
                    <p className="font-medium leading-tight">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                      {n.message}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-border p-2 text-center">
            <Link
              href="/notifications"
              className="text-xs text-primary hover:underline"
              onClick={() => setOpen(false)}>
              {t("viewAll")}
            </Link>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
