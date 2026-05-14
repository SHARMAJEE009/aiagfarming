"use client";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Thead, Th, Tr, Td } from "@/components/ui";
import { mockFields } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

const sprayRecords = [
  { id: "sp1", fieldId: "f1", product: "Roundup PowerMAX", rate: 2.5, unit: "L/ha", appliedAt: "2025-04-10", withholdDays: 0, operator: "James Whitfield", area: 48.5, totalVol: 121.25 },
  { id: "sp2", fieldId: "f2", product: "Atrazine 900WG", rate: 1.0, unit: "kg/ha", appliedAt: "2025-04-22", withholdDays: 0, operator: "Mike Chen", area: 62.3, totalVol: 62.3 },
  { id: "sp3", fieldId: "f4", product: "Decis Forte", rate: 0.3, unit: "L/ha", appliedAt: "2025-05-02", withholdDays: 7, operator: "James Whitfield", area: 55.1, totalVol: 16.53 },
  { id: "sp4", fieldId: "f3", product: "Urea 46%", rate: 150, unit: "kg/ha", appliedAt: "2025-05-08", withholdDays: 0, operator: "Sarah O'Brien", area: 31.8, totalVol: 4770 },
];

export default function SpraysPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Spray Records"
        subtitle="Agrochemical application log with withholding period tracking"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Export Compliance</Button>
            <Button size="sm">Log Spray Event</Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Events This Season", value: sprayRecords.length },
            { label: "Active Withholding", value: sprayRecords.filter(s => s.withholdDays > 0).length },
            { label: "Products Used", value: new Set(sprayRecords.map(s => s.product)).size },
          ].map((s) => (
            <Card key={s.label}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-[#1A7A3A] mt-1">{s.value}</p>
            </Card>
          ))}
        </div>

        <Card padding={false}>
          <div className="p-6 pb-0">
            <CardHeader>
              <CardTitle>Spray Application Records</CardTitle>
              <Button size="sm" variant="outline">Filter</Button>
            </CardHeader>
          </div>
          <Table>
            <Thead>
              <tr>
                <Th>Date</Th>
                <Th>Field</Th>
                <Th>Product</Th>
                <Th>Rate</Th>
                <Th>Area (ha)</Th>
                <Th>Total Volume</Th>
                <Th>Operator</Th>
                <Th>Withhold</Th>
              </tr>
            </Thead>
            <tbody>
              {sprayRecords.map((record) => {
                const field = mockFields.find(f => f.id === record.fieldId);
                return (
                  <Tr key={record.id}>
                    <Td>{formatDate(record.appliedAt)}</Td>
                    <Td className="font-medium">{field?.name || "—"}</Td>
                    <Td>{record.product}</Td>
                    <Td className="font-mono text-xs">{record.rate} {record.unit}</Td>
                    <Td>{record.area.toFixed(1)}</Td>
                    <Td className="font-mono text-xs">{record.totalVol.toFixed(1)} {record.unit.split("/")[0]}</Td>
                    <Td className="text-gray-600">{record.operator}</Td>
                    <Td>
                      {record.withholdDays > 0 ? (
                        <Badge variant="amber">{record.withholdDays} days</Badge>
                      ) : (
                        <Badge variant="green">Nil</Badge>
                      )}
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
