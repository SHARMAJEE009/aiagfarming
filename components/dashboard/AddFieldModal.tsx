"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

export function AddFieldModal() {
  const [open, setOpen]       = useState(false);
  const [saving, setSaving]   = useState(false);
  const [name, setName]       = useState("");
  const [area, setArea]       = useState("");
  const [soil, setSoil]       = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !area) return;
    setSaving(true);
    try {
      const res = await fetch("/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, area_ha: area, soil_type: soil || undefined }),
      });
      if (res.ok) {
        setOpen(false);
        setName(""); setArea(""); setSoil("");
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Failed to add field");
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
        Add Field
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1F2937]">Add New Field</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Field Name"
                placeholder="e.g. North Paddock A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Area (hectares)"
                type="number"
                step="0.1"
                placeholder="e.g. 48.5"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
              />
              <Input
                label="Soil Type (optional)"
                placeholder="e.g. Clay Loam"
                value={soil}
                onChange={(e) => setSoil(e.target.value)}
              />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" className="flex-1" loading={saving}>
                  {saving ? "Saving…" : "Add Field"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
