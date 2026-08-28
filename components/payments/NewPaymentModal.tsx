"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createPaymentAction, type PaymentFormState } from "@/actions/payments.actions";
import { downloadReceiptPdf } from "@/lib/pdf/receipt";
import { getReceiptData } from "@/actions/payments.actions";

function SubmitButton({ label, loadingLabel }: { label: string; loadingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? loadingLabel : label}
    </Button>
  );
}

export function NewPaymentModal({
  clientId,
  clientName,
  triggerLabel,
}: {
  clientId: string;
  clientName?: string;
  triggerLabel?: string;
}) {
  const tPayments = useTranslations("payments");
  const tCommon = useTranslations("common");

  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<PaymentFormState, FormData>(createPaymentAction, {});

  const PAYMENT_METHODS = [
    { value: "naqd", label: tPayments("methodCash") },
    { value: "karta", label: tPayments("methodCard") },
    { value: "bank_otkazma", label: tPayments("methodBank") },
    { value: "payme", label: tPayments("methodPayme") },
    { value: "click", label: tPayments("methodClick") },
    { value: "boshqa", label: tPayments("methodOther") },
  ];

  useEffect(() => {
    if (state.success && state.receiptNumber && state.paymentId) {
      toast.success(`${tPayments("acceptPayment")}: ${state.receiptNumber}`);
      setOpen(false);
      getReceiptData(state.paymentId).then(downloadReceiptPdf).catch(() => {});
    }
  }, [state.success, state.receiptNumber, state.paymentId, tPayments]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          {triggerLabel ?? tPayments("newPayment")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tPayments("acceptPayment")}</DialogTitle>
          <DialogDescription>{clientName ?? tPayments("forClientDefault")}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />

          <div className="space-y-1.5">
            <Label htmlFor="amount">{tPayments("amount").replace("UZS", "$")}</Label>
            <Input id="amount" name="amount" type="number" min={1} placeholder="100" required />
          </div>

          <div className="space-y-1.5">
            <Label>{tPayments("method")}</Label>
            <Select name="paymentMethod" defaultValue="naqd">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">
              {tCommon("note")} ({tCommon("optional")})
            </Label>
            <Input id="note" name="note" />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {tCommon("cancel")}
              </Button>
            </DialogClose>
            <SubmitButton
              label={tPayments("acceptPayment")}
              loadingLabel={tCommon("loading")}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}