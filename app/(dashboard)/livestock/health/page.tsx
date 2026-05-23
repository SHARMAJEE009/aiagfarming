import { auth } from "@/auth";
import { getOrgByEmail, getHealthEvents } from "@/lib/queries";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Thead, Th, Tr, Td } from "@/components/ui";
import { AddHealthEventModal } from "@/components/dashboard/AddHealthEventModal";

const eventTypeVariant: Record<string, "green" | "amber" | "gray" | "red"> = {
  vaccination: "green",
  treatment:   "amber",
  vet_visit:   "gray",
  observation: "gray",
};

export default async function HealthPage() {
  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  const orgId = ctx?.org_id;

  const events = orgId ? await getHealthEvents(orgId) : [];

  // Active withholding periods
  const today = new Date();
  const activeWithhold = events.filter((e) => {
    if (!e.withhold_date) return false;
    return new Date(e.withhold_date) > today;
  });

  const byType = {
    vaccination: events.filter((e) => e.event_type === "vaccination").length,
    treatment:   events.filter((e) => e.event_type === "treatment").length,
    vet_visit:   events.filter((e) => e.event_type === "vet_visit").length,
    observation: events.filter((e) => e.event_type === "observation").length,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Health Events"
        subtitle="Vaccination and treatment records with withholding period tracking"
        actions={<AddHealthEventModal />}
      />
      <div className="flex-1 overflow-y-auto p-6">
        {activeWithhold.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-6">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {activeWithhold.length} active withholding period{activeWithhold.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">Animals with treatments still within their withholding window.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Vaccinations", value: byType.vaccination, color: "#1A7A3A" },
            { label: "Treatments",   value: byType.treatment,   color: "#F5A623" },
            { label: "Vet Visits",   value: byType.vet_visit,   color: "#6B7280" },
            { label: "Active Withhold", value: activeWithhold.length, color: "#EF4444" },
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
              <CardTitle>Event Log ({events.length})</CardTitle>
              <Button size="sm" variant="outline">Export</Button>
            </CardHeader>
          </div>
          {events.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              No health events recorded yet. Log a treatment or vaccination to get started.
            </div>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Animal / Mob</Th>
                  <Th>Type</Th>
                  <Th>Product</Th>
                  <Th>Dose</Th>
                  <Th>Withhold Until</Th>
                  <Th>Notes</Th>
                </tr>
              </Thead>
              <tbody>
                {events.map((e) => {
                  const withholdActive = e.withhold_date && new Date(e.withhold_date) > today;
                  return (
                    <Tr key={e.id}>
                      <Td>{new Date(e.treatment_date).toLocaleDateString("en-AU")}</Td>
                      <Td>
                        <span className="font-medium">
                          {e.mob_name ?? e.animal_tag ?? "—"}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">
                          {e.mob_id ? "(mob)" : "(animal)"}
                        </span>
                      </Td>
                      <Td>
                        <Badge variant={eventTypeVariant[e.event_type] ?? "gray"} className="capitalize">
                          {e.event_type.replace("_", " ")}
                        </Badge>
                      </Td>
                      <Td>{e.product ?? "—"}</Td>
                      <Td>{e.dose != null ? `${e.dose} ${e.dose_unit ?? ""}` : "—"}</Td>
                      <Td>
                        {e.withhold_date
                          ? <Badge variant={withholdActive ? "amber" : "green"}>
                              {new Date(e.withhold_date).toLocaleDateString("en-AU")}
                            </Badge>
                          : <span className="text-gray-400">—</span>}
                      </Td>
                      <Td className="text-sm text-gray-500 max-w-[160px] truncate">{e.notes ?? "—"}</Td>
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
