import { auth } from "@/auth";
import { getOrgByEmail } from "@/lib/queries";
import { getSubmissions, getMySignedDocuments, getComplianceSubmissions } from "@/lib/whs-queries";
import { getAllSchemas, getFormsUserCanFill } from "@/lib/whs-schemas";
import { isValidRole, type UserRole } from "@/lib/permissions";
import { TopBar } from "@/components/dashboard/TopBar";
import { SubmissionBadge } from "@/components/whs/SubmissionBadge";
import { SafetyTabs } from "@/components/whs/SafetyTabs";
import { MySignedDocuments } from "@/components/whs/MySignedDocuments";
import { ComplianceWHSTab } from "@/components/whs/ComplianceWHSTab";
import Link from "next/link";

export default async function SafetyPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  const orgId = ctx?.org_id;

  const rawRole = ctx?.user_role ?? "FARMHAND";
  const userRole: UserRole = isValidRole(rawRole) ? rawRole : "FARMHAND";

  const isOwnerOrManager = userRole === "OWNER" || userRole === "MANAGER";
  const myForms = getFormsUserCanFill(userRole);
  const allSchemas = getAllSchemas();

  const { tab: tabParam } = await searchParams;

  const [myOperationalSubs, mySignedDocs, complianceSubs] = orgId && ctx?.user_id
    ? await Promise.all([
        getSubmissions({ orgId, userId: ctx.user_id, stage: "operational" }),
        getMySignedDocuments(ctx.user_id, orgId),
        isOwnerOrManager ? getComplianceSubmissions(orgId) : Promise.resolve([]),
      ])
    : [[], [], []];

  // Latest submission per form for the current user
  const latestByForm = new Map<string, { status: string; id: string }>();
  for (const sub of myOperationalSubs) {
    if (!latestByForm.has(sub.form_id)) {
      latestByForm.set(sub.form_id, { status: sub.status, id: sub.id });
    }
  }

  // Pending = fillable forms with no signed submission yet
  const pendingFormsCount = myForms.filter(
    (f) => latestByForm.get(f.id)?.status !== "signed"
  ).length;

  // FARMHAND (staff) has no fillable forms — default to signed tab
  const defaultTab =
    userRole === "FARMHAND" || myForms.length === 0 ? "signed" : "forms";
  const resolvedDefault =
    tabParam === "compliance" && isOwnerOrManager
      ? "compliance"
      : tabParam === "signed"
      ? "signed"
      : defaultTab;

  // ── My Forms content ──────────────────────────────────────────────────────
  const myFormsContent = (
    <div>
      {myForms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] py-20 text-center">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-gray-400">No forms available for your role.</p>
          <p className="text-xs text-gray-300 mt-1">
            Check the My Signed Documents tab to view your completed records.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {myForms.map((schema) => {
            const latest = latestByForm.get(schema.id);
            const isSigned = latest?.status === "signed";
            return (
              <Link
                key={schema.id}
                href={`/safety/${schema.id}`}
                className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-md hover:border-[#1A7A3A]/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-[#1A7A3A] bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 rounded">
                    {schema.id}
                  </span>
                  <SubmissionBadge status={latest?.status ?? null} />
                </div>
                <h3 className="font-semibold text-[#1F2937] text-sm group-hover:text-[#1A7A3A] transition-colors leading-snug">
                  {schema.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{schema.description}</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-[#1A7A3A] font-medium">
                  {isSigned ? "View Record" : latest ? "Continue" : "Start Form"}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── My Signed Documents content ───────────────────────────────────────────
  const mySignedDocsContent = (
    <MySignedDocuments signedDocs={mySignedDocs} schemas={allSchemas} />
  );

  // ── Compliance content (owner/manager only) ───────────────────────────────
  const complianceContent = isOwnerOrManager ? (
    <ComplianceWHSTab submissions={complianceSubs} />
  ) : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Safety & WHS"
        subtitle="Work Health & Safety forms and compliance records"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <SafetyTabs
          myFormsContent={myFormsContent}
          mySignedDocsContent={mySignedDocsContent}
          complianceContent={complianceContent}
          defaultTab={resolvedDefault as "forms" | "signed" | "compliance"}
          pendingFormsCount={pendingFormsCount}
        />
      </div>
    </div>
  );
}
