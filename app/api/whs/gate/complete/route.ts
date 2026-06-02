import { NextResponse } from "next/server";
import { requireOrg } from "@/lib/api-auth";
import { markWHSGateComplete, getLatestSubmissionForForm } from "@/lib/whs-queries";
import { onboardingFormsForRole } from "@/lib/whs-schemas";
import { isValidRole, type UserRole } from "@/lib/permissions";

export async function POST() {
  const result = await requireOrg();
  if ("error" in result) return result.error;
  const { ctx } = result;

  const rawRole = ctx.user_role;
  const userRole: UserRole = isValidRole(rawRole) ? rawRole : "FARMHAND";

  // Verify all required forms are signed before marking complete
  const requiredForms = onboardingFormsForRole(userRole);
  const checks = await Promise.all(
    requiredForms.map((s) => getLatestSubmissionForForm(ctx.user_id, ctx.org_id, s.id))
  );

  const allSigned = checks.every((sub) => sub?.status === "signed");
  if (!allSigned) {
    return NextResponse.json(
      { error: "All required onboarding forms must be signed before completing the gate." },
      { status: 422 }
    );
  }

  await markWHSGateComplete(ctx.user_id);
  return NextResponse.json({ ok: true });
}
