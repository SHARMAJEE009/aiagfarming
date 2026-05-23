import { dbQuery, dbQueryOne } from "@/lib/db";
import { getInviteByToken } from "@/lib/queries";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return (await hashPassword(password)) === hash;
}

export async function POST(
  req: Request,
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

  const { name, password } = await req.json() as { name?: string; password?: string };

  // Check if user already exists
  const existingUser = await dbQueryOne<{
    id: string; password: string | null; organization_id: string | null;
  }>(
    `SELECT id, password, organization_id FROM users WHERE email = $1`,
    [invite.email]
  );

  if (existingUser) {
    // Existing user: validate their password
    if (!password) {
      return Response.json({ error: "Password required" }, { status: 400 });
    }
    if (!existingUser.password) {
      // OAuth-only account (no password) — join org without password check
    } else {
      const valid = await verifyPassword(password, existingUser.password);
      if (!valid) {
        return Response.json({ error: "Incorrect password" }, { status: 401 });
      }
    }

    // Join the organization
    await dbQuery(
      `UPDATE users SET organization_id = $1, role = $2 WHERE id = $3`,
      [invite.organization_id, invite.role, existingUser.id]
    );
  } else {
    // New user: create account
    if (!name || !password) {
      return Response.json({ error: "Name and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    await dbQuery(
      `INSERT INTO users (name, email, password, role, organization_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, invite.email, hashed, invite.role, invite.organization_id]
    );
  }

  // Mark invite as accepted
  await dbQuery(
    `UPDATE invitations SET status = 'accepted' WHERE id = $1`,
    [invite.id]
  );

  return Response.json({ ok: true, email: invite.email });
}