"use client";
import { useState, useMemo } from "react";
import { Card, Badge, Button, Table, Thead, Th, Tr, Td, Input, Select } from "@/components/ui";

type Animal = {
  id: string; nlis_tag: string | null; rfid_tag: string | null;
  visual_tag: string | null; species: string; breed: string | null;
  sex: string; dob: string | null; status: string;
  mob_name: string | null; mob_id: string | null;
};

const speciesBadgeVariant: Record<string, "green" | "amber" | "gray"> = {
  cattle: "green", sheep: "amber",
  pig: "gray", goat: "gray", poultry: "gray",
};

export function AnimalsClient({ animals }: { animals: Animal[] }) {
  const [search, setSearch]         = useState("");
  const [speciesFilter, setSpecies] = useState("all");
  const [statusFilter,  setStatus]  = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return animals.filter((a) => {
      const matchSearch = !q ||
        a.nlis_tag?.toLowerCase().includes(q) ||
        a.breed?.toLowerCase().includes(q)    ||
        a.visual_tag?.toLowerCase().includes(q);
      const matchSpecies = speciesFilter === "all" || a.species === speciesFilter;
      const matchStatus  = statusFilter  === "all" || a.status  === statusFilter;
      return matchSearch && matchSpecies && matchStatus;
    });
  }, [animals, search, speciesFilter, statusFilter]);

  return (
    <>
      <Card className="mb-4">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Search"
              placeholder="NLIS tag, breed, visual tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select
              label="Species"
              value={speciesFilter}
              onChange={(e) => setSpecies(e.target.value)}
              options={[
                { value: "all",     label: "All Species" },
                { value: "cattle",  label: "Cattle" },
                { value: "sheep",   label: "Sheep"  },
                { value: "pig",     label: "Pigs"   },
                { value: "goat",    label: "Goats"  },
                { value: "poultry", label: "Poultry"},
              ]}
            />
          </div>
          <div className="w-40">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "all",      label: "All Status" },
                { value: "active",   label: "Active"     },
                { value: "sold",     label: "Sold"       },
                { value: "deceased", label: "Deceased"   },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card padding={false}>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            {animals.length === 0
              ? "No animals registered yet. Click \"Add Animal\" to get started."
              : "No animals match your search criteria."}
          </div>
        ) : (
          <>
            <Table>
              <Thead>
                <tr>
                  <Th>NLIS Tag</Th>
                  <Th>Species / Breed</Th>
                  <Th>Sex</Th>
                  <Th>DOB</Th>
                  <Th>Mob</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </Thead>
              <tbody>
                {filtered.map((animal) => (
                  <Tr key={animal.id}>
                    <Td>
                      <span className="font-mono text-xs bg-[#F3F4F6] px-2 py-0.5 rounded">
                        {animal.nlis_tag || animal.visual_tag || "—"}
                      </span>
                    </Td>
                    <Td>
                      <div>
                        <Badge variant={speciesBadgeVariant[animal.species] ?? "gray"} className="capitalize mr-1">
                          {animal.species}
                        </Badge>
                        <span className="text-sm text-gray-600">{animal.breed ?? ""}</span>
                      </div>
                    </Td>
                    <Td className="capitalize">{animal.sex}</Td>
                    <Td>{animal.dob ? new Date(animal.dob).toLocaleDateString("en-AU") : "—"}</Td>
                    <Td>{animal.mob_name ?? "—"}</Td>
                    <Td>
                      <Badge
                        variant={animal.status === "active" ? "green" : animal.status === "sold" ? "amber" : "gray"}
                        className="capitalize"
                      >
                        {animal.status}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">View</Button>
                        <Button size="sm" variant="ghost">Health</Button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <div className="px-4 py-3 border-t border-[#F3F4F6] flex items-center justify-between text-sm text-gray-500">
              <span>Showing {filtered.length} of {animals.length} animals</span>
            </div>
          </>
        )}
      </Card>
    </>
  );
}
