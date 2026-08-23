import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from "@/lib/enums";

const CONFIG: Record<DocumentStatus, { label: string; variant: "secondary" | "accent" | "success" | "destructive" }> = {
  yuklanmagan: { label: "Yuklanmagan", variant: "secondary" },
  kutilmoqda: { label: "Tekshiruvda", variant: "accent" },
  qabul_qilindi: { label: "Qabul qilindi", variant: "success" },
  rad_etildi: { label: "Rad etildi", variant: "destructive" },
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const c = CONFIG[status];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
