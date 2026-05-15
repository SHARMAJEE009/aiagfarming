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
    const {
      farmName,
      location,
      operation,
      farmSize,
      animalCount,
      referral,
      plan
    } = body;

    // Validate required fields
    if (!farmName || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE users 
         SET farm_name = $1, 
             location = $2, 
             operation_type = $3, 
             farm_size = $4, 
             animal_count = $5, 
             referral_source = $6, 
             plan = $7
         WHERE email = $8`,
        [
          farmName,
          location,
          operation || null,
          farmSize ? parseInt(farmSize) : null,
          animalCount ? parseInt(animalCount) : null,
          referral || null,
          plan || 'professional',
          session.user.email
        ]
      );

      return NextResponse.json({
        message: "Onboarding completed successfully"
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
