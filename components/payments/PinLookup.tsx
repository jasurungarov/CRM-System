"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getClientByPinWithLedger } from "@/actions/payments.actions";
import { NewPaymentModal } from "./NewPaymentModal";
import { ReceiptPdfButton } from "./ReceiptPdfButton";

type Ledger = Awaited<ReturnType<typeof getClientByPinWithLedger>>;

export function PinLookup() {
  const tPayments = useTranslations("payments");
  const tCommon = useTranslations("common");

  const [pin, setPin] = useState("");
  const [result, setResult] = useState<Ledger | null>(null);
  const [isPending, startTransition] = useTransition();

  const STATUS_LABELS: Record<string, { label: string; variant: "success" | "accent" | "destructive" }> = {
    to_liq_to_langan: { label: tPayments("statusFullyPaid"), variant: "success" },
    qisman_to_langan: { label: tPayments("statusPartiallyPaid"), variant: "accent" },
    to_lanmagan: { label: tPayments("statusUnpaid"), variant: "destructive" },
  };

  function handleSearch() {
    if (pin.trim().length !== 6) {
      toast.error(tPayments("pinValidation"));
      return;
    }
    startTransition(async () => {
      try {
        const data = await getClientByPinWithLedger(pin.trim());
        setResult(data);
      } catch (err) {
        setResult(null);
        toast.error(err instanceof Error ? err.message : tCommon("errorOccurred"));
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={`6 ${tPayments("pinSearchTitle").toLowerCase()}`}
          className="max-w-[200px] font-mono"
        />
        <Button onClick={handleSearch} disabled={isPending}>
          <Search className="h-4 w-4" />
          {tCommon("search")}
        </Button>
      </div>

      {result && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{result.client.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {result.client.phone} · {result.client.tariff?.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_LABELS[result.summary.paymentStatus]?.variant ?? "secondary"}>
                  {STATUS_LABELS[result.summary.paymentStatus]?.label ?? result.summary.paymentStatus}
                </Badge>
                <NewPaymentModal
                  clientId={result.client._id}
                  clientName={result.client.fullName}
                  triggerLabel={tPayments("acceptPayment")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">{tPayments("tariffPrice")}</p>
                <p className="font-semibold">{result.summary.tariffPrice.toLocaleString("en-US")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{tPayments("paid")}</p>
                <p className="font-semibold">{result.summary.totalPaid.toLocaleString("en-US")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{tPayments("debt")}</p>
                <p className="font-semibold">{result.summary.remainingDebt.toLocaleString("en-US")}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">{tPayments("history")}</p>
              {result.payments.length === 0 && (
                <p className="text-sm text-muted-foreground">{tPayments("noPayments")}</p>
              )}
              {result.payments.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{p.receiptNumber}</p>
                    <p>{p.amount.toLocaleString("en-US")} $</p>
                  </div>
                  <ReceiptPdfButton paymentId={p._id} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}