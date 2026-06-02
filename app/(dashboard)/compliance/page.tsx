import { auth } from "@/auth";
import { getOrgByEmail, getSprayRecords } from "@/lib/queries";
import { getComplianceSubmissions } from "@/lib/whs-queries";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Thead, Th, Tr, Td } from "@/components/ui";
import { ComplianceTabs } from "@/components/whs/ComplianceTabs";
import { ComplianceWHSTab } from "@/components/whs/ComplianceWHSTab";

const statusBadge: Record<string, "green" | "amber" | "gray" | "red"> = {
  active:   "green",
  expiring: "amber",
  expired:  "red",
  pending:  "amber",
  planning: "gray",
};

export default async function CompliancePage() {
  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  const orgId = ctx?.org_id;

  const [sprays, whsSubmissions] = await Promise.all([
    orgId ? getSprayRecords(orgId) : Promise.resolve([]),
    orgId ? getComplianceSubmissions(orgId) : Promise.resolve([]),
  ]);

  const today = new Date();

  const chemicalMap = new Map<string, { product: string; lastUsed: string; withholdDays: number; status: string }>();
  for (const s of sprays) {
    const withholdEnd = new Date(s.applied_at);
    withholdEnd.setDate(withholdEnd.getDate() + s.withhold_days);
    const existing = chemicalMap.get(s.product);
    if (!existing || new Date(s.applied_at) > new Date(existing.lastUsed)) {
      chemicalMap.set(s.product, {
        product:      s.product,
        lastUsed:     s.applied_at,
        withholdDays: s.withhold_days,
        status:       "active",
      });
    }
  }
  const chemicals = Array.from(chemicalMap.values());

  const withholdTasks = sprays
    .filter((s) => {
      if (s.withhold_days === 0) return false;
      const end = new Date(s.applied_at);
      end.setDate(end.getDate() + s.withhold_days);
      return end > today;
    })
    .map((s) => {
      const end = new Date(s.applied_at);
      end.setDate(end.getDate() + s.withhold_days);
      return { id: s.id, title: `Withholding period — ${s.product} on ${s.field_name}`, dueDate: end };
    });

  const whsPending = whsSubmissions.filter((s) => s.status !== "signed").length;

  const chemicalContent = (
    <>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Products Used",       value: chemicals.length,     color: "#1A7A3A" },
          { label: "Active Withhold",     value: withholdTasks.length, color: withholdTasks.length > 0 ? "#F5A623" : "#1A7A3A" },
          { label: "Total Spray Records", value: sprays.length,        color: "#374151" },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </Card>
        ))}
      </div>

      {withholdTasks.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Active Withholding Periods</CardTitle></CardHeader>
          <div className="space-y-3">
            {withholdTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-900">{task.title}</p>
                    <p className="text-xs text-amber-700">Clears {task.dueDate.toLocaleDateString("en-AU")}</p>
                  </div>
                </div>
                <Badge variant="amber">High</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card padding={false}>
        <div className="p-6 pb-0">
          <CardHeader>
            <CardTitle>Chemical Register ({chemicals.length})</CardTitle>
            <Button size="sm" variant="outline">Export PDF</Button>
          </CardHeader>
        </div>
        {chemicals.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            No chemicals recorded yet. Spray records will automatically populate the chemical register.
          </div>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Product</Th>
                <Th>Last Applied</Th>
                <Th>Withhold (Days)</Th>
                <Th>Status</Th>
              </tr>
            </Thead>
            <tbody>
              {chemicals.map((chem) => (
                <Tr key={chem.product}>
                  <Td className="font-medium">{chem.product}</Td>
                  <Td>{new Date(chem.lastUsed).toLocaleDateString("en-AU")}</Td>
                  <Td>{chem.withholdDays > 0 ? `${chem.withholdDays} days` : <span className="text-gray-400">Nil</span>}</Td>
                  <Td><Badge variant={statusBadge[chem.status] ?? "gray"} className="capitalize">{chem.status}</Badge></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Compliance & Traceability"
        subtitle="Chemical register, withholding periods and WHS submissions"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Export NLIS CSV</Button>
            <Button size="sm" variant="outline">Audit Report</Button>
            <Button size="sm">Add Chemical</Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        <ComplianceTabs
          chemicalContent={chemicalContent}
          whsContent={<ComplianceWHSTab submissions={whsSubmissions} />}
          whsPendingCount={whsPending}
        />
      </div>
    </div>
  );
}
