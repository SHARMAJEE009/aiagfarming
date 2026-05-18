import { auth } from "@/auth";
import { getOrgByEmail, getAnimals, getAnimalCounts } from "@/lib/queries";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, Badge, Button, Table, Thead, Th, Tr, Td } from "@/components/ui";
import { AnimalsClient } from "@/components/dashboard/AnimalsClient";

export default async function AnimalsPage() {
  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  const orgId = ctx?.org_id;

  const [animals, counts] = orgId
    ? await Promise.all([getAnimals(orgId), getAnimalCounts(orgId)])
    : [[], []];

  const totalAnimals = counts.reduce((a, c) => a + c.count, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Animal Registry"
        subtitle="Track individual animal records, NLIS tags and health status"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Import CSV</Button>
            <Button size="sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Animal
            </Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Species summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <p className="text-xs text-gray-500">Total Animals</p>
            <p className="text-2xl font-bold text-[#1A7A3A] mt-1">{totalAnimals.toLocaleString()}</p>
          </Card>
          {counts.map((c) => (
            <Card key={c.species}>
              <p className="text-xs text-gray-500 capitalize">{c.species}</p>
              <p className="text-2xl font-bold mt-1 text-[#1A7A3A]">{c.count.toLocaleString()}</p>
            </Card>
          ))}
        </div>

        {/* Client component for search/filter + table */}
        <AnimalsClient animals={animals} />
      </div>
    </div>
  );
}
