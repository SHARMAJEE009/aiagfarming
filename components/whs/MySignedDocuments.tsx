"use client";

import Link from "next/link";
import type { WHSSubmission } from "@/lib/whs-queries";
import type { FormSchema } from "@/lib/whs-schemas";

interface Props {
  signedDocs: WHSSubmission[];
  schemas: FormSchema[];
}

const stagePill: Record<string, string> = {
  onboarding:  "bg-purple-50 text-purple-700 border-purple-200",
  operational: "bg-blue-50 text-blue-700 border-blue-200",
};

export function MySignedDocuments({ signedDocs, schemas }: Props) {
  const schemaMap = new Map(schemas.map((s) => [s.id, s]));

  if (signedDocs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E7EB] py-20 text-center">
        <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm text-gray-400">No signed documents yet.</p>
        <p className="text-xs text-gray-300 mt-1">Signed forms will appear here as a permanent record.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#1F2937]">
          Signed Documents ({signedDocs.length})
        </h2>
        <button
          onClick={() => window.print()}
          className="text-xs text-gray-500 hover:text-[#1A7A3A] flex items-center gap-1 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print all
        </button>
      </div>

      <div className="divide-y divide-[#F3F4F6]">
        {signedDocs.map((doc) => {
          const schema = schemaMap.get(doc.form_id);
          const signedDate = new Date(doc.updated_at).toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={doc.id}
              className="flex items-center justify-between px-6 py-4 hover:bg-[#FAFAFA] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-bold text-[#1A7A3A] bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 rounded shrink-0">
                  {doc.form_id}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1F2937] truncate">
                    {schema?.title ?? doc.form_id}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {schema && (
                      <span className={`text-xs border px-1.5 py-0.5 rounded capitalize ${stagePill[schema.stage] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {schema.stage}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">Signed {signedDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-4">
                <span className="text-xs bg-[#F0FDF4] text-[#1A7A3A] border border-[#BBF7D0] px-2 py-0.5 rounded-full font-medium">
                  Signed
                </span>
                <Link
                  href={`/safety/${doc.form_id}/${doc.id}`}
                  className="text-xs text-[#1A7A3A] hover:underline font-medium"
                >
                  View
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
