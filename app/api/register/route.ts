import { NextRequest, NextResponse } from "next/server";
import { getPgPool } from "@/lib/db";

// Simple password hashing for demo purposes
// In production, use proper password hashing
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: NextRequest) {
  try {
    const pool = getPgPool();
    if (!pool) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      farmName,
      location,
      operation,
      farmSize,
      animalCount,
      referral,
      plan
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const client = await pool.connect();
    try {
      const existingUser = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        return NextResponse.json({ error: "User already exists" }, { status: 400 });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const result = await client.query(
        `INSERT INTO users (email, password, name, farm_name, location, operation_type, farm_size, animal_count, referral_source, plan, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         RETURNING id`,
        [
          email,
          hashedPassword,
          `${firstName} ${lastName}`,
          farmName || null,
          location || null,
          operation || null,
          farmSize ? parseInt(farmSize) : null,
          animalCount ? parseInt(animalCount) : null,
          referral || null,
          plan || 'professional'
        ]
      );

      return NextResponse.json({
        message: "User created successfully",
        userId: result.rows[0].id
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}