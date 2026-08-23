"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const COLORS = ["hsl(215 14% 55%)", "hsl(42 66% 47%)", "hsl(158 64% 28%)", "hsl(0 72% 51%)"];

export function ApplicationsFunnelChart({ data }: { data: Array<{ status: string; count: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(214 20% 89%)" />
        <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="status" fontSize={12} tickLine={false} axisLine={false} width={110} />
        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214 20% 89%)" }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
