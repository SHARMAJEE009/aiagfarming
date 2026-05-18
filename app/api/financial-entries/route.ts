import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrgByEmail, getFinancialEntries, createFinancialEntry } from "@/lib/queries";

async function getOrgId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const ctx = await getOrgByEmail(session.user.email);
  return ctx?.org_id ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const entries = await getFinancialEntries(orgId, limit);
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("[GET /api/financial-entries]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { category, type, amount, entry_date, description } = body;
    if (!category || !type || !amount || !entry_date)
      return NextResponse.json({ error: "category, type, amount, entry_date required" }, { status: 400 });
    if (!["income", "expense"].includes(type))
      return NextResponse.json({ error: "type must be income or expense" }, { status: 400 });
    const result = await createFinancialEntry(orgId, {
      category, type, amount: parseFloat(amount), entry_date, description,
    });
    return NextResponse.json({ id: result?.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/financial-entries]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
