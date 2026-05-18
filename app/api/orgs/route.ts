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
    const { farmName, location, operation, farmSize, animalCount, plan } = body;

    if (!farmName || !location) {
      return NextResponse.json({ error: "Farm name and location are required" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Get user id
      const userRes = await client.query("SELECT id FROM users WHERE email = $1", [session.user.email]);
      if (userRes.rows.length === 0) throw new Error("User not found");
      const userId = userRes.rows[0].id;

      // 2. Create organisation record
      const slug = farmName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
      const existingSlug = await client.query("SELECT id FROM organizations WHERE slug = $1", [slug]);
      const finalSlug = existingSlug.rows.length > 0 ? `${slug}-${Math.random().toString(36).slice(2, 7)}` : slug;

      const orgResult = await client.query<{ id: string }>(
        `INSERT INTO organizations (name, slug, plan) VALUES ($1, $2, $3) RETURNING id`,
        [farmName, finalSlug, plan ?? "professional"]
      );
      const orgId = orgResult.rows[0].id;

      // 3. Add to organization_members table
      await client.query(
        `INSERT INTO organization_members (user_id, organization_id, role) VALUES ($1, $2, 'OWNER')`,
        [userId, orgId]
      );

      // 4. Set as active organization
      await client.query(
        `UPDATE users
         SET organization_id = $1,
             farm_name       = COALESCE($2, farm_name),
             location        = COALESCE($3, location),
             operation_type  = COALESCE($4, operation_type),
             farm_size       = COALESCE($5, farm_size),
             animal_count    = COALESCE($6, animal_count)
         WHERE id = $7`,
        [
          orgId,
          farmName,
          location,
          operation ?? null,
          farmSize ? parseInt(farmSize) : null,
          animalCount ? parseInt(animalCount) : null,
          userId
        ]
      );

      await client.query("COMMIT");
      return NextResponse.json({ message: "Farm added successfully", orgId });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Add farm error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
