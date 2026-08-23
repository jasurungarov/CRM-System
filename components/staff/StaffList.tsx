"use client";

import { useTransition } from "react";
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

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  manager: "Menejer",
  consultant: "Konsultant",
};

export function StaffList({ staff, currentUserId }: { staff: StaffRow[]; currentUserId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(userId: string) {
    startTransition(async () => {
      try {
        const result = await toggleStaffActiveAction(userId);
        toast.success(result.isActive ? "Xodim faollashtirildi" : "Xodim deaktivatsiya qilindi");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Xatolik");
      }
    });
  }

  function handleRoleChange(userId: string, role: string) {
    startTransition(async () => {
      try {
        await changeStaffRoleAction(userId, role as "admin" | "manager" | "consultant");
        toast.success("Rol o'zgartirildi");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Xatolik");
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
              {u.name} {u._id === currentUserId && <span className="text-xs text-muted-foreground">(Siz)</span>}
            </p>
            <p className="text-sm text-muted-foreground">{u.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={u.isActive ? "success" : "secondary"}>{u.isActive ? "Faol" : "Faol emas"}</Badge>
            <Select
              value={u.role}
              onValueChange={(v) => handleRoleChange(u._id, v)}
              disabled={isPending || u._id === currentUserId}
            >
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue>{ROLE_LABELS[u.role]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultant">Konsultant</SelectItem>
                <SelectItem value="manager">Menejer</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggle(u._id)}
              disabled={isPending || u._id === currentUserId}
            >
              {u.isActive ? "Deaktivatsiya" : "Faollashtirish"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
