import { getClients, getTariffsList, getConsultantsList } from "@/actions/clients.actions";
import { getSession } from "@/lib/auth";
import { Suspense } from "react";
import { ClientList } from "@/components/clients/ClientList";
import { ClientFormModal } from "@/components/clients/ClientFormModal";
import { ClientSearchBar } from "@/components/clients/ClientSearchBar";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const session = await getSession();
  if (!session) return null;

  const canManage = session.role === "admin" || session.role === "manager";

  const [clients, tariffs, consultants] = await Promise.all([
    getClients({ search }),
    getTariffsList(),
    canManage ? getConsultantsList() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-display font-semibold sm:text-2xl">Mijozlar</h1>
          <p className="text-sm text-muted-foreground mt-1">Jami: {clients.length} ta</p>
        </div>
        <ClientFormModal
          tariffs={tariffs}
          consultants={consultants}
          canAssign={canManage}
          currentUserId={session.id}
        />
      </div>

      <Suspense fallback={<div className="h-10 w-full max-w-xs rounded-md bg-secondary animate-pulse" />}>
        <ClientSearchBar />
      </Suspense>

      <ClientList
        clients={clients as never}
        canManage={canManage}
        currentUserId={session.id}
        tariffs={tariffs}
        consultants={consultants}
      />
    </div>
  );
}
