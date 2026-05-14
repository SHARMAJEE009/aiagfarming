"use client";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Thead, Th, Tr, Td } from "@/components/ui";
import { mockSeasons, mockFields } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

const statusMap = {
  active: { label: "Active", variant: "green" as const },
  planning: { label: "Planning", variant: "amber" as const },
  harvested: { label: "Harvested", variant: "gray" as const },
};

export default function SeasonsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Seasons & Crop Planner"
        subtitle="Plan and track crop seasons across all fields"
        actions={
          <Button size="sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Season
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Active Seasons", value: mockSeasons.filter(s => s.status === "active").length },
            { label: "Planning", value: mockSeasons.filter(s => s.status === "planning").length },
            { label: "Harvested This Year", value: mockSeasons.filter(s => s.status === "harvested").length },
          ].map((s) => (
            <Card key={s.label}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-[#1A7A3A] mt-1">{s.value}</p>
            </Card>
          ))}
        </div>

        <Card padding={false}>
          <div className="p-6 pb-0">
            <CardHeader><CardTitle>All Seasons</CardTitle></CardHeader>
          </div>
          <Table>
            <Thead>
              <tr>
                <Th>Field</Th>
                <Th>Crop</Th>
                <Th>Planted</Th>
                <Th>Harvested</Th>
                <Th>Yield (kg)</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {mockSeasons.map((season) => {
                const field = mockFields.find(f => f.id === season.fieldId);
                const s = statusMap[season.status];
                return (
                  <Tr key={season.id}>
                    <Td className="font-medium">{field?.name}</Td>
                    <Td>{season.cropType}</Td>
                    <Td>{formatDate(season.plantedAt)}</Td>
                    <Td>{season.harvestedAt ? formatDate(season.harvestedAt) : <span className="text-gray-400">—</span>}</Td>
                    <Td>{season.yieldKg ? season.yieldKg.toLocaleString() : <span className="text-gray-400">—</span>}</Td>
                    <Td><Badge variant={s.variant}>{s.label}</Badge></Td>
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
