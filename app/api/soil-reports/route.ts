import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrgByEmail, getSoilReports, createSoilReport, updateSoilReport, deleteSoilReport } from "@/lib/queries";
import OpenAI from "openai";
// Import pdf-parse internals directly to avoid the startup self-test that
// uses __dirname to load a test PDF (path breaks in Next.js server context).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;

async function getOrgCtx() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return getOrgByEmail(session.user.email);
}

export async function GET() {
  try {
    const ctx = await getOrgCtx();
    if (!ctx?.org_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const reports = await getSoilReports(ctx.org_id);
    return NextResponse.json({ reports });
  } catch (err) {
    console.error("[GET /api/soil-reports]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getOrgCtx();
    if (!ctx?.org_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const reportName = formData.get("reportName") as string || "Soil Report";
    const fieldId = formData.get("fieldId") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.type !== "application/pdf")
      return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 });
    if (file.size > 20 * 1024 * 1024)
      return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 });

    // Create placeholder record
    const record = await createSoilReport(ctx.org_id, {
      report_name: reportName,
      field_id: fieldId || undefined,
      status: "processing",
    });
    if (!record?.id) return NextResponse.json({ error: "Failed to create record" }, { status: 500 });

    // Extract text from PDF
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let extractedText = "";
    try {
      const parsed = await pdfParse(buffer);
      extractedText = parsed.text?.trim() || "";
      console.log("[soil-reports] pdf-parse ok, chars:", extractedText.length);
    } catch (pdfErr) {
      console.error("[soil-reports] pdf-parse failed:", pdfErr);
      // Fallback: attempt raw text extraction from buffer for simple PDFs
      try {
        const raw = buffer.toString("latin1");
        const matches = raw.match(/BT[\s\S]*?ET/g) ?? [];
        const pieces: string[] = [];
        for (const block of matches) {
          const tjs = block.match(/\(([^)]+)\)\s*Tj/g) ?? [];
          for (const tj of tjs) {
            const m = tj.match(/\(([^)]+)\)/);
            if (m) pieces.push(m[1]);
          }
        }
        extractedText = pieces.join(" ").trim();
        if (extractedText) console.log("[soil-reports] fallback extraction ok, chars:", extractedText.length);
      } catch {
        extractedText = "";
      }
    }

    if (!extractedText) {
      await updateSoilReport(record.id, {
        status: "error",
        extracted_text: "",
        ai_analysis: { error: "Could not extract text from this PDF. It may be a scanned image or an unsupported PDF format." },
      });
      return NextResponse.json({
        id: record.id,
        status: "error",
        message: "Could not extract text from the PDF. Please ensure it is a text-based (not scanned) PDF.",
      }, { status: 422 });
    }

    // Analyse with OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are an expert agronomist. Analyse the following soil report text and return a structured JSON response with comprehensive recommendations.

SOIL REPORT TEXT:
${extractedText.slice(0, 12000)}

Return ONLY valid JSON (no markdown, no extra text) with this exact structure:
{
  "soilSummary": "Brief 2-3 sentence overview of the soil condition and key findings",
  "sampleDetails": {
    "location": "field/paddock location if mentioned",
    "depth": "sampling depth if mentioned",
    "date": "testing date if mentioned"
  },
  "nutrientLevels": {
    "nitrogen": {"value": "measured value or null", "status": "low|adequate|high|unknown", "unit": "unit or null"},
    "phosphorus": {"value": "measured value or null", "status": "low|adequate|high|unknown", "unit": "unit or null"},
    "potassium": {"value": "measured value or null", "status": "low|adequate|high|unknown", "unit": "unit or null"},
    "sulfur": {"value": "measured value or null", "status": "low|adequate|high|unknown", "unit": "unit or null"},
    "calcium": {"value": "measured value or null", "status": "low|adequate|high|unknown", "unit": "unit or null"},
    "magnesium": {"value": "measured value or null", "status": "low|adequate|high|unknown", "unit": "unit or null"},
    "zinc": {"value": "measured value or null", "status": "low|adequate|high|unknown", "unit": "unit or null"},
    "pH": {"value": "measured value or null", "status": "acidic|neutral|alkaline|unknown"},
    "organicMatter": {"value": "measured value or null", "status": "low|adequate|high|unknown", "unit": "%"}
  },
  "deficiencies": ["list of identified nutrient deficiencies or issues"],
  "recommendations": [
    {
      "category": "Fertilizer|Lime|Gypsum|Organic Matter|Irrigation|Drainage|Cover Crop|Other",
      "recommendation": "specific actionable recommendation",
      "priority": "high|medium|low",
      "timing": "when to apply or implement (e.g. 'Before planting', 'Spring application')"
    }
  ],
  "fertilizerSuggestions": [
    {
      "product": "fertilizer product name",
      "rate": "application rate with units",
      "purpose": "what nutrient deficiency it addresses"
    }
  ],
  "cropSuitability": ["list of crops suitable for this soil based on the analysis"],
  "improvementActions": ["list of soil improvement actions in priority order"],
  "alerts": ["any urgent issues requiring immediate attention"],
  "overallRating": "poor|fair|good|excellent"
}`;

    let analysis: unknown;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });
      const raw = completion.choices[0]?.message?.content || "{}";
      analysis = JSON.parse(raw);
    } catch (err) {
      console.error("[soil-reports] OpenAI error:", err);
      analysis = {
        soilSummary: "AI analysis failed. Please review the extracted text manually.",
        error: String(err),
      };
    }

    await updateSoilReport(record.id, {
      extracted_text: extractedText.slice(0, 50000),
      ai_analysis: analysis,
      status: "done",
    });

    return NextResponse.json({ id: record.id, status: "done", analysis }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/soil-reports]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await getOrgCtx();
    if (!ctx?.org_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await deleteSoilReport(ctx.org_id, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/soil-reports]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
