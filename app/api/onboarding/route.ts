import { NextRequest, NextResponse } from "next/server";
import { getPgPool } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pool = getPgPool();
    if (!pool) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const body = await request.json();
    const { farmName, location, operation, farmSize, animalCount, referral, plan } = body;

    if (!farmName || !location) {
      return NextResponse.json({ error: "Farm name and location are required" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Create organisation record
      const slug = farmName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 60);

      // ensure slug uniqueness by appending random suffix if needed
      const existingSlug = await client.query(
        "SELECT id FROM organizations WHERE slug = $1",
        [slug]
      );
      const finalSlug = existingSlug.rows.length > 0
        ? `${slug}-${Math.random().toString(36).slice(2, 7)}`
        : slug;

      const orgResult = await client.query<{ id: string }>(
        `INSERT INTO organizations (name, slug, plan)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [farmName, finalSlug, plan ?? "professional"]
      );
      const orgId = orgResult.rows[0].id;

      // 2. Update user with org link and farm details
      const userResult = await client.query(
        `UPDATE users
         SET farm_name       = $1,
             location        = $2,
             operation_type  = $3,
             farm_size       = $4,
             animal_count    = $5,
             referral_source = $6,
             plan            = $7,
             organization_id = $8,
             role            = 'OWNER'
         WHERE email = $9 RETURNING id`,
        [
          farmName,
          location,
          operation  ?? null,
          farmSize   ? parseInt(farmSize)   : null,
          animalCount ? parseInt(animalCount) : null,
          referral   ?? null,
          plan       ?? "professional",
          orgId,
          session.user.email,
        ]
      );

      const userId = userResult.rows[0].id;

      // 3. Add to organization_members table
      await client.query(
        `INSERT INTO organization_members (user_id, organization_id, role)
         VALUES ($1, $2, 'OWNER')`,
        [userId, orgId]
      );

      await client.query("COMMIT");
      return NextResponse.json({ message: "Onboarding completed", orgId });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
