"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function RevenueChart({ data }: { data: Array<{ month: string; revenue: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214 20% 89%)" />
        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toLocaleString("uz-UZ")} so'm`, "Tushum"]}
          contentStyle={{ borderRadius: 8, border: "1px solid hsl(214 20% 89%)" }}
        />
        <Bar dataKey="revenue" fill="hsl(209 56% 16%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
