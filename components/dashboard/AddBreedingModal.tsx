"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

type Animal = { id: string; nlis_tag: string | null; visual_tag: string | null; species: string; mob_name: string | null };

export function AddBreedingModal() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loadingAnimals, setLoadingAnimals] = useState(false);

  const [damId, setDamId] = useState("");
  const [sireId, setSireId] = useState("");
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().slice(0, 10));
  const [pgTestDate, setPgTestDate] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [offspringCount, setOffspringCount] = useState("");
  const [status, setStatus] = useState<"joined" | "confirmed" | "born">("joined");

  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    setLoadingAnimals(true);
    fetch("/api/animals")
      .then((r) => r.json())
      .then((d) => setAnimals(d.animals ?? []))
      .catch(() => setAnimals([]))
      .finally(() => setLoadingAnimals(false));
  }, [open]);

  const females = animals.filter((a) => {
    // All animals (dam can be female of any species)
    return true;
  });

  const males = animals.filter((a) => a.id !== damId);

  const reset = () => {
    setDamId(""); setSireId(""); setJoiningDate(new Date().toISOString().slice(0, 10));
    setPgTestDate(""); setBirthDate(""); setOffspringCount(""); setStatus("joined");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!damId || !joiningDate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/breeding-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dam_id: damId,
          sire_id: sireId || undefined,
          joining_date: joiningDate,
          pg_test_date: pgTestDate || undefined,
          birth_date: birthDate || undefined,
          offspring_count: offspringCount ? parseInt(offspringCount) : undefined,
          status,
        }),
      });
      if (res.ok) {
        setOpen(false);
        reset();
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Failed to record breeding event");
      }
    } finally {
      setSaving(false);
    }
  };

  const animalLabel = (a: Animal) =>
    [a.nlis_tag ?? a.visual_tag ?? a.id.slice(0, 8), a.species, a.mob_name].filter(Boolean).join(" · ");

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Record Joining</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[#1F2937]">Record Breeding / Joining Event</h2>
              <button onClick={() => { setOpen(false); reset(); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Status</label>
                <div className="flex gap-1 bg-[#F3F4F6] rounded-xl p-1">
                  {(["joined", "confirmed", "born"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        status === s ? "bg-white shadow-sm text-[#1A7A3A]" : "text-gray-500"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dam */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Dam (Female) *</label>
                {loadingAnimals ? (
                  <p className="text-sm text-gray-400">Loading animals…</p>
                ) : (
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                    value={damId}
                    onChange={(e) => setDamId(e.target.value)}
                    required
                  >
                    <option value="">Select dam…</option>
                    {females.map((a) => (
                      <option key={a.id} value={a.id}>{animalLabel(a)}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Sire */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Sire (Male, optional)</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                  value={sireId}
                  onChange={(e) => setSireId(e.target.value)}
                >
                  <option value="">Unknown / AI</option>
                  {males.map((a) => (
                    <option key={a.id} value={a.id}>{animalLabel(a)}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Joining Date *"
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                required
              />

              <Input
                label="Pregnancy Test Date (optional)"
                type="date"
                value={pgTestDate}
                onChange={(e) => setPgTestDate(e.target.value)}
              />

              {(status === "confirmed" || status === "born") && (
                <>
                  <Input
                    label="Birth Date (optional)"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                  <Input
                    label="Offspring Count (optional)"
                    type="number"
                    min="1"
                    placeholder="e.g. 1"
                    value={offspringCount}
                    onChange={(e) => setOffspringCount(e.target.value)}
                  />
                </>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => { setOpen(false); reset(); }}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" className="flex-1" loading={saving}>
                  {saving ? "Saving…" : "Record Event"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
