import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseCSVData, computeSummary } from "@/services/dataProcessor";
import { generateBriefingWithGemini } from "@/services/geminiService";
import { TargetPersona } from "@/types/airQuality";

const RequestBodySchema = z.object({
  csvData: z.string().min(1, "CSV data cannot be empty"),
  persona: z.enum(["MUNICIPAL_WARD", "RWA_HOUSING", "EDUCATIONAL_INSTITUTION"]),
  previousCsvData: z.string().optional().nullable(),
});

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = RequestBodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { csvData, persona, previousCsvData } = parsed.data;

    // Parse current readings
    const { readings, errors: parseErrors } = parseCSVData(csvData);
    if (readings.length === 0) {
      return NextResponse.json(
        { error: "Could not extract valid air-quality readings from the dataset", parseErrors },
        { status: 422 }
      );
    }

    const summary = computeSummary(readings);

    // Parse previous readings if provided
    let previousSummary = null;
    if (previousCsvData && previousCsvData.trim().length > 0) {
      const { readings: prevReadings } = parseCSVData(previousCsvData);
      if (prevReadings.length > 0) {
        previousSummary = computeSummary(prevReadings);
      }
    }

    // Call Gemini with safe fallback to high-fidelity Demo Mode
    const { report, usingFallback, error: apiWarning } = await generateBriefingWithGemini(
      readings,
      summary,
      persona as TargetPersona,
      previousSummary
    );

    return NextResponse.json({
      success: true,
      report,
      summary,
      readings,
      usingFallback,
      warning: apiWarning,
      parseErrors: parseErrors.length > 0 ? parseErrors : undefined,
    });
  } catch (error: any) {
    console.error("API /api/briefings error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while processing air quality briefing", message: error?.message },
      { status: 500 }
    );
  }
}
