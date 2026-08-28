import { getTranslations } from "next-intl/server";
import { getClientById } from "@/actions/clients.actions";
import { getSaudiUniversitiesCatalog } from "@/actions/applications.actions";
import { getPaymentSummaryForClient } from "@/lib/payment-summary";
import { getSession } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApplicationStatusBadge, UrgencyBadge } from "@/components/clients/status-badge";
import { AddApplicationModal } from "@/components/applications/AddApplicationModal";
import { UniversityStatusControls } from "@/components/applications/UniversityStatusControls";
import { NewPaymentModal } from "@/components/payments/NewPaymentModal";
import { SendConfirmationModal } from "@/components/confirmations/SendConfirmationModal";
import { ClientDocumentsChecklist } from "@/components/documents/ClientDocumentsChecklist";

function computeUrgency(deadline: Date) {
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  let urgency: "expired" | "urgent" | "warning" | "normal" = "normal";
  if (daysLeft < 0) urgency = "expired";
  else if (daysLeft <= 3) urgency = "urgent";
  else if (daysLeft <= 7) urgency = "warning";
  return { daysLeft, urgency };
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return null;

  const tClients = await getTranslations("clients");

  const [client, paymentSummary, catalog] = await Promise.all([
    getClientById(id),
    getPaymentSummaryForClient(id),
    getSaudiUniversitiesCatalog(),
  ]);

  const canProcessRefund = session.role === "admin" || session.role === "manager";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-display font-semibold sm:text-2xl">{client.fullName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {client.phone} · {client.email}
          </p>
        </div>
        <Badge variant="outline" className="w-fit font-mono text-base">
          PIN: {client.pin}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <NewPaymentModal clientId={client._id} clientName={client.fullName} />
        <SendConfirmationModal clientId={client._id} clientName={client.fullName} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{tClients("detailTariff")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{client.tariff?.name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">
              ${client.tariff?.price?.toLocaleString("en-US") ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{tClients("detailPaid")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">${paymentSummary.totalPaid.toLocaleString("en-US")}</p>
            <p className="text-xs text-muted-foreground">USD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{tClients("detailDebt")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">${paymentSummary.remainingDebt.toLocaleString("en-US")}</p>
            <p className="text-xs text-muted-foreground">USD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{tClients("detailConsultant")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{client.assignedToUser?.name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">
              {tClients("profileCompletion", { percent: client.profileCompletionPercent })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>{tClients("universityApplications")}</CardTitle>
          <AddApplicationModal clientId={client._id} catalog={catalog} />
        </CardHeader>
        <CardContent className="space-y-3">
          {client.universities.length === 0 && (
            <p className="text-sm text-muted-foreground">{tClients("noApplicationsYet")}</p>
          )}
          {client.universities.map((uni) => {
            const { daysLeft, urgency } = computeUrgency(new Date(uni.submissionDeadline));
            return (
              <div
                key={String(uni._id)}
                className="flex flex-col gap-3 rounded-md border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{uni.universityName}</p>
                  <p className="text-sm text-muted-foreground">{uni.program}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <ApplicationStatusBadge status={uni.submissionStatus} />
                    {uni.submissionStatus !== "qabul_qilindi" && uni.submissionStatus !== "rad_etildi" && (
                      <UrgencyBadge urgency={urgency} daysLeft={daysLeft} />
                    )}
                  </div>
                </div>
                <UniversityStatusControls
                  clientId={client._id}
                  universityId={String(uni._id)}
                  currentStatus={uni.submissionStatus}
                  refundEligible={uni.refundEligible}
                  alreadyRefunded={Boolean(uni.refund?.isRefunded)}
                  canProcessRefund={canProcessRefund}
                  canDelete={session.role !== "consultant" || client.assignedToUser?.id === session.id}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <ClientDocumentsChecklist
        clientId={client._id}
        canReview={session.role === "admin" || session.role === "manager"}
      />
    </div>
  );
}