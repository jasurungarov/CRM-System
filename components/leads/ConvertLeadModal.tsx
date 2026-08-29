"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { ArrowRightCircle } from "lucide-react";
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
import { convertLeadToClientAction, type ConvertLeadFormState } from "@/actions/leads.actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "..." : "Mijoz sifatida yaratish"}
    </Button>
  );
}

export function ConvertLeadModal({
  leadId,
  leadName,
  canAssign,
  currentUserId,
  tariffs,
  consultants,
}: {
  leadId: string;
  leadName: string;
  canAssign: boolean;
  currentUserId: string;
  tariffs: Array<{ _id: string; name: string; price: number }>;
  consultants: Array<{ id: string; name: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<ConvertLeadFormState, FormData>(convertLeadToClientAction, {});

  useEffect(() => {
    if (state.success) {
      toast.success(`${leadName} mijozga aylantirildi`);
      setOpen(false);
    }
  }, [state.success, leadName]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent" size="sm">
          <ArrowRightCircle className="h-4 w-4" />
          Mijozga aylantirish
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mijozga aylantirish</DialogTitle>
          <DialogDescription>
            {leadName} endi rasmiy mijoz sifatida CRM tomonga o&apos;tkaziladi.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="leadId" value={leadId} />

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>

          <div className="space-y-1.5">
            <Label>Tarif</Label>
            <Select name="tariffId">
              <SelectTrigger>
                <SelectValue placeholder="Tarif tanlang" />
              </SelectTrigger>
              <SelectContent>
                {tariffs.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name} — {t.price.toLocaleString("uz-UZ")} so&apos;m
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {canAssign && (
            <div className="space-y-1.5">
              <Label>Konsultant</Label>
              <Select name="assignedTo" defaultValue={currentUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Konsultant tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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