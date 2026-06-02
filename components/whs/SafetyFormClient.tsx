"use client";

import { useState } from "react";
import type { FormSchema } from "@/lib/whs-schemas";
import type { UserRole } from "@/lib/permissions";
import type { WHSSubmission } from "@/lib/whs-queries";
import { FormRenderer } from "./FormRenderer";
import { SigningModal } from "./SigningModal";
import { SubmissionBadge } from "./SubmissionBadge";

interface Props {
  schema: FormSchema;
  placeholders: Record<string, string>;
  userRole: UserRole;
  userName: string;
  initialSubmission: WHSSubmission | null;
}

export function SafetyFormClient({
  schema,
  placeholders,
  userRole,
  userName,
  initialSubmission,
}: Props) {
  const alreadySigned = initialSubmission?.status === "signed";
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [signingOpen, setSigningOpen] = useState(false);
  const [signed, setSigned] = useState(alreadySigned);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(answers: Record<string, unknown>) {
    try {
      const res = await fetch("/api/whs/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: schema.id, answers, status: "submitted" }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Save failed");
      }
      const data = await res.json() as { id: string };
      setSubmissionId(data.id);
      setSigningOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    }
  }

  function handleSigned() {
    setSigningOpen(false);
    setSigned(true);
  }

  if (signed) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center">
        <div className="w-14 h-14 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-[#1A7A3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-bold text-[#1F2937] text-lg mb-1">{schema.title}</h2>
        <SubmissionBadge status="signed" className="mx-auto mb-3" />
        <p className="text-sm text-gray-500">This form has been signed and recorded.</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}
      <FormRenderer
        schema={schema}
        placeholders={placeholders}
        userRole={userRole}
        initialAnswers={(initialSubmission?.answers as Record<string, unknown>) ?? {}}
        onSubmit={handleSubmit}
      />
      {signingOpen && submissionId && (
        <SigningModal
          submissionId={submissionId}
          formId={schema.id}
          formVersion={schema.version}
          userName={userName}
          onSigned={handleSigned}
          onCancel={() => setSigningOpen(false)}
        />
      )}
    </>
  );
}
