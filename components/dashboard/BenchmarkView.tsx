"use client";

import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui";
import type { BenchmarkSeason } from "@/lib/queries";

interface AnnualFinance {
  year: string;
  revenue: number;
  expenses: number;
}

interface Props {
  seasons: BenchmarkSeason[];
  annualFinance: AnnualFinance[];
}

function StatCard({ label, value, sub, highlight = false }: {
  label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-1 ${highlight ? "border-[#1A7A3A] bg-[#F0FDF4]" : "border-[#E5E7EB] bg-white"}`}>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-[#1A7A3A]" : "text-[#1F2937]"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export function BenchmarkView({ seasons, annualFinance }: Props) {
  const harvestedSeasons = useMemo(
    () => seasons.filter((s) => s.status === "harvested" && s.yield_kg !== null),
    [seasons]
  );

  // Summary stats
  const avgYieldPerHa = useMemo(() => {
    const vals = harvestedSeasons.filter((s) => s.yield_per_ha !== null).map((s) => s.yield_per_ha!);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(0) : null;
  }, [harvestedSeasons]);

  const latestSeason = harvestedSeasons[0] ?? null;
  const prevSeason   = harvestedSeasons[1] ?? null;

  const yieldDiff = latestSeason?.yield_per_ha != null && prevSeason?.yield_per_ha != null
    ? (latestSeason.yield_per_ha - prevSeason.yield_per_ha).toFixed(0)
    : null;

  // Chart data — last 8 harvested seasons (oldest first for left-to-right time order)
  const chartData = useMemo(() => {
    return [...harvestedSeasons]
      .slice(0, 8)
      .reverse()
      .map((s) => ({
        name: `${s.crop_type} (${s.field_name.slice(0, 10)})`,
        "Yield kg/ha": s.yield_per_ha ?? 0,
        "Total kg": s.yield_kg ?? 0,
      }));
  }, [harvestedSeasons]);

  // Finance chart
  const financeData = useMemo(
    () =>
      [...annualFinance]
        .reverse()
        .map((r) => ({
          year: r.year,
          Revenue: Number(r.revenue),
          Expenses: Number(r.expenses),
          "Net Profit": Number(r.revenue) - Number(r.expenses),
        })),
    [annualFinance]
  );

  const formatK = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`;

  if (seasons.length === 0 && annualFinance.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400">
        <svg className="w-16 h-16 opacity-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm font-medium">No benchmark data yet</p>
        <p className="text-xs mt-1">Add harvested seasons with yield data to see comparisons here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Latest Yield"
          value={latestSeason?.yield_per_ha != null ? `${latestSeason.yield_per_ha} kg/ha` : "—"}
          sub={latestSeason ? `${latestSeason.crop_type} · ${latestSeason.field_name}` : undefined}
          highlight
        />
        <StatCard
          label="Previous Yield"
          value={prevSeason?.yield_per_ha != null ? `${prevSeason.yield_per_ha} kg/ha` : "—"}
          sub={prevSeason ? `${prevSeason.crop_type} · ${prevSeason.field_name}` : undefined}
        />
        <StatCard
          label="Season Average"
          value={avgYieldPerHa ? `${avgYieldPerHa} kg/ha` : "—"}
          sub={harvestedSeasons.length > 0 ? `across ${harvestedSeasons.length} season${harvestedSeasons.length !== 1 ? "s" : ""}` : undefined}
        />
        <StatCard
          label="vs Previous Season"
          value={yieldDiff != null ? `${Number(yieldDiff) >= 0 ? "+" : ""}${yieldDiff} kg/ha` : "—"}
          sub={yieldDiff != null ? (Number(yieldDiff) >= 0 ? "Improvement" : "Decline") : "Not enough data"}
          highlight={yieldDiff != null && Number(yieldDiff) >= 0}
        />
      </div>

      {/* Yield per ha chart */}
      {chartData.length > 0 && (
        <Card>
          <p className="font-semibold text-[#1F2937] mb-1">Yield per Hectare — Harvested Seasons</p>
          <p className="text-xs text-gray-400 mb-4">Most recent seasons, oldest to newest (left to right)</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} unit=" kg" />
              <Tooltip
                formatter={(v) => [`${Number(v).toLocaleString()} kg/ha`, "Yield"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="Yield kg/ha" fill="#1A7A3A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Annual finance chart */}
      {financeData.length > 0 && (
        <Card>
          <p className="font-semibold text-[#1F2937] mb-1">Annual Revenue vs Expenses</p>
          <p className="text-xs text-gray-400 mb-4">Last 3 years</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={financeData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#6B7280" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={formatK} />
              <Tooltip
                formatter={(v, name) => [formatK(Number(v)), String(name)]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Revenue"  fill="#1A7A3A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Net Profit" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Season detail table */}
      {harvestedSeasons.length > 0 && (
        <Card padding={false}>
          <div className="px-5 pt-4 pb-2">
            <p className="font-semibold text-[#1F2937]">Season Detail</p>
            <p className="text-xs text-gray-400 mt-0.5">All harvested seasons with recorded yield</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-[#E5E7EB]">
                  {["Field", "Crop", "Planted", "Harvested", "Total Yield", "Yield / ha"].map((h) => (
                    <th key={h} className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 bg-[#F9FAFB] first:rounded-none last:rounded-none">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {harvestedSeasons.map((s) => (
                  <tr key={s.season_id} className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB]">
                    <td className="px-5 py-3 font-medium text-[#1F2937]">{s.field_name}</td>
                    <td className="px-5 py-3 text-gray-600">{s.crop_type}</td>
                    <td className="px-5 py-3 text-gray-500">{s.planted_at?.slice(0, 10) ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-500">{s.harvested_at?.slice(0, 10) ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-700">{s.yield_kg != null ? `${s.yield_kg.toLocaleString()} kg` : "—"}</td>
                    <td className="px-5 py-3 font-semibold text-[#1A7A3A]">
                      {s.yield_per_ha != null ? `${s.yield_per_ha} kg/ha` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
