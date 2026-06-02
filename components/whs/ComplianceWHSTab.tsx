"use client";

import { useState } from "react";
import Link from "next/link";
import type { ComplianceSubmissionRow } from "@/lib/whs-queries";
import { SubmissionBadge } from "./SubmissionBadge";
import { getAllSchemas } from "@/lib/whs-schemas";

interface Props {
  submissions: ComplianceSubmissionRow[];
}

const allSchemas = getAllSchemas();
const formTitles = Object.fromEntries(allSchemas.map((s) => [s.id, s.title]));

const ROLES = ["All", "OWNER", "MANAGER", "AGRONOMIST", "FARMHAND"];
const STATUSES = ["All", "signed", "submitted", "draft"];

export function ComplianceWHSTab({ submissions }: Props) {
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterForm, setFilterForm] = useState("All");

  const formIds = ["All", ...Array.from(new Set(submissions.map((s) => s.form_id))).sort()];

  const filtered = submissions.filter((s) => {
    if (filterRole !== "All" && s.submitter_role !== filterRole) return false;
    if (filterStatus !== "All" && s.status !== filterStatus) return false;
    if (filterForm !== "All" && s.form_id !== filterForm) return false;
    return true;
  });

  const pending = filtered.filter((s) => s.status !== "signed").length;

  const sel = "border border-[#D1D5DB] rounded-lg px-3 py-1.5 text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/40 bg-white";

  return (
    <div className="space-y-4">
      {pending > 0 && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800 font-medium">
          {pending} submission{pending !== 1 ? "s" : ""} pending signature
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className={sel}>
          {ROLES.map((r) => <option key={r} value={r}>{r === "All" ? "All Roles" : r}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={sel}>
          {STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
        </select>
        <select value={filterForm} onChange={(e) => setFilterForm(e.target.value)} className={sel}>
          {formIds.map((f) => <option key={f} value={f}>{f === "All" ? "All Forms" : f}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400 text-sm">
          No WHS submissions match the selected filters.
        </div>
      ) : (
        <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {["Form", "Submitted By", "Role", "Status", "Date", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr key={sub.id} className={`border-t border-[#F3F4F6] hover:bg-[#F9FAFB] ${sub.status !== "signed" ? "bg-amber-50/30" : ""}`}>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[#1A7A3A] text-xs">{sub.form_id}</span>
                    <p className="text-gray-600 text-xs mt-0.5 max-w-[180px] truncate">
                      {formTitles[sub.form_id] ?? "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1F2937]">{sub.submitter_name ?? "—"}</p>
                    <p className="text-xs text-gray-400">{sub.submitter_email ?? ""}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{sub.submitter_role}</td>
                  <td className="px-4 py-3"><SubmissionBadge status={sub.status} /></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(sub.updated_at).toLocaleDateString("en-AU")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/safety/${sub.form_id}/${sub.id}`}
                      className="text-xs text-[#1A7A3A] hover:underline font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
