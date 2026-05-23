"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

type Mob = { id: string; name: string; species: string };
type Animal = { id: string; nlis_tag: string | null; visual_tag: string | null; species: string };

const EVENT_TYPES = ["vaccination", "treatment", "vet_visit", "observation"] as const;
const DOSE_UNITS  = ["mL", "g", "mg", "tablet", "IU"] as const;

export function AddHealthEventModal() {
  const [open, setOpen]     = useState(false);
  const [saving, setSaving] = useState(false);

  const [target, setTarget]       = useState<"mob" | "animal">("mob");
  const [mobId, setMobId]         = useState("");
  const [animalId, setAnimalId]   = useState("");
  const [eventType, setEventType] = useState<string>("vaccination");
  const [product, setProduct]     = useState("");
  const [dose, setDose]           = useState("");
  const [doseUnit, setDoseUnit]   = useState("mL");
  const [treatDate, setTreatDate] = useState(new Date().toISOString().slice(0, 10));
  const [withholdDate, setWithholdDate] = useState("");
  const [notes, setNotes]         = useState("");

  const [mobs, setMobs]       = useState<Mob[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);

  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    Promise.all([
      fetch("/api/mobs").then((r) => r.json()).then((d) => setMobs(d.mobs ?? [])),
      fetch("/api/animals").then((r) => r.json()).then((d) => setAnimals(d.animals ?? [])),
    ]).catch(() => {});
  }, [open]);

  const reset = () => {
    setTarget("mob"); setMobId(""); setAnimalId(""); setEventType("vaccination");
    setProduct(""); setDose(""); setDoseUnit("mL");
    setTreatDate(new Date().toISOString().slice(0, 10));
    setWithholdDate(""); setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (target === "mob" && !mobId) return;
    if (target === "animal" && !animalId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/health-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mob_id:         target === "mob"    ? mobId    : undefined,
          animal_id:      target === "animal" ? animalId : undefined,
          event_type:     eventType,
          product:        product  || undefined,
          dose:           dose     ? parseFloat(dose) : undefined,
          dose_unit:      dose     ? doseUnit : undefined,
          treatment_date: treatDate,
          withhold_date:  withholdDate || undefined,
          notes:          notes || undefined,
        }),
      });
      if (res.ok) {
        setOpen(false); reset(); router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Failed to log health event");
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
        Log Event
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1F2937]">Log Health Event</h2>
              <button onClick={() => { setOpen(false); reset(); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Target toggle */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Apply to</label>
                <div className="flex gap-1 bg-[#F3F4F6] rounded-xl p-1">
                  {(["mob", "animal"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTarget(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        target === t ? "bg-white shadow-sm text-[#1A7A3A]" : "text-gray-500"
                      }`}
                    >
                      {t === "mob" ? "Whole Mob" : "Individual Animal"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mob or Animal selector */}
              {target === "mob" ? (
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Mob *</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                    value={mobId}
                    onChange={(e) => setMobId(e.target.value)}
                    required
                  >
                    <option value="">Select mob…</option>
                    {mobs.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.species})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Animal *</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                    value={animalId}
                    onChange={(e) => setAnimalId(e.target.value)}
                    required
                  >
                    <option value="">Select animal…</option>
                    {animals.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nlis_tag ?? a.visual_tag ?? a.id.slice(0, 8)} ({a.species})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Event type */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Event Type *</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  required
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace("_", " ")}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Product / Drug Name"
                placeholder="e.g. Ivermectin, Cydectin"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Dose (optional)"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 5"
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Unit</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                    value={doseUnit}
                    onChange={(e) => setDoseUnit(e.target.value)}
                  >
                    {DOSE_UNITS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <Input
                label="Treatment Date *"
                type="date"
                value={treatDate}
                onChange={(e) => setTreatDate(e.target.value)}
                required
              />
              <Input
                label="Withholding Date (optional)"
                type="date"
                value={withholdDate}
                onChange={(e) => setWithholdDate(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Notes (optional)</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30 resize-none"
                  rows={2}
                  placeholder="Any additional notes…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => { setOpen(false); reset(); }}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" className="flex-1" loading={saving}>
                  {saving ? "Saving…" : "Log Event"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
