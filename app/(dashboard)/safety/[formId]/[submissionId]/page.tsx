import { auth } from "@/auth";
import { getOrgByEmail } from "@/lib/queries";
import { getSubmission, getSignaturesForSubmission } from "@/lib/whs-queries";
import { getSchema } from "@/lib/whs-schemas";
import { isValidRole, type UserRole } from "@/lib/permissions";
import { TopBar } from "@/components/dashboard/TopBar";
import { redirect, notFound } from "next/navigation";
import { FormRenderer } from "@/components/whs/FormRenderer";
import { SubmissionBadge } from "@/components/whs/SubmissionBadge";
import { PrintButton } from "@/components/whs/PrintButton";

interface PageProps {
  params: Promise<{ formId: string; submissionId: string }>;
}

export default async function SubmissionViewPage({ params }: PageProps) {
  const { formId, submissionId } = await params;

  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  if (!ctx?.org_id) redirect("/sign-in");

  const rawRole = ctx.user_role;
  const userRole: UserRole = isValidRole(rawRole) ? rawRole : "FARMHAND";

  const schema = getSchema(formId);
  if (!schema) notFound();

  const [submission, signatures] = await Promise.all([
    getSubmission(submissionId, ctx.org_id),
    getSignaturesForSubmission(submissionId),
  ]);

  if (!submission) notFound();

  const isOwn = submission.submitted_by === ctx.user_id;
  const isElevated = userRole === "OWNER" || userRole === "MANAGER";
  if (!isOwn && !isElevated) redirect("/safety");

  const orgName = ctx.org_name ?? ctx.farm_name ?? "";
  const printDate = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const placeholders = {
    company_name: orgName,
    employee_name: submission.submitter_name ?? "",
  };

  return (
    <div className="flex flex-col h-full overflow-hidden print:block print:h-auto print:overflow-visible">

      {/* ── Print-only document header (replaces TopBar in PDF) ─────────── */}
      <div className="hidden print:block mb-8">
        <div className="flex items-start justify-between pb-5 mb-2" style={{ borderBottom: "2px solid #1A7A3A" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#6B7280" }}>
              Work Health &amp; Safety — Official Submission Record
            </p>
            <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>{schema.title}</h1>
            <p className="text-sm mt-1" style={{ color: "#4B5563" }}>
              Form {schema.id}
              {orgName && <> &nbsp;·&nbsp; {orgName}</>}
            </p>
          </div>
          <div className="text-right text-xs" style={{ color: "#6B7280" }}>
            <p className="font-semibold text-sm" style={{ color: "#1F2937" }}>{printDate}</p>
            <p className="mt-1">AIAG Farming Platform</p>
          </div>
        </div>
      </div>

      {/* ── App TopBar — hidden when printing ───────────────────────────── */}
      <div className="print:hidden">
        <TopBar
          title={schema.title}
          subtitle={`${schema.id} · Submission record`}
          actions={<PrintButton />}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 print:overflow-visible print:p-0">
        <div className="max-w-2xl mx-auto space-y-4 print:max-w-none print:space-y-6">

          {/* Submission meta */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 print-card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[#1F2937]">Submission Details</h2>
              <SubmissionBadge status={submission.status} />
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-gray-400 text-xs">Submitted by</dt>
                <dd className="font-medium text-[#1F2937]">{submission.submitter_name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-400 text-xs">Role at time</dt>
                <dd className="font-medium text-[#1F2937]">{submission.submitter_role}</dd>
              </div>
              <div>
                <dt className="text-gray-400 text-xs">Created</dt>
                <dd className="text-gray-600">{new Date(submission.created_at).toLocaleDateString("en-AU")}</dd>
              </div>
              <div>
                <dt className="text-gray-400 text-xs">Last updated</dt>
                <dd className="text-gray-600">{new Date(submission.updated_at).toLocaleDateString("en-AU")}</dd>
              </div>
            </dl>
          </div>

          {/* Form answers (read-only) */}
          <FormRenderer
            schema={schema}
            placeholders={placeholders}
            userRole={userRole}
            initialAnswers={(submission.answers as Record<string, unknown>) ?? {}}
            readOnly
          />

          {/* Signature records */}
          {signatures.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 print-card">
              <h2 className="font-semibold text-[#1F2937] mb-4">Signatures</h2>
              <div className="space-y-3">
                {signatures.map((sig) => (
                  <div key={sig.id} className="border border-[#E5E7EB] rounded-lg p-4 print-card">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-[#1F2937] font-serif italic text-lg">{sig.typed_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Signed as <span className="font-medium">{sig.role_at_signing}</span>
                          {" · "}
                          {new Date(sig.signed_at).toLocaleString("en-AU")}
                        </p>
                        {sig.ip_address && (
                          <p className="text-xs text-gray-300 mt-0.5">IP: {sig.ip_address}</p>
                        )}
                      </div>
                      <svg className="w-5 h-5 text-[#1A7A3A] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* Print-only signature attestation footer */}
              <div className="hidden print:block mt-6 pt-4 border-t border-[#E5E7EB]">
                <p className="text-xs text-gray-500">
                  This document contains legally binding electronic signatures recorded by the AIAG Farming
                  platform. Signatures are immutable and timestamped at the point of signing.
                  Unauthorised alteration of this document is prohibited.
                </p>
              </div>
            </div>
          )}

          {/* Print-only page footer */}
          <div className="hidden print:block mt-8 pt-4 text-xs text-gray-400 flex items-center justify-between"
               style={{ borderTop: "1px solid #E5E7EB" }}>
            <span>Form {schema.id} — {schema.title}</span>
            <span>Generated by AIAG Farming · {printDate}</span>
          </div>

        </div>
      </div>
    </div>
  );
}
