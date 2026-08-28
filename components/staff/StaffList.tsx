"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toggleStaffActiveAction, changeStaffRoleAction } from "@/actions/staff.actions";

type StaffRow = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "consultant";
  isActive: boolean;
};

export function StaffList({ staff, currentUserId }: { staff: StaffRow[]; currentUserId: string }) {
  const tStaff = useTranslations("staff");
  const tRoles = useTranslations("roles");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  function handleToggle(userId: string) {
    startTransition(async () => {
      try {
        const result = await toggleStaffActiveAction(userId);
        toast.success(result.isActive ? tStaff("activated") : tStaff("deactivated"));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : tCommon("errorOccurred"));
      }
    });
  }

  function handleRoleChange(userId: string, role: string) {
    startTransition(async () => {
      try {
        await changeStaffRoleAction(userId, role as "admin" | "manager" | "consultant");
        toast.success(tStaff("roleChanged"));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : tCommon("errorOccurred"));
      }
    });
  }

  return (
    <div className="space-y-3">
      {staff.map((u) => (
        <div
          key={u._id}
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium">
              {u.name} {u._id === currentUserId && <span className="text-xs text-muted-foreground">({tStaff("youLabel")})</span>}
            </p>
            <p className="text-sm text-muted-foreground">{u.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={u.isActive ? "secondary" : "outline"}>
              {u.isActive ? tStaff("active") : tStaff("inactive")}
            </Badge>
            <Select
              value={u.role}
              onValueChange={(v) => handleRoleChange(u._id, v)}
              disabled={isPending || u._id === currentUserId}
            >
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue>{tRoles(u.role)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultant">{tRoles("consultant")}</SelectItem>
                <SelectItem value="manager">{tRoles("manager")}</SelectItem>
                <SelectItem value="admin">{tRoles("admin")}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggle(u._id)}
              disabled={isPending || u._id === currentUserId}
            >
              {u.isActive ? tStaff("deactivateButton") : tStaff("activateButton")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}