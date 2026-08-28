"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  updateApplicationStatusAction,
  removeUniversityApplicationAction,
} from "@/actions/applications.actions";
import type { ApplicationStatus, FailureReason } from "@/lib/enums";
import { RefundModal } from "./RefundModal";

export function UniversityStatusControls({
  clientId,
  universityId,
  currentStatus,
  refundEligible,
  alreadyRefunded,
  canProcessRefund,
  canDelete,
}: {
  clientId: string;
  universityId: string;
  currentStatus: ApplicationStatus;
  refundEligible: boolean;
  alreadyRefunded: boolean;
  canProcessRefund: boolean;
  canDelete: boolean;
}) {
  const tApps = useTranslations("applications");
  const tBadge = useTranslations("statusBadge");
  const tCommon = useTranslations("common");

  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);

  const STATUS_OPTIONS: Array<{ value: ApplicationStatus; label: string }> = [
    { value: "topshirilmagan", label: tBadge("notSubmitted") },
    { value: "topshirilgan", label: tBadge("submitted") },
    { value: "qabul_qilindi", label: tBadge("accepted") },
    { value: "rad_etildi", label: tBadge("rejected") },
  ];

  function handleStatusChange(newStatus: ApplicationStatus) {
    let failureReason: FailureReason = null;
    if (newStatus === "rad_etildi") {
      const managerFault = window.confirm(tApps("managerFaultPrompt"));
      failureReason = managerFault ? "menejer_aybi" : "universitet_rad_etdi";
    }

    startTransition(async () => {
      try {
        const result = await updateApplicationStatusAction(clientId, universityId, newStatus, failureReason);
        setStatus(newStatus);
        if (result.refundEligible) {
          toast.warning(tApps("refundAutoGranted"));
        } else {
          toast.success(tApps("statusUpdated"));
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : tCommon("errorOccurred"));
      }
    });
  }

  function handleDelete() {
    if (!window.confirm(tApps("deleteConfirm"))) return;
    startTransition(async () => {
      try {
        await removeUniversityApplicationAction(clientId, universityId);
        toast.success(tApps("deleted"));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : tCommon("errorOccurred"));
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={status} onValueChange={(v) => handleStatusChange(v as ApplicationStatus)}>
        <SelectTrigger className="h-9 w-[170px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {refundEligible && !alreadyRefunded && canProcessRefund && (
        <RefundModal clientId={clientId} universityId={universityId} />
      )}
      {alreadyRefunded && (
        <span className="text-xs font-medium text-success">{tApps("alreadyRefunded")}</span>
      )}

      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={isPending}
          aria-label={tApps("delete")}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  );
}