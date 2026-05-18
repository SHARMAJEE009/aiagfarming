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
    if (!pool) return NextResponse.json({ error: "Database connection failed" }, { status: 500 });

    const { orgId } = await request.json();
    if (!orgId) return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      const userRes = await client.query("SELECT id FROM users WHERE email = $1", [session.user.email]);
      if (userRes.rows.length === 0) throw new Error("User not found");
      const userId = userRes.rows[0].id;

      // Verify user belongs to org
      const memRes = await client.query(
        "SELECT id FROM organization_members WHERE user_id = $1 AND organization_id = $2",
        [userId, orgId]
      );
      if (memRes.rows.length === 0) throw new Error("Unauthorized to switch to this organization");

      // Update active org
      await client.query("UPDATE users SET organization_id = $1 WHERE id = $2", [orgId, userId]);

      await client.query("COMMIT");
      return NextResponse.json({ message: "Switched successfully" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Switch farm error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
