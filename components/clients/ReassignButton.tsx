"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { UserCog } from "lucide-react";
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { reassignClientAction } from "@/actions/clients.actions";
import { useTranslations } from 'next-intl'

export function ReassignButton({
  clientId,
  consultants,
}: {
  clientId: string;
  consultants: Array<{ id: string; name: string }>;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!selected) return;
    startTransition(async () => {
      try {
        const result = await reassignClientAction(clientId, selected);
        toast.success(`${result.clientName} — ${result.newConsultantName}ga biriktirildi`);
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Qayta biriktirish">
          <UserCog className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("clients.reassignTitle")}</DialogTitle>
        </DialogHeader>

        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger>
            <SelectValue placeholder={t("clients.reassignSelectNew")} />
          </SelectTrigger>
          <SelectContent>
            {consultants.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("common.cancel")}</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!selected || isPending}>
            {isPending ? t("common.loading") : t("clients.reassignButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
