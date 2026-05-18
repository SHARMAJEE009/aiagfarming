"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

const CATEGORIES_INCOME  = ["Livestock Sales", "Grain Sales", "Wool Sales", "Government Payments", "Other Income"];
const CATEGORIES_EXPENSE = ["Fertiliser", "Chemical / Sprays", "Veterinary", "Fuel & Machinery", "Labour", "Feed", "Insurance", "Rates & Land Tax", "Other Expense"];

export function AddEntryModal() {
  const [open,     setOpen]    = useState(false);
  const [saving,   setSaving]  = useState(false);
  const [type,     setType]    = useState<"income" | "expense">("income");
  const [category, setCategory]= useState("");
  const [amount,   setAmount]  = useState("");
  const [date,     setDate]    = useState(new Date().toISOString().slice(0, 10));
  const [desc,     setDesc]    = useState("");
  const router = useRouter();

  const categories = type === "income" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount || !date) return;
    setSaving(true);
    try {
      const res = await fetch("/api/financial-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type, amount, entry_date: date, description: desc || undefined }),
      });
      if (res.ok) {
        setOpen(false);
        setCategory(""); setAmount(""); setDesc("");
        setDate(new Date().toISOString().slice(0, 10));
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Failed to add entry");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Add Entry</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1F2937]">Add Financial Entry</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type toggle */}
              <div className="flex gap-1 bg-[#F3F4F6] rounded-xl p-1">
                {(["income", "expense"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setType(t); setCategory(""); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      type === t ? "bg-white shadow-sm text-[#1A7A3A]" : "text-gray-500"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select category…</option>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <Input
                label="Amount (AUD)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <Input
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <Input
                label="Description (optional)"
                placeholder="Brief note about this entry"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" className="flex-1" loading={saving}>
                  {saving ? "Saving…" : "Add Entry"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
