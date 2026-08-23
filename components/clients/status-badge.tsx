import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/lib/enums";

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; variant: "secondary" | "accent" | "success" | "destructive" }> = {
  topshirilmagan: { label: "Topshirilmagan", variant: "secondary" },
  topshirilgan: { label: "Topshirilgan", variant: "accent" },
  qabul_qilindi: { label: "Qabul qilindi", variant: "success" },
  rad_etildi: { label: "Rad etildi", variant: "destructive" },
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

const URGENCY_CONFIG: Record<string, { label: string; variant: "secondary" | "accent" | "destructive" }> = {
  expired: { label: "Muddati o'tgan", variant: "destructive" },
  urgent: { label: "Shoshilinch", variant: "destructive" },
  warning: { label: "Diqqat", variant: "accent" },
  normal: { label: "Normal", variant: "secondary" },
};

export function UrgencyBadge({ urgency, daysLeft }: { urgency: string; daysLeft: number }) {
  const config = URGENCY_CONFIG[urgency] ?? URGENCY_CONFIG.normal;
  return (
    <Badge variant={config.variant}>
      {config.label} {urgency !== "expired" ? `(${daysLeft} kun)` : ""}
    </Badge>
  );
}
