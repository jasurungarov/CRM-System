"use client";

import { createLeadAction, type LeadFormState } from "@/actions/leads.actions";
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
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

const EDUCATION_OPTIONS = [
  { value: "maktab", key: "educationMaktab" },
  { value: "kollej", key: "educationKollej" },
  { value: "bakalavriat", key: "educationBakalavriat" },
  { value: "magistratura", key: "educationMagistratura" },
  { value: "boshqa", key: "educationBoshqa" },
] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("leads");

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "loading..." : t("addNew")}
    </Button>
  );
}

export function LeadFormModal() {
  const t = useTranslations("leads");
  const tTelegram = useTranslations("telegramLink");

  const [open, setOpen] = useState(false);
  const [educationLevel, setEducationLevel] = useState("boshqa");
  const [state, formAction] = useActionState<LeadFormState, FormData>(
    createLeadAction,
    {},
  );

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          {t("addNew")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addTitle")}</DialogTitle>
          <DialogDescription>{t("addDesc")}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">{t("fullName")}</Label>
            <Input id="fullName" name="fullName" required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input id="phone" name="phone" placeholder="+998" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telegramUsername">{t("telegramUsername")}</Label>
              <Input
                id="telegramUsername"
                name="telegramUsername"
                placeholder="@username"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telegramPhone">{t("telegramPhone")}</Label>
            <Input id="telegramPhone" name="telegramPhone" placeholder="+998" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="country">{t("country")}</Label>
              <Input id="country" name="country" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="direction">{t("direction")}</Label>
              <Input id="direction" name="direction" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("educationLevel")}</Label>
            <Select
              name="educationLevel"
              value={educationLevel}
              onValueChange={setEducationLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EDUCATION_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {t(item.key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {educationLevel === "boshqa" && (
            <div className="space-y-1.5">
              <Label htmlFor="educationLevelOther">
                {t("educationLevelOther")}
              </Label>
              <Input id="educationLevelOther" name="educationLevelOther" />
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
