import { auth } from "@/auth";
import { dbQuery } from "@/lib/db";
import { getOrgByEmail } from "@/lib/queries";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await getOrgByEmail(session.user.email);
  if (!ctx?.org_id || ctx.user_role !== "OWNER") {
    return Response.json({ error: "Only the owner can remove members" }, { status: 403 });
  }

  const { userId } = await params;

  if (userId === ctx.user_id) {
    return Response.json({ error: "Cannot remove yourself" }, { status: 400 });
  }

  await dbQuery(
    `UPDATE users SET organization_id = NULL, role = 'READ_ONLY'
     WHERE id = $1 AND organization_id = $2`,
    [userId, ctx.org_id]
  );

  return Response.json({ ok: true });
}