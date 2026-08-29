"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateTelegramChatIdAction, type TelegramLinkState } from "@/actions/staff.actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "..." : "Saqlash"}
    </Button>
  );
}

export function TelegramLinkModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [state, formAction] = useActionState<TelegramLinkState, FormData>(updateTelegramChatIdAction, {});

  useEffect(() => {
    if (state.success) {
      toast.success("Telegram muvaffaqiyatli ulandi");
      onOpenChange(false);
    }
  }, [state.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Telegramni ulash
          </DialogTitle>
          <DialogDescription>
            Avval firma botiga kirib &quot;Start&quot; bosing, so&apos;ng @userinfobot orqali o&apos;z Chat ID
            raqamingizni oling va shu yerga kiriting.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="telegramChatId">Telegram Chat ID</Label>
            <Input id="telegramChatId" name="telegramChatId" placeholder="masalan: 123456789" required />
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