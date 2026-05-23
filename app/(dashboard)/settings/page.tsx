import { auth } from "@/auth";
import { getOrgByEmail, getOrgById, getTeamMembers, getPendingInvites } from "@/lib/queries";
import { TopBar } from "@/components/dashboard/TopBar";
import { SettingsClient } from "@/components/dashboard/SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  const orgId = ctx?.org_id;

  const [org, team, invites] = orgId
    ? await Promise.all([getOrgById(orgId), getTeamMembers(orgId), getPendingInvites(orgId)])
    : [null, [], []];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Settings" subtitle="Manage your organisation, team and integrations" />
      <SettingsClient
        org={org ? {
          id:   org.id,
          name: org.name,
          slug: org.slug,
          plan: org.plan,
        } : null}
        user={{
          id:            ctx?.user_id    ?? "",
          name:          ctx?.user_name  ?? "",
          email:         ctx?.user_email ?? "",
          role:          ctx?.user_role  ?? "READ_ONLY",
          image:         ctx?.user_image ?? null,
          location:      ctx?.location   ?? "",
          operationType: ctx?.operation_type ?? "",
          farmSize:      ctx?.farm_size  ?? null,
        }}
        team={team}
        invites={invites}
      />
    </div>
  );
}