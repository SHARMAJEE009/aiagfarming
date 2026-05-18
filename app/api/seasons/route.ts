import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrgByEmail, getSeasons, createSeason } from "@/lib/queries";

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
    const seasons = await getSeasons(orgId);
    return NextResponse.json({ seasons });
  } catch (err) {
    console.error("[GET /api/seasons]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { field_id, crop_type, planted_at, status } = body;
    if (!field_id || !crop_type || !planted_at)
      return NextResponse.json({ error: "field_id, crop_type, planted_at required" }, { status: 400 });
    const result = await createSeason(orgId, { field_id, crop_type, planted_at, status });
    return NextResponse.json({ id: result?.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/seasons]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
