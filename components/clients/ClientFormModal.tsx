"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Pencil } from "lucide-react";
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
import { createClientAction, updateClientAction, type ClientFormState } from "@/actions/clients.actions";

type Tariff = { _id: string; name: string; price: number };
type Consultant = { id: string; name: string };

type ExistingClient = {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  tariffId: string;
  assignedTo: string;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "..." : label}
    </Button>
  );
}

export function ClientFormModal({
  tariffs,
  consultants,
  canAssign,
  currentUserId,
  client,
}: {
  tariffs: Tariff[];
  consultants: Consultant[];
  canAssign: boolean;
  currentUserId: string;
  client?: ExistingClient;
}) {
  const [open, setOpen] = useState(false);
  const action = client ? updateClientAction : createClientAction;
  const [state, formAction] = useActionState<ClientFormState, FormData>(action, {});

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {client ? (
          <Button variant="ghost" size="icon" aria-label="Tahrirlash">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" />
            Yangi mijoz
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{client ? "Mijozni tahrirlash" : "Yangi mijoz qo'shish"}</DialogTitle>
          <DialogDescription>
            {client
              ? "Mijoz ma'lumotlarini yangilang."
              : "Mijoz qo'shilgach, avtomatik 6 xonali unikal PIN beriladi."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {client && <input type="hidden" name="clientId" value={client._id} />}

          <div className="space-y-1.5">
            <Label htmlFor="fullName">F.I.SH</Label>
            <Input id="fullName" name="fullName" defaultValue={client?.fullName} required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" name="phone" defaultValue={client?.phone} placeholder="+998" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={client?.email} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tarif</Label>
            <Select name="tariffId" defaultValue={client?.tariffId}>
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
              <Select name="assignedTo" defaultValue={client?.assignedTo ?? currentUserId}>
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
            <SubmitButton label={client ? "Saqlash" : "Qo'shish"} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

