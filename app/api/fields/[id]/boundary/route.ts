import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrgByEmail } from "@/lib/queries";
import { dbQuery } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ctx = await getOrgByEmail(session.user.email);
    if (!ctx?.org_id)
      return NextResponse.json({ error: "No organization" }, { status: 403 });

    const { id: fieldId } = await params;
    const { boundary } = await req.json();

    if (!Array.isArray(boundary) || boundary.length < 3)
      return NextResponse.json(
        { error: "boundary must be an array of at least 3 {lat,lng} points" },
        { status: 400 }
      );

    // Verify this field belongs to the user's org (tenant isolation)
    const rows = await dbQuery<{ id: string }>(
      `SELECT id FROM fields WHERE id = $1 AND organization_id = $2`,
      [fieldId, ctx.org_id]
    );
    if (!rows.length)
      return NextResponse.json({ error: "Field not found" }, { status: 404 });

    await dbQuery(
      `UPDATE fields SET boundary_geojson = $1 WHERE id = $2`,
      [JSON.stringify(boundary), fieldId]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/fields/[id]/boundary]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
