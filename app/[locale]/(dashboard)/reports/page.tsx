import {
  getApplicationsFunnelReport,
  getClientsExportData,
  getConsultantPerformanceReport,
  getMonthlyRevenueReport,
  getPaymentsExportData,
} from "@/actions/reports.actions";
import { ApplicationsFunnelChart } from "@/components/reports/ApplicationsFunnelChart";
import { ConsultantPerformanceTable } from "@/components/reports/ConsultantPerformanceTable";
import { ExcelExportButton } from "@/components/reports/ExcelExportButton";
import { RevenueChart } from "@/components/reports/RevenueChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function ReportsPage() {
  const tReports = await getTranslations("reports");

  const [revenue, funnel, performance] = await Promise.all([
    getMonthlyRevenueReport(),
    getApplicationsFunnelReport(),
    getConsultantPerformanceReport(),
  ]);

  const totalRevenue = revenue.reduce((sum, m) => sum + m.revenue, 0);
  const totalApplications = funnel.reduce((sum, f) => sum + f.count, 0);

  const formattedRevenue = totalRevenue.toLocaleString("uz-UZ");
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-display font-semibold sm:text-2xl">
            {tReports("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tReports("subtitle", {
              revenue: formattedRevenue,
              count: totalApplications,
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExcelExportButton
            label={tReports("exportClients")}
            fileName="mijozlar-royxati"
            sheetName="Mijozlar"
            fetchData={getClientsExportData}
          />
          <ExcelExportButton
            label={tReports("exportPayments")}
            fileName="tolovlar-royxati"
            sheetName="To'lovlar"
            fetchData={getPaymentsExportData}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {tReports("revenueChartTitle", { year: currentYear })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenue} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{tReports("funnelChartTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationsFunnelChart data={funnel} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tReports("performanceTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ConsultantPerformanceTable data={performance} />
        </CardContent>
      </Card>
    </div>
  );
}
