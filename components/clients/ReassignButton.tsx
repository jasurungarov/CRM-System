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

export function ReassignButton({
  clientId,
  consultants,
}: {
  clientId: string;
  consultants: Array<{ id: string; name: string }>;
}) {
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
          <DialogTitle>Mijozni qayta biriktirish</DialogTitle>
        </DialogHeader>

        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger>
            <SelectValue placeholder="Yangi konsultant tanlang" />
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
            <Button variant="outline">Bekor qilish</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!selected || isPending}>
            {isPending ? "..." : "Biriktirish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
