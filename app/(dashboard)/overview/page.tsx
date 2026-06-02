import { Suspense } from "react";
import { auth } from "@/auth";
import { getOrgByEmail } from "@/lib/queries";
import { getDashboardStats, getRevenueChart, getLivestockBySpecies, getMobs } from "@/lib/queries";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, StatTile, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { OverviewCharts } from "@/components/dashboard/OverviewCharts";
import { isValidRole, type UserRole } from "@/lib/permissions";
import { WHSStatusWidget } from "@/components/whs/WHSStatusWidget";

function WHSWidgetSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-100 rounded-lg" />
          <div className="h-4 w-28 bg-gray-100 rounded" />
        </div>
        <div className="h-3 w-12 bg-gray-100 rounded" />
      </div>
      <div className="h-4 w-40 bg-gray-100 rounded mb-2" />
      <div className="h-3 w-24 bg-gray-100 rounded" />
    </div>
  );
}

interface Props {
  searchParams: Promise<{ forbidden?: string }>;
}

export default async function OverviewPage({ searchParams }: Props) {
  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  const orgId = ctx?.org_id;

  const rawRole = ctx?.user_role ?? "FARMHAND";
  const userRole: UserRole = isValidRole(rawRole) ? rawRole : "FARMHAND";

  const canSeeFinance    = ["OWNER", "MANAGER", "READ_ONLY"].includes(userRole);
  const canSeeLivestock  = ["OWNER", "MANAGER", "FARMHAND"].includes(userRole);
  const canSeeCharts     = ["OWNER", "MANAGER"].includes(userRole);

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
  const { forbidden } = await searchParams;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Farm Overview"
        subtitle={subtitle}
        actions={
          canSeeCharts ? (
            <Button size="sm" variant="secondary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </Button>
          ) : undefined
        }
      />
      <div className="flex-1 overflow-y-auto p-5">

        {/* Forbidden banner — shown when middleware redirects here after blocked route */}
        {forbidden === "1" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-4">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-amber-800">You don&apos;t have permission to access that page. Contact your farm owner if you need access.</p>
          </div>
        )}

        {/* Empty state for new orgs */}
        {!orgId && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 mb-4">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-800">Your dashboard is ready. Start by adding fields, animals, and financial entries to see live data here.</p>
          </div>
        )}

        {/* KPI tiles — shown conditionally by role */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Fields — always visible */}
          <StatTile
            label="Total Fields"
            value={stats.totalFields}
            change={`${stats.activeSeasons} active season${stats.activeSeasons !== 1 ? "s" : ""}`}
            changeType="neutral"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
          />

          {/* Livestock — OWNER, MANAGER, FARMHAND */}
          {canSeeLivestock ? (
            <StatTile
              label="Total Animals"
              value={stats.totalAnimals.toLocaleString()}
              change={`${stats.activeMobs} active mob${stats.activeMobs !== 1 ? "s" : ""}`}
              changeType="neutral"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
          ) : (
            <StatTile
              label="Active Seasons"
              value={stats.activeSeasons}
              change="crops in progress"
              changeType="neutral"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            />
          )}

          {/* Revenue — OWNER, MANAGER, READ_ONLY */}
          {canSeeFinance ? (
            <StatTile
              label="MTD Revenue"
              value={formatCurrency(stats.monthlyRevenue)}
              change={stats.monthlyRevenue > 0 ? "This month" : "No entries yet"}
              changeType={stats.monthlyRevenue > 0 ? "up" : "neutral"}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
          ) : (
            <Card className="flex flex-col justify-center items-center py-4 text-center">
              <p className="text-xs text-gray-400">Financial data</p>
              <p className="text-sm font-medium text-gray-500 mt-1">Restricted</p>
            </Card>
          )}

          {/* Expenses — OWNER, MANAGER, READ_ONLY */}
          {canSeeFinance ? (
            <StatTile
              label="MTD Expenses"
              value={formatCurrency(stats.monthlyExpenses)}
              change={netProfit >= 0 ? `Net +${formatCurrency(netProfit)}` : `Net ${formatCurrency(netProfit)}`}
              changeType={netProfit >= 0 ? "up" : "down"}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
            />
          ) : (
            <Card className="flex flex-col justify-center items-center py-4 text-center">
              <p className="text-xs text-gray-400">Financial data</p>
              <p className="text-sm font-medium text-gray-500 mt-1">Restricted</p>
            </Card>
          )}
        </div>

        {/* WHS Status Widget — streams in independently, hidden for Supplier */}
        {userRole !== "READ_ONLY" && orgId && ctx?.user_id && (
          <div className="mb-4">
            <Suspense fallback={<WHSWidgetSkeleton />}>
              <WHSStatusWidget
                orgId={orgId}
                userId={ctx.user_id}
                userRole={userRole}
              />
            </Suspense>
          </div>
        )}

        {/* Charts + Mobs — OWNER and MANAGER only */}
        {canSeeCharts && (
          <OverviewCharts chart={chart} species={species} mobs={mobs} />
        )}

        {/* Agronomist view: season/field focus message */}
        {userRole === "AGRONOMIST" && (
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-5">
            <p className="text-sm font-semibold text-[#15803D] mb-1">Agronomist View</p>
            <p className="text-sm text-[#166534]">Use the Crops section to manage fields and seasons. Visit Agronomist Reports to upload and analyse soil data. The AI Farm Advisor has full access to your crop and soil context.</p>
          </div>
        )}

        {/* Farmhand view */}
        {userRole === "FARMHAND" && (
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-5">
            <p className="text-sm font-semibold text-[#15803D] mb-1">Staff View</p>
            <p className="text-sm text-[#166534]">Use the Crops section to view fields, and the Livestock section to manage animals, mobs, and health events.</p>
          </div>
        )}

        {/* Supplier view */}
        {userRole === "READ_ONLY" && (
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-5">
            <p className="text-sm font-semibold text-[#1D4ED8] mb-1">Supplier View</p>
            <p className="text-sm text-[#1E40AF]">You have read-only access to financial entries linked to this farm. Contact the farm owner for any changes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
