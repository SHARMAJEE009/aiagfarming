import { auth } from "@/auth";
import { getOrgByEmail, getFinancialEntries, getRevenueChart } from "@/lib/queries";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Thead, Th, Tr, Td } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { FinanceChartClient } from "@/components/dashboard/FinanceChartClient";
import { AddEntryModal } from "@/components/dashboard/AddEntryModal";

export default async function FinancePage() {
  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  const orgId = ctx?.org_id;

  const [entries, chartData] = orgId
    ? await Promise.all([getFinancialEntries(orgId, 100), getRevenueChart(orgId)])
    : [[], []];

  const totalRevenue  = entries.filter((e) => e.type === "income").reduce((a, e) => a + e.amount, 0);
  const totalExpenses = entries.filter((e) => e.type === "expense").reduce((a, e) => a + e.amount, 0);
  const netProfit     = totalRevenue - totalExpenses;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Financial Management"
        subtitle="P&L, income, expenses and ledger"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Report
            </Button>
            <AddEntryModal />
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        {/* P&L summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <p className="text-xs text-gray-500">MTD Revenue</p>
            <p className="text-2xl font-bold text-[#1A7A3A] mt-1">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-gray-400 mt-1">{entries.filter((e) => e.type === "income").length} income entries</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500">MTD Expenses</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-gray-400 mt-1">{entries.filter((e) => e.type === "expense").length} expense entries</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500">Net Profit (MTD)</p>
            <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? "text-[#1A7A3A]" : "text-red-500"}`}>
              {formatCurrency(netProfit)}
            </p>
            <p className="text-xs text-gray-400 mt-1">{netProfit >= 0 ? "Profitable" : "Loss"}</p>
          </Card>
        </div>

        {/* Chart — client component */}
        <FinanceChartClient data={chartData} />

        {/* Transactions table */}
        <Card padding={false} className="mt-6">
          <div className="p-6 pb-0">
            <CardHeader>
              <CardTitle>All Transactions ({entries.length})</CardTitle>
              <div className="flex gap-2">
                <Badge variant="green">Income: {entries.filter((e) => e.type === "income").length}</Badge>
                <Badge variant="red">Expense: {entries.filter((e) => e.type === "expense").length}</Badge>
              </div>
            </CardHeader>
          </div>
          {entries.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              No financial entries yet. Click &quot;Add Entry&quot; to record your first transaction.
            </div>
          ) : (
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
                {entries.map((entry) => (
                  <Tr key={entry.id}>
                    <Td>{new Date(entry.entry_date).toLocaleDateString("en-AU")}</Td>
                    <Td><Badge variant="gray">{entry.category}</Badge></Td>
                    <Td>
                      <Badge variant={entry.type === "income" ? "green" : "red"} className="capitalize">
                        {entry.type}
                      </Badge>
                    </Td>
                    <Td className="text-sm text-gray-600 max-w-[220px] truncate">{entry.description ?? "—"}</Td>
                    <Td className={`text-right font-semibold ${entry.type === "income" ? "text-[#1A7A3A]" : "text-red-500"}`}>
                      {entry.type === "income" ? "+" : "-"}{formatCurrency(entry.amount)}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
