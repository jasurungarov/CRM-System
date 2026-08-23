import { PinLookup } from "@/components/payments/PinLookup";
import { PaymentsList } from "@/components/payments/PaymentsList";

export default function PaymentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-display font-semibold sm:text-2xl">To&apos;lovlar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          PIN orqali tez qidiruv yoki to&apos;liq to&apos;lovlar tarixi
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">PIN bo&apos;yicha qidiruv</h2>
        <PinLookup />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Barcha to&apos;lovlar</h2>
        <PaymentsList />
      </section>
    </div>
  );
}
