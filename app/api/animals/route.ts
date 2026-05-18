import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrgByEmail, getAnimals, getAnimalCounts, createAnimal } from "@/lib/queries";

async function getOrgId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const ctx = await getOrgByEmail(session.user.email);
  return ctx?.org_id ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const species = searchParams.get("species") ?? undefined;
    const status  = searchParams.get("status")  ?? undefined;
    const search  = searchParams.get("search")  ?? undefined;

    const [animals, counts] = await Promise.all([
      getAnimals(orgId, { species, status, search }),
      getAnimalCounts(orgId),
    ]);

    return NextResponse.json({ animals, counts });
  } catch (err) {
    console.error("[GET /api/animals]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { nlis_tag, rfid_tag, visual_tag, species, breed, sex, dob, mob_id } = body;
    if (!species || !sex)
      return NextResponse.json({ error: "species and sex are required" }, { status: 400 });
    const result = await createAnimal(orgId, { nlis_tag, rfid_tag, visual_tag, species, breed, sex, dob, mob_id });
    return NextResponse.json({ id: result?.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/animals]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
