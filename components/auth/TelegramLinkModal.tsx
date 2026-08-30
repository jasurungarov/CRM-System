"use client";

import {
  updateTelegramChatIdAction,
  type TelegramLinkState,
} from "@/actions/staff.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("telegramLink");

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "loading..." : t("save")}
    </Button>
  );
}

export function TelegramLinkModal({
  open,
  onOpenChange,
  currentChatId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentChatId: string | null;
}) {
  const t = useTranslations("telegramLink");

  const [state, formAction] = useActionState<TelegramLinkState, FormData>(
    updateTelegramChatIdAction,
    {},
  );

  useEffect(() => {
    if (state.success) {
      toast.success(t("success"));
      onOpenChange(false);
    }
  }, [state.success, onOpenChange, t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            {t("modalTitle")}
          </DialogTitle>
          <DialogDescription>{t("modalDesc")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="telegramChatId">{t("chatIdLabel")}</Label>
            <Input
              id="telegramChatId"
              name="telegramChatId"
              placeholder={t("chatIdPlaceholder")}
              defaultValue={currentChatId ?? ""}
              required
            />
          </div>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("cancel")}
              </Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
