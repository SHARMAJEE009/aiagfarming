import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrgByEmail, getSprayRecords, createSprayRecord } from "@/lib/queries";

async function getCtx() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return getOrgByEmail(session.user.email);
}

export async function GET() {
  try {
    const ctx = await getCtx();
    if (!ctx?.org_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const records = await getSprayRecords(ctx.org_id);
    return NextResponse.json({ records });
  } catch (err) {
    console.error("[GET /api/spray-records]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getCtx();
    if (!ctx?.org_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { field_id, product, rate, unit, applied_at, withhold_days, notes } = body;
    if (!field_id || !product || !rate || !unit || !applied_at)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    const result = await createSprayRecord(ctx.org_id, ctx.user_id, {
      field_id, product, rate: parseFloat(rate), unit,
      applied_at, withhold_days: parseInt(withhold_days ?? "0"), notes,
    });
    return NextResponse.json({ id: result?.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/spray-records]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
