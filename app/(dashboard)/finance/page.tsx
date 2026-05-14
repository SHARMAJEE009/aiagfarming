"use client";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Thead, Th, Tr, Td } from "@/components/ui";
import { mockFinancialEntries, revenueChartData } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function FinancePage() {
  const totalRevenue = mockFinancialEntries.filter(e => e.type === "income").reduce((a, e) => a + e.amount, 0);
  const totalExpenses = mockFinancialEntries.filter(e => e.type === "expense").reduce((a, e) => a + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Financial Management"
        subtitle="P&L, income, expenses and integrations"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export Report
            </Button>
            <Button size="sm">Add Entry</Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        {/* P&L summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <p className="text-xs text-gray-500">MTD Revenue</p>
            <p className="text-2xl font-bold text-[#1A7A3A] mt-1">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-green-600 mt-1">↑ 12% vs last month</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500">MTD Expenses</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-gray-500 mt-1">↓ 8% vs last month</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500">Net Profit (MTD)</p>
            <p className={`text-2xl font-bold mt-1 ${netProfit > 0 ? "text-[#1A7A3A]" : "text-red-500"}`}>
              {formatCurrency(netProfit)}
            </p>
            <p className="text-xs text-green-600 mt-1">Healthy margin</p>
          </Card>
        </div>

        {/* Chart */}
        <Card className="mb-6" padding={false}>
          <div className="p-6 pb-2">
            <CardHeader>
              <CardTitle>Revenue vs Expenses — Last 7 Months</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="text-xs">Monthly</Button>
                <Button size="sm" variant="secondary" className="text-xs">Quarterly</Button>
              </div>
            </CardHeader>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueChartData} margin={{ left: 16, right: 16, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, ""]} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#1A7A3A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#F5A623" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Transactions */}
        <Card padding={false}>
          <div className="p-6 pb-0">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <div className="flex gap-2">
                <Badge variant="green">Income: {mockFinancialEntries.filter(e => e.type === "income").length}</Badge>
                <Badge variant="red">Expense: {mockFinancialEntries.filter(e => e.type === "expense").length}</Badge>
              </div>
            </CardHeader>
          </div>
          <Table>
            <Thead>
              <tr>
                <Th>Date</Th>
                <Th>Category</Th>
                <Th>Type</Th>
                <Th>Description</Th>
                <Th className="text-right">Amount</Th>
              </tr>
            </Thead>
            <tbody>
              {mockFinancialEntries.map((entry) => (
                <Tr key={entry.id}>
                  <Td>{formatDate(entry.date)}</Td>
                  <Td>
                    <Badge variant="gray">{entry.category}</Badge>
                  </Td>
                  <Td>
                    <Badge variant={entry.type === "income" ? "green" : "red"} className="capitalize">
                      {entry.type}
                    </Badge>
                  </Td>
                  <Td className="text-sm text-gray-600">{entry.description}</Td>
                  <Td className={`text-right font-semibold ${entry.type === "income" ? "text-[#1A7A3A]" : "text-red-500"}`}>
                    {entry.type === "income" ? "+" : "-"}{formatCurrency(entry.amount)}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
