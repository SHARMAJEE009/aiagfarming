"use client";

export function PrintButton({ label = "Print / Download" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
    >
      {label}
    </button>
  );
}
