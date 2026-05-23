import { auth } from "@/auth";
import { dbQuery, dbQueryOne } from "@/lib/db";
import { getOrgByEmail } from "@/lib/queries";
import { sendInviteEmail } from "@/lib/email";
import { randomBytes } from "crypto";

const VALID_ROLES = ["MANAGER", "AGRONOMIST", "FARMHAND", "READ_ONLY"];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await getOrgByEmail(session.user.email);
  if (!ctx?.org_id || ctx.user_role !== "OWNER") {
    return Response.json({ error: "Only the owner can invite members" }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, role } = body as { name?: string; email?: string; role?: string };

  if (!email || !role) {
    return Response.json({ error: "Email and role are required" }, { status: 400 });
  }
  if (!VALID_ROLES.includes(role)) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }

  // Already an active member?
  const existing = await dbQueryOne(
    `SELECT id FROM users WHERE email = $1 AND organization_id = $2`,
    [email, ctx.org_id]
  );
  if (existing) {
    return Response.json({ error: "This email is already a team member" }, { status: 400 });
  }

  // Already has a pending invite?
  const pending = await dbQueryOne(
    `SELECT id FROM invitations
     WHERE email = $1 AND organization_id = $2 AND status = 'pending' AND expires_at > now()`,
    [email, ctx.org_id]
  );
  if (pending) {
    return Response.json({ error: "An invite has already been sent to this email" }, { status: 400 });
  }

  const token = randomBytes(32).toString("hex");

  await dbQuery(
    `INSERT INTO invitations (organization_id, email, name, role, token, invited_by)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [ctx.org_id, email, name ?? null, role, token, ctx.user_id]
  );

  try {
    await sendInviteEmail({
      to: email,
      toName: name ?? email,
      orgName: ctx.org_name,
      role,
      inviterName: ctx.user_name ?? "The owner",
      token,
    });
  } catch (err) {
    console.error("Failed to send invite email:", err);
    // Don't fail the request — invite is created, user can resend
  }

  return Response.json({ ok: true });
}