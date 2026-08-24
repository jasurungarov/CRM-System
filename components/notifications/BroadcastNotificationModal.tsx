"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";
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
import { createBroadcastNotificationAction, type BroadcastFormState } from "@/actions/notifications.actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "..." : "Yuborish"}
    </Button>
  );
}

export function BroadcastNotificationModal() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<BroadcastFormState, FormData>(
    createBroadcastNotificationAction,
    {}
  );

  useEffect(() => {
    if (state.success) {
      toast.success("E'lon yuborildi");
      setOpen(false);
    }
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="accent">
          <Megaphone className="h-4 w-4" />
          Yangi elon
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yangi elon yuborish</DialogTitle>
          <DialogDescription>Xabar tanlangan auditoriyaning bildirishnomalar royxatida chiqadi.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Sarlavha</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Xabar matni</Label>
            <Input id="message" name="message" required />
          </div>
          <div className="space-y-1.5">
            <Label>Kimga yuborilsin</Label>
            <Select name="audience" defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha xodimlarga</SelectItem>
                <SelectItem value="manager">Faqat menejerlarga</SelectItem>
                <SelectItem value="consultant">Faqat konsultantlarga</SelectItem>
              </SelectContent>
            </Select>
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