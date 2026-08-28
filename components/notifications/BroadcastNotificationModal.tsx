"use client";

import {
  createBroadcastNotificationAction,
  type BroadcastFormState,
} from "@/actions/notifications.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Megaphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

function SubmitButton() {
  const { pending } = useFormStatus();
  const tCommon = useTranslations("common");

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "..." : tCommon("save")}
    </Button>
  );
}

export function BroadcastNotificationModal() {
  const tNotif = useTranslations("notifications");
  const tCommon = useTranslations("common");
  const tRoles = useTranslations("roles");

  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<BroadcastFormState, FormData>(
    createBroadcastNotificationAction,
    {},
  );

  useEffect(() => {
    if (state.success) {
      toast.success(tNotif("title"));
      setOpen(false);
    }
  }, [state.success, tNotif]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="accent">
          <Megaphone className="h-4 w-4" />
          {tNotif("title")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tNotif("title")}</DialogTitle>
          <DialogDescription>{tNotif("subtitle")}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">{tNotif("bellTitle")}</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">{tNotif("subtitle")}</Label>
            <Input id="message" name="message" required />
          </div>
          <div className="space-y-1.5">
            <Label>{tNotif("title")}</Label>
            <Select name="audience" defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tCommon("actions")}</SelectItem>
                <SelectItem value="manager">{tRoles("manager")}</SelectItem>
                <SelectItem value="consultant">
                  {tRoles("consultant")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {tCommon("cancel")}
              </Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
