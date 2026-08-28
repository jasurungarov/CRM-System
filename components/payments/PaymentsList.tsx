import { getTranslations } from "next-intl/server";
import { getPayments } from "@/actions/payments.actions";
import { Badge } from "@/components/ui/badge";
import { ReceiptPdfButton } from "./ReceiptPdfButton";

export async function PaymentsList() {
  const t = await getTranslations("payments");
  const payments = await getPayments();

  const METHOD_LABELS: Record<string, string> = {
    naqd: t("methodCash"),
    karta: t("methodCard"),
    bank_otkazma: t("methodBank"),
    payme: t("methodPayme"),
    click: t("methodClick"),
    boshqa: t("methodOther"),
  };

  if (payments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        {t("noPayments")}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {payments.map((p) => (
          <div key={p._id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{p.client?.fullName ?? "—"}</p>
                <p className="font-mono text-xs text-muted-foreground">{p.receiptNumber}</p>
              </div>
              <ReceiptPdfButton paymentId={p._id} />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="font-semibold">{p.amount.toLocaleString("uz-UZ")} so&apos;m</span>
              <Badge variant="secondary">{METHOD_LABELS[p.paymentMethod] ?? p.paymentMethod}</Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border lg:block">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">{t("tableReceipt")}</th>
              <th className="px-4 py-3 font-medium">{t("tableClient")}</th>
              <th className="px-4 py-3 font-medium">{t("tableSum")}</th>
              <th className="px-4 py-3 font-medium">{t("tableMethod")}</th>
              <th className="px-4 py-3 font-medium">{t("tableDate")}</th>
              <th className="px-4 py-3 font-medium text-right">{t("tableReceiptCol")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((p) => (
              <tr key={p._id} className="hover:bg-secondary/40">
                <td className="px-4 py-3 font-mono text-xs">{p.receiptNumber}</td>
                <td className="px-4 py-3">{p.client?.fullName ?? "—"}</td>
                <td className="px-4 py-3 font-semibold">{p.amount.toLocaleString("uz-UZ")}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{METHOD_LABELS[p.paymentMethod] ?? p.paymentMethod}</Badge>
                </td>
                <td className="px-4 py-3">{new Date(p.createdAt as unknown as string).toLocaleDateString("uz-UZ")}</td>
                <td className="px-4 py-3 text-right">
                  <ReceiptPdfButton paymentId={p._id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}