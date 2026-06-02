import { auth } from "@/auth";
import { getOrgByEmail } from "@/lib/queries";
import { NextResponse } from "next/server";
import { isValidRole, type UserRole } from "@/lib/permissions";

export type OrgCtx = NonNullable<Awaited<ReturnType<typeof getOrgByEmail>>>;

type Ok = { ctx: OrgCtx; role: UserRole };
type Err = { error: NextResponse };

/**
 * Authenticate the request and assert the caller has one of the allowed roles.
 * Usage:
 *   const result = await requireRole(["OWNER", "MANAGER"]);
 *   if ("error" in result) return result.error;
 *   const { ctx, role } = result;
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<Ok | Err> {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const ctx = await getOrgByEmail(session.user.email);
  if (!ctx?.org_id) {
    return { error: NextResponse.json({ error: "No organization found" }, { status: 403 }) };
  }

  const rawRole = ctx.user_role;
  if (!isValidRole(rawRole) || !allowedRoles.includes(rawRole)) {
    return {
      error: NextResponse.json(
        { error: `Access denied. Required: ${allowedRoles.join(" or ")}` },
        { status: 403 }
      ),
    };
  }

  return { ctx, role: rawRole };
}

/** Same as requireRole but accepts any authenticated user with a valid org. */
export async function requireOrg(): Promise<Ok | Err> {
  return requireRole(["OWNER", "MANAGER", "AGRONOMIST", "FARMHAND", "READ_ONLY"]);
}
