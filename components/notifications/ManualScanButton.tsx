"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runManualScanAction } from "@/actions/notifications.actions";

export function ManualScanButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const result = await runManualScanAction();
        toast.success(`Skanerlash tugadi: ${result.notificationsCreated} ta yangi bildirishnoma`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi");
      }
    });
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleClick} disabled={isPending}>
      <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
      Deadline skanerini ishga tushirish
    </Button>
  );
}
