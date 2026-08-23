"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
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

const PAYMENT_METHODS = [
  { value: "naqd", label: "Naqd" },
  { value: "karta", label: "Plastik karta" },
  { value: "bank_otkazma", label: "Bank o'tkazmasi" },
  { value: "payme", label: "Payme" },
  { value: "click", label: "Click" },
  { value: "boshqa", label: "Boshqa" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "..." : "To'lovni qabul qilish"}
    </Button>
  );
}

export function NewPaymentModal({
  clientId,
  clientName,
  triggerLabel = "Yangi to'lov",
}: {
  clientId: string;
  clientName?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<PaymentFormState, FormData>(createPaymentAction, {});

  useEffect(() => {
    if (state.success && state.receiptNumber && state.paymentId) {
      toast.success(`To'lov qabul qilindi: ${state.receiptNumber}`);
      setOpen(false);
      getReceiptData(state.paymentId).then(downloadReceiptPdf).catch(() => {
        // Chek avtomatik yuklanmasa ham to'lov muvaffaqiyatli saqlangan —
        // foydalanuvchi keyinroq ro'yxatdan PDF tugmasi orqali qayta yuklab olishi mumkin.
      });
    }
  }, [state.success, state.receiptNumber, state.paymentId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>To&apos;lov qabul qilish</DialogTitle>
          <DialogDescription>{clientName ?? "Mijoz uchun yangi to'lov"}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />

          <div className="space-y-1.5">
            <Label htmlFor="amount">Summa (UZS)</Label>
            <Input id="amount" name="amount" type="number" min={1} placeholder="1000000" required />
          </div>

          <div className="space-y-1.5">
            <Label>To&apos;lov usuli</Label>
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
            <Label htmlFor="note">Izoh (ixtiyoriy)</Label>
            <Input id="note" name="note" />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Bekor qilish
              </Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
