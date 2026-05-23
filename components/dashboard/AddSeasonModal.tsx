"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

type Field = { id: string; name: string; area_ha: number };

const CROP_TYPES = [
  "Wheat", "Barley", "Canola", "Oats", "Sorghum", "Maize",
  "Chickpeas", "Lentils", "Faba Beans", "Lupins", "Pasture", "Other",
];
const STATUSES = ["planning", "active", "harvested"] as const;

export function AddSeasonModal() {
  const [open, setOpen]     = useState(false);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);

  const [fieldId, setFieldId]     = useState("");
  const [cropType, setCropType]   = useState("");
  const [customCrop, setCustomCrop] = useState("");
  const [plantedAt, setPlantedAt] = useState(new Date().toISOString().slice(0, 10));
  const [harvestedAt, setHarvestedAt] = useState("");
  const [yieldKg, setYieldKg]     = useState("");
  const [status, setStatus]       = useState<"planning" | "active" | "harvested">("planning");

  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    fetch("/api/fields")
      .then((r) => r.json())
      .then((d) => setFields(d.fields ?? []))
      .catch(() => setFields([]));
  }, [open]);

  const reset = () => {
    setFieldId(""); setCropType(""); setCustomCrop("");
    setPlantedAt(new Date().toISOString().slice(0, 10));
    setHarvestedAt(""); setYieldKg(""); setStatus("planning");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCrop = cropType === "Other" ? customCrop : cropType;
    if (!fieldId || !finalCrop || !plantedAt) return;
    setSaving(true);
    try {
      const res = await fetch("/api/seasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field_id: fieldId,
          crop_type: finalCrop,
          planted_at: plantedAt,
          harvested_at: harvestedAt || undefined,
          yield_kg: yieldKg ? parseFloat(yieldKg) : undefined,
          status,
        }),
      });
      if (res.ok) {
        setOpen(false); reset(); router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Failed to create season");
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
        New Season
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[#1F2937]">New Season</h2>
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

              {/* Crop type */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Crop Type *</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  required
                >
                  <option value="">Select crop…</option>
                  {CROP_TYPES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              {cropType === "Other" && (
                <Input
                  label="Specify crop *"
                  placeholder="e.g. Triticale"
                  value={customCrop}
                  onChange={(e) => setCustomCrop(e.target.value)}
                  required
                />
              )}

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Status</label>
                <div className="flex gap-1 bg-[#F3F4F6] rounded-xl p-1">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                        status === s ? "bg-white shadow-sm text-[#1A7A3A]" : "text-gray-500"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Planted Date *"
                type="date"
                value={plantedAt}
                onChange={(e) => setPlantedAt(e.target.value)}
                required
              />

              {status === "harvested" && (
                <>
                  <Input
                    label="Harvested Date"
                    type="date"
                    value={harvestedAt}
                    onChange={(e) => setHarvestedAt(e.target.value)}
                  />
                  <Input
                    label="Yield (kg)"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="e.g. 12500"
                    value={yieldKg}
                    onChange={(e) => setYieldKg(e.target.value)}
                  />
                </>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => { setOpen(false); reset(); }}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" className="flex-1" loading={saving} disabled={fields.length === 0}>
                  {saving ? "Saving…" : "Create Season"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
