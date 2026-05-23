import { auth } from "@/auth";
import { dbQuery, dbQueryOne } from "@/lib/db";
import { getOrgByEmail } from "@/lib/queries";
import { sendInviteEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await getOrgByEmail(session.user.email);
  if (!ctx?.org_id || ctx.user_role !== "OWNER") {
    return Response.json({ error: "Only the owner can resend invites" }, { status: 403 });
  }

  const { inviteId } = await req.json() as { inviteId: string };

  const invite = await dbQueryOne<{
    id: string; email: string; name: string | null; role: string;
  }>(
    `SELECT id, email, name, role FROM invitations
     WHERE id = $1 AND organization_id = $2 AND status = 'pending'`,
    [inviteId, ctx.org_id]
  );

  if (!invite) {
    return Response.json({ error: "Invite not found" }, { status: 404 });
  }

  const token = randomBytes(32).toString("hex");

  await dbQuery(
    `UPDATE invitations SET token = $1, expires_at = now() + interval '7 days'
     WHERE id = $2`,
    [token, invite.id]
  );

  try {
    await sendInviteEmail({
      to: invite.email,
      toName: invite.name ?? invite.email,
      orgName: ctx.org_name,
      role: invite.role,
      inviterName: ctx.user_name ?? "The owner",
      token,
    });
  } catch (err) {
    console.error("Failed to resend invite email:", err);
    return Response.json({ error: "Token refreshed but email failed to send" }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await getOrgByEmail(session.user.email);
  if (!ctx?.org_id || ctx.user_role !== "OWNER") {
    return Response.json({ error: "Only the owner can revoke invites" }, { status: 403 });
  }

  const { inviteId } = await req.json() as { inviteId: string };

  await dbQuery(
    `UPDATE invitations SET status = 'revoked'
     WHERE id = $1 AND organization_id = $2 AND status = 'pending'`,
    [inviteId, ctx.org_id]
  );

  return Response.json({ ok: true });
}