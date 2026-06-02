"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FormSchema } from "@/lib/whs-schemas";
import type { UserRole } from "@/lib/permissions";
import { FormRenderer } from "./FormRenderer";
import { SigningModal } from "./SigningModal";

interface Props {
  userId: string;
  orgId: string;
  orgName: string;
  userName: string;
  userRole: UserRole;
  employmentContractHtml: string | null;
  requiredForms: FormSchema[];
}

type StepResult = { submissionId: string } | null;

export function WHSGateClient({
  orgName,
  userName,
  userRole,
  employmentContractHtml,
  requiredForms,
}: Props) {
  const router = useRouter();

  // Steps: 0 = employment contract, 1..N = form schemas
  const totalSteps = 1 + requiredForms.length;
  const [step, setStep] = useState(0);
  const [stepResults, setStepResults] = useState<StepResult[]>(new Array(requiredForms.length).fill(null));
  const [signingSubmissionId, setSigningSubmissionId] = useState<string | null>(null);
  const [signingFormId, setSigningFormId] = useState<string | null>(null);
  const [signingFormVersion, setSigningFormVersion] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractAccepted, setContractAccepted] = useState(false);

  const isContractStep = step === 0;
  const formIndex = step - 1;
  const currentForm = isContractStep ? null : requiredForms[formIndex];
  const progress = Math.round((step / totalSteps) * 100);

  async function handleFormSave(formId: string, answers: Record<string, unknown>): Promise<string> {
    const res = await fetch("/api/whs/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formId, answers, status: "submitted" }),
    });
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      throw new Error(data.error ?? "Save failed");
    }
    const data = await res.json() as { id: string };
    return data.id;
  }

  async function handleFormSubmit(formId: string, answers: Record<string, unknown>) {
    try {
      const submissionId = await handleFormSave(formId, answers);
      const results = [...stepResults];
      results[formIndex] = { submissionId };
      setStepResults(results);
      // Open signing modal
      const schema = requiredForms[formIndex];
      setSigningSubmissionId(submissionId);
      setSigningFormId(formId);
      setSigningFormVersion(schema.version);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save form");
    }
  }

  async function handleSigned() {
    setSigningSubmissionId(null);
    setSigningFormId(null);
    setSigningFormVersion(null);

    const nextStep = step + 1;
    if (nextStep >= totalSteps) {
      await handleComplete();
    } else {
      setStep(nextStep);
    }
  }

  async function handleComplete() {
    setCompleting(true);
    setError(null);
    try {
      const res = await fetch("/api/whs/gate/complete", { method: "POST" });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Could not complete gate");
        setCompleting(false);
        return;
      }
      router.push("/overview");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setCompleting(false);
    }
  }

  const placeholders = { company_name: orgName, employee_name: userName };

  return (
    <div className="min-h-screen bg-[#F0FDF4] flex flex-col">
      {/* Header */}
      <div className="bg-[#0D3320] text-white px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#1A7A3A] rounded-lg flex items-center justify-center text-white text-sm font-bold">AF</div>
        <div>
          <p className="font-bold text-sm">AIAG Farming</p>
          <p className="text-white/60 text-xs">{orgName}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-1 bg-white/20">
        <div
          className="h-full bg-[#1A7A3A] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start py-8 px-4">
        <div className="w-full max-w-2xl">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs text-[#1A7A3A] font-semibold uppercase tracking-wide">
              Step {step + 1} of {totalSteps}
            </span>
            <span className="text-xs text-gray-400">— WHS Onboarding</span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Employment contract step */}
          {isContractStep && (
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E5E7EB]">
                <h1 className="text-lg font-bold text-[#1F2937]">Employment Contract</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Please read your employment contract carefully before proceeding.
                </p>
              </div>
              <div className="px-6 py-5">
                {employmentContractHtml ? (
                  <div
                    className="prose prose-sm max-w-none text-gray-700 border border-[#E5E7EB] rounded-lg p-4 bg-[#F9FAFB] max-h-80 overflow-y-auto mb-4"
                    dangerouslySetInnerHTML={{ __html: employmentContractHtml }}
                  />
                ) : (
                  <div className="border border-dashed border-[#D1FAE5] rounded-lg p-6 bg-[#F0FDF4] text-center mb-4">
                    <p className="text-sm text-gray-500">
                      No employment contract has been configured yet. Contact your manager.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">You can continue — your manager will provide the contract separately.</p>
                  </div>
                )}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contractAccepted}
                    onChange={(e) => setContractAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#1A7A3A]"
                  />
                  <span className="text-sm text-gray-700">
                    I have read and understood my employment contract and agree to its terms.
                  </span>
                </label>
              </div>
              <div className="px-6 py-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex justify-end">
                <button
                  onClick={() => setStep(1)}
                  disabled={!contractAccepted && !!employmentContractHtml}
                  className="px-5 py-2 bg-[#1A7A3A] text-white text-sm font-medium rounded-lg hover:bg-[#155f2e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue to WHS Forms
                </button>
              </div>
            </div>
          )}

          {/* Form steps */}
          {!isContractStep && currentForm && (
            <FormRenderer
              schema={currentForm}
              placeholders={placeholders}
              userRole={userRole}
              onSubmit={(answers) => handleFormSubmit(currentForm.id, answers)}
            />
          )}
        </div>
      </div>

      {/* Signing modal */}
      {signingSubmissionId && signingFormId && signingFormVersion && (
        <SigningModal
          submissionId={signingSubmissionId}
          formId={signingFormId}
          formVersion={signingFormVersion}
          userName={userName}
          onSigned={handleSigned}
          onCancel={() => {
            setSigningSubmissionId(null);
            setSigningFormId(null);
            setSigningFormVersion(null);
          }}
        />
      )}

      {completing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
            <div className="w-12 h-12 border-4 border-[#1A7A3A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-semibold text-[#1F2937]">Completing onboarding…</p>
          </div>
        </div>
      )}
    </div>
  );
}
