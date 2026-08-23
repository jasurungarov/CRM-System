import { getApplications, getApplicationStats } from "@/actions/applications.actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { ApplicationStatusBadge, UrgencyBadge } from "@/components/clients/status-badge";

export async function ApplicationsDashboard() {
  const [stats, applications] = await Promise.all([getApplicationStats(), getApplications()]);

  const statCards = [
    { label: "Jami arizalar", value: stats.total },
    { label: "Topshirilmagan", value: stats.notSubmitted },
    { label: "Topshirilgan", value: stats.submitted },
    { label: "Qabul qilindi", value: stats.accepted },
    { label: "Shoshilinch/Diqqat", value: stats.urgentDeadlines },
    { label: "Muddati o'tgan", value: stats.expiredDeadlines },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobil: kartochkalar */}
      <div className="space-y-3 lg:hidden">
        {applications.map((a) => (
          <div key={a.applicationId} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <Link href={`/clients/${a.client._id}`} className="font-medium hover:underline">
              {a.client.fullName}
            </Link>
            <p className="text-sm text-muted-foreground">
              {a.universityName} — {a.program}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <ApplicationStatusBadge status={a.submissionStatus} />
              <UrgencyBadge urgency={a.urgency} daysLeft={a.daysLeft} />
              {a.refundEligible && <span className="text-xs font-medium text-accent">Refund huquqi</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: jadval */}
      <div className="hidden overflow-x-auto rounded-lg border border-border lg:block">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Mijoz</th>
              <th className="px-4 py-3 font-medium">Universitet</th>
              <th className="px-4 py-3 font-medium">Yo&apos;nalish</th>
              <th className="px-4 py-3 font-medium">Holat</th>
              <th className="px-4 py-3 font-medium">Muddat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {applications.map((a) => (
              <tr key={a.applicationId} className="hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <Link href={`/clients/${a.client._id}`} className="font-medium hover:underline">
                    {a.client.fullName}
                  </Link>
                  <p className="text-xs text-muted-foreground font-mono">{a.client.pin}</p>
                </td>
                <td className="px-4 py-3">{a.universityName}</td>
                <td className="px-4 py-3">{a.program}</td>
                <td className="px-4 py-3">
                  <ApplicationStatusBadge status={a.submissionStatus} />
                </td>
                <td className="px-4 py-3">
                  <UrgencyBadge urgency={a.urgency} daysLeft={a.daysLeft} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
