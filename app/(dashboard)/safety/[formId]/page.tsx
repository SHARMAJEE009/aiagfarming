import { auth } from "@/auth";
import { getOrgByEmail } from "@/lib/queries";
import { getEmploymentContract, getLatestSubmissionForForm } from "@/lib/whs-queries";
import { getSchema, canFill } from "@/lib/whs-schemas";
import { isValidRole, type UserRole } from "@/lib/permissions";
import { TopBar } from "@/components/dashboard/TopBar";
import { redirect, notFound } from "next/navigation";
import { SafetyFormClient } from "@/components/whs/SafetyFormClient";

interface PageProps {
  params: Promise<{ formId: string }>;
}

export default async function SafetyFormPage({ params }: PageProps) {
  const { formId } = await params;
  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  if (!ctx?.org_id) redirect("/sign-in");

  const rawRole = ctx.user_role;
  const userRole: UserRole = isValidRole(rawRole) ? rawRole : "FARMHAND";

  const schema = getSchema(formId);
  if (!schema) notFound();

  const hasAccess = canFill(schema, userRole) ||
    userRole === "OWNER" || userRole === "MANAGER";
  if (!hasAccess) redirect("/safety");

  const [latestSub, contract] = await Promise.all([
    getLatestSubmissionForForm(ctx.user_id, ctx.org_id, formId),
    getEmploymentContract(ctx.org_id),
  ]);

  const placeholders = {
    company_name: ctx.org_name ?? ctx.farm_name ?? "",
    employee_name: ctx.user_name ?? "",
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title={schema.title}
        subtitle={`${schema.id} · ${schema.stage === "onboarding" ? "Onboarding" : "Operational"}`}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <SafetyFormClient
            schema={schema}
            placeholders={placeholders}
            userRole={userRole}
            userName={ctx.user_name ?? ""}
            initialSubmission={latestSub ?? null}
          />
          {latestSub && (
            <div className="mt-4 text-center">
              <a
                href={`/safety/${formId}/${latestSub.id}`}
                className="text-sm text-[#1A7A3A] hover:underline"
              >
                View submission history
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
