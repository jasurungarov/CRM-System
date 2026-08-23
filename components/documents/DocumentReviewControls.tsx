"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reviewDocumentAction } from "@/actions/documents.actions";

export function DocumentReviewControls({ documentId }: { documentId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleAccept() {
    startTransition(async () => {
      try {
        await reviewDocumentAction(documentId, "qabul_qilindi");
        toast.success("Hujjat qabul qilindi");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Xatolik");
      }
    });
  }

  function handleReject() {
    const reason = window.prompt("Rad etish sababini kiriting:");
    if (!reason?.trim()) return;
    startTransition(async () => {
      try {
        await reviewDocumentAction(documentId, "rad_etildi", reason);
        toast.success("Hujjat rad etildi");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Xatolik");
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={handleAccept} disabled={isPending} aria-label="Qabul qilish">
        <Check className="h-4 w-4 text-success" />
      </Button>
      <Button variant="ghost" size="icon" onClick={handleReject} disabled={isPending} aria-label="Rad etish">
        <X className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
