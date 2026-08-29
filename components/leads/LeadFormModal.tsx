"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
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
import { createLeadAction, type LeadFormState } from "@/actions/leads.actions";
import { EDUCATION_LEVEL_LABELS } from "@/lib/lead-labels";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "..." : "Qo'shish"}
    </Button>
  );
}

export function LeadFormModal() {
  const [open, setOpen] = useState(false);
  const [educationLevel, setEducationLevel] = useState("boshqa");
  const [state, formAction] = useActionState<LeadFormState, FormData>(createLeadAction, {});

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Yangi lid
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yangi lid qo&apos;shish</DialogTitle>
          <DialogDescription>Hali shartnoma tuzmagan, lekin qiziqish bildirgan aloqa</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Ismi</Label>
            <Input id="fullName" name="fullName" required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" name="phone" placeholder="+998" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telegramUsername">Telegram username</Label>
              <Input id="telegramUsername" name="telegramUsername" placeholder="@username" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telegramPhone">Telegram raqami (agar username bo&apos;lmasa)</Label>
            <Input id="telegramPhone" name="telegramPhone" placeholder="+998" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="country">Qiziqqan davlat</Label>
              <Input id="country" name="country" placeholder="masalan: Saudiya Arabistoni" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="direction">Yo&apos;nalish</Label>
              <Input id="direction" name="direction" placeholder="masalan: Tibbiyot" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Ta&apos;lim darajasi</Label>
            <Select name="educationLevel" value={educationLevel} onValueChange={setEducationLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EDUCATION_LEVEL_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {educationLevel === "boshqa" && (
            <div className="space-y-1.5">
              <Label htmlFor="educationLevelOther">Ta&apos;lim darajasi haqida qo&apos;shimcha</Label>
              <Input id="educationLevelOther" name="educationLevelOther" />
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