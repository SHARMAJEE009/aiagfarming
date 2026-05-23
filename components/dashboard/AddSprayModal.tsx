"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

type Field = { id: string; name: string; area_ha: number };

export function AddSprayModal() {
  const [open, setOpen]             = useState(false);
  const [saving, setSaving]         = useState(false);
  const [fields, setFields]         = useState<Field[]>([]);

  const [fieldId, setFieldId]       = useState("");
  const [product, setProduct]       = useState("");
  const [rate, setRate]             = useState("");
  const [unit, setUnit]             = useState("L/ha");
  const [appliedAt, setAppliedAt]   = useState(new Date().toISOString().slice(0, 10));
  const [withholdDays, setWithholdDays] = useState("0");
  const [notes, setNotes]           = useState("");

  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    fetch("/api/fields")
      .then((r) => r.json())
      .then((d) => setFields(d.fields ?? []))
      .catch(() => setFields([]));
  }, [open]);

  const reset = () => {
    setFieldId("");
    setProduct("");
    setRate("");
    setUnit("L/ha");
    setAppliedAt(new Date().toISOString().slice(0, 10));
    setWithholdDays("0");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldId || !product || !rate || !unit || !appliedAt) return;
    setSaving(true);
    try {
      const res = await fetch("/api/spray-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field_id: fieldId,
          product,
          rate: parseFloat(rate),
          unit,
          applied_at: new Date(appliedAt).toISOString(),
          withhold_days: parseInt(withholdDays || "0"),
          notes: notes || undefined,
        }),
      });
      if (res.ok) {
        setOpen(false);
        reset();
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Failed to log spray record");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Log Spray
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[#1F2937]">Log Spray Application</h2>
              <button onClick={() => { setOpen(false); reset(); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Field *</label>
                {fields.length === 0 ? (
                  <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    No fields found. Add fields first under Crops → Fields.
                  </p>
                ) : (
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                    value={fieldId}
                    onChange={(e) => setFieldId(e.target.value)}
                    required
                  >
                    <option value="">Select field…</option>
                    {fields.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.area_ha.toFixed(1)} ha)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Product */}
              <Input
                label="Product Name *"
                placeholder="e.g. Glyphosate 450, Roundup"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                required
              />

              {/* Rate & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Application Rate *"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1.8"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Unit *</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                  >
                    <option value="L/ha">L/ha</option>
                    <option value="mL/ha">mL/ha</option>
                    <option value="kg/ha">kg/ha</option>
                    <option value="g/ha">g/ha</option>
                  </select>
                </div>
              </div>

              {/* Applied Date */}
              <Input
                label="Applied Date *"
                type="date"
                value={appliedAt}
                onChange={(e) => setAppliedAt(e.target.value)}
                required
              />

              {/* Withholding Days */}
              <Input
                label="Withholding Period (days)"
                type="number"
                min="0"
                placeholder="e.g. 7 (0 if none)"
                value={withholdDays}
                onChange={(e) => setWithholdDays(e.target.value)}
              />

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Notes (optional)</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30 resize-none h-20"
                  placeholder="e.g. Wind 5km/h, temperature 22°C"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => { setOpen(false); reset(); }}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" className="flex-1" loading={saving} disabled={fields.length === 0}>
                  {saving ? "Saving…" : "Log Spray"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
