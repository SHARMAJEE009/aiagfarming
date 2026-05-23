"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

type Mob = { id: string; name: string; species: string };

const SPECIES = ["cattle", "sheep", "pig", "goat", "poultry"] as const;

export function AddAnimalModal() {
  const [open, setOpen]       = useState(false);
  const [saving, setSaving]   = useState(false);
  const [mobs, setMobs]       = useState<Mob[]>([]);

  // Form Fields
  const [nlisTag, setNlisTag]     = useState("");
  const [rfidTag, setRfidTag]     = useState("");
  const [visualTag, setVisualTag] = useState("");
  const [species, setSpecies]     = useState<string>("");
  const [breed, setBreed]         = useState("");
  const [sex, setSex]             = useState<"male" | "female">("female");
  const [dob, setDob]             = useState("");
  const [mobId, setMobId]         = useState("");

  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    fetch("/api/mobs")
      .then((r) => r.json())
      .then((d) => setMobs(d.mobs ?? []))
      .catch(() => setMobs([]));
  }, [open]);

  const reset = () => {
    setNlisTag("");
    setRfidTag("");
    setVisualTag("");
    setSpecies("");
    setBreed("");
    setSex("female");
    setDob("");
    setMobId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!species || !sex) return;
    setSaving(true);
    try {
      const res = await fetch("/api/animals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nlis_tag: nlisTag || undefined,
          rfid_tag: rfidTag || undefined,
          visual_tag: visualTag || undefined,
          species,
          breed: breed || undefined,
          sex,
          dob: dob || undefined,
          mob_id: mobId || undefined,
        }),
      });
      if (res.ok) {
        setOpen(false);
        reset();
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Failed to add animal");
      }
    } finally {
      setSaving(false);
    }
  };

  // Filter mobs matching the selected species
  const filteredMobs = mobs.filter((m) => !species || m.species === species);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Animal
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[#1F2937]">Add New Animal</h2>
              <button onClick={() => { setOpen(false); reset(); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Species */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Species *</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30 capitalize"
                  value={species}
                  onChange={(e) => {
                    setSpecies(e.target.value);
                    setMobId(""); // Reset mob if species changes
                  }}
                  required
                >
                  <option value="">Select species…</option>
                  {SPECIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Breed */}
              <Input
                label="Breed"
                placeholder="e.g. Angus, Merino, Friesian"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />

              {/* Sex */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Sex *</label>
                <div className="flex gap-1 bg-[#F3F4F6] rounded-xl p-1">
                  {(["female", "male"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSex(s)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                        sex === s ? "bg-white shadow-sm text-[#1A7A3A]" : "text-gray-500"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Visual Tag"
                  placeholder="e.g. Orange 42"
                  value={visualTag}
                  onChange={(e) => setVisualTag(e.target.value)}
                />
                <Input
                  label="RFID Tag"
                  placeholder="e.g. 982 0001..."
                  value={rfidTag}
                  onChange={(e) => setRfidTag(e.target.value)}
                />
              </div>

              <Input
                label="NLIS Tag"
                placeholder="e.g. ABC12345X01"
                value={nlisTag}
                onChange={(e) => setNlisTag(e.target.value)}
              />

              {/* Date of Birth */}
              <Input
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />

              {/* Mob assignment */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Assign to Mob (optional)</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                  value={mobId}
                  onChange={(e) => setMobId(e.target.value)}
                  disabled={!species}
                >
                  <option value="">Unassigned</option>
                  {filteredMobs.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                {!species && (
                  <p className="text-xs text-gray-400 mt-1">Please select a species first to see available mobs.</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => { setOpen(false); reset(); }}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" className="flex-1" loading={saving}>
                  {saving ? "Saving…" : "Add Animal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
