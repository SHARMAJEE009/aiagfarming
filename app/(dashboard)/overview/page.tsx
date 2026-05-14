"use client";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, StatTile, Badge, Button } from "@/components/ui";
import { mockDashboardStats, mockMobs, mockWeatherData, revenueChartData, mockHealthEvents, livestockBySpecies } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#1A7A3A", "#F5A623", "#2d8e4e"];

export default function OverviewPage() {
  const s = mockDashboardStats;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Farm Overview"
        subtitle="Whitfield Station · Dalby, QLD · Updated just now"
        actions={
          <Button size="sm" variant="secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Alert banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-6">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">3 compliance items require attention</p>
            <p className="text-xs text-amber-700 mt-0.5">2 withholding period warnings · 1 chemical register expiry upcoming</p>
          </div>
          <Button size="sm" variant="ghost" className="text-amber-700 hover:bg-amber-100">View All</Button>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatTile label="Total Fields" value={s.totalFields} change="2 active seasons" changeType="neutral"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
          />
          <StatTile label="Total Animals" value={s.totalAnimals.toLocaleString()} change="+42 this month" changeType="up"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          <StatTile label="MTD Revenue" value={formatCurrency(s.monthlyRevenue)} change="+12% vs last month" changeType="up"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatTile label="MTD Expenses" value={formatCurrency(s.monthlyExpenses)} change="-8% vs last month" changeType="down"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
          />
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue chart */}
          <Card className="lg:col-span-2" padding={false}>
            <div className="p-6 pb-2">
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <Badge variant="green">Last 7 months</Badge>
              </CardHeader>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChartData} margin={{ left: 16, right: 16, bottom: 8 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A7A3A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1A7A3A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, ""]} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#1A7A3A" strokeWidth={2} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#F5A623" strokeWidth={2} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Livestock breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Livestock by Species</CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={livestockBySpecies} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="count" nameKey="species" paddingAngle={3}>
                  {livestockBySpecies.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {livestockBySpecies.map((d, i) => (
                <div key={d.species} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-gray-600">{d.species}</span>
                  </div>
                  <span className="font-semibold text-[#1F2937]">{d.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bottom row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active mobs */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Active Mobs</CardTitle>
              <Button size="sm" variant="secondary">View All</Button>
            </CardHeader>
            <div className="space-y-3">
              {mockMobs.slice(0, 4).map((mob) => (
                <div key={mob.id} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#E8F5EC] rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#1A7A3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1F2937]">{mob.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{mob.species} · Paddock {mob.paddockId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#1F2937]">{mob.headcount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">head</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Weather widget */}
          <Card>
            <CardHeader>
              <CardTitle>Weather · {mockWeatherData.location}</CardTitle>
            </CardHeader>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-[#1A7A3A]">{mockWeatherData.current.temp}°C</p>
              <p className="text-sm text-gray-500 mt-1">{mockWeatherData.current.description}</p>
              <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
                <span>💧 {mockWeatherData.current.humidity}%</span>
                <span>💨 {mockWeatherData.current.windSpeed} km/h</span>
              </div>
            </div>
            <div className="space-y-1.5">
              {mockWeatherData.forecast.slice(0, 5).map((day) => (
                <div key={day.date} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 w-16">{new Date(day.date).toLocaleDateString("en-AU", { weekday: "short" })}</span>
                  <span className="text-gray-700 flex-1 text-center">{day.description}</span>
                  <span className="text-blue-500 mr-2">{day.rain > 0 ? `${day.rain}mm` : "—"}</span>
                  <Badge variant={day.sprayWindow ? "green" : "red"} className="text-xs">
                    {day.sprayWindow ? "Spray ✓" : "No Spray"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
