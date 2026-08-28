import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, Wallet, FileCheck2, AlertTriangle } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getClients } from "@/actions/clients.actions";
import { getPayments } from "@/actions/payments.actions";
import { getApplicationStats } from "@/actions/applications.actions";
import { getConfirmations } from "@/actions/confirmations.actions";

export default async function DashboardHomePage() {
  const t = await getTranslations("nav");
  const td = await getTranslations("dashboard");
  const session = await getSession();
  if (!session) return null;

  const [clients, payments, appStats, confirmations] = await Promise.all([
    getClients(),
    getPayments(),
    getApplicationStats(),
    getConfirmations(),
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingConfirmations = confirmations.filter((c) => c.status === "yuborildi" && !c.isExpiredNow).length;

  const cards = [
    {
      key: "clients",
      label: t("clients"),
      value: clients.length,
      icon: Users,
      description: td("applicationsCount", { count: appStats.total }),
    },
    {
      key: "payments",
      label: t("payments"),
      value: `${totalRevenue.toLocaleString("USD")} $`,
      icon: Wallet,
      description: td("paymentsCount", { count: payments.length }),
    },
    {
      key: "confirmations",
      label: t("confirmations"),
      value: pendingConfirmations,
      icon: FileCheck2,
      description: td("awaitingResponse"),
    },
    {
      key: "deadlines",
      label: td("urgentDeadlines"),
      value: appStats.urgentDeadlines,
      icon: AlertTriangle,
      description: td("expiredCount", { count: appStats.expiredDeadlines }),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold sm:text-2xl">{t("dashboard")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{td("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ key, label, value, icon: Icon, description }) => (
          <Card key={key}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{value}</p>
              <CardDescription className="mt-1">{description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}