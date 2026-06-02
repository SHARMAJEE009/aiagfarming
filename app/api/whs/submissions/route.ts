import { NextRequest, NextResponse } from "next/server";
import { requireOrg } from "@/lib/api-auth";
import { getSubmissions, upsertSubmission } from "@/lib/whs-queries";
import { getSchema, canFill } from "@/lib/whs-schemas";
import { isValidRole, type UserRole } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const result = await requireOrg();
  if ("error" in result) return result.error;
  const { ctx } = result;

  const rawRole = ctx.user_role;
  const userRole: UserRole = isValidRole(rawRole) ? rawRole : "FARMHAND";

  const { searchParams } = req.nextUrl;
  const formId = searchParams.get("formId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const stage  = searchParams.get("stage") ?? undefined;
  const role   = searchParams.get("role") ?? undefined;

  // OWNER/MANAGER see all org submissions; others see only their own
  const userId = (userRole === "OWNER" || userRole === "MANAGER") ? undefined : ctx.user_id;

  const submissions = await getSubmissions({
    orgId: ctx.org_id,
    userId,
    formId,
    status,
    stage,
    role,
  });

  return NextResponse.json(submissions);
}

export async function POST(req: NextRequest) {
  const result = await requireOrg();
  if ("error" in result) return result.error;
  const { ctx } = result;

  const rawRole = ctx.user_role;
  const userRole: UserRole = isValidRole(rawRole) ? rawRole : "FARMHAND";

  const body = await req.json() as {
    formId: string;
    answers: Record<string, unknown>;
    status?: "draft" | "submitted";
  };

  if (!body.formId) {
    return NextResponse.json({ error: "formId is required" }, { status: 400 });
  }

  const schema = getSchema(body.formId);
  if (!schema) {
    return NextResponse.json({ error: "Unknown form" }, { status: 404 });
  }

  if (!canFill(schema, userRole)) {
    return NextResponse.json({ error: "You do not have permission to fill this form" }, { status: 403 });
  }

  const id = await upsertSubmission({
    orgId:       ctx.org_id,
    formId:      body.formId,
    formVersion: schema.version,
    submittedBy: ctx.user_id,
    stage:       schema.stage,
    answers:     body.answers ?? {},
    status:      body.status ?? "draft",
  });

  return NextResponse.json({ id });
}
