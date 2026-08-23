"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { markAsReadAction, markAllAsReadAction } from "@/actions/notifications.actions";
import { CheckCheck } from "lucide-react";

type NotificationRow = {
  _id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
};

const PRIORITY_CONFIG: Record<string, { label: string; variant: "destructive" | "accent" | "secondary" }> = {
  shoshilinch: { label: "Shoshilinch", variant: "destructive" },
  yuqori: { label: "Yuqori", variant: "accent" },
  orta: { label: "O'rta", variant: "secondary" },
  past: { label: "Past", variant: "secondary" },
};

export function NotificationsListClient({ initialNotifications }: { initialNotifications: NotificationRow[] }) {
  const [items, setItems] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();

  function handleRead(id: string) {
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
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

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <button
          onClick={handleReadAll}
          disabled={isPending}
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <CheckCheck className="h-4 w-4" />
          Barchasini o&apos;qilgan deb belgilash ({unreadCount})
        </button>
      )}

      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Hozircha bildirishnoma yo&apos;q
        </div>
      )}

      {items.map((n) => {
        const priority = PRIORITY_CONFIG[n.priority] ?? PRIORITY_CONFIG.orta;
        return (
          <button
            key={n._id}
            onClick={() => !n.isRead && handleRead(n._id)}
            className={`block w-full rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-opacity ${
              n.isRead ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{n.title}</p>
              <Badge variant={priority.variant}>{priority.label}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(n.createdAt).toLocaleString("uz-UZ")}
            </p>
          </button>
        );
      })}
    </div>
  );
}
