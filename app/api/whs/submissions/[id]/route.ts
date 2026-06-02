import { NextRequest, NextResponse } from "next/server";
import { requireOrg } from "@/lib/api-auth";
import { getSubmission, getSignaturesForSubmission } from "@/lib/whs-queries";
import { getSchema, canView } from "@/lib/whs-schemas";
import { isValidRole, type UserRole } from "@/lib/permissions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireOrg();
  if ("error" in result) return result.error;
  const { ctx } = result;

  const rawRole = ctx.user_role;
  const userRole: UserRole = isValidRole(rawRole) ? rawRole : "FARMHAND";

  const { id } = await params;
  const submission = await getSubmission(id, ctx.org_id);
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Access: owner sees own; manager/owner see all; others see own only
  const isOwn = submission.submitted_by === ctx.user_id;
  const isElevated = userRole === "OWNER" || userRole === "MANAGER";
  if (!isOwn && !isElevated) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const schema = getSchema(submission.form_id);
  if (schema && !canView(schema, userRole) && !isOwn) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const signatures = await getSignaturesForSubmission(id);
  return NextResponse.json({ submission, signatures });
}
