"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface ChartPoint { month: string; revenue: number; expenses: number; }

export function FinanceChartClient({ data }: { data: ChartPoint[] }) {
  const isEmpty = !data.length || data.every((d) => d.revenue === 0 && d.expenses === 0);

  return (
    <Card padding={false}>
      <div className="p-6 pb-2">
        <CardHeader>
          <CardTitle>Revenue vs Expenses — Last 7 Months</CardTitle>
        </CardHeader>
      </div>
      {isEmpty ? (
        <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">
          No financial data yet — add income and expense entries to see the chart
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ left: 16, right: 16, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, ""]} />
            <Legend />
            <Bar dataKey="revenue"  name="Revenue"  fill="#1A7A3A" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#F5A623" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
