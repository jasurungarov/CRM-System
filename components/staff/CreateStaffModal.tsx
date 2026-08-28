"use client";

import {
  createStaffAction,
  type StaffFormState,
} from "@/actions/staff.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
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
import { UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

function SubmitButton() {
  const { pending } = useFormStatus();
  const tCommon = useTranslations("common");

  return (
    <Button type="submit" disabled={pending}>
      {pending ? tCommon("loading") : tCommon("add")}
    </Button>
  );
}

export function CreateStaffModal() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<StaffFormState, FormData>(
    createStaffAction,
    {},
  );

  const tStaff = useTranslations("staff");
  const tRoles = useTranslations("roles");
  const tCommon = useTranslations("common");

  useEffect(() => {
    if (state.success) {
      toast.success(tStaff("createdSuccess"));
      setOpen(false);
    }
  }, [state.success, tStaff]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="h-4 w-4" />
          {tStaff("addNew")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tStaff("addTitle")}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">{tStaff("fullName")}</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">{tStaff("email")}</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{tStaff("tempPassword")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>{tStaff("role")}</Label>
            <Select name="role" defaultValue="consultant">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultant">
                  {tRoles("consultant")}
                </SelectItem>
                <SelectItem value="manager">{tRoles("manager")}</SelectItem>
                <SelectItem value="admin">{tRoles("admin")}</SelectItem>
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
