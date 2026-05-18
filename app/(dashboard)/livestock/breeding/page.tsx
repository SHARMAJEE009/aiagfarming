import { auth } from "@/auth";
import { getOrgByEmail } from "@/lib/queries";
import { dbQuery } from "@/lib/db";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Thead, Th, Tr, Td } from "@/components/ui";

const statusColors: Record<string, "green" | "amber" | "gray"> = {
  confirmed: "green",
  joined:    "amber",
  born:      "gray",
};

export default async function BreedingPage() {
  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  const orgId = ctx?.org_id;

  // Query breeding events through mobs scoped to org
  const events = orgId ? await dbQuery<{
    id: string; dam_id: string; sire_id: string | null;
    joining_date: string; pg_test_date: string | null;
    birth_date: string | null; offspring_count: number | null;
    status: string;
    dam_tag: string | null; dam_mob: string | null;
  }>(
    `SELECT be.id, be.dam_id, be.sire_id, be.joining_date, be.pg_test_date,
            be.birth_date, be.offspring_count, be.status,
            a.nlis_tag AS dam_tag, m.name AS dam_mob
     FROM breeding_events be
     JOIN animals a ON a.id = be.dam_id
     LEFT JOIN mobs m ON m.id = a.mob_id
     WHERE a.organization_id = $1
     ORDER BY be.joining_date DESC`,
    [orgId]
  ) : [];

  const active    = events.filter((e) => e.status !== "born").length;
  const confirmed = events.filter((e) => e.status === "confirmed").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Breeding Management"
        subtitle="Joining records, pregnancy testing and birth tracking"
        actions={<Button size="sm">Record Joining</Button>}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Active Joinings",        value: active,     color: "#1A7A3A" },
            { label: "Confirmed Pregnancies",  value: confirmed,  color: "#1A7A3A" },
            { label: "Total Births Recorded",  value: events.filter((e) => e.status === "born").length, color: "#6B7280" },
          ].map((s) => (
            <Card key={s.label}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </Card>
          ))}
        </div>

        <Card padding={false}>
          <div className="p-6 pb-0">
            <CardHeader>
              <CardTitle>Breeding Events ({events.length})</CardTitle>
              <Button size="sm" variant="outline">Export Report</Button>
            </CardHeader>
          </div>
          {events.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              No breeding events recorded yet. Register animals first, then log joining events.
            </div>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Dam</Th>
                  <Th>Mob</Th>
                  <Th>Joining Date</Th>
                  <Th>Preg Test</Th>
                  <Th>Birth Date</Th>
                  <Th>Offspring</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </Thead>
              <tbody>
                {events.map((e) => (
                  <Tr key={e.id}>
                    <Td><span className="font-mono text-xs bg-[#F3F4F6] px-2 py-0.5 rounded">{e.dam_tag ?? "—"}</span></Td>
                    <Td>{e.dam_mob ?? "—"}</Td>
                    <Td>{new Date(e.joining_date).toLocaleDateString("en-AU")}</Td>
                    <Td>{e.pg_test_date ? new Date(e.pg_test_date).toLocaleDateString("en-AU") : "—"}</Td>
                    <Td>{e.birth_date ? new Date(e.birth_date).toLocaleDateString("en-AU") : "—"}</Td>
                    <Td>{e.offspring_count ?? "—"}</Td>
                    <Td><Badge variant={statusColors[e.status] ?? "gray"} className="capitalize">{e.status}</Badge></Td>
                    <Td><Button size="sm" variant="ghost">View</Button></Td>
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
