"use client";

import { useState } from "react";
import type { ReactNode } from "react";

interface Props {
  chemicalContent: ReactNode;
  whsContent: ReactNode;
  whsPendingCount: number;
}

export function ComplianceTabs({ chemicalContent, whsContent, whsPendingCount }: Props) {
  const [tab, setTab] = useState<"chemical" | "whs">("chemical");

  return (
    <div>
      <div className="flex gap-1 mb-5 bg-[#F3F4F6] rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("chemical")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "chemical" ? "bg-white text-[#1F2937] shadow-sm" : "text-gray-500 hover:text-[#1F2937]"
          }`}
        >
          Chemical Register
        </button>
        <button
          onClick={() => setTab("whs")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
            tab === "whs" ? "bg-white text-[#1F2937] shadow-sm" : "text-gray-500 hover:text-[#1F2937]"
          }`}
        >
          WHS Submissions
          {whsPendingCount > 0 && (
            <span className="bg-amber-400 text-white text-xs rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center">
              {whsPendingCount}
            </span>
          )}
        </button>
      </div>

      {tab === "chemical" ? chemicalContent : whsContent}
    </div>
  );
}
