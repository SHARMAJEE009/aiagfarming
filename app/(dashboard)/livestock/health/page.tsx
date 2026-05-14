"use client";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Thead, Th, Tr, Td } from "@/components/ui";
import { mockHealthEvents, mockMobs, mockAnimals } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

const eventTypeColors: Record<string, "green" | "amber" | "red" | "blue"> = {
  vaccination: "green",
  treatment: "amber",
  vet_visit: "blue",
  observation: "amber",
};

export default function HealthPage() {
  const withholdingAlerts = mockHealthEvents.filter(h => h.withholdDate);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Health Events"
        subtitle="Treatments, vaccinations, vet visits and withholding period management"
        actions={
          <Button size="sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Log Treatment
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Withholding alert */}
        {withholdingAlerts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p className="font-semibold text-amber-800">{withholdingAlerts.length} Active Withholding Period{withholdingAlerts.length > 1 ? "s" : ""}</p>
            </div>
            {withholdingAlerts.map(h => (
              <p key={h.id} className="text-sm text-amber-700">
                · {h.product} — clearance {h.withholdDate ? formatDate(h.withholdDate) : "—"}
              </p>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Events This Month", value: 12 },
            { label: "Vaccinations", value: 3 },
            { label: "Treatments", value: 7 },
            { label: "Vet Visits", value: 2 },
          ].map((s) => (
            <Card key={s.label}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-[#1A7A3A] mt-1">{s.value}</p>
            </Card>
          ))}
        </div>

        {/* Events table */}
        <Card padding={false}>
          <div className="p-6 pb-0">
            <CardHeader>
              <CardTitle>Health Events</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Export Compliance</Button>
                <Button size="sm" variant="outline">Filter</Button>
              </div>
            </CardHeader>
          </div>
          <Table>
            <Thead>
              <tr>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th>Animal / Mob</Th>
                <Th>Product</Th>
                <Th>Dose</Th>
                <Th>Withhold Until</Th>
                <Th>Notes</Th>
              </tr>
            </Thead>
            <tbody>
              {mockHealthEvents.map((event) => {
                const mob = event.mobId ? mockMobs.find(m => m.id === event.mobId) : null;
                const animal = event.animalId ? mockAnimals.find(a => a.id === event.animalId) : null;
                const subject = mob ? `${mob.name} (mob)` : animal ? `${animal.nlisTag}` : "—";
                const variant = eventTypeColors[event.eventType] || "gray";
                return (
                  <Tr key={event.id}>
                    <Td>{formatDate(event.treatmentDate)}</Td>
                    <Td><Badge variant={variant} className="capitalize">{event.eventType.replace("_", " ")}</Badge></Td>
                    <Td className="font-medium">{subject}</Td>
                    <Td>{event.product || "—"}</Td>
                    <Td>{event.dose ? `${event.dose} ${event.doseUnit}` : "—"}</Td>
                    <Td>
                      {event.withholdDate ? (
                        <Badge variant="amber">{formatDate(event.withholdDate)}</Badge>
                      ) : <span className="text-gray-400">—</span>}
                    </Td>
                    <Td className="text-gray-500 text-xs">{event.notes || "—"}</Td>
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
