"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Send, Copy, ExternalLink } from "lucide-react";
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
import { createConfirmationAction, type ConfirmationFormState } from "@/actions/confirmations.actions";
import { buildTelegramShareUrl } from "@/lib/telegram";

function SubmitButton({ label, loadingLabel }: { label: string; loadingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? loadingLabel : label}
      <Send className="h-4 w-4" />
    </Button>
  );
}

export function SendConfirmationModal({ clientId, clientName }: { clientId: string; clientName: string }) {
  const t = useTranslations("confirmations");
  const tCommon = useTranslations("common");

  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<ConfirmationFormState, FormData>(createConfirmationAction, {});

  useEffect(() => {
    if (state.success) toast.success(t("created"));
  }, [state.success, t]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Send className="h-4 w-4" />
          {t("send")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDesc", { clientName })}</DialogDescription>
        </DialogHeader>

        {!state.confirmationUrl ? (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="clientId" value={clientId} />
            <div className="space-y-1.5">
              <Label htmlFor="telegramChatId">{t("telegramChatId")}</Label>
              <Input id="telegramChatId" name="telegramChatId" placeholder="masalan: 123456789" />
              <p className="text-xs text-muted-foreground">
                {t("telegramHint")}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">
                {tCommon("note")} ({tCommon("optional")})
              </Label>
              <Input id="notes" name="notes" />
            </div>

            {state.error && <p className="text-sm text-destructive">{state.error}</p>}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {tCommon("cancel")}
                </Button>
              </DialogClose>
              <SubmitButton
                label={t("createButton")}
                loadingLabel={tCommon("loading")}
              />
            </DialogFooter>
          </form>
        ) : (
          <ConfirmationLinkResult clientName={clientName} confirmationUrl={state.confirmationUrl} onClose={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ConfirmationLinkResult({
  clientName,
  confirmationUrl,
  onClose,
}: {
  clientName: string;
  confirmationUrl: string;
  onClose: () => void;
}) {
  const t = useTranslations("confirmations");
  const tCommon = useTranslations("common");

  const shareText = `${clientName} uchun Ansor Edu shartnoma-tasdiqnomasi. Iltimos, havola orqali tasdiqlang:`;
  const telegramShareUrl = buildTelegramShareUrl(confirmationUrl, shareText);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-secondary/40 p-3">
        <p className="break-all font-mono text-xs">{confirmationUrl}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            navigator.clipboard.writeText(confirmationUrl);
            toast.success(t("linkCopied"));
          }}
        >
          <Copy className="h-4 w-4" />
          {t("copyLink")}
        </Button>
        <Button asChild className="flex-1">
          <a href={telegramShareUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            {t("sendViaTelegram")}
          </a>
        </Button>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
          {tCommon("close")}
        </Button>
      </DialogFooter>
    </div>
  );
}