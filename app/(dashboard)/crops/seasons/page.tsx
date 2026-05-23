import { auth } from "@/auth";
import { getOrgByEmail, getSeasons } from "@/lib/queries";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Thead, Th, Tr, Td } from "@/components/ui";
import { AddSeasonModal } from "@/components/dashboard/AddSeasonModal";

const statusMap: Record<string, { label: string; variant: "green" | "amber" | "gray" }> = {
  active:    { label: "Active",    variant: "green" },
  planning:  { label: "Planning",  variant: "amber" },
  harvested: { label: "Harvested", variant: "gray"  },
};

export default async function SeasonsPage() {
  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  const orgId = ctx?.org_id;

  const seasons = orgId ? await getSeasons(orgId) : [];

  const active    = seasons.filter((s) => s.status === "active").length;
  const planning  = seasons.filter((s) => s.status === "planning").length;
  const harvested = seasons.filter((s) => s.status === "harvested").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Seasons"
        subtitle="Track planting, growing, and harvest cycles"
        actions={<AddSeasonModal />}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Active",    value: active,    color: "#1A7A3A" },
            { label: "Planning",  value: planning,  color: "#F5A623" },
            { label: "Harvested", value: harvested, color: "#6B7280" },
          ].map((s) => (
            <Card key={s.label}>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </Card>
          ))}
        </div>

        <Card padding={false}>
          <div className="p-6 pb-0">
            <CardHeader>
              <CardTitle>All Seasons ({seasons.length})</CardTitle>
              <Button size="sm" variant="outline">Export</Button>
            </CardHeader>
          </div>
          {seasons.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              No seasons recorded yet. Add fields first, then log a season.
            </div>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Field</Th>
                  <Th>Crop</Th>
                  <Th>Planted</Th>
                  <Th>Harvested</Th>
                  <Th>Yield (kg)</Th>
                  <Th>Status</Th>
                </tr>
              </Thead>
              <tbody>
                {seasons.map((s) => {
                  const st = statusMap[s.status] ?? { label: s.status, variant: "gray" as const };
                  return (
                    <Tr key={s.id}>
                      <Td><span className="font-medium">{s.field_name}</span></Td>
                      <Td>{s.crop_type}</Td>
                      <Td>{new Date(s.planted_at).toLocaleDateString("en-AU")}</Td>
                      <Td>{s.harvested_at ? new Date(s.harvested_at).toLocaleDateString("en-AU") : "—"}</Td>
                      <Td>{s.yield_kg != null ? s.yield_kg.toLocaleString() : "—"}</Td>
                      <Td><Badge variant={st.variant}>{st.label}</Badge></Td>
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
