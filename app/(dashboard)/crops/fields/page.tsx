import { auth } from "@/auth";
import { getOrgByEmail, getFields } from "@/lib/queries";
import { FieldsInteractiveView } from "@/components/dashboard/FieldsInteractiveView";
import type { LatLng } from "@/components/dashboard/FieldsMap";

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
    <FieldsInteractiveView 
      fields={fields} 
      fieldMapData={fieldMapData} 
      totalArea={totalArea} 
      activeCount={activeCount} 
      mappedCount={mappedCount} 
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} 
    />
  );
}
