import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrgByEmail } from "@/lib/queries";
import { getDashboardStats, getRevenueChart, getLivestockBySpecies } from "@/lib/queries";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ctx = await getOrgByEmail(session.user.email);
    if (!ctx?.org_id) return NextResponse.json({ error: "No organisation found" }, { status: 404 });

    const [stats, chart, species] = await Promise.all([
      getDashboardStats(ctx.org_id),
      getRevenueChart(ctx.org_id),
      getLivestockBySpecies(ctx.org_id),
    ]);

    return NextResponse.json({ stats, chart, species });
  } catch (err) {
    console.error("[GET /api/dashboard/stats]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
