import { NextRequest, NextResponse } from "next/server";
import { getFinancialEntries, createFinancialEntry } from "@/lib/queries";
import { requireRole } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    // READ_ONLY (Supplier) can view financial entries
    const result = await requireRole(["OWNER", "MANAGER", "READ_ONLY"]);
    if ("error" in result) return result.error;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const entries = await getFinancialEntries(result.ctx.org_id, limit);
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("[GET /api/financial-entries]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only OWNER and MANAGER can create entries
    const result = await requireRole(["OWNER", "MANAGER"]);
    if ("error" in result) return result.error;
    const body = await req.json();
    const { category, type, amount, entry_date, description } = body;
    if (!category || !type || !amount || !entry_date)
      return NextResponse.json({ error: "category, type, amount, entry_date required" }, { status: 400 });
    if (!["income", "expense"].includes(type))
      return NextResponse.json({ error: "type must be income or expense" }, { status: 400 });
    const entry = await createFinancialEntry(result.ctx.org_id, {
      category, type, amount: parseFloat(amount), entry_date, description,
    });
    return NextResponse.json({ id: entry?.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/financial-entries]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
