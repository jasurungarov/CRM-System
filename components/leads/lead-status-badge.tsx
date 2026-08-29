import { Badge } from "@/components/ui/badge";
import { LEAD_STATUS_LABELS } from "@/lib/lead-labels";
import type { LeadStatus } from "@/lib/enums";

const VARIANT_MAP: Record<LeadStatus, "secondary" | "accent" | "success" | "destructive"> = {
  yangi: "secondary",
  boglanildi: "accent",
  qiziqmoqda: "accent",
  tayyor: "success",
  rad_etdi: "destructive",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Badge variant={VARIANT_MAP[status]}>{LEAD_STATUS_LABELS[status]}</Badge>;
}