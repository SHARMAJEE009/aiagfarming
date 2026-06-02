"use client";

import type { FieldDef } from "@/lib/whs-schemas";

interface Props {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  readOnly?: boolean;
  resolveText: (t: string) => string;
}

const labelCls = "block text-sm font-medium text-[#374151] mb-1.5";
const inputCls =
  "w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/40 focus:border-[#1A7A3A] disabled:bg-[#F3F4F6] disabled:text-gray-500";

export function FieldRenderer({ field, value, onChange, readOnly, resolveText }: Props) {
  const disabled = readOnly;

  switch (field.type) {
    case "text":
      return (
        <div>
          <label className={labelCls}>
            {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <input
            type="text"
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
          />
        </div>
      );

    case "textarea":
      return (
        <div>
          <label className={labelCls}>
            {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <textarea
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className={`${inputCls} resize-y`}
          />
        </div>
      );

    case "date":
      return (
        <div>
          <label className={labelCls}>
            {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <input
            type="date"
            value={(value as string) ?? ""}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
          />
        </div>
      );

    case "number":
      return (
        <div>
          <label className={labelCls}>
            {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <input
            type="number"
            value={(value as string) ?? ""}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
          />
        </div>
      );

    case "select":
      return (
        <div>
          <label className={labelCls}>
            {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <select
            value={(value as string) ?? ""}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
          >
            <option value="">Select…</option>
            {field.options?.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      );

    case "yes_no":
      return (
        <div>
          <label className={labelCls}>
            {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <div className="flex gap-3">
            {["Yes", "No"].map((opt) => (
              <label key={opt} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                value === opt
                  ? "border-[#1A7A3A] bg-[#F0FDF4] text-[#1A7A3A] font-medium"
                  : "border-[#E5E7EB] text-gray-600 hover:border-[#1A7A3A]/40"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}>
                <input
                  type="radio"
                  className="sr-only"
                  disabled={disabled}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      );

    case "tri_state":
      return (
        <div>
          <label className={labelCls}>
            {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {["Yes", "No", "Don't know", "N/A"].map((opt) => (
              <label key={opt} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition-colors ${
                value === opt
                  ? "border-[#1A7A3A] bg-[#F0FDF4] text-[#1A7A3A] font-medium"
                  : "border-[#E5E7EB] text-gray-600 hover:border-[#1A7A3A]/40"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}>
                <input
                  type="radio"
                  className="sr-only"
                  disabled={disabled}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      );

    case "checklist": {
      const vals = (value as Record<string, string>) ?? {};
      const responseType = field.responseType ?? "yes_no";
      const options =
        responseType === "tri_state"
          ? ["Yes", "No", "Don't know", "N/A"]
          : responseType === "initials"
          ? ["Initials"]
          : ["Yes", "No"];

      return (
        <div>
          <label className={labelCls}>
            {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
            {field.items?.map((item, i) => {
              const itemKey = `item_${i}`;
              return (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 text-sm ${i > 0 ? "border-t border-[#F3F4F6]" : ""}`}>
                  <span className="flex-1 text-gray-700">{resolveText(item)}</span>
                  <div className="flex gap-1.5 shrink-0">
                    {options.map((opt) => (
                      <label key={opt} className={`flex items-center gap-1.5 px-2.5 py-1 rounded border cursor-pointer text-xs transition-colors ${
                        vals[itemKey] === opt
                          ? "border-[#1A7A3A] bg-[#F0FDF4] text-[#1A7A3A] font-semibold"
                          : "border-[#E5E7EB] text-gray-500 hover:border-[#1A7A3A]/40"
                      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}>
                        <input
                          type="radio"
                          className="sr-only"
                          disabled={disabled}
                          checked={vals[itemKey] === opt}
                          onChange={() => onChange({ ...vals, [itemKey]: opt })}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case "acknowledgement_group": {
      const vals = (value as Record<string, boolean>) ?? {};
      return (
        <div>
          <label className={labelCls}>
            {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <div className="border border-[#E5E7EB] rounded-lg overflow-hidden bg-[#F9FAFB]">
            {field.items?.map((item, i) => {
              const itemKey = `item_${i}`;
              return (
                <label key={i} className={`flex items-start gap-3 px-4 py-3 cursor-pointer ${i > 0 ? "border-t border-[#E5E7EB]" : ""} ${disabled ? "cursor-not-allowed" : "hover:bg-white"} transition-colors`}>
                  <input
                    type="checkbox"
                    checked={!!vals[itemKey]}
                    disabled={disabled}
                    onChange={(e) => onChange({ ...vals, [itemKey]: e.target.checked })}
                    className="mt-0.5 w-4 h-4 accent-[#1A7A3A] shrink-0"
                  />
                  <span className="text-sm text-gray-700">{resolveText(item)}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    case "table": {
      const rows = (value as Record<string, unknown>[]) ?? [{}];

      function setRow(rowIdx: number, colKey: string, colVal: unknown) {
        const next = rows.map((r, i) => (i === rowIdx ? { ...r, [colKey]: colVal } : r));
        onChange(next);
      }

      function addRow() {
        onChange([...rows, {}]);
      }

      function removeRow(idx: number) {
        onChange(rows.filter((_, i) => i !== idx));
      }

      return (
        <div>
          <label className={labelCls}>
            {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <div className="border border-[#E5E7EB] rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB]">
                  {field.columns?.map((col) => (
                    <th key={col.key} className="text-left px-3 py-2 text-xs font-semibold text-gray-500 border-b border-[#E5E7EB]">
                      {col.label}
                    </th>
                  ))}
                  {!disabled && <th className="w-8 border-b border-[#E5E7EB]" />}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className={ri > 0 ? "border-t border-[#F3F4F6]" : ""}>
                    {field.columns?.map((col) => (
                      <td key={col.key} className="px-2 py-1.5">
                        {col.type === "select" ? (
                          <select
                            value={(row[col.key] as string) ?? ""}
                            disabled={disabled}
                            onChange={(e) => setRow(ri, col.key, e.target.value)}
                            className="w-full border border-[#D1D5DB] rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#1A7A3A]/40 disabled:bg-[#F3F4F6]"
                          >
                            <option value="">—</option>
                            {col.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : col.type === "date" ? (
                          <input
                            type="date"
                            value={(row[col.key] as string) ?? ""}
                            disabled={disabled}
                            onChange={(e) => setRow(ri, col.key, e.target.value)}
                            className="w-full border border-[#D1D5DB] rounded px-2 py-1 text-xs focus:outline-none disabled:bg-[#F3F4F6]"
                          />
                        ) : col.type === "number" ? (
                          <input
                            type="number"
                            value={(row[col.key] as string) ?? ""}
                            disabled={disabled}
                            onChange={(e) => setRow(ri, col.key, e.target.value)}
                            className="w-full border border-[#D1D5DB] rounded px-2 py-1 text-xs focus:outline-none disabled:bg-[#F3F4F6]"
                          />
                        ) : col.type === "yes_no" ? (
                          <select
                            value={(row[col.key] as string) ?? ""}
                            disabled={disabled}
                            onChange={(e) => setRow(ri, col.key, e.target.value)}
                            className="w-full border border-[#D1D5DB] rounded px-2 py-1 text-xs focus:outline-none disabled:bg-[#F3F4F6]"
                          >
                            <option value="">—</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={(row[col.key] as string) ?? ""}
                            disabled={disabled}
                            onChange={(e) => setRow(ri, col.key, e.target.value)}
                            className="w-full border border-[#D1D5DB] rounded px-2 py-1 text-xs focus:outline-none disabled:bg-[#F3F4F6]"
                          />
                        )}
                      </td>
                    ))}
                    {!disabled && (
                      <td className="px-1 py-1.5 text-center">
                        {rows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRow(ri)}
                            className="text-red-400 hover:text-red-600 text-xs"
                            title="Remove row"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {!disabled && (
              <div className="px-3 py-2 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={addRow}
                  className="text-xs text-[#1A7A3A] font-medium hover:underline"
                >
                  + Add row
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    case "signature":
      // Signature is handled at the submission level via SigningModal, not inline.
      // In read-only view we show the typed name from the signature record.
      return readOnly ? (
        <div>
          <label className={labelCls}>{field.label}</label>
          <p className="text-sm text-gray-500 italic">See signature record below.</p>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#D1FAE5] text-sm text-[#1A7A3A]">
          Signature will be captured after you submit this form.
        </div>
      );

    default:
      return (
        <div className="text-sm text-gray-400">
          Unknown field type: {(field as FieldDef).type}
        </div>
      );
  }
}
