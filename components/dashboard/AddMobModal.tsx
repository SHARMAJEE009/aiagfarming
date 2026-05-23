"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

type Paddock = { id: string; name: string; area_ha: number | null };
type Tab = "mob" | "paddock";

const SPECIES = ["cattle", "sheep", "pig", "goat", "poultry"] as const;

export function AddMobModal() {
  const [open, setOpen]       = useState(false);
  const [tab, setTab]         = useState<Tab>("mob");
  const [saving, setSaving]   = useState(false);
  const [paddocks, setPaddocks] = useState<Paddock[]>([]);

  // Mob fields
  const [mobName, setMobName]       = useState("");
  const [species, setSpecies]       = useState<string>("");
  const [headcount, setHeadcount]   = useState("");
  const [paddockId, setPaddockId]   = useState("");

  // Paddock fields
  const [paddockName, setPaddockName] = useState("");
  const [areaHa, setAreaHa]           = useState("");

  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    fetch("/api/paddocks")
      .then((r) => r.json())
      .then((d) => setPaddocks(d.paddocks ?? []))
      .catch(() => setPaddocks([]));
  }, [open]);

  const reset = () => {
    setMobName(""); setSpecies(""); setHeadcount(""); setPaddockId("");
    setPaddockName(""); setAreaHa("");
    setTab("mob");
  };

  const handleMobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobName || !species || !headcount) return;
    setSaving(true);
    try {
      const res = await fetch("/api/mobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: mobName,
          species,
          headcount: parseInt(headcount),
          paddock_id: paddockId || undefined,
        }),
      });
      if (res.ok) {
        setOpen(false); reset(); router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Failed to add mob");
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePaddockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paddockName) return;
    setSaving(true);
    try {
      const res = await fetch("/api/paddocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: paddockName, area_ha: areaHa || undefined }),
      });
      if (res.ok) {
        const d = await res.json();
        // Refresh paddocks list then switch to mob tab
        setPaddocks((prev) => [...prev, { id: d.id, name: paddockName, area_ha: areaHa ? parseFloat(areaHa) : null }]);
        setPaddockName(""); setAreaHa("");
        setTab("mob");
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Failed to add paddock");
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
        Add Mob
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1F2937]">Add Mob or Paddock</h2>
              <button onClick={() => { setOpen(false); reset(); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 bg-[#F3F4F6] rounded-xl p-1 mb-5">
              {(["mob", "paddock"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    tab === t ? "bg-white shadow-sm text-[#1A7A3A]" : "text-gray-500"
                  }`}
                >
                  {t === "mob" ? "New Mob" : "New Paddock"}
                </button>
              ))}
            </div>

            {/* Mob Form */}
            {tab === "mob" && (
              <form onSubmit={handleMobSubmit} className="space-y-4">
                <Input
                  label="Mob Name *"
                  placeholder="e.g. Spring Ewes"
                  value={mobName}
                  onChange={(e) => setMobName(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Species *</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    required
                  >
                    <option value="">Select species…</option>
                    {SPECIES.map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Headcount *"
                  type="number"
                  min="1"
                  placeholder="e.g. 250"
                  value={headcount}
                  onChange={(e) => setHeadcount(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Assign to Paddock (optional)</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                    value={paddockId}
                    onChange={(e) => setPaddockId(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {paddocks.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}{p.area_ha ? ` (${p.area_ha.toFixed(1)} ha)` : ""}
                      </option>
                    ))}
                  </select>
                  {paddocks.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      No paddocks yet.{" "}
                      <button type="button" className="text-[#1A7A3A] underline" onClick={() => setTab("paddock")}>
                        Create one first
                      </button>
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => { setOpen(false); reset(); }}>
                    Cancel
                  </Button>
                  <Button type="submit" size="lg" className="flex-1" loading={saving}>
                    {saving ? "Saving…" : "Add Mob"}
                  </Button>
                </div>
              </form>
            )}

            {/* Paddock Form */}
            {tab === "paddock" && (
              <form onSubmit={handlePaddockSubmit} className="space-y-4">
                <Input
                  label="Paddock Name *"
                  placeholder="e.g. North Block"
                  value={paddockName}
                  onChange={(e) => setPaddockName(e.target.value)}
                  required
                />
                <Input
                  label="Area (ha, optional)"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 45.5"
                  value={areaHa}
                  onChange={(e) => setAreaHa(e.target.value)}
                />
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => { setOpen(false); reset(); }}>
                    Cancel
                  </Button>
                  <Button type="submit" size="lg" className="flex-1" loading={saving}>
                    {saving ? "Saving…" : "Add Paddock"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
