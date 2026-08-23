"use client";

import { useState, useTransition } from "react";
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

const STATUS_OPTIONS: Array<{ value: ApplicationStatus; label: string }> = [
  { value: "topshirilmagan", label: "Topshirilmagan" },
  { value: "topshirilgan", label: "Topshirilgan" },
  { value: "qabul_qilindi", label: "Qabul qilindi" },
  { value: "rad_etildi", label: "Rad etildi" },
];

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
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);

  function handleStatusChange(newStatus: ApplicationStatus) {
    // "rad_etildi" tanlansa, sababni so'raymiz (oddiy prompt — tezkor UX uchun)
    let failureReason: FailureReason = null;
    if (newStatus === "rad_etildi") {
      const managerFault = window.confirm(
        "Rad etilish sababi menejer aybimi? (Bekor qilsangiz — universitet rad etdi deb belgilanadi)"
      );
      failureReason = managerFault ? "menejer_aybi" : "universitet_rad_etdi";
    }

    startTransition(async () => {
      try {
        const result = await updateApplicationStatusAction(clientId, universityId, newStatus, failureReason);
        setStatus(newStatus);
        if (result.refundEligible) {
          toast.warning("Avtomatik refund huquqi berildi (menejer aybi)");
        } else {
          toast.success("Ariza holati yangilandi");
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm("Ushbu arizani o'chirmoqchimisiz?")) return;
    startTransition(async () => {
      try {
        await removeUniversityApplicationAction(clientId, universityId);
        toast.success("Ariza o'chirildi");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi");
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
        <span className="text-xs font-medium text-success">Qaytarildi ✓</span>
      )}

      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={isPending}
          aria-label="O'chirish"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  );
}
