import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrgByEmail, getHealthEvents, createHealthEvent } from "@/lib/queries";

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
    const events = await getHealthEvents(orgId);
    return NextResponse.json({ events });
  } catch (err) {
    console.error("[GET /api/health-events]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { animal_id, mob_id, event_type, product, dose, dose_unit, treatment_date, withhold_date, notes } = body;
    if (!event_type || !treatment_date || (!animal_id && !mob_id))
      return NextResponse.json({ error: "event_type, treatment_date, and animal_id or mob_id required" }, { status: 400 });
    const result = await createHealthEvent(orgId, {
      animal_id, mob_id, event_type, product,
      dose: dose ? parseFloat(dose) : undefined, dose_unit,
      treatment_date, withhold_date, notes,
    });
    return NextResponse.json({ id: result?.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/health-events]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
