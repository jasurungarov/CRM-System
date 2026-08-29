"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { updateLeadAction, type LeadFormState } from "@/actions/leads.actions";
import { LEAD_STATUS_LABELS } from "@/lib/lead-labels";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "..." : "Saqlash"}
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
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<LeadFormState, FormData>(updateLeadAction, {});

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Tahrirlash">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aloqa natijasini yozish</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="leadId" value={lead._id} />

          <div className="space-y-1.5">
            <Label>Holat</Label>
            <Select name="status" defaultValue={lead.status}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="objection">E&apos;tirozi</Label>
            <textarea
              id="objection"
              name="objection"
              defaultValue={lead.objection ?? ""}
              rows={2}
              placeholder="masalan: narxi qimmat, oilasi bilan maslahatlashmoqchi"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastResult">Natija</Label>
            <textarea
              id="lastResult"
              name="lastResult"
              defaultValue={lead.lastResult ?? ""}
              rows={2}
              placeholder="masalan: fikr so'radi, qiziqish bildirdi"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nextContactDate">Keyingi aloqa sanasi</Label>
            <Input
              id="nextContactDate"
              name="nextContactDate"
              type="date"
              defaultValue={lead.nextContactDate ? lead.nextContactDate.slice(0, 10) : ""}
            />
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