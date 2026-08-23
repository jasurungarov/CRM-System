import { notFound } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { getConfirmationByToken } from "@/actions/confirmations.actions";
import { COMPANY_INFO } from "@/lib/company-info";
import { AcceptContractForm } from "@/components/confirmations/AcceptContractForm";
import { DownloadContractButton } from "@/components/confirmations/DownloadContractButton";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  yuborildi: { label: "Ko'rib chiqilmoqda", tone: "text-accent" },
  tasdiqlandi: { label: "Tasdiqlangan", tone: "text-success" },
  muddati_otgan: { label: "Muddati o'tgan", tone: "text-destructive" },
  bekor_qilingan: { label: "Bekor qilingan", tone: "text-muted-foreground" },
};

function som(n: number) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

export default async function PublicConfirmPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const confirmation = await getConfirmationByToken(token);

  if (!confirmation) notFound();

  const { clientData } = confirmation;
  const statusInfo = STATUS_LABELS[confirmation.status] ?? STATUS_LABELS.yuborildi;

  return (
    <div className="min-h-screen bg-secondary/40 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-6 w-6 text-accent" />
          </span>
          <div>
            <p className="font-display font-semibold">{COMPANY_INFO.name}</p>
            <p className="text-xs text-muted-foreground">{COMPANY_INFO.phone}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-lg font-semibold">Shartnoma-tasdiqnoma № {confirmation.contractNumber}</h1>
            <Badge variant="outline" className={statusInfo.tone}>
              {statusInfo.label}
            </Badge>
          </div>

          <div className="mt-4 space-y-1.5 text-sm">
            <p>
              <span className="text-muted-foreground">Mijoz:</span> <strong>{clientData.fullName}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Tarif:</span> {clientData.tariffName} (
              {som(clientData.tariffPrice)})
            </p>
            <p>
              <span className="text-muted-foreground">To&apos;langan:</span> {som(clientData.totalPaid)}
            </p>
            <p>
              <span className="text-muted-foreground">Qolgan qarz:</span> {som(clientData.remainingDebt)}
            </p>
            <p>
              <span className="text-muted-foreground">Konsultant:</span> {clientData.assignedConsultantName}
            </p>
          </div>

          {clientData.universities?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium">Tanlangan universitetlar:</p>
              <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                {clientData.universities.map((u, i) => (
                  <li key={i}>
                    • {u.name} — {u.program} (muddat: {new Date(u.deadline).toLocaleDateString("uz-UZ")})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-5 space-y-2 rounded-md bg-secondary/60 p-4 text-xs leading-relaxed text-muted-foreground">
            <p>
              1. Ansor Edu Consulting mijozga tanlangan universitet(lar)ga hujjat topshirish, konsultatsiya va
              vizaga tayyorgarlik bo&apos;yicha xizmat ko&apos;rsatadi.
            </p>
            <p>2. Mijoz tanlangan tarif bo&apos;yicha belgilangan to&apos;lovni o&apos;z vaqtida amalga oshiradi.</p>
            <p>
              3. Ariza universitet tomonidan rad etilsa — to&apos;lov qaytarilmaydi. Agar rad etilish Ansor Edu
              xodimining aybi bilan bog&apos;liq bo&apos;lsa — mijozga pul qaytariladi (refund).
            </p>
            <p>4. Mijozning shaxsiy ma&apos;lumotlari uchinchi shaxslarga berilmaydi.</p>
          </div>
        </div>

        {confirmation.status === "yuborildi" && <AcceptContractForm token={token} />}
        {confirmation.status === "tasdiqlandi" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-center text-sm text-success">
              Ushbu shartnoma{" "}
              {confirmation.confirmedAt ? new Date(confirmation.confirmedAt).toLocaleString("uz-UZ") : ""} sanasida
              tasdiqlangan.
            </div>
            <DownloadContractButton
              data={{
                contractNumber: confirmation.contractNumber,
                sentAt: confirmation.sentAt,
                confirmedAt: confirmation.confirmedAt,
                clientAcceptedName: confirmation.clientAcceptedName,
                clientData: clientData as never,
              }}
            />
          </div>
        )}
        {confirmation.status === "muddati_otgan" && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
            Ushbu havolaning amal qilish muddati tugagan. Konsultantingizdan yangi havola so&apos;rang.
          </div>
        )}
        {confirmation.status === "bekor_qilingan" && (
          <div className="rounded-lg border border-border bg-secondary p-4 text-center text-sm text-muted-foreground">
            Ushbu shartnoma bekor qilingan.
          </div>
        )}
      </div>
    </div>
  );
}
