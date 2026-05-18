import { auth } from "@/auth";
import { getOrgByEmail, getMobs, getPaddocks } from "@/lib/queries";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Thead, Th, Tr, Td } from "@/components/ui";

const speciesColor: Record<string, string> = {
  cattle:  "#1A7A3A",
  sheep:   "#F5A623",
  pig:     "#6B7280",
  goat:    "#2d8e4e",
  poultry: "#9CA3AF",
};

export default async function MobsPage() {
  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  const orgId = ctx?.org_id;

  const [mobs, paddocks] = orgId
    ? await Promise.all([getMobs(orgId), getPaddocks(orgId)])
    : [[], []];

  const totalAnimals = mobs.reduce((a, m) => a + m.headcount, 0);
  const speciesSet   = new Set(mobs.map((m) => m.species));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Mobs & Paddocks"
        subtitle="Manage livestock groups and paddock allocations"
        actions={
          <Button size="sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Mob
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Mobs",     value: mobs.length              },
            { label: "Total Animals",  value: totalAnimals.toLocaleString() },
            { label: "Species",        value: speciesSet.size           },
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
              <CardTitle>Mob Register ({mobs.length})</CardTitle>
              <Button size="sm" variant="outline">Export</Button>
            </CardHeader>
          </div>
          {mobs.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              No mobs yet. Click &quot;Add Mob&quot; to create your first livestock group.
            </div>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Mob Name</Th>
                  <Th>Species</Th>
                  <Th>Headcount</Th>
                  <Th>Paddock</Th>
                  <Th>Actions</Th>
                </tr>
              </Thead>
              <tbody>
                {mobs.map((mob) => (
                  <Tr key={mob.id}>
                    <Td><span className="font-medium">{mob.name}</span></Td>
                    <Td>
                      <Badge
                        variant="green"
                        className="capitalize"
                        style={{ backgroundColor: `${speciesColor[mob.species] ?? "#6B7280"}20`, color: speciesColor[mob.species] ?? "#6B7280" }}
                      >
                        {mob.species}
                      </Badge>
                    </Td>
                    <Td><span className="font-semibold">{mob.headcount.toLocaleString()}</span></Td>
                    <Td>{mob.paddock_name ?? <span className="text-gray-400">Unassigned</span>}</Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">Edit</Button>
                        <Button size="sm" variant="ghost">Move</Button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        {paddocks.length > 0 && (
          <Card className="mt-6">
            <CardHeader><CardTitle>Paddocks ({paddocks.length})</CardTitle></CardHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {paddocks.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB] border border-[#F3F4F6]">
                  <span className="text-sm font-medium text-[#1F2937]">{p.name}</span>
                  {p.area_ha && <span className="text-xs text-gray-500">{p.area_ha.toFixed(1)} ha</span>}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
