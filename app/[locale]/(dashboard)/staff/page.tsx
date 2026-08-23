import { getStaffList } from "@/actions/staff.actions";
import { getSession } from "@/lib/auth";
import { StaffList } from "@/components/staff/StaffList";
import { CreateStaffModal } from "@/components/staff/CreateStaffModal";

export default async function StaffPage() {
  const [staff, session] = await Promise.all([getStaffList(), getSession()]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-display font-semibold sm:text-2xl">Xodimlar</h1>
          <p className="text-sm text-muted-foreground mt-1">Jami: {staff.length} ta</p>
        </div>
        <CreateStaffModal />
      </div>
      <StaffList staff={staff} currentUserId={session?.id ?? ""} />
    </div>
  );
}
