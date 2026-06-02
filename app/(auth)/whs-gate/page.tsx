import { auth } from "@/auth";
import { getOrgByEmail } from "@/lib/queries";
import { getEmploymentContract, getWHSGateStatus } from "@/lib/whs-queries";
import { onboardingFormsForRole } from "@/lib/whs-schemas";
import { isValidRole, type UserRole, WHS_GATE_ROLES } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { WHSGateClient } from "@/components/whs/WHSGateClient";

export default async function WHSGatePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/sign-in");

  const ctx = await getOrgByEmail(session.user.email);
  if (!ctx?.org_id) redirect("/sign-in");

  const rawRole = ctx.user_role;
  const userRole: UserRole = isValidRole(rawRole) ? rawRole : "FARMHAND";

  // Roles that don't need the gate go straight to the dashboard
  if (!WHS_GATE_ROLES.includes(userRole)) redirect("/overview");

  const gate = await getWHSGateStatus(ctx.user_id);
  if (gate?.completed_at) redirect("/overview");

  const [employmentContract, requiredForms] = await Promise.all([
    getEmploymentContract(ctx.org_id),
    Promise.resolve(onboardingFormsForRole(userRole)),
  ]);

  return (
    <WHSGateClient
      userId={ctx.user_id}
      orgId={ctx.org_id}
      orgName={ctx.org_name ?? ctx.farm_name ?? "Your Organisation"}
      userName={ctx.user_name ?? ""}
      userRole={userRole}
      employmentContractHtml={employmentContract}
      requiredForms={requiredForms}
    />
  );
}
