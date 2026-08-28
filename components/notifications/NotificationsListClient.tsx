"use client";

import {
  markAllAsReadAction,
  markAsReadAction,
} from "@/actions/notifications.actions";
import { Badge } from "@/components/ui/badge";
import { CheckCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

type NotificationRow = {
  _id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
};

export function NotificationsListClient({
  initialNotifications,
}: {
  initialNotifications: NotificationRow[];
}) {
  const tNotif = useTranslations("notifications");
  const [items, setItems] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();

  function handleRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    startTransition(() => {
      markAsReadAction(id);
    });
  }

  function handleReadAll() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    startTransition(() => {
      markAllAsReadAction();
    });
  }

  const unreadCount = items.filter((n) => !n.isRead).length;

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "shoshilinch":
      case "urgent":
        return {
          label: tNotif("priorityUrgent"),
          variant: "destructive" as const,
        };
      case "yuqori":
      case "high":
        return { label: tNotif("priorityHigh"), variant: "accent" as const };
      case "orta":
      case "medium":
        return {
          label: tNotif("priorityMedium"),
          variant: "secondary" as const,
        };
      case "past":
      case "low":
        return { label: tNotif("priorityLow"), variant: "secondary" as const };
      default:
        return {
          label: tNotif("priorityMedium"),
          variant: "secondary" as const,
        };
    }
  };

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <button
          onClick={handleReadAll}
          disabled={isPending}
          className="flex items-center gap-1.5 text-sm text-primary hover:underline">
          <CheckCheck className="h-4 w-4" />
          {tNotif("markAllRead")} ({unreadCount})
        </button>
      )}

      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {tNotif("noNotifications")}
        </div>
      )}

      {items.map((n) => {
        const priorityConfig = getPriorityConfig(n.priority);

        return (
          <button
            key={n._id}
            onClick={() => !n.isRead && handleRead(n._id)}
            className={`block w-full rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-opacity ${
              n.isRead ? "opacity-60" : ""
            }`}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{n.title}</p>
              <Badge variant={priorityConfig.variant}>
                {priorityConfig.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </button>
        );
      })}
    </div>
  );
}
