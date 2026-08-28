"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Ban, Send, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cancelConfirmationAction, resendTelegramAction } from "@/actions/confirmations.actions";
import { downloadContractPdf } from "@/lib/pdf/contract";

type ConfirmationRow = {
  _id: string;
  contractNumber: string;
  status: string;
  isExpiredNow: boolean;
  sentAt: string;
  confirmedAt?: string | null;
  clientAcceptedName?: string;
  telegramChatId?: string;
  clientData: {
    fullName: string;
    tariffName: string;
    universities: Array<{ name: string; program: string; deadline: string }>;
    [key: string]: unknown;
  };
};

export function ConfirmationsList({ confirmations }: { confirmations: ConfirmationRow[] }) {
  const t = useTranslations("confirmations");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const STATUS_CONFIG: Record<string, { label: string; variant: "secondary" | "accent" | "success" | "destructive" }> = {
    yuborildi: { label: t("statusSent"), variant: "accent" },
    tasdiqlandi: { label: t("statusConfirmed"), variant: "success" },
    muddati_otgan: { label: t("statusExpired"), variant: "destructive" },
    bekor_qilingan: { label: t("statusCancelled"), variant: "secondary" },
  };

  function handleCancel(id: string) {
    if (!window.confirm(t("cancelConfirmPrompt"))) return;
    startTransition(async () => {
      try {
        await cancelConfirmationAction(id);
        toast.success(t("cancelled"));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : tCommon("errorOccurred"));
      }
    });
  }

  function handleResend(id: string) {
    startTransition(async () => {
      try {
        await resendTelegramAction(id);
        toast.success(t("telegramResent"));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : tCommon("errorOccurred"));
      }
    });
  }

  if (confirmations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        {tCommon("noResults")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {confirmations.map((c) => {
        const effectiveStatus = c.isExpiredNow ? "muddati_otgan" : c.status;
        const config = STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.yuborildi;
        return (
          <div
            key={c._id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{c.clientData.fullName}</p>
              <p className="font-mono text-xs text-muted-foreground">{c.contractNumber}</p>
              <Badge variant={config.variant} className="mt-1.5">
                {config.label}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("pdf")}
                onClick={() =>
                  downloadContractPdf({
                    contractNumber: c.contractNumber,
                    sentAt: c.sentAt,
                    confirmedAt: c.confirmedAt,
                    clientAcceptedName: c.clientAcceptedName,
                    clientData: c.clientData as never,
                  })
                }
              >
                <FileDown className="h-4 w-4" />
              </Button>
              {effectiveStatus === "yuborildi" && c.telegramChatId && (
                <Button variant="ghost" size="icon" aria-label={t("resend")} onClick={() => handleResend(c._id)} disabled={isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              )}
              {effectiveStatus === "yuborildi" && (
                <Button variant="ghost" size="icon" aria-label={tCommon("cancel")} onClick={() => handleCancel(c._id)} disabled={isPending}>
                  <Ban className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}