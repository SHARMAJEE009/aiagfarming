import { auth } from "@/auth";
import { getOrgByEmail, getFields, getSeasons } from "@/lib/queries";
import { TopBar } from "@/components/dashboard/TopBar";
import { FieldsMap } from "@/components/dashboard/FieldsMap";
import { FieldsBoundaryPanel } from "@/components/dashboard/FieldsBoundaryPanel";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Thead, Th, Tr, Td } from "@/components/ui";
import { AddFieldModal } from "@/components/dashboard/AddFieldModal";
import type { LatLng } from "@/components/dashboard/FieldsMap";

const statusMap: Record<string, { label: string; variant: "green" | "amber" | "gray" }> = {
  active:    { label: "Active",    variant: "green" },
  planning:  { label: "Planning",  variant: "amber" },
  harvested: { label: "Harvested", variant: "gray"  },
};

export default async function FieldsPage() {
  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  const orgId = ctx?.org_id;

  const fields = orgId ? await getFields(orgId) : [];

  const totalArea    = fields.reduce((a, f) => a + f.area_ha, 0);
  const activeCount  = fields.filter((f) => f.season_status === "active").length;
  const mappedCount  = fields.filter((f) => {
    const b = f.boundary_geojson as LatLng[] | null;
    return Array.isArray(b) && b.length >= 3;
  }).length;

  // Build field data for the map
  const fieldMapData = fields.map((f) => ({
    id: f.id,
    name: f.name,
    boundary: (f.boundary_geojson as LatLng[] | null) ?? undefined,
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Fields"
        subtitle="Manage your farm fields and GIS boundaries"
        actions={<AddFieldModal />}
      />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Fields",   value: fields.length,               sub: "registered"        },
            { label: "Total Area",     value: `${totalArea.toFixed(1)} ha`, sub: "across all fields" },
            { label: "Active Seasons", value: activeCount,                  sub: "growing now"       },
            { label: "Mapped Fields",  value: mappedCount,                  sub: "with boundaries"   },
          ].map((s) => (
            <Card key={s.label}>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-[#1A7A3A] mt-1">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </Card>
          ))}
        </div>

        {/* Overview map with all saved boundaries */}
        <Card className="mb-6 overflow-hidden" padding={false}>
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#1F2937]">Farm Overview Map</p>
              <p className="text-xs text-gray-500 mt-0.5">All mapped paddock boundaries</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#1A7A3A]/40 border border-[#1A7A3A] rounded-sm inline-block" />
              <span className="text-xs text-gray-500">Mapped boundary</span>
            </div>
          </div>
          <FieldsMap
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            fields={fieldMapData}
            heightPx={320}
          />
        </Card>

        {/* Fields table */}
        <Card padding={false}>
          <div className="p-6 pb-0">
            <CardHeader>
              <CardTitle>All Fields ({fields.length})</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Import CSV</Button>
                <Button size="sm" variant="outline">Export</Button>
              </div>
            </CardHeader>
          </div>
          {fields.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-sm">No fields yet.</p>
              <p className="text-xs mt-1">Click &quot;Add Field&quot; to register your first field.</p>
            </div>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Field Name</Th>
                  <Th>Area (ha)</Th>
                  <Th>Soil Type</Th>
                  <Th>Current Crop</Th>
                  <Th>Season Status</Th>
                  <Th>Boundary</Th>
                  <Th>Actions</Th>
                </tr>
              </Thead>
              <tbody>
                {fields.map((field) => {
                  const status = field.season_status ? statusMap[field.season_status] : null;
                  const hasBoundary = Array.isArray(field.boundary_geojson) && (field.boundary_geojson as LatLng[]).length >= 3;
                  return (
                    <Tr key={field.id}>
                      <Td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-[#E8F5EC] rounded-md flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-[#1A7A3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                          </div>
                          <span className="font-medium">{field.name}</span>
                        </div>
                      </Td>
                      <Td>{field.area_ha.toFixed(1)}</Td>
                      <Td>{field.soil_type || "—"}</Td>
                      <Td>{field.crop_type || <span className="text-gray-400">No crop</span>}</Td>
                      <Td>
                        {status
                          ? <Badge variant={status.variant}>{status.label}</Badge>
                          : <span className="text-gray-400">—</span>}
                      </Td>
                      <Td>
                        {hasBoundary
                          ? <Badge variant="green">✓ Mapped</Badge>
                          : <span className="text-xs text-gray-400">Not mapped</span>}
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">View</Button>
                          <Button size="sm" variant="ghost">Edit</Button>
                          {/* Client-side boundary mapper trigger */}
                          <FieldsBoundaryPanel
                            fieldId={field.id}
                            fieldName={field.name}
                            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                            initialBoundary={(field.boundary_geojson as LatLng[] | null) ?? []}
                          />
                        </div>
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
