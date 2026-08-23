import {
  getMonthlyRevenueReport,
  getApplicationsFunnelReport,
  getConsultantPerformanceReport,
  getClientsExportData,
  getPaymentsExportData,
} from "@/actions/reports.actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RevenueChart } from "@/components/reports/RevenueChart";
import { ApplicationsFunnelChart } from "@/components/reports/ApplicationsFunnelChart";
import { ConsultantPerformanceTable } from "@/components/reports/ConsultantPerformanceTable";
import { ExcelExportButton } from "@/components/reports/ExcelExportButton";

export default async function ReportsPage() {
  const [revenue, funnel, performance] = await Promise.all([
    getMonthlyRevenueReport(),
    getApplicationsFunnelReport(),
    getConsultantPerformanceReport(),
  ]);

  const totalRevenue = revenue.reduce((sum, m) => sum + m.revenue, 0);
  const totalApplications = funnel.reduce((sum, f) => sum + f.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-display font-semibold sm:text-2xl">Hisobotlar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Joriy yil: {totalRevenue.toLocaleString("uz-UZ")} so&apos;m tushum · {totalApplications} ta ariza
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExcelExportButton
            label="Mijozlar (Excel)"
            fileName="mijozlar-royxati"
            sheetName="Mijozlar"
            fetchData={getClientsExportData}
          />
          <ExcelExportButton
            label="To'lovlar (Excel)"
            fileName="tolovlar-royxati"
            sheetName="To'lovlar"
            fetchData={getPaymentsExportData}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Oylik tushum ({new Date().getFullYear()})</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenue} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Arizalar holati bo&apos;yicha taqsimot</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationsFunnelChart data={funnel} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Konsultantlar samaradorligi</CardTitle>
        </CardHeader>
        <CardContent>
          <ConsultantPerformanceTable data={performance} />
        </CardContent>
      </Card>
    </div>
  );
}
