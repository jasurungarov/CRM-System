"use client";

import { runManualScanAction } from "@/actions/notifications.actions";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

export function ManualScanButton() {
  const tNotif = useTranslations("notifications");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const result = await runManualScanAction();
        toast.success(
          tNotif("scanComplete", { count: result.notificationsCreated }),
        );
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : tCommon("errorOccurred"),
        );
      }
    });
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleClick}
      disabled={isPending}>
      <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
      {tNotif("runScan")}
    </Button>
  );
}
