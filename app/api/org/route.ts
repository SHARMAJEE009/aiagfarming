import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrgByEmail, updateOrg, getTeamMembers, updateUserProfile } from "@/lib/queries";

async function getOrgContext() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const ctx = await getOrgByEmail(session.user.email);
  return ctx;
}

export async function GET() {
  try {
    const ctx = await getOrgContext();
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const team = ctx.org_id ? await getTeamMembers(ctx.org_id) : [];

    return NextResponse.json({
      org: {
        id:    ctx.org_id,
        name:  ctx.org_name,
        slug:  ctx.org_slug,
        plan:  ctx.plan,
        trialEndsAt: ctx.trial_ends_at,
      },
      user: {
        id:            ctx.user_id,
        name:          ctx.user_name,
        email:         ctx.user_email,
        role:          ctx.user_role,
        image:         ctx.user_image,
        farmName:      ctx.farm_name,
        location:      ctx.location,
        operationType: ctx.operation_type,
        farmSize:      ctx.farm_size,
        animalCount:   ctx.animal_count,
      },
      team,
    });
  } catch (err) {
    console.error("[GET /api/org]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ctx = await getOrgByEmail(session.user.email);
    if (!ctx) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await request.json();
    const { orgName, orgSlug, userName, location, operationType } = body;

    const updates: Promise<unknown>[] = [];

    if ((orgName || orgSlug) && ctx.org_id) {
      updates.push(updateOrg(ctx.org_id, { name: orgName, slug: orgSlug }));
    }

    if (userName || location || operationType) {
      updates.push(updateUserProfile(ctx.user_id, {
        name: userName, location, operation_type: operationType,
      }));
    }

    await Promise.all(updates);
    return NextResponse.json({ message: "Updated successfully" });
  } catch (err) {
    console.error("[PATCH /api/org]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
