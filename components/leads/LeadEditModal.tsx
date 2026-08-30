"use client";

import { updateLeadAction, type LeadFormState } from "@/actions/leads.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
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
import { LEAD_STATUS_LABELS } from "@/lib/lead-labels";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  const tTelegram = useTranslations("telegramLink");

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "loading..." : tTelegram("save")}
    </Button>
  );
}

type LeadForEdit = {
  _id: string;
  status: string;
  objection: string | null;
  lastResult: string | null;
  nextContactDate: string | null;
};

export function LeadEditModal({ lead }: { lead: LeadForEdit }) {
  const t = useTranslations("leads");
  const tTelegram = useTranslations("telegramLink");

  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<LeadFormState, FormData>(
    updateLeadAction,
    {},
  );

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editTitle")}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="leadId" value={lead._id} />

          <div className="space-y-1.5">
            <Label>{t("status")}</Label>
            <Select name="status" defaultValue={lead.status}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LEAD_STATUS_LABELS).map(([value, jsonKey]) => (
                  <SelectItem key={value} value={value}>
                    {t(jsonKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="objection">{t("objection")}</Label>
            <textarea
              id="objection"
              name="objection"
              defaultValue={lead.objection ?? ""}
              rows={2}
              placeholder={t("objectionPlaceholder")}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastResult">{t("lastResult")}</Label>
            <textarea
              id="lastResult"
              name="lastResult"
              defaultValue={lead.lastResult ?? ""}
              rows={2}
              placeholder={t("lastResultPlaceholder")}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nextContactDate">{t("nextContactDate")}</Label>
            <Input
              id="nextContactDate"
              name="nextContactDate"
              type="date"
              defaultValue={
                lead.nextContactDate ? lead.nextContactDate.slice(0, 10) : ""
              }
            />
          </div>

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
