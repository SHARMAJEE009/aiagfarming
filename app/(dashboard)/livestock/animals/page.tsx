"use client";
import { useState } from "react";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Thead, Th, Tr, Td, Input, Select } from "@/components/ui";
import { mockAnimals, mockMobs } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import type { AnimalSpecies } from "@/types";

const speciesBadge: Record<AnimalSpecies, "green" | "amber" | "gray"> = {
  cattle: "green",
  sheep: "amber",
  pig: "gray",
  goat: "gray",
  poultry: "gray",
};

export default function AnimalsPage() {
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");

  const filtered = mockAnimals.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.nlisTag?.toLowerCase().includes(q) || a.breed?.toLowerCase().includes(q);
    const matchSpecies = speciesFilter === "all" || a.species === speciesFilter;
    return matchSearch && matchSpecies;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Animal Registry"
        subtitle="Track individual animal records, NLIS tags and health status"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Import CSV</Button>
            <Button size="sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Animal
            </Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Animals", value: "1,847", color: "#1A7A3A" },
            { label: "Cattle", value: "625", color: "#1A7A3A" },
            { label: "Sheep", value: "1,100", color: "#F5A623" },
            { label: "Other", value: "122", color: "#6B7280" },
          ].map((s) => (
            <Card key={s.label}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                label="Search"
                placeholder="Search by NLIS tag, breed..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Select
                label="Species"
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                options={[
                  { value: "all", label: "All Species" },
                  { value: "cattle", label: "Cattle" },
                  { value: "sheep", label: "Sheep" },
                  { value: "pig", label: "Pigs" },
                  { value: "goat", label: "Goats" },
                ]}
              />
            </div>
            <div className="w-40">
              <Select
                label="Status"
                value="active"
                onChange={() => {}}
                options={[
                  { value: "active", label: "Active" },
                  { value: "sold", label: "Sold" },
                  { value: "deceased", label: "Deceased" },
                ]}
              />
            </div>
            <Button variant="outline" size="md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filter
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card padding={false}>
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
              {filtered.map((animal) => {
                const mob = mockMobs.find(m => m.id === animal.mobId);
                return (
                  <Tr key={animal.id}>
                    <Td>
                      <span className="font-mono text-xs bg-[#F3F4F6] px-2 py-0.5 rounded">{animal.nlisTag || "—"}</span>
                    </Td>
                    <Td>
                      <div>
                        <Badge variant={speciesBadge[animal.species] || "gray"} className="capitalize mr-1">{animal.species}</Badge>
                        <span className="text-sm text-gray-600">{animal.breed}</span>
                      </div>
                    </Td>
                    <Td className="capitalize">{animal.sex}</Td>
                    <Td>{animal.dob ? formatDate(animal.dob) : "—"}</Td>
                    <Td>{mob?.name || "—"}</Td>
                    <Td><Badge variant="green" className="capitalize">{animal.status}</Badge></Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">View</Button>
                        <Button size="sm" variant="ghost">Health</Button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
          <div className="px-4 py-3 border-t border-[#F3F4F6] flex items-center justify-between text-sm text-gray-500">
            <span>Showing {filtered.length} of 1,847 animals</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled>Previous</Button>
              <Button size="sm" variant="outline">Next</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
