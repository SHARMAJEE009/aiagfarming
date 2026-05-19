import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrgByEmail, deleteField } from "@/lib/queries";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ctx = await getOrgByEmail(session.user.email);
    if (!ctx?.org_id) {
      return NextResponse.json({ error: "No organization" }, { status: 403 });
    }

    const { id } = await params;
    
    // Attempt to delete (queries function enforces org_id filter for security)
    await deleteField(ctx.org_id, id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/fields/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
