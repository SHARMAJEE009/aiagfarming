import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrgByEmail } from "@/lib/queries";
import { dbQuery, dbQueryOne } from "@/lib/db";

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

    const events = await dbQuery<{
      id: string; dam_id: string; sire_id: string | null;
      joining_date: string; pg_test_date: string | null;
      birth_date: string | null; offspring_count: number | null;
      status: string; dam_tag: string | null; dam_mob: string | null;
    }>(
      `SELECT be.id, be.dam_id, be.sire_id, be.joining_date, be.pg_test_date,
              be.birth_date, be.offspring_count, be.status,
              a.nlis_tag AS dam_tag, m.name AS dam_mob
       FROM breeding_events be
       JOIN animals a ON a.id = be.dam_id
       LEFT JOIN mobs m ON m.id = a.mob_id
       WHERE a.organization_id = $1
       ORDER BY be.joining_date DESC`,
      [orgId]
    );

    return NextResponse.json({ events });
  } catch (err) {
    console.error("[GET /api/breeding-events]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { dam_id, sire_id, joining_date, pg_test_date, birth_date, offspring_count, status } = body;

    if (!dam_id || !joining_date) {
      return NextResponse.json({ error: "dam_id and joining_date are required" }, { status: 400 });
    }

    // Verify dam belongs to this org
    const dam = await dbQueryOne<{ id: string }>(
      `SELECT id FROM animals WHERE id = $1 AND organization_id = $2`,
      [dam_id, orgId]
    );
    if (!dam) return NextResponse.json({ error: "Animal not found" }, { status: 404 });

    const result = await dbQueryOne<{ id: string }>(
      `INSERT INTO breeding_events (dam_id, sire_id, joining_date, pg_test_date, birth_date, offspring_count, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [
        dam_id,
        sire_id || null,
        joining_date,
        pg_test_date || null,
        birth_date || null,
        offspring_count ? parseInt(offspring_count) : null,
        status || "joined",
      ]
    );

    return NextResponse.json({ id: result?.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/breeding-events]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
