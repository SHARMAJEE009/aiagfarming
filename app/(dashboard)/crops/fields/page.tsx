"use client";
import { TopBar } from "@/components/dashboard/TopBar";
import { FieldsMap } from "@/components/dashboard/FieldsMap";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Thead, Th, Tr, Td } from "@/components/ui";
import { mockFields, mockSeasons } from "@/lib/mock-data";

const statusMap: Record<string, { label: string; variant: "green" | "amber" | "gray" }> = {
  active: { label: "Active", variant: "green" },
  planning: { label: "Planning", variant: "amber" },
  harvested: { label: "Harvested", variant: "gray" },
};

export default function FieldsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Fields"
        subtitle="Manage your farm fields and GIS boundaries"
        actions={
          <Button size="sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Field
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Fields", value: mockFields.length, sub: "registered" },
            { label: "Total Area", value: `${mockFields.reduce((a, f) => a + f.area, 0).toFixed(0)} ha`, sub: "across all fields" },
            { label: "Active Seasons", value: mockSeasons.filter(s => s.status === "active").length, sub: "growing now" },
          ].map((s) => (
            <Card key={s.label}>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-[#1A7A3A] mt-1">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </Card>
          ))}
        </div>

        <Card className="mb-6 overflow-hidden" padding={false}>
          <div className="h-64 rounded-xl overflow-hidden">
            <FieldsMap apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} heightPx={256} />
          </div>
        </Card>

        {/* Fields table */}
        <Card padding={false}>
          <div className="p-6 pb-0">
            <CardHeader>
              <CardTitle>All Fields</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Import CSV</Button>
                <Button size="sm" variant="outline">Export</Button>
              </div>
            </CardHeader>
          </div>
          <Table>
            <Thead>
              <tr>
                <Th>Field Name</Th>
                <Th>Area (ha)</Th>
                <Th>Soil Type</Th>
                <Th>Current Crop</Th>
                <Th>Season Status</Th>
                <Th>Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {mockFields.map((field) => {
                const season = mockSeasons.find(s => s.fieldId === field.id);
                const status = season ? statusMap[season.status] : null;
                return (
                  <Tr key={field.id}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-[#E8F5EC] rounded-md flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-[#1A7A3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                        </div>
                        <span className="font-medium">{field.name}</span>
                      </div>
                    </Td>
                    <Td>{field.area.toFixed(1)}</Td>
                    <Td>{field.soilType || "—"}</Td>
                    <Td>{season?.cropType || <span className="text-gray-400">No crop</span>}</Td>
                    <Td>{status ? <Badge variant={status.variant}>{status.label}</Badge> : <span className="text-gray-400">—</span>}</Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">View</Button>
                        <Button size="sm" variant="ghost">Edit</Button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
