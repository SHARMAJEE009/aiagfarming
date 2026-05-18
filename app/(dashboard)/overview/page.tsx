import { auth } from "@/auth";
import { getOrgByEmail } from "@/lib/queries";
import { getDashboardStats, getRevenueChart, getLivestockBySpecies, getMobs } from "@/lib/queries";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, StatTile, Badge, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { OverviewCharts } from "@/components/dashboard/OverviewCharts";

export default async function OverviewPage() {
  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  const orgId = ctx?.org_id;

  const [stats, chart, species, mobs] = orgId
    ? await Promise.all([
        getDashboardStats(orgId),
        getRevenueChart(orgId),
        getLivestockBySpecies(orgId),
        getMobs(orgId),
      ])
    : [
        { totalFields: 0, activeSeasons: 0, totalAnimals: 0, activeMobs: 0, monthlyRevenue: 0, monthlyExpenses: 0 },
        [],
        [],
        [],
      ];

  const orgName  = ctx?.org_name ?? ctx?.farm_name ?? "Your Farm";
  const location = ctx?.location ?? "";
  const subtitle = location ? `${orgName} · ${location} · Updated just now` : `${orgName} · Updated just now`;

  const netProfit = (stats.monthlyRevenue ?? 0) - (stats.monthlyExpenses ?? 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Farm Overview"
        subtitle={subtitle}
        actions={
          <Button size="sm" variant="secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">

        {/* Empty state for new orgs */}
        {!orgId && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 mb-6">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-800">Your dashboard is ready. Start by adding fields, animals, and financial entries to see live data here.</p>
          </div>
        )}

        {/* KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatTile
            label="Total Fields"
            value={stats.totalFields}
            change={`${stats.activeSeasons} active season${stats.activeSeasons !== 1 ? "s" : ""}`}
            changeType="neutral"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
          />
          <StatTile
            label="Total Animals"
            value={stats.totalAnimals.toLocaleString()}
            change={`${stats.activeMobs} active mob${stats.activeMobs !== 1 ? "s" : ""}`}
            changeType="neutral"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          <StatTile
            label="MTD Revenue"
            value={formatCurrency(stats.monthlyRevenue)}
            change={stats.monthlyRevenue > 0 ? "This month" : "No entries yet"}
            changeType={stats.monthlyRevenue > 0 ? "up" : "neutral"}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatTile
            label="MTD Expenses"
            value={formatCurrency(stats.monthlyExpenses)}
            change={netProfit >= 0 ? `Net +${formatCurrency(netProfit)}` : `Net ${formatCurrency(netProfit)}`}
            changeType={netProfit >= 0 ? "up" : "down"}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
          />
        </div>

        {/* Charts + Mobs — client component handles recharts */}
        <OverviewCharts chart={chart} species={species} mobs={mobs} />
      </div>
    </div>
  );
}
