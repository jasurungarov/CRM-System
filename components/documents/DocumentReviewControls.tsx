"use client";

import { reviewDocumentAction } from "@/actions/documents.actions";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

export function DocumentReviewControls({ documentId }: { documentId: string }) {
  const t = useTranslations("documents");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  function handleAccept() {
    startTransition(async () => {
      try {
        await reviewDocumentAction(documentId, "qabul_qilindi");
        toast.success(t("reviewAccepted"));
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : tCommon("errorOccurred"),
        );
      }
    });
  }

  function handleReject() {
    const reason = window.prompt(t("rejectReasonPrompt"));
    if (!reason?.trim()) return;
    startTransition(async () => {
      try {
        await reviewDocumentAction(documentId, "rad_etildi", reason);
        toast.success(t("reviewRejected"));
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : tCommon("errorOccurred"),
        );
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleAccept}
        disabled={isPending}
        aria-label={t("reviewAccept")}>
        <Check className="h-4 w-4 text-success" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleReject}
        disabled={isPending}
        aria-label={t("reviewReject")}>
        <X className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
