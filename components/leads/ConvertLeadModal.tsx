"use client";

import {
  convertLeadToClientAction,
  type ConvertLeadFormState,
} from "@/actions/leads.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRightCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("leads");

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "..." : t("convertSubmit")}
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
  const t = useTranslations("leads");
  const tTelegram = useTranslations("telegramLink");

  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<ConvertLeadFormState, FormData>(
    convertLeadToClientAction,
    {},
  );

  useEffect(() => {
    if (state.success) {
      toast.success(t("convertSuccess", { name: leadName }));
      setOpen(false);
    }
  }, [state.success, leadName, t]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent" size="sm">
          <ArrowRightCircle className="h-4 w-4" />
          {t("convertButton")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("convertButton")}</DialogTitle>
          <DialogDescription>
            {t("convertDesc", { name: leadName })}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="leadId" value={leadId} />

          <div className="space-y-1.5">
            <Label htmlFor="email">{t("convertEmail")}</Label>
            <Input id="email" name="email" type="email" required />
          </div>

          <div className="space-y-1.5">
            <Label>{t("convertTariff")}</Label>
            <Select name="tariffId">
              <SelectTrigger>
                <SelectValue placeholder={t("convertSelectTariff")} />
              </SelectTrigger>
              <SelectContent>
                {tariffs.map((tariff) => (
                  <SelectItem key={tariff._id} value={tariff._id}>
                    {tariff.name} — {tariff.price.toLocaleString("uz-UZ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {canAssign && (
            <div className="space-y-1.5">
              <Label>{t("convertConsultant")}</Label>
              <Select name="assignedTo" defaultValue={currentUserId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("convertSelectConsultant")} />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((consultant) => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      {consultant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {tTelegram("cancel")}
              </Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
