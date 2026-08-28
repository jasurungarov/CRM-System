import { PaymentsList } from "@/components/payments/PaymentsList";
import { PinLookup } from "@/components/payments/PinLookup";
import { getTranslations } from "next-intl/server";

export default async function PaymentsPage() {
  const t = await getTranslations("payments");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-display font-semibold sm:text-2xl">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {t("pinSearchTitle")}
        </h2>
        <PinLookup />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {t("allPaymentsTitle")}
        </h2>
        <PaymentsList />
      </section>
    </div>
  );
}
