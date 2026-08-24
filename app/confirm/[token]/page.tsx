import { getConfirmationByToken } from "@/actions/confirmations.actions";
import { AcceptContractForm } from "@/components/confirmations/AcceptContractForm";
import { DownloadContractButton } from "@/components/confirmations/DownloadContractButton";
import { Badge } from "@/components/ui/badge";
import { COMPANY_INFO } from "@/lib/company-info";
import Image from 'next/image'
import { notFound } from "next/navigation";

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  yuborildi: { label: "Ko'rib chiqilmoqda", tone: "text-accent" },
  tasdiqlandi: { label: "Tasdiqlangan", tone: "text-success" },
  muddati_otgan: { label: "Muddati o'tgan", tone: "text-destructive" },
  bekor_qilingan: { label: "Bekor qilingan", tone: "text-muted-foreground" },
};

function som(n: number) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

export default async function PublicConfirmPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const confirmation = await getConfirmationByToken(token);

  if (!confirmation) notFound();

  const { clientData } = confirmation;
  const statusInfo =
    STATUS_LABELS[confirmation.status] ?? STATUS_LABELS.yuborildi;

  return (
    <div className="min-h-screen bg-secondary/40 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border">
            <Image
              src="/logo.png"
              alt={COMPANY_INFO.name}
              width={44}
              height={44}
              className="h-full w-full object-contain p-1"
            />
          </span>
          <div>
            <p className="font-display font-semibold">{COMPANY_INFO.name}</p>
            <p className="text-xs text-muted-foreground">
              {COMPANY_INFO.phone}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-lg font-semibold">
              Shartnoma-tasdiqnoma № {confirmation.contractNumber}
            </h1>
            <Badge variant="outline" className={statusInfo.tone}>
              {statusInfo.label}
            </Badge>
          </div>

          <div className="mt-4 space-y-1.5 text-sm">
            <p>
              <span className="text-muted-foreground">Mijoz:</span>{" "}
              <strong>{clientData.fullName}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Tarif:</span>{" "}
              {clientData.tariffName} ({som(clientData.tariffPrice)})
            </p>
            <p>
              <span className="text-muted-foreground">To&apos;langan:</span>{" "}
              {som(clientData.totalPaid)}
            </p>
            <p>
              <span className="text-muted-foreground">Qolgan qarz:</span>{" "}
              {som(clientData.remainingDebt)}
            </p>
            <p>
              <span className="text-muted-foreground">Konsultant:</span>{" "}
              {clientData.assignedConsultantName}
            </p>
          </div>

          {clientData.universities?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium">Tanlangan universitetlar:</p>
              <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                {clientData.universities.map((u, i) => (
                  <li key={i}>
                    • {u.name} — {u.program} (muddat:{" "}
                    {new Date(u.deadline).toLocaleDateString("uz-UZ")})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-5 space-y-2 rounded-md bg-secondary/60 p-4 text-xs leading-relaxed text-muted-foreground">
            <p>
              1. Ansor Edu firmasi mijozga tanlangan universitet(larga)
              hujjatlarni tayyorlash, topshirish va konsultatsiya xizmatlarini
              koʻrsatadi. Firma xizmati — jarayonni professional tashkil etish
              boʻlib, universitet tomonidan qabul qilinishga kafolat bermaydi,
              chunki qabul qilish qarori toʻliq universitetning ichki
              komissiyasi ixtiyorida.
            </p>
            <p>
              2. Agar mijoz tanlangan universitet(lar)ga qabul qilinmasa, bu
              firma xizmatining sifatsizligi deb hisoblanmaydi. Mijoz bunday
              holatda firmaga, uning xodimlariga nisbatan haqoratli, tuhmat
              xarakteridagi soʻz va ayblovlarni bildirmaslikka rozilik
              bildiradi.
            </p>
            <p>
              3. Toʻlov qaytarilishi <br />a) Agar mijozning hujjatlari tanlangan
              universitet(lar)ga muvaffaqiyatli topshirilgan boʻlsa-yu,
              universitet komissiyasi qabul qilishdan bosh tortsa — bu holatda
              mijoz tomonidan toʻlangan xizmat haqi qaytarilmaydi, chunki firma
              oʻz majburiyatini (topshirish jarayonini toʻliq va sifatli tashkil
              etish) bajargan hisoblanadi. <br /> b) Agar mijozning arizasi firma
              xodimi (menejer)ning aybi/e&apos;tiborsizligi tufayli belgilangan
              muddatda universitet(lar)ga topshirilmay qolib ketgan boʻlsa — bu
              holatda mijoz tomonidan toʻlangan xizmat haqining toʻliq summasi
              qaytariladi.
            </p>
            <p>
              4. Mijoz taqdim etgan barcha maʼlumot va hujjatlarning
              toʻgʻriligiga oʻzi javobgar notoʻgʻri maʼlumot sababli yuzaga
              kelgan rad javobiga firma javobgar emas.
            </p>
            <p>
              5. Ushbu hujjatni tasdiqlash orqali mijoz yuqoridagi shartlar
              bilan tanishgani va rozi ekanini bildiradi hamda mijozning shaxsiy
              ma&apos;lumotlari uchinchi shaxslarga berilmaydi.
            </p>
          </div>
        </div>

        {confirmation.status === "yuborildi" && (
          <AcceptContractForm token={token} />
        )}
        {confirmation.status === "tasdiqlandi" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-center text-sm text-success">
              Ushbu shartnoma{" "}
              {confirmation.confirmedAt
                ? new Date(confirmation.confirmedAt).toLocaleString("uz-UZ")
                : ""}{" "}
              sanasida tasdiqlangan.
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
            Ushbu havolaning amal qilish muddati tugagan. Konsultantingizdan
            yangi havola so&apos;rang.
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
