"use client";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Thead, Th, Tr, Td } from "@/components/ui";
import { formatDate } from "@/lib/utils";

const breedingEvents = [
  { id: "b1", mobName: "Breeding Cows #1", damCount: 285, joiningDate: "2025-03-01", pgTestDate: "2025-05-15", expectedBirthDate: "2025-11-20", status: "confirmed", pregnancyRate: 91 },
  { id: "b2", mobName: "Heifers 2024", damCount: 68, joiningDate: "2025-03-15", pgTestDate: "2025-05-22", expectedBirthDate: "2025-12-05", status: "joined", pregnancyRate: null },
  { id: "b3", mobName: "Ewes Main", damCount: 680, joiningDate: "2025-04-01", pgTestDate: "2025-06-01", expectedBirthDate: "2025-09-01", status: "joined", pregnancyRate: null },
];

const statusColors: Record<string, "green" | "amber" | "gray"> = {
  confirmed: "green",
  joined: "amber",
  born: "gray",
};

export default function BreedingPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Breeding Management"
        subtitle="Joining records, pregnancy testing and birth tracking"
        actions={
          <Button size="sm">Record Joining</Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Active Joinings", value: breedingEvents.filter(b => b.status !== "born").length },
            { label: "Confirmed Pregnancies", value: breedingEvents.filter(b => b.status === "confirmed").reduce((a, b) => a + Math.round(b.damCount * (b.pregnancyRate || 0) / 100), 0) },
            { label: "Births Expected (Nov)", value: "285+", color: "#F5A623" },
          ].map((s) => (
            <Card key={s.label}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: s.color || "#1A7A3A" }}>{s.value}</p>
            </Card>
          ))}
        </div>

        <Card padding={false}>
          <div className="p-6 pb-0">
            <CardHeader>
              <CardTitle>Breeding Events</CardTitle>
              <Button size="sm" variant="outline">Export Performance Report</Button>
            </CardHeader>
          </div>
          <Table>
            <Thead>
              <tr>
                <Th>Mob</Th>
                <Th>Dams</Th>
                <Th>Joining Date</Th>
                <Th>Preg Test Date</Th>
                <Th>Expected Birth</Th>
                <Th>Pregnancy Rate</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {breedingEvents.map((event) => (
                <Tr key={event.id}>
                  <Td className="font-medium">{event.mobName}</Td>
                  <Td>{event.damCount}</Td>
                  <Td>{formatDate(event.joiningDate)}</Td>
                  <Td>{event.pgTestDate ? formatDate(event.pgTestDate) : "—"}</Td>
                  <Td>{formatDate(event.expectedBirthDate)}</Td>
                  <Td>
                    {event.pregnancyRate !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full w-16">
                          <div className="h-1.5 bg-[#1A7A3A] rounded-full" style={{ width: `${event.pregnancyRate}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-[#1A7A3A]">{event.pregnancyRate}%</span>
                      </div>
                    ) : <span className="text-gray-400">—</span>}
                  </Td>
                  <Td><Badge variant={statusColors[event.status]} className="capitalize">{event.status}</Badge></Td>
                  <Td>
                    <Button size="sm" variant="ghost">View</Button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
