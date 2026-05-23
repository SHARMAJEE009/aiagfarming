import { getInviteByToken } from "@/lib/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const invite = await getInviteByToken(token);

  if (!invite) {
    return Response.json({ error: "Invite not found" }, { status: 404 });
  }
  if (invite.status !== "pending") {
    return Response.json({ error: "This invite has already been used or revoked" }, { status: 410 });
  }
  if (new Date(invite.expires_at) < new Date()) {
    return Response.json({ error: "This invite link has expired" }, { status: 410 });
  }

  return Response.json({
    email: invite.email,
    name: invite.name,
    role: invite.role,
    orgName: invite.org_name,
    invitedBy: invite.invited_by_name,
  });
}