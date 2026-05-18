import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrgByEmail } from "@/lib/queries";
import { getFields, createField } from "@/lib/queries";

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
    const fields = await getFields(orgId);
    return NextResponse.json({ fields });
  } catch (err) {
    console.error("[GET /api/fields]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { name, area_ha, soil_type } = body;
    if (!name || !area_ha) return NextResponse.json({ error: "name and area_ha are required" }, { status: 400 });
    const result = await createField(orgId, { name, area_ha: parseFloat(area_ha), soil_type });
    return NextResponse.json({ id: result?.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/fields]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
