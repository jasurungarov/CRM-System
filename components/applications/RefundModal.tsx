"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Banknote } from "lucide-react";
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
import { processRefundAction } from "@/actions/applications.actions";

export function RefundModal({ clientId, universityId }: { clientId: string; universityId: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const numeric = Number(amount);
    if (!numeric || numeric <= 0) {
      toast.error("To'g'ri summa kiriting");
      return;
    }
    startTransition(async () => {
      try {
        await processRefundAction(clientId, universityId, numeric, note || undefined);
        toast.success("Refund muvaffaqiyatli amalga oshirildi");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent" size="sm">
          <Banknote className="h-4 w-4" />
          Refund
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>To&apos;lovni qaytarish (Refund)</DialogTitle>
          <DialogDescription>
            Menejer aybi sababli rad etilgan ariza uchun to&apos;lov qaytarilmoqda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="refundAmount">Qaytariladigan summa (UZS)</Label>
            <Input
              id="refundAmount"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="5000000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="refundNote">Izoh (ixtiyoriy)</Label>
            <Input id="refundNote" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Bekor qilish</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "..." : "Tasdiqlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
