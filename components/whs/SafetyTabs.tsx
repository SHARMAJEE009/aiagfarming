"use client";

import { useState } from "react";
import type { ReactNode } from "react";

type TabKey = "forms" | "signed" | "compliance";

interface Props {
  myFormsContent: ReactNode;
  mySignedDocsContent: ReactNode;
  complianceContent: ReactNode | null;
  defaultTab?: TabKey;
  pendingFormsCount: number;
}

export function SafetyTabs({
  myFormsContent,
  mySignedDocsContent,
  complianceContent,
  defaultTab = "forms",
  pendingFormsCount,
}: Props) {
  const [tab, setTab] = useState<TabKey>(defaultTab);

  const tabBtn = (key: TabKey, label: string, badge?: number) => (
    <button
      onClick={() => setTab(key)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
        tab === key
          ? "bg-white text-[#1F2937] shadow-sm"
          : "text-gray-500 hover:text-[#1F2937]"
      }`}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="bg-amber-400 text-white text-xs rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div>
      <div className="flex gap-1 mb-5 bg-[#F3F4F6] rounded-xl p-1 w-fit">
        {tabBtn("forms", "My Forms", pendingFormsCount)}
        {tabBtn("signed", "My Signed Documents")}
        {complianceContent !== null && tabBtn("compliance", "Compliance")}
      </div>

      {tab === "forms"
        ? myFormsContent
        : tab === "signed"
        ? mySignedDocsContent
        : complianceContent}
    </div>
  );
}
