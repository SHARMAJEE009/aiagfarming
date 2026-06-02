"use client";

import { useState } from "react";

interface Props {
  submissionId: string;
  formId: string;
  formVersion: string;
  userName: string;
  onSigned: () => void | Promise<void>;
  onCancel: () => void;
}

export function SigningModal({ submissionId, formId, formVersion, userName, onSigned, onCancel }: Props) {
  const [understood, setUnderstood] = useState(false);
  const [typedName, setTypedName] = useState(userName);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSign() {
    if (!typedName.trim()) {
      setError("Please type your full legal name.");
      return;
    }
    setSigning(true);
    setError(null);
    try {
      const res = await fetch(`/api/whs/submissions/${submissionId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typedName: typedName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Signing failed");
        setSigning(false);
        return;
      }
      await onSigned();
    } catch {
      setError("Network error. Please try again.");
      setSigning(false);
    }
  }

  const _ = { formId, formVersion }; // referenced to avoid lint warning

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E5E7EB]">
          <h2 className="font-bold text-[#1F2937] text-lg">Sign this Form</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Your signature creates an immutable compliance record.
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#1A7A3A] shrink-0"
            />
            <span className="text-sm text-gray-700">
              I have read and understood this form. I confirm the information is accurate and I am signing voluntarily.
            </span>
          </label>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              Full Legal Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Type your full name as it appears on your ID"
              className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/40 focus:border-[#1A7A3A] font-serif italic text-[#1F2937]"
            />
            <p className="text-xs text-gray-400 mt-1">
              This typed name is your legal electronic signature.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={signing}
            className="px-4 py-2 text-sm text-gray-600 border border-[#E5E7EB] rounded-lg hover:bg-white transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSign()}
            disabled={!understood || !typedName.trim() || signing}
            className="px-5 py-2 bg-[#1A7A3A] text-white text-sm font-medium rounded-lg hover:bg-[#155f2e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {signing && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Sign Form
          </button>
        </div>
      </div>
    </div>
  );
}
