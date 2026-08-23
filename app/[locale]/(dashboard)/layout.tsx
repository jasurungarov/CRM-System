import type { ReactNode } from "react";
import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { NavbarWithLogout } from "@/components/layout/LogoutTrigger";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect({ href: "/login", locale: "uz" });
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={session.role} />
      <div className="lg:pl-64">
        <NavbarWithLogout user={session} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
