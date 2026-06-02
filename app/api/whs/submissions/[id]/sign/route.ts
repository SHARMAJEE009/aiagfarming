import { NextRequest, NextResponse } from "next/server";
import { requireOrg } from "@/lib/api-auth";
import { getSubmissionForSign, signSubmission } from "@/lib/whs-queries";
import { getSchema, canSign } from "@/lib/whs-schemas";
import { isValidRole, type UserRole } from "@/lib/permissions";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireOrg();
    if ("error" in result) return result.error;
    const { ctx } = result;

    const rawRole = ctx.user_role;
    const userRole: UserRole = isValidRole(rawRole) ? rawRole : "FARMHAND";

    const { id } = await params;

    const submission = await getSubmissionForSign(id, ctx.org_id);
    if (!submission) {
      console.error(`[sign] submission not found: id=${id} org=${ctx.org_id}`);
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (submission.status === "signed") {
      return NextResponse.json({ error: "Already signed" }, { status: 409 });
    }

    const schema = getSchema(submission.form_id);
    if (schema && !canSign(schema, userRole)) {
      return NextResponse.json({ error: "You do not have permission to sign this form" }, { status: 403 });
    }

    const body = await req.json() as {
      typedName: string;
      drawnSignatureData?: string;
    };

    if (!body.typedName?.trim()) {
      return NextResponse.json({ error: "typedName is required" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? req.headers.get("x-real-ip")
      ?? null;
    const ua = req.headers.get("user-agent") ?? null;

    const sigId = await signSubmission({
      submissionId:       id,
      orgId:              ctx.org_id,
      formId:             submission.form_id,
      formVersion:        submission.form_version,
      userId:             ctx.user_id,
      roleAtSigning:      userRole,
      typedName:          body.typedName.trim(),
      drawnSignatureData: body.drawnSignatureData,
      ipAddress:          ip ?? undefined,
      userAgent:          ua ?? undefined,
    });

    return NextResponse.json({ signatureId: sigId });
  } catch (err) {
    console.error("[POST /api/whs/submissions/[id]/sign]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
