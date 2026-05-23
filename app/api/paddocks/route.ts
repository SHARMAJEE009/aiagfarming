import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrgByEmail, getPaddocks } from "@/lib/queries";
import { dbQueryOne } from "@/lib/db";

async function getOrgId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const ctx = await getOrgByEmail(session.user.email);
  return ctx?.org_id ?? null;
}

export async function GET() {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const paddocks = await getPaddocks(orgId);
    return NextResponse.json({ paddocks });
  } catch (err) {
    console.error("[GET /api/paddocks]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, area_ha } = body;
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const result = await dbQueryOne<{ id: string }>(
      `INSERT INTO paddocks (organization_id, name, area_ha)
       VALUES ($1,$2,$3) RETURNING id`,
      [orgId, name, area_ha ? parseFloat(area_ha) : null]
    );

    return NextResponse.json({ id: result?.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/paddocks]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
