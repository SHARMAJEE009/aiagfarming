import { NextResponse } from "next/server";
import { requireOrg } from "@/lib/api-auth";
import { getWHSGateStatus, ensureWHSGateRow, getLatestSubmissionForForm } from "@/lib/whs-queries";
import { onboardingFormsForRole, type FormSchema } from "@/lib/whs-schemas";
import { isValidRole, type UserRole } from "@/lib/permissions";

export async function GET() {
  const result = await requireOrg();
  if ("error" in result) return result.error;
  const { ctx } = result;

  const rawRole = ctx.user_role;
  const userRole: UserRole = isValidRole(rawRole) ? rawRole : "FARMHAND";

  await ensureWHSGateRow(ctx.user_id, ctx.org_id);
  const gate = await getWHSGateStatus(ctx.user_id);

  const requiredForms: FormSchema[] = onboardingFormsForRole(userRole);

  // For each required form, find the latest submission status
  const formStatuses = await Promise.all(
    requiredForms.map(async (schema) => {
      const sub = await getLatestSubmissionForForm(ctx.user_id, ctx.org_id, schema.id);
      return {
        formId:    schema.id,
        title:     schema.title,
        status:    sub?.status ?? null,
        submissionId: sub?.id ?? null,
      };
    })
  );

  return NextResponse.json({
    completed:    !!gate?.completed_at,
    completedAt:  gate?.completed_at ?? null,
    requiredForms: formStatuses,
  });
}
