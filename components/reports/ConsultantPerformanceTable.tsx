type ConsultantPerf = {
  consultantId: string;
  consultantName: string;
  clientsCount: number;
  applicationsCount: number;
  acceptedCount: number;
  revenue: number;
};

export function ConsultantPerformanceTable({ data }: { data: ConsultantPerf[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Konsultant</th>
            <th className="px-4 py-3 font-medium">Mijozlar</th>
            <th className="px-4 py-3 font-medium">Arizalar</th>
            <th className="px-4 py-3 font-medium">Qabul qilindi</th>
            <th className="px-4 py-3 font-medium">Tushum</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((c) => (
            <tr key={c.consultantId} className="hover:bg-secondary/40">
              <td className="px-4 py-3 font-medium">{c.consultantName}</td>
              <td className="px-4 py-3">{c.clientsCount}</td>
              <td className="px-4 py-3">{c.applicationsCount}</td>
              <td className="px-4 py-3">{c.acceptedCount}</td>
              <td className="px-4 py-3">{c.revenue.toLocaleString("uz-UZ")} so&apos;m</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
