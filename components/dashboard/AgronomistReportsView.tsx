"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, Button, Badge } from "@/components/ui";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface NutrientInfo { value: string | null; status: string; unit?: string | null }
interface Recommendation { category: string; recommendation: string; priority: string; timing?: string }
interface FertilizerSuggestion { product: string; rate: string; purpose: string }

interface SoilAnalysis {
  soilSummary?: string;
  sampleDetails?: { location?: string; depth?: string; date?: string };
  nutrientLevels?: Record<string, NutrientInfo>;
  deficiencies?: string[];
  recommendations?: Recommendation[];
  fertilizerSuggestions?: FertilizerSuggestion[];
  cropSuitability?: string[];
  improvementActions?: string[];
  alerts?: string[];
  overallRating?: string;
  error?: string;
}

interface Report {
  id: string;
  report_name: string;
  field_id: string | null;
  field_name: string | null;
  uploaded_at: string;
  ai_analysis: unknown;
  status: string;
}

interface FieldOption { id: string; name: string }

interface Props {
  reports: Report[];
  fieldOptions: FieldOption[];
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const ratingColors: Record<string, string> = {
  excellent: "bg-emerald-100 text-emerald-800",
  good: "bg-green-100 text-green-800",
  fair: "bg-amber-100 text-amber-800",
  poor: "bg-red-100 text-red-800",
};

const statusVariant: Record<string, "green" | "amber" | "gray"> = {
  done: "green",
  processing: "amber",
  error: "gray",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-50 border-red-200 text-red-800",
  medium: "bg-amber-50 border-amber-200 text-amber-800",
  low: "bg-blue-50 border-blue-200 text-blue-800",
};

const nutrientStatusColors: Record<string, string> = {
  low: "text-red-600 bg-red-50",
  adequate: "text-green-700 bg-green-50",
  high: "text-orange-600 bg-orange-50",
  acidic: "text-red-600 bg-red-50",
  neutral: "text-green-700 bg-green-50",
  alkaline: "text-orange-600 bg-orange-50",
  unknown: "text-gray-500 bg-gray-50",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── Upload Modal ────────────────────────────────────────────────────────── */
function UploadModal({ fieldOptions, onClose, onUploaded }: {
  fieldOptions: FieldOption[];
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [reportName, setReportName] = useState("");
  const [fieldId, setFieldId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (!reportName) setReportName(f.name.replace(/\.pdf$/i, ""));
    }
  };

  const handleUpload = async () => {
    if (!file) { setError("Please select a PDF file."); return; }
    if (!reportName.trim()) { setError("Please enter a report name."); return; }
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("reportName", reportName.trim());
      if (fieldId) fd.append("fieldId", fieldId);

      const res = await fetch("/api/soil-reports", { method: "POST", body: fd });
      if (res.ok) {
        onUploaded();
        onClose();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || d.message || "Upload failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-[#0D3320]">Upload Soil Report</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* PDF drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-[#D1D5DB] rounded-xl p-8 text-center cursor-pointer hover:border-[#1A7A3A] hover:bg-[#F0FDF4] transition-colors"
          >
            <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
            {file ? (
              <div>
                <svg className="w-10 h-10 mx-auto text-[#1A7A3A] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold text-[#1A7A3A]">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
              </div>
            ) : (
              <div>
                <svg className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-semibold text-gray-700">Click to select PDF</p>
                <p className="text-xs text-gray-400 mt-1">Soil test reports, lab analyses (max 20MB)</p>
              </div>
            )}
          </div>

          {/* Report name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="e.g. North Paddock Soil Test 2025"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30 focus:border-[#1A7A3A]"
            />
          </div>

          {/* Field selector */}
          {fieldOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link to Field (optional)</label>
              <select
                value={fieldId}
                onChange={(e) => setFieldId(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
              >
                <option value="">— Not linked to a field —</option>
                {fieldOptions.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-3 py-2 text-xs text-[#15803D]">
            AI will extract soil nutrients, pH, deficiencies and generate fertilizer and crop recommendations automatically.
          </div>
        </div>

        <div className="px-6 py-4 border-t flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={uploading}>Cancel</Button>
          <Button className="flex-1" onClick={handleUpload} loading={uploading} disabled={!file || uploading}>
            {uploading ? "Analysing with AI…" : "Upload & Analyse"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Report Detail Panel ─────────────────────────────────────────────────── */
function ReportDetail({ report, onClose, onDelete }: {
  report: Report;
  onClose: () => void;
  onDelete: () => void;
}) {
  const a = report.ai_analysis as SoilAnalysis | null;
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this report?")) return;
    setDeleting(true);
    try {
      await fetch("/api/soil-reports", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: report.id }),
      });
      onDelete();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b bg-[#F9FAFB]">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-bold text-[#0D3320] truncate">{report.report_name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant={statusVariant[report.status] ?? "gray"}>
                {report.status === "done" ? "✓ Analysis Complete" : report.status}
              </Badge>
              {report.field_name && (
                <span className="text-xs text-gray-500">Field: {report.field_name}</span>
              )}
              <span className="text-xs text-gray-400">{formatDate(report.uploaded_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handleDelete} disabled={deleting} className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
              {deleting ? "Deleting…" : "Delete"}
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!a ? (
            <p className="text-gray-500 text-sm">No analysis available.</p>
          ) : a.error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{a.error}</div>
          ) : (
            <>
              {/* Alerts */}
              {a.alerts && a.alerts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-red-800 mb-2">⚠ Urgent Alerts</h3>
                  <ul className="space-y-1">
                    {a.alerts.map((alert, i) => (
                      <li key={i} className="text-sm text-red-700">{alert}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary + Rating */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-[#1F2937]">Soil Summary</h3>
                  {a.overallRating && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${ratingColors[a.overallRating] ?? "bg-gray-100 text-gray-700"}`}>
                      {a.overallRating}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{a.soilSummary}</p>
                {a.sampleDetails && (a.sampleDetails.location || a.sampleDetails.depth || a.sampleDetails.date) && (
                  <div className="mt-2 flex flex-wrap gap-3">
                    {a.sampleDetails.location && <span className="text-xs text-gray-500">📍 {a.sampleDetails.location}</span>}
                    {a.sampleDetails.depth && <span className="text-xs text-gray-500">📏 {a.sampleDetails.depth}</span>}
                    {a.sampleDetails.date && <span className="text-xs text-gray-500">📅 {a.sampleDetails.date}</span>}
                  </div>
                )}
              </div>

              {/* Nutrient Levels */}
              {a.nutrientLevels && Object.keys(a.nutrientLevels).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2937] mb-3">Nutrient Levels</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(a.nutrientLevels).map(([key, info]) => (
                      <div key={key} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2.5">
                        <p className="text-xs text-gray-500 capitalize">{key === "pH" ? "pH" : key.replace(/([A-Z])/g, " $1")}</p>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">
                          {info.value || "—"}{info.unit && info.value ? ` ${info.unit}` : ""}
                        </p>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full capitalize ${nutrientStatusColors[info.status] ?? nutrientStatusColors.unknown}`}>
                          {info.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deficiencies */}
              {a.deficiencies && a.deficiencies.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2937] mb-2">Identified Deficiencies</h3>
                  <div className="flex flex-wrap gap-2">
                    {a.deficiencies.map((d, i) => (
                      <span key={i} className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1">{d}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {a.recommendations && a.recommendations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2937] mb-3">Recommendations</h3>
                  <div className="space-y-2">
                    {a.recommendations.map((rec, i) => (
                      <div key={i} className={`border rounded-lg p-3 ${priorityColors[rec.priority] ?? "bg-gray-50 border-gray-200"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{rec.category}</span>
                          <span className="text-xs capitalize font-medium opacity-70">{rec.priority} priority</span>
                        </div>
                        <p className="text-sm">{rec.recommendation}</p>
                        {rec.timing && <p className="text-xs opacity-70 mt-1">⏱ {rec.timing}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fertilizer Suggestions */}
              {a.fertilizerSuggestions && a.fertilizerSuggestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2937] mb-3">Fertilizer Suggestions</h3>
                  <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
                    <table className="w-full text-sm">
                      <thead className="bg-[#F9FAFB]">
                        <tr>
                          <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Product</th>
                          <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Rate</th>
                          <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Purpose</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {a.fertilizerSuggestions.map((f, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 font-medium text-gray-800">{f.product}</td>
                            <td className="px-3 py-2 text-gray-600">{f.rate}</td>
                            <td className="px-3 py-2 text-gray-500">{f.purpose}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Crop Suitability */}
              {a.cropSuitability && a.cropSuitability.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2937] mb-2">Suitable Crops</h3>
                  <div className="flex flex-wrap gap-2">
                    {a.cropSuitability.map((c, i) => (
                      <span key={i} className="text-xs bg-[#E8F5EC] text-[#1A7A3A] border border-[#BBF7D0] rounded-full px-3 py-1 capitalize">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvement Actions */}
              {a.improvementActions && a.improvementActions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2937] mb-2">Improvement Action Plan</h3>
                  <ol className="space-y-1.5">
                    {a.improvementActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-5 h-5 bg-[#1A7A3A] text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                        {action}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main View ──────────────────────────────────────────────────────────── */
export function AgronomistReportsView({ reports: initialReports, fieldOptions }: Props) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const router = useRouter();

  const refreshReports = async () => {
    const res = await fetch("/api/soil-reports");
    if (res.ok) {
      const { reports: fresh } = await res.json();
      setReports(fresh);
    }
    router.refresh();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Agronomist Reports"
        subtitle="Upload soil reports and get AI-powered recommendations"
        actions={
          <Button onClick={() => setShowUpload(true)} className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Soil Report
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        {reports.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-20 h-20 bg-[#E8F5EC] rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-[#1A7A3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#1F2937] mb-2">No Soil Reports Yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Upload a PDF soil test report and our AI will extract nutrient data, identify deficiencies, and generate fertilizer and crop recommendations.
            </p>
            <Button onClick={() => setShowUpload(true)}>Upload First Report</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {reports.map((report) => {
              const a = report.ai_analysis as SoilAnalysis | null;
              return (
                <div
                  key={report.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedReport(report)}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedReport(report)}
                  className="cursor-pointer"
                >
                <Card
                  className="hover:shadow-md transition-shadow h-full"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-[#E8F5EC] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#1A7A3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-2">
                      {a?.overallRating && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${ratingColors[a.overallRating] ?? "bg-gray-100 text-gray-700"}`}>
                          {a.overallRating}
                        </span>
                      )}
                      <Badge variant={statusVariant[report.status] ?? "gray"}>
                        {report.status}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="font-semibold text-[#1F2937] text-sm leading-tight mb-1 line-clamp-2">{report.report_name}</h3>

                  {report.field_name && (
                    <p className="text-xs text-gray-500 mb-2">Field: {report.field_name}</p>
                  )}
                  <p className="text-xs text-gray-400 mb-3">{formatDate(report.uploaded_at)}</p>

                  {a && !a.error && (
                    <>
                      {a.soilSummary && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">{a.soilSummary}</p>
                      )}

                      {/* Deficiency badges */}
                      {a.deficiencies && a.deficiencies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {a.deficiencies.slice(0, 3).map((d, i) => (
                            <span key={i} className="text-xs bg-red-50 text-red-600 border border-red-100 rounded-full px-2 py-0.5">{d}</span>
                          ))}
                          {a.deficiencies.length > 3 && (
                            <span className="text-xs text-gray-400">+{a.deficiencies.length - 3} more</span>
                          )}
                        </div>
                      )}

                      {/* Quick stats */}
                      <div className="flex gap-3 text-xs text-gray-500 border-t border-[#F3F4F6] pt-3">
                        <span>{a.recommendations?.length ?? 0} recommendations</span>
                        <span>{a.cropSuitability?.length ?? 0} suitable crops</span>
                      </div>
                    </>
                  )}

                  {a?.error && (
                    <p className="text-xs text-red-600 mt-2">{a.error}</p>
                  )}
                </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showUpload && (
        <UploadModal
          fieldOptions={fieldOptions}
          onClose={() => setShowUpload(false)}
          onUploaded={refreshReports}
        />
      )}

      {selectedReport && (
        <ReportDetail
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onDelete={refreshReports}
        />
      )}
    </div>
  );
}
