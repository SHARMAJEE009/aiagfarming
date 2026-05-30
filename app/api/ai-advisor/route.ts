import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrgByEmail, getFarmContext } from "@/lib/queries";
import OpenAI from "openai";

interface ChatMessage { role: "user" | "assistant"; content: string }

function buildSystemPrompt(orgName: string, ctx: Awaited<ReturnType<typeof getFarmContext>>) {
  const { fields, seasons, mobs, animals, healthEvents, financials, soilReports } = ctx;

  const totalArea = fields.reduce((a, f) => a + f.area_ha, 0);
  const activeSeasons = seasons.filter((s) => s.status === "active");
  const totalAnimals = animals.filter((a) => a.status === "active").length;
  const totalRevenue = financials.filter((e) => e.type === "income").reduce((a, e) => a + Number(e.amount), 0);
  const totalExpenses = financials.filter((e) => e.type === "expense").reduce((a, e) => a + Number(e.amount), 0);

  const fieldsSummary = fields.map((f) =>
    `  - ${f.name}: ${f.area_ha.toFixed(1)} ha, soil: ${f.soil_type || "unknown"}${f.crop_type ? `, current crop: ${f.crop_type} (${f.season_status})` : ""}`
  ).join("\n");

  const mobsSummary = mobs.map((m) =>
    `  - ${m.name}: ${m.headcount} ${m.species}${m.paddock_name ? ` in ${m.paddock_name}` : ""}`
  ).join("\n");

  const recentHealth = healthEvents.slice(0, 10).map((h) =>
    `  - ${h.treatment_date}: ${h.event_type}${h.product ? ` (${h.product})` : ""} — ${h.mob_name || h.animal_tag || "unknown"}`
  ).join("\n");

  const recentFinancials = financials.slice(0, 20).map((e) =>
    `  - ${e.entry_date}: ${e.type === "income" ? "+" : "-"}$${Number(e.amount).toFixed(2)} (${e.category})${e.description ? ` — ${e.description}` : ""}`
  ).join("\n");

  const soilSummary = soilReports
    .filter((r) => r.status === "done" && r.ai_analysis)
    .slice(0, 5)
    .map((r) => {
      const a = r.ai_analysis as { soilSummary?: string; deficiencies?: string[]; overallRating?: string } | null;
      return `  - ${r.report_name}${r.field_name ? ` (${r.field_name})` : ""}: ${a?.overallRating ?? "unknown"} rating — ${a?.soilSummary ?? ""}${a?.deficiencies?.length ? `; deficiencies: ${a.deficiencies.join(", ")}` : ""}`;
    }).join("\n");

  return `You are an expert AI Farm Advisor for ${orgName}. You have comprehensive, real-time access to all farm data. Provide specific, actionable, data-driven advice tailored to this farm's exact situation.

═══ FARM OVERVIEW ═══
Farm: ${orgName}
Total Fields: ${fields.length} (${totalArea.toFixed(1)} ha total area)
Total Livestock: ${totalAnimals} active animals across ${mobs.length} mobs
Active Crops: ${activeSeasons.length} seasons currently growing
Recent Financials: $${totalRevenue.toFixed(2)} income / $${totalExpenses.toFixed(2)} expenses (last 100 entries)
Net Position: ${totalRevenue - totalExpenses >= 0 ? "+" : ""}$${(totalRevenue - totalExpenses).toFixed(2)}

═══ FIELDS & CROPS ═══
${fieldsSummary || "  No fields registered yet"}

═══ LIVESTOCK MOBS ═══
${mobsSummary || "  No livestock mobs registered"}

═══ RECENT HEALTH EVENTS ═══
${recentHealth || "  No recent health events"}

═══ RECENT FINANCIAL ENTRIES ═══
${recentFinancials || "  No financial entries recorded"}

${soilReports.length > 0 ? `═══ SOIL REPORTS ═══\n${soilSummary}` : ""}

═══ INSTRUCTIONS ═══
- Always refer to specific farm data above when answering questions
- Give precise, actionable recommendations with quantities, dates, and specific products where relevant
- Flag any urgent issues (withholding periods, disease risks, financial concerns)
- When asked about trends, reference specific data points from the context above
- If data is missing, say so clearly and suggest what data to collect
- Format responses clearly with bullet points or sections when appropriate
- Use Australian farming context (metric units, Australian seasons, local regulations)
- Today's date: ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ctx = await getOrgByEmail(session.user.email);
    if (!ctx?.org_id)
      return NextResponse.json({ error: "No organization" }, { status: 403 });

    const { message, history } = await req.json() as {
      message: string;
      history: ChatMessage[];
    };

    if (!message?.trim())
      return NextResponse.json({ error: "Message is required" }, { status: 400 });

    const farmCtx = await getFarmContext(ctx.org_id);
    const systemPrompt = buildSystemPrompt(ctx.org_name || ctx.farm_name || "Your Farm", farmCtx);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...(history ?? []).slice(-10).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
      temperature: 0.5,
      max_tokens: 1200,
    });

    const reply = completion.choices[0]?.message?.content ?? "I could not generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[POST /api/ai-advisor]", err);
    return NextResponse.json({ error: "AI service unavailable. Please try again." }, { status: 500 });
  }
}
