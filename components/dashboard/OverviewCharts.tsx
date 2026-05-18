"use client";
import { Card, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#1A7A3A", "#F5A623", "#2d8e4e", "#6B7280"];

interface ChartPoint  { month: string; revenue: number; expenses: number; }
interface SpeciesRow  { species: string; count: number; }
interface MobRow      { id: string; name: string; species: string; headcount: number; paddock_name: string | null; }

interface Props {
  chart:   ChartPoint[];
  species: SpeciesRow[];
  mobs:    MobRow[];
}

export function OverviewCharts({ chart, species, mobs }: Props) {
  const isEmpty = chart.length === 0 || chart.every((c) => c.revenue === 0 && c.expenses === 0);

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="p-6 pb-2">
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
              <Badge variant="green">Last 7 months</Badge>
            </CardHeader>
          </div>
          {isEmpty ? (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              No financial data yet — add entries in Financials
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chart} margin={{ left: 16, right: 16, bottom: 8 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1A7A3A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1A7A3A" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F5A623" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, ""]} />
                <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#1A7A3A" strokeWidth={2} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#F5A623" strokeWidth={2} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Livestock breakdown */}
        <Card>
          <CardHeader><CardTitle>Livestock by Species</CardTitle></CardHeader>
          {species.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-gray-400 text-sm">
              No livestock data
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={species} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="count" nameKey="species" paddingAngle={3}>
                    {species.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [v, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {species.map((d, i) => (
                  <div key={d.species} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-gray-600 capitalize">{d.species}</span>
                    </div>
                    <span className="font-semibold text-[#1F2937]">{d.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Active mobs */}
      <Card>
        <CardHeader>
          <CardTitle>Active Mobs</CardTitle>
          <Button size="sm" variant="secondary" as="a" href="/livestock/mobs">View All</Button>
        </CardHeader>
        {mobs.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No mobs yet — add them in Livestock → Mobs & Paddocks</p>
        ) : (
          <div className="space-y-3">
            {mobs.slice(0, 5).map((mob) => (
              <div key={mob.id} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#E8F5EC] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#1A7A3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1F2937]">{mob.name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {mob.species}{mob.paddock_name ? ` · ${mob.paddock_name}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#1F2937]">{mob.headcount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">head</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
