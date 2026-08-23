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
import {
  addUniversityApplicationAction,
  type ApplicationFormState,
} from "@/actions/applications.actions";
import type { SaudiUniversity } from "@/lib/data/saudi-universities";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "..." : "Qo'shish"}
    </Button>
  );
}

export function AddApplicationModal({
  clientId,
  catalog,
}: {
  clientId: string;
  catalog: SaudiUniversity[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedUni, setSelectedUni] = useState<string>("custom");
  const [state, formAction] = useActionState<ApplicationFormState, FormData>(
    addUniversityApplicationAction,
    {}
  );

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  const preset = catalog.find((u) => u.id === selectedUni);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Plus className="h-4 w-4" />
          Universitet qo&apos;shish
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Universitetga ariza qo&apos;shish</DialogTitle>
          <DialogDescription>
            Katalogdan tanlang yoki qo&apos;lda kiriting.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />

          <div className="space-y-1.5">
            <Label>Katalogdan tanlash</Label>
            <Select value={selectedUni} onValueChange={setSelectedUni}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Qo&apos;lda kiritish</SelectItem>
                {catalog.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="universityName">Universitet nomi</Label>
            <Input
              id="universityName"
              name="universityName"
              defaultValue={preset?.name}
              key={`uni-${selectedUni}`}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="country">Davlat</Label>
              <Input
                id="country"
                name="country"
                defaultValue={preset?.country ?? "Saudi Arabia"}
                key={`country-${selectedUni}`}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="submissionDeadline">Topshirish muddati</Label>
              <Input
                id="submissionDeadline"
                name="submissionDeadline"
                type="date"
                defaultValue={preset?.defaultDeadline?.slice(0, 10)}
                key={`deadline-${selectedUni}`}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="program">Yo&apos;nalish (dastur)</Label>
            <Input
              id="program"
              name="program"
              defaultValue={preset?.popularPrograms[0]}
              key={`program-${selectedUni}`}
              required
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
