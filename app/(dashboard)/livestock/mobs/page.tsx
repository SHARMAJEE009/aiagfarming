"use client";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Thead, Th, Tr, Td } from "@/components/ui";
import { mockMobs } from "@/lib/mock-data";

const speciesColors: Record<string, "green" | "amber" | "gray"> = {
  cattle: "green",
  sheep: "amber",
  pig: "gray",
  goat: "gray",
  poultry: "gray",
};

const paddocks = [
  { id: "p1", name: "Home Paddock", area: 85 },
  { id: "p2", name: "North Run", area: 142 },
  { id: "p3", name: "South Flat", area: 98 },
  { id: "p4", name: "Creek Block", area: 67 },
  { id: "p5", name: "Hill Country", area: 220 },
];

export default function MobsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Mobs & Paddocks"
        subtitle="Group management, paddock allocation and movement tracking"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Record Movement</Button>
            <Button size="sm">New Mob</Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Paddock grid */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Paddock Overview</CardTitle>
            <Button size="sm" variant="secondary">View Map</Button>
          </CardHeader>
          <div className="grid grid-cols-5 gap-3">
            {paddocks.map((p) => {
              const mob = mockMobs.find(m => m.paddockId === p.id);
              return (
                <div
                  key={p.id}
                  className={`rounded-xl border-2 p-3 cursor-pointer transition-all hover:shadow-md ${mob ? "border-[#1A7A3A] bg-[#E8F5EC]" : "border-[#E5E7EB] bg-[#F9FAFB]"}`}
                >
                  <p className="text-xs font-semibold text-[#1F2937]">{p.name}</p>
                  <p className="text-xs text-gray-500 mb-2">{p.area} ha</p>
                  {mob ? (
                    <>
                      <Badge variant={speciesColors[mob.species]} className="text-xs mb-1 block w-fit">{mob.headcount} head</Badge>
                      <p className="text-xs text-gray-600 truncate">{mob.name}</p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Empty</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Mobs table */}
        <Card padding={false}>
          <div className="p-6 pb-0">
            <CardHeader>
              <CardTitle>Active Mobs</CardTitle>
              <Button size="sm" variant="outline">NLIS Export</Button>
            </CardHeader>
          </div>
          <Table>
            <Thead>
              <tr>
                <Th>Mob Name</Th>
                <Th>Species</Th>
                <Th>Headcount</Th>
                <Th>Current Paddock</Th>
                <Th>Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {mockMobs.map((mob) => {
                const paddock = paddocks.find(p => p.id === mob.paddockId);
                return (
                  <Tr key={mob.id}>
                    <Td className="font-medium">{mob.name}</Td>
                    <Td><Badge variant={speciesColors[mob.species]} className="capitalize">{mob.species}</Badge></Td>
                    <Td className="font-semibold">{mob.headcount.toLocaleString()}</Td>
                    <Td>{paddock?.name || <span className="text-gray-400">Unassigned</span>}</Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">View</Button>
                        <Button size="sm" variant="ghost">Move</Button>
                        <Button size="sm" variant="ghost">Health</Button>
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
