import { Suspense } from "react";
import { getLeads, getLeadStats } from "@/actions/leads.actions";
import { getTariffsList, getConsultantsList } from "@/actions/clients.actions";
import { getSession } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LeadFormModal } from "@/components/leads/LeadFormModal";
import { LeadSearchBar } from "@/components/leads/LeadSearchBar";
import { LeadList } from "@/components/leads/LeadList";
import { LEAD_STATUS_LABELS } from "@/lib/lead-labels";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const { search, status } = await searchParams;
  const session = await getSession();
  if (!session) return null;

  const canAssign = session.role === "admin" || session.role === "manager";

  const [leads, stats, tariffs, consultants] = await Promise.all([
    getLeads({ search, status }),
    getLeadStats(),
    getTariffsList(),
    canAssign ? getConsultantsList() : Promise.resolve([]),
  ]);

  const statCards = [
    { key: "total", label: "Jami", value: stats.total },
    { key: "yangi", label: LEAD_STATUS_LABELS.yangi, value: stats.yangi },
    { key: "boglanildi", label: LEAD_STATUS_LABELS.boglanildi, value: stats.boglanildi },
    { key: "qiziqmoqda", label: LEAD_STATUS_LABELS.qiziqmoqda, value: stats.qiziqmoqda },
    { key: "tayyor", label: LEAD_STATUS_LABELS.tayyor, value: stats.tayyor },
    { key: "rad_etdi", label: LEAD_STATUS_LABELS.rad_etdi, value: stats.rad_etdi },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-display font-semibold sm:text-2xl">SRM</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hali shartnoma tuzmagan, qiziqish bildirgan aloqalar
          </p>
        </div>
        <LeadFormModal />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((s) => (
          <Card key={s.key}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Suspense fallback={<div className="h-10 w-full max-w-xs rounded-md bg-secondary animate-pulse" />}>
        <LeadSearchBar />
      </Suspense>

      <LeadList
        leads={leads as never}
        canAssign={canAssign}
        currentUserId={session.id}
        tariffs={tariffs}
        consultants={consultants}
      />
    </div>
  );
}