import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrgByEmail, getMobs, createMob } from "@/lib/queries";

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
    const mobs = await getMobs(orgId);
    return NextResponse.json({ mobs });
  } catch (err) {
    console.error("[GET /api/mobs]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { name, species, headcount, paddock_id } = body;
    if (!name || !species || headcount === undefined)
      return NextResponse.json({ error: "name, species, headcount required" }, { status: 400 });
    const result = await createMob(orgId, { name, species, headcount: parseInt(headcount), paddock_id });
    return NextResponse.json({ id: result?.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/mobs]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
