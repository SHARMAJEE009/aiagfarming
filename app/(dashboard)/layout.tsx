import { Sidebar } from "@/components/dashboard/Sidebar";
import { auth } from "@/auth";
import { getOrgByEmail } from "@/lib/queries";
import { getWHSGateStatus, ensureWHSGateRow } from "@/lib/whs-queries";
import { redirect } from "next/navigation";
import { isValidRole, type UserRole, WHS_GATE_ROLES } from "@/lib/permissions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/sign-in");

  const ctx = await getOrgByEmail(session.user.email);

  // If user has no farm_name yet, send to onboarding
  if (!ctx?.farm_name && !ctx?.org_id) {
    redirect("/onboarding");
  }

  const orgName   = ctx?.org_name  ?? ctx?.farm_name ?? "My Farm";
  const userName  = ctx?.user_name ?? session.user.name ?? "User";
  const userEmail = ctx?.user_email ?? session.user.email ?? "";
  const userImage = ctx?.user_image ?? session.user.image ?? null;
  const plan      = ctx?.plan ?? "starter";
  const rawRole   = ctx?.user_role ?? "FARMHAND";
  const userRole: UserRole = isValidRole(rawRole) ? rawRole : "FARMHAND";

  // WHS gate: block dashboard for applicable roles until they complete onboarding signing.
  // /whs-gate is under (auth) layout — no loop risk.
  if (ctx?.org_id && ctx?.user_id && WHS_GATE_ROLES.includes(userRole)) {
    await ensureWHSGateRow(ctx.user_id, ctx.org_id);
    const gate = await getWHSGateStatus(ctx.user_id);
    if (!gate?.completed_at) redirect("/whs-gate");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB] print:block print:h-auto print:overflow-visible print:bg-white">
      <div className="print:hidden">
        <Sidebar
          orgId={ctx?.org_id ?? ""}
          orgName={orgName}
          userName={userName}
          userEmail={userEmail}
          userImage={userImage}
          plan={plan}
          userRole={userRole}
        />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden print:block print:overflow-visible">
        {children}
      </div>
    </div>
  );
}
