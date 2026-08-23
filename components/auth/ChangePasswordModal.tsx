"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction, type ChangePasswordState } from "@/actions/auth.actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "..." : "Saqlash"}
    </Button>
  );
}

export function ChangePasswordModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [state, formAction] = useActionState<ChangePasswordState, FormData>(changePasswordAction, {});
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (state.success) {
      toast.success("Parol muvaffaqiyatli almashtirildi");
      onOpenChange(false);
      setKey((k) => k + 1);
    }
  }, [state.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Parolni almashtirish
          </DialogTitle>
        </DialogHeader>
        <form key={key} action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Joriy parol</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">Yangi parol (kamida 8 belgi)</Label>
            <Input id="newPassword" name="newPassword" type="password" minLength={8} required />
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
