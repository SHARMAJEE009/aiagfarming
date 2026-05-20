import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrgByEmail, bulkCreateFields } from "@/lib/queries";

async function getOrgId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const ctx = await getOrgByEmail(session.user.email);
  return ctx?.org_id ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const body = await req.json();
    const { fields } = body;
    
    if (!Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json({ error: "fields array is required" }, { status: 400 });
    }
    
    const result = await bulkCreateFields(orgId, fields);
    return NextResponse.json({ insertedCount: result.length }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/fields/bulk]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
