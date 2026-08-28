import { getStaffList } from "@/actions/staff.actions";
import { CreateStaffModal } from "@/components/staff/CreateStaffModal";
import { StaffList } from "@/components/staff/StaffList";
import { getSession } from "@/lib/auth";
import { getTranslations } from 'next-intl/server'

export default async function StaffPage() {
  const [staff, session] = await Promise.all([getStaffList(), getSession()]);
  const t = await getTranslations("staff")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-display font-semibold sm:text-2xl">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("totalCount", { count: staff.length })}
          </p>
        </div>
        <CreateStaffModal />
      </div>
      <StaffList staff={staff} currentUserId={session?.id ?? ""} />
    </div>
  );
}
