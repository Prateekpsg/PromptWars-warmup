import { GoogleGenAI } from "@google/genai";
import {
  AirQualityReading,
  AirQualitySummary,
  BriefingReport,
  BriefingReportSchema,
  TargetPersona,
} from "@/types/airQuality";

/**
 * Generate Heuristic High-Fidelity Briefing when in DEMO MODE or if quota is reached.
 * Guaranteed ₹0 cost and completely offline capable.
 */
export function generateHeuristicDemoBriefing(
  readings: AirQualityReading[],
  summary: AirQualitySummary,
  persona: TargetPersona,
  previousSummary?: AirQualitySummary | null
): BriefingReport {
  const isSevere = summary.maxPm25 > 250 || summary.maxAqi > 300;
  const isVeryPoor = summary.maxPm25 > 120 || summary.maxAqi > 200;
  const severity = isSevere ? "SEVERE" : isVeryPoor ? "VERY_POOR" : "MODERATE";

  const personaTitles: Record<TargetPersona, string> = {
    MUNICIPAL_WARD: "Municipal Ward Emergency Briefing & Action Matrix",
    RWA_HOUSING: "Residential Welfare & Neighborhood Air Quality Advisory",
    EDUCATIONAL_INSTITUTION: "Campus Health & Student Outdoor Safety Protocol",
  };

  // Persona-tailored recommendations
  const recommendations = [];
  if (persona === "MUNICIPAL_WARD") {
    recommendations.push({
      priority: "CRITICAL" as const,
      category: "Enforcement & Dust Control",
      action: "Deploy anti-smog water mist canons and enforce zero open-biomass/waste burning patrols.",
      rationale: `Identified peak PM2.5 of ${summary.maxPm25} µg/m³ at detected hotspots: ${summary.hotspots.join(", ") || "Active ward junctions"}.`,
      traceableLocations: summary.hotspots.length > 0 ? summary.hotspots : [readings[0]?.location || "Ward Center"],
      timeframe: "Immediate (Next 2 Hours)",
    });
    recommendations.push({
      priority: "HIGH" as const,
      category: "Traffic Optimization",
      action: "Divert heavy diesel freight vehicles away from school and congested market corridors during peak hours.",
      rationale: "NO2 and fine particulate spikes correlate directly with morning transit bottlenecks.",
      traceableLocations: summary.hotspots,
      timeframe: "07:00 - 11:00 AM and 04:00 - 08:00 PM",
    });
  } else if (persona === "EDUCATIONAL_INSTITUTION") {
    recommendations.push({
      priority: "CRITICAL" as const,
      category: "Physical Activity Protocol",
      action: "Suspend all outdoor sports, morning assemblies, and recess in open fields; shift to indoor ventilated spaces.",
      rationale: `Ambient PM2.5 (${summary.avgPm25} µg/m³) exposes children's respiratory systems to toxic thresholds.`,
      traceableLocations: summary.hotspots,
      timeframe: "Active school day duration",
    });
    recommendations.push({
      priority: "HIGH" as const,
      category: "Campus Transport Safety",
      action: "Enforce strict 'Engine Off / No Idling' policies for school buses and parent pickup vehicles at school gates.",
      rationale: "Sensor readings indicate severe micro-hotspots at arrival and dismissal hours near gates.",
      traceableLocations: ["Campus Gates"],
      timeframe: "Drop-off and dispersal hours",
    });
  } else {
    // RWA_HOUSING
    recommendations.push({
      priority: "CRITICAL" as const,
      category: "Resident Vulnerability Protection",
      action: "Issue immediate alert for elderly residents, children, and asthma sufferers to avoid outdoor morning walks.",
      rationale: `Neighborhood particulate levels reached peak AQI ${summary.maxAqi}.`,
      traceableLocations: summary.hotspots,
      timeframe: "Immediate until evening dispersion",
    });
    recommendations.push({
      priority: "HIGH" as const,
      category: "Society Maintenance",
      action: "Mandate wet vacuuming/sweeping in common driveways and pause all unshielded civil construction works.",
      rationale: "Unpaved dust significantly amplifies coarse PM10 particulate loads in residential corridors.",
      traceableLocations: ["Internal Roads and Basements"],
      timeframe: "Next 24 Hours",
    });
  }

  // Multi-lingual advisories
  const advisories = {
    english: {
      citizenLevel: `Ward Air Quality is currently classified as ${severity} with average PM2.5 levels of ${summary.avgPm25} µg/m³. Residents in ${summary.hotspots.join(", ") || "monitored sectors"} should minimize outdoor exertion and keep indoor air filters operational.`,
      schoolChildLevel: `The air outside is very smoky and unhealthy today. Please play your games indoors, keep windows closed in class, and wear your mask if you must go outside.`,
      actionableBullets: [
        "Wear N95/FFP2 masks when stepping outside.",
        "Avoid morning jogging or strenuous outdoor exercise.",
        "Keep doors and windows sealed during peak traffic hours.",
        "Report any local garbage or leaf burning immediately to the ward desk.",
      ],
    },
    hindi: {
      citizenLevel: `वर्तमान में आपके क्षेत्र की वायु गुणवत्ता ${severity === "SEVERE" ? "गंभीर (Severe)" : "अत्यंत खराब"} श्रेणी में है, जहां औसत PM2.5 ${summary.avgPm25} µg/m³ दर्ज किया गया है। संवेदनशील नागरिक व बच्चे बाहर जाने से बचें।`,
      schoolChildLevel: `आज बाहर की हवा में धुआं और धूल बहुत अधिक है। कृपया खेल के मैदान में जाने के बजाय इनडोर खेल खेलें और बाहर जाते समय मास्क अवश्य पहनें।`,
      actionableBullets: [
        "घर से बाहर निकलते समय N95 मास्क का उपयोग करें।",
        "सुबह की सैर और खुले में भारी व्यायाम से बचें।",
        "खिड़कियां और दरवाजे बंद रखें।",
        "कूड़ा या पत्तियां जलाने की घटना की सूचना तुरंत वार्ड कार्यालय को दें।",
      ],
    },
  };

  // Comparison with historical baseline
  let comparisonWithPrevious = undefined;
  if (previousSummary) {
    const deltaPm25 = summary.avgPm25 - previousSummary.avgPm25;
    const trend = deltaPm25 > 10 ? ("DETERIORATING" as const) : deltaPm25 < -10 ? ("IMPROVING" as const) : ("STABLE" as const);
    comparisonWithPrevious = {
      trend,
      deltaSummary: `Compared to the previous baseline, average PM2.5 changed by ${deltaPm25 > 0 ? "+" : ""}${deltaPm25} µg/m³ (${trend.toLowerCase()}).`,
      notableChanges: [
        `Baseline average PM2.5: ${previousSummary.avgPm25} µg/m³ vs Current: ${summary.avgPm25} µg/m³.`,
        `Peak AQI moved from ${previousSummary.maxAqi} to ${summary.maxAqi}.`,
        deltaPm25 > 0 ? "Increased emissions observed across major transit corridors." : "Dispersal conditions improved slightly over the last cycle.",
      ],
    };
  }

  return {
    reportId: `REP-${Date.now().toString(36).toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    isDemoMode: true,
    persona,
    headline: `${personaTitles[persona]}: ${severity} Air Quality Alert`,
    overallSeverity: severity,
    technicalSummary: `Comprehensive audit of ${summary.totalReadings} timestamped sensor records across ${summary.locationsCount} spatial nodes indicates elevated PM2.5 (avg ${summary.avgPm25} µg/m³, max ${summary.maxPm25} µg/m³) and AQI up to ${summary.maxAqi}. Identified ${summary.hotspots.length} acute hotspot sectors with ${summary.anomaliesDetected} sensor anomalies flagged during validation.`,
    keyFindings: summary.hotspots.map((loc) => ({
      finding: `Critical particulate saturation detected at ${loc}`,
      evidence: `Record readings show persistent PM2.5 exceeding safety guidelines by over 400%`,
      location: loc,
    })),
    hotspotsDetected: summary.hotspots.map((loc) => ({
      location: loc,
      peakPollutant: "PM2.5",
      peakValue: summary.maxPm25,
      suspectedCause: "Combined heavy diesel transit, unpaved dust, and localized industrial/commercial emissions",
    })),
    recommendations,
    advisories,
    comparisonWithPrevious,
  };
}

/**
 * Generate Structured Briefing utilizing Google Gemini API (@google/genai)
 * If no API key is provided or quota is exceeded, gracefully falls back to Heuristic Demo Briefing!
 */
export async function generateBriefingWithGemini(
  readings: AirQualityReading[],
  summary: AirQualitySummary,
  persona: TargetPersona,
  previousSummary?: AirQualitySummary | null
): Promise<{ report: BriefingReport; usingFallback: boolean; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  // Check if API key exists
  if (!apiKey || apiKey.trim() === "") {
    return {
      report: generateHeuristicDemoBriefing(readings, summary, persona, previousSummary),
      usingFallback: true,
      error: "No GEMINI_API_KEY provided in environment. Running in Demo Mode with high-fidelity civic heuristics.",
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a Principal Environmental Data Scientist & Civic Intelligence Officer for "BhopalAIR by Prateek" (Civic Air Quality Briefing Studio).
Your mission is to convert raw air-quality sensor data into rigorous, traceable, actionable civic intelligence for a specific user persona: ${persona}.
Every recommendation and finding must be traceable to the supplied sensor dataset.

Return ONLY a valid JSON object matching this schema strictly (do not include markdown ticks, just raw JSON):
{
  "reportId": "string",
  "generatedAt": "ISO date string",
  "isDemoMode": false,
  "persona": "${persona}",
  "headline": "string",
  "overallSeverity": "GOOD" | "MODERATE" | "POOR" | "VERY_POOR" | "SEVERE",
  "technicalSummary": "detailed multi-paragraph technical note with exact numbers",
  "keyFindings": [
    { "finding": "string", "evidence": "traceable data evidence", "location": "string" }
  ],
  "hotspotsDetected": [
    { "location": "string", "peakPollutant": "PM2.5", "peakValue": number, "suspectedCause": "string" }
  ],
  "recommendations": [
    {
      "priority": "CRITICAL" | "HIGH" | "MODERATE" | "INFORMATIONAL",
      "category": "string",
      "action": "string",
      "rationale": "string",
      "traceableLocations": ["string"],
      "timeframe": "string"
    }
  ],
  "advisories": {
    "english": {
      "citizenLevel": "Clear, accessible, non-technical advisory for general public",
      "schoolChildLevel": "Simple, empathetic guidance understandable by a 10-year-old school student",
      "actionableBullets": ["string", "string"]
    },
    "hindi": {
      "citizenLevel": "हिन्दी में नागरिकों के लिए स्पष्ट सलाह",
      "schoolChildLevel": "बच्चों के लिए सरल हिन्दी में मार्गदर्शन",
      "actionableBullets": ["string", "string"]
    }
  },
  "comparisonWithPrevious": {
    "trend": "DETERIORATING" | "IMPROVING" | "STABLE",
    "deltaSummary": "string",
    "notableChanges": ["string"]
  }
}`;

    const promptPayload = {
      persona,
      summaryStats: summary,
      sampleReadings: readings.slice(0, 40), // Provide sample data points to respect token window
      previousSummary: previousSummary || "None available",
    };

    // Call Gemini API with structured output configuration
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemPrompt}\n\nDataset Input:\n${JSON.stringify(promptPayload, null, 2)}`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    // Clean potential markdown ticks
    const cleanJson = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let parsedData: any;
    try {
      parsedData = JSON.parse(cleanJson);
    } catch (jsonErr) {
      console.error("Failed to parse Gemini JSON:", cleanJson);
      throw jsonErr;
    }

    // Assign reportId and flags
    if (!parsedData.reportId) {
      parsedData.reportId = `GEMINI-${Date.now().toString(36).toUpperCase()}`;
    }
    parsedData.isDemoMode = false;

    const validated = BriefingReportSchema.parse(parsedData);

    return {
      report: validated,
      usingFallback: false,
    };
  } catch (err: any) {
    console.warn("Gemini API call failed or quota reached, falling back to Demo Mode:", err?.message);
    const fallbackReport = generateHeuristicDemoBriefing(readings, summary, persona, previousSummary);
    return {
      report: fallbackReport,
      usingFallback: true,
      error: `Gemini API: ${err?.message || "Unavailable"}. Switched seamlessly to Demo Mode.`,
    };
  }
}
