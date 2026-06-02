"use client";

import { useState } from "react";
import type { FormSchema, FieldDef } from "@/lib/whs-schemas";
import { resolvePlaceholders, requiredFieldKeys } from "@/lib/whs-schemas";
import type { UserRole } from "@/lib/permissions";
import { FieldRenderer } from "./FieldRenderer";

interface Props {
  schema: FormSchema;
  placeholders?: Record<string, string>;
  userRole: UserRole;
  initialAnswers?: Record<string, unknown>;
  readOnly?: boolean;
  onSubmit?: (answers: Record<string, unknown>) => void | Promise<void>;
  onSaveDraft?: (answers: Record<string, unknown>) => void | Promise<void>;
}

export function FormRenderer({
  schema,
  placeholders = {},
  readOnly = false,
  initialAnswers = {},
  onSubmit,
  onSaveDraft,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, unknown>>(initialAnswers);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const required = new Set(requiredFieldKeys(schema));

  function setField(key: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function resolveText(text: string): string {
    return resolvePlaceholders(text, placeholders);
  }

  function validate(): string | null {
    for (const section of schema.sections) {
      for (const field of section.fields) {
        if (!required.has(field.key)) continue;
        // Signature is captured post-submission via SigningModal, never set inline
        if (field.type === "signature") continue;
        const val = answers[field.key];
        if (val === undefined || val === null || val === "") return `"${field.label}" is required.`;
        if (field.type === "acknowledgement_group") {
          const items = val as Record<string, boolean>;
          const allTicked = field.items?.every((_, i) => items[`item_${i}`]);
          if (!allTicked) return `All items in "${field.label}" must be acknowledged.`;
        }
      }
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit?.(answers);
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden print:overflow-visible print-card">
      {/* Form header */}
      <div className="px-6 py-5 border-b border-[#E5E7EB]">
        <h1 className="text-lg font-bold text-[#1F2937]">{schema.title}</h1>
        {schema.description && (
          <p className="text-sm text-gray-500 mt-0.5">{resolveText(schema.description)}</p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="px-6 py-5 space-y-8">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {schema.sections.map((section, si) => (
            <div key={si}>
              <h2 className="text-sm font-semibold text-[#1A7A3A] uppercase tracking-wide mb-4">
                {section.title}
              </h2>
              <div className="space-y-5">
                {section.fields.map((field: FieldDef) => (
                  <div key={field.key}>
                    <FieldRenderer
                      field={field}
                      value={answers[field.key]}
                      onChange={(v) => setField(field.key, v)}
                      readOnly={readOnly}
                      resolveText={resolveText}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {!readOnly && (
          <div className="px-6 py-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between gap-3">
            {onSaveDraft && (
              <button
                type="button"
                onClick={() => void onSaveDraft(answers)}
                className="px-4 py-2 text-sm text-gray-600 border border-[#E5E7EB] rounded-lg hover:bg-white transition-colors"
              >
                Save Draft
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="ml-auto px-5 py-2 bg-[#1A7A3A] text-white text-sm font-medium rounded-lg hover:bg-[#155f2e] transition-colors disabled:opacity-40"
            >
              {submitting ? "Saving…" : "Submit & Sign"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
