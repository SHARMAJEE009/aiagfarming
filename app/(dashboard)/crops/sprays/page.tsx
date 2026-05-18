import { auth } from "@/auth";
import { getOrgByEmail, getSprayRecords } from "@/lib/queries";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Thead, Th, Tr, Td } from "@/components/ui";

export default async function SpraysPage() {
  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  const orgId = ctx?.org_id;

  const records = orgId ? await getSprayRecords(orgId) : [];

  // Check withholding — flag entries where applied_at + withhold_days > today
  const today = new Date();
  const withWarning = records.filter((r) => {
    const applied = new Date(r.applied_at);
    const withholdEnd = new Date(applied);
    withholdEnd.setDate(withholdEnd.getDate() + r.withhold_days);
    return r.withhold_days > 0 && withholdEnd > today;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Spray Records"
        subtitle="Chemical application log and withholding period tracker"
        actions={
          <Button size="sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Log Spray
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        {withWarning.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-6">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">{withWarning.length} active withholding period{withWarning.length !== 1 ? "s" : ""}</p>
              <p className="text-xs text-amber-700 mt-0.5">These fields have chemical withholding periods still in effect.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Applications", value: records.length },
            { label: "Active Withholding",  value: withWarning.length },
            { label: "Fields Sprayed",      value: new Set(records.map((r) => r.field_id)).size },
          ].map((s) => (
            <Card key={s.label}>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-[#1A7A3A] mt-1">{s.value}</p>
            </Card>
          ))}
        </div>

        <Card padding={false}>
          <div className="p-6 pb-0">
            <CardHeader>
              <CardTitle>Application Log ({records.length})</CardTitle>
              <Button size="sm" variant="outline">Export CSV</Button>
            </CardHeader>
          </div>
          {records.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              No spray records yet. Log your first application above.
            </div>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Field</Th>
                  <Th>Product</Th>
                  <Th>Rate</Th>
                  <Th>Area (ha)</Th>
                  <Th>Operator</Th>
                  <Th>Withholding</Th>
                </tr>
              </Thead>
              <tbody>
                {records.map((r) => {
                  const applied = new Date(r.applied_at);
                  const withholdEnd = new Date(applied);
                  withholdEnd.setDate(withholdEnd.getDate() + r.withhold_days);
                  const inWithhold = r.withhold_days > 0 && withholdEnd > today;
                  return (
                    <Tr key={r.id}>
                      <Td>{applied.toLocaleDateString("en-AU")}</Td>
                      <Td><span className="font-medium">{r.field_name}</span></Td>
                      <Td>{r.product}</Td>
                      <Td>{r.rate} {r.unit}</Td>
                      <Td>{r.area_ha.toFixed(1)}</Td>
                      <Td>{r.operator_name ?? "—"}</Td>
                      <Td>
                        {r.withhold_days === 0
                          ? <Badge variant="green">None</Badge>
                          : inWithhold
                            ? <Badge variant="amber">Until {withholdEnd.toLocaleDateString("en-AU")}</Badge>
                            : <Badge variant="green">Cleared</Badge>
                        }
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
