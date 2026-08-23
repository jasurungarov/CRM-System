"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { acceptConfirmationAction, type AcceptFormState } from "@/actions/confirmations.actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? "Yuborilmoqda..." : "Shartnomani tasdiqlayman"}
    </Button>
  );
}

export function AcceptContractForm({ token }: { token: string }) {
  const boundAction = acceptConfirmationAction.bind(null, token);
  const [state, formAction] = useActionState<AcceptFormState, FormData>(boundAction, {});

  if (state.success) {
    return (
      <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-center">
        <p className="font-semibold text-success">Shartnoma muvaffaqiyatli tasdiqlandi!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Sahifani yangilab, tasdiqlangan shartnomani PDF holida yuklab olishingiz mumkin.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-card p-5">
      <div className="space-y-1.5">
        <Label htmlFor="clientAcceptedName">To&apos;liq F.I.SH (tasdiqlash uchun)</Label>
        <Input id="clientAcceptedName" name="clientAcceptedName" placeholder="Familiya Ism Otangizning ismi" required />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <SubmitButton />
      <p className="text-center text-xs text-muted-foreground">
        Tasdiqlash orqali siz yuqoridagi barcha shartlarga rozilik bildirasiz.
      </p>
    </form>
  );
}
