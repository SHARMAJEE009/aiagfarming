"use client";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Thead, Th, Tr, Td } from "@/components/ui";
import { formatDate } from "@/lib/utils";

const chemicalRegister = [
  { id: "c1", product: "Roundup PowerMAX", activeIngredient: "Glyphosate", regNo: "62815", withholdDays: 0, expiryDate: "2026-06-30", status: "active" },
  { id: "c2", product: "Dectomax Pour-On", activeIngredient: "Doramectin", regNo: "48219", withholdDays: 42, expiryDate: "2025-12-31", status: "active" },
  { id: "c3", product: "Glanvac 6S", activeIngredient: "Clostridial antigens", regNo: "55103", withholdDays: 0, expiryDate: "2025-08-15", status: "expiring" },
  { id: "c4", product: "Bovilis MH+PI3", activeIngredient: "Mannheimia haemolytica", regNo: "67412", withholdDays: 0, expiryDate: "2026-03-20", status: "active" },
  { id: "c5", product: "Atrazine 900WG", activeIngredient: "Atrazine", regNo: "39011", withholdDays: 0, expiryDate: "2024-11-01", status: "expired" },
];

const complianceTasks = [
  { id: "t1", title: "NLIS Movement Declaration — Steer Sale", dueDate: "2025-05-20", priority: "high", status: "pending" },
  { id: "t2", title: "Annual Chemical Register Audit", dueDate: "2025-06-01", priority: "medium", status: "pending" },
  { id: "t3", title: "Withholding Period Clearance — Dectomax (Lot A)", dueDate: "2025-07-01", priority: "high", status: "active" },
  { id: "t4", title: "SQF Food Safety Audit Preparation", dueDate: "2025-09-01", priority: "low", status: "planning" },
  { id: "t5", title: "Water Use Compliance Report — Q2", dueDate: "2025-06-30", priority: "medium", status: "pending" },
];

const priorityBadge: Record<string, "red" | "amber" | "gray"> = {
  high: "red",
  medium: "amber",
  low: "gray",
};

const statusBadge: Record<string, "green" | "amber" | "gray" | "red"> = {
  active: "green",
  expiring: "amber",
  expired: "red",
  pending: "amber",
  planning: "gray",
};

export default function CompliancePage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Compliance & Traceability"
        subtitle="Chemical register, NLIS, withholding periods and audit exports"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Export NLIS CSV</Button>
            <Button size="sm" variant="outline">Audit Report</Button>
            <Button size="sm">Add Chemical</Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Chemicals Registered", value: chemicalRegister.length, color: "#1A7A3A" },
            { label: "Expiring Soon", value: chemicalRegister.filter(c => c.status === "expiring").length, color: "#F5A623" },
            { label: "Expired", value: chemicalRegister.filter(c => c.status === "expired").length, color: "#DC2626" },
            { label: "Compliance Tasks", value: complianceTasks.filter(t => t.status === "pending").length, color: "#374151" },
          ].map((s) => (
            <Card key={s.label}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </Card>
          ))}
        </div>

        {/* Compliance tasks */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Compliance Tasks</CardTitle>
            <Button size="sm" variant="secondary">Add Task</Button>
          </CardHeader>
          <div className="space-y-3">
            {complianceTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB] border border-[#F3F4F6]">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 accent-[#1A7A3A]" />
                  <div>
                    <p className="text-sm font-medium text-[#1F2937]">{task.title}</p>
                    <p className="text-xs text-gray-500">Due {formatDate(task.dueDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={priorityBadge[task.priority]} className="capitalize">{task.priority}</Badge>
                  <Badge variant={statusBadge[task.status as keyof typeof statusBadge]} className="capitalize">{task.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Chemical register */}
        <Card padding={false}>
          <div className="p-6 pb-0">
            <CardHeader>
              <CardTitle>Chemical Register</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Export PDF</Button>
                <Button size="sm" variant="outline">Import</Button>
              </div>
            </CardHeader>
          </div>
          <Table>
            <Thead>
              <tr>
                <Th>Product</Th>
                <Th>Active Ingredient</Th>
                <Th>APVMA Reg No.</Th>
                <Th>Withhold (Days)</Th>
                <Th>Expiry Date</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {chemicalRegister.map((chem) => (
                <Tr key={chem.id}>
                  <Td className="font-medium">{chem.product}</Td>
                  <Td className="text-gray-600">{chem.activeIngredient}</Td>
                  <Td><span className="font-mono text-xs bg-[#F3F4F6] px-2 py-0.5 rounded">{chem.regNo}</span></Td>
                  <Td>{chem.withholdDays > 0 ? `${chem.withholdDays} days` : <span className="text-gray-400">Nil</span>}</Td>
                  <Td>{formatDate(chem.expiryDate)}</Td>
                  <Td>
                    <Badge variant={statusBadge[chem.status as keyof typeof statusBadge]} className="capitalize">{chem.status}</Badge>
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">Edit</Button>
                      <Button size="sm" variant="ghost">View SDS</Button>
                    </div>
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
