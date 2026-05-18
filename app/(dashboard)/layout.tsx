import { Sidebar } from "@/components/dashboard/Sidebar";
import { auth } from "@/auth";
import { getOrgByEmail, getUserOrganizations } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/sign-in");

  const ctx = await getOrgByEmail(session.user.email);

  // If user has no farm_name yet, send to onboarding
  if (!ctx?.farm_name && !ctx?.org_id) {
    redirect("/onboarding");
  }

  const organizations = ctx?.user_id ? await getUserOrganizations(ctx.user_id) : [];

  const orgName  = ctx?.org_name  ?? ctx?.farm_name ?? "My Farm";
  const userName = ctx?.user_name ?? session.user.name ?? "User";
  const userEmail = ctx?.user_email ?? session.user.email ?? "";
  const userImage = ctx?.user_image ?? session.user.image ?? null;
  const plan     = ctx?.plan ?? "starter";

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB]">
      <Sidebar
        orgId={ctx?.org_id ?? ""}
        orgName={orgName}
        organizations={organizations}
        userName={userName}
        userEmail={userEmail}
        userImage={userImage}
        plan={plan}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
