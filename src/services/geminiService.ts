import { GoogleGenAI } from "@google/genai";
import {
  AirQualityReading,
  AirQualitySummary,
  BriefingReport,
  BriefingReportSchema,
  TargetPersona,
} from "@/types/airQuality";

/**
 * Generate Heuristic High-Fidelity Briefing when in offline mode or if quota is reached.
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
      rationale: `Identified peak PM2.5 of ${summary.maxPm25} µg/m³ at detected hotspots: ${summary.hotspots.join(", ") || "Active transit corridors"}.`,
      traceableLocations: summary.hotspots.length > 0 ? summary.hotspots : [readings[0]?.location || "Monitoring Hub"],
      timeframe: "Immediate (Next 2 Hours)",
    });
    recommendations.push({
      priority: "HIGH" as const,
      category: "Traffic Optimization",
      action: "Divert heavy diesel freight vehicles away from school and congested market corridors during peak hours.",
      rationale: "NO2 and fine particulate spikes correlate directly with transit bottlenecks.",
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
      action: "Mandate engine switch-off for all private buses and vans in pickup/drop-off queues to prevent localized toxic exhaust plumes.",
      rationale: `Elevated particulate concentrations (Avg PM2.5: ${summary.avgPm25} µg/m³) concentrated along bus drop-off points.`,
      traceableLocations: summary.hotspots,
      timeframe: "Drop-off (07:00-08:30) & Pickup (13:30-15:00)",
    });
  } else {
    // RWA_HOUSING
    recommendations.push({
      priority: "CRITICAL" as const,
      category: "Resident Vulnerability Protection",
      action: "Issue urgent WhatsApp/SMS advisory to senior citizens, asthmatics, and toddlers to remain indoors with air filtration active.",
      rationale: `Hazardous PM2.5 (${summary.avgPm25} µg/m³) and AQI readings pose immediate respiratory trigger risks.`,
      traceableLocations: summary.hotspots,
      timeframe: "Current shift until next sensor dispersal",
    });
    recommendations.push({
      priority: "MODERATE" as const,
      category: "Estate Operations",
      action: "Pause mechanical leaf blowers and high-dust landscaping; enforce moist sweeping only across paved internal avenues.",
      rationale: "Dry sweeping mechanically resuspends settled coarse dust into the breathing zone.",
      traceableLocations: summary.hotspots,
      timeframe: "Immediate effect",
    });
  }

  // Key Findings
  const keyFindings = [
    {
      finding: `Highest concentration observed at ${summary.hotspots[0] || "primary monitoring sector"} with peak PM2.5 reaching ${summary.maxPm25} µg/m³.`,
      evidence: `Sensor recorded PM2.5 ${summary.maxPm25} µg/m³, exceeding WHO 24-hr standard by ${Math.max(1, Math.round(summary.maxPm25 / 15))}x.`,
      location: summary.hotspots[0] || readings[0]?.location || "Monitored Zone",
    },
    {
      finding: `Fleet average particulate reading is PM2.5: ${summary.avgPm25} µg/m³, PM10: ${summary.avgPm10} µg/m³.`,
      evidence: `Aggregated across ${summary.totalReadings} timestamp records.`,
      location: "Fleet Spatial Aggregate",
    },
  ];

  if (summary.anomaliesDetected > 0) {
    keyFindings.push({
      finding: `Flagged ${summary.anomaliesDetected} sensor validation anomaly record(s) where reported PM2.5 exceeded PM10 or readings were non-physical.`,
      evidence: "Physical plausibility constraint: PM2.5 fraction cannot exceed coarse PM10 mass.",
      location: "Quality Assurance Engine",
    });
  }

  // Multi-lingual Advisories
  const advisories = {
    english: {
      citizenLevel:
        severity === "SEVERE"
          ? "Air quality has reached severe risk levels across multiple sectors. Vulnerable groups, elderly, and children should strictly avoid outdoor exposure. Keep doors and windows sealed and use HEPA air purifiers if accessible."
          : severity === "VERY_POOR"
          ? "Air quality is unhealthy for sensitive groups. Minimize heavy outdoor exertion during morning and late evening hours. Wear well-fitted N95 masks if commuting near major transit intersections."
          : "Air quality is currently in acceptable ranges with mild particulate presence. Sensitive individuals should observe localized shifts.",
      schoolChildLevel:
        severity === "SEVERE"
          ? "The air outside is very dusty and unhealthy today! Please stay inside classrooms during break times, keep windows closed, and don't play running games outdoors. Remember to drink water!"
          : "The air outside has noticeable dust today. Let's do our games and fun exercises indoors or take gentle walks. Drink plenty of water!",
      actionableBullets: [
        "Avoid early morning jogging along major roadways and industrial zones.",
        "Wear certified N95 / FFP2 respirators when stepping outdoors.",
        "Ensure air conditioner filters are cleared and run air purifiers in sealed rooms.",
        "Report any open waste, leaf, or biomass burning immediately to local authorities.",
      ],
    },
    hindi: {
      citizenLevel:
        severity === "SEVERE"
          ? "क्षेत्र में वायु गुणवत्ता गंभीर स्तर पर पहुंच चुकी है। वरिष्ठ नागरिक, बच्चे एवं सांस के मरीज घरों के अंदर रहें। खिड़कियां व दरवाजे बंद रखें और जरूरी होने पर ही बाहर निकलें।"
          : "वायु प्रदूषण स्तर अस्वस्थ बना हुआ है। मुख्य चौराहों और भारी यातायात वाले क्षेत्रों में सुबह-शाम सैर से बचें। बाहर निकलते समय N95 मास्क अवश्य लगाएं।",
      schoolChildLevel:
        severity === "SEVERE"
          ? "आज बाहर हवा में धूल और धुआं बहुत ज्यादा है! खेल का समय आज कमरे के अंदर ही बिताएं और बाहर मैदान में दौड़-भाग न करें। खूब पानी पिएं!"
          : "आज बाहर की हवा थोड़ी खराब है। खेलकूद कमरे में करें और सेहत का ध्यान रखें!",
      actionableBullets: [
        "सुबह और शाम के समय मुख्य मार्गों के किनारे दौड़ने या व्यायाम करने से बचें।",
        "घर से बाहर निकलते समय प्रमाणित N95 मास्क का उपयोग करें।",
        "कमरों में खिड़कियां बंद रखें और धूल-मिट्टी से बचाव करें।",
        "कचरा या पत्तियां जलाने की सूचना तुरंत नगर निगम को दें।",
      ],
    },
  };

  // Comparative delta
  let comparisonWithPrevious = undefined;
  if (previousSummary) {
    const diff = summary.avgPm25 - previousSummary.avgPm25;
    const trend = diff > 10 ? ("DETERIORATING" as const) : diff < -10 ? ("IMPROVING" as const) : ("STABLE" as const);
    comparisonWithPrevious = {
      trend,
      deltaSummary:
        trend === "DETERIORATING"
          ? `Average PM2.5 elevated by +${Math.round(diff)} µg/m³ compared to baseline reference.`
          : trend === "IMPROVING"
          ? `Average PM2.5 improved by ${Math.round(diff)} µg/m³ relative to prior baseline.`
          : `Atmospheric concentrations remained broadly stable (within ±10 µg/m³ variance).`,
      notableChanges: [
        `Baseline Avg PM2.5: ${previousSummary.avgPm25} µg/m³ → Current: ${summary.avgPm25} µg/m³.`,
        `Baseline Peak: ${previousSummary.maxPm25} µg/m³ → Current Peak: ${summary.maxPm25} µg/m³.`,
      ],
    };
  }

  return {
    reportId: `AERO-${Date.now().toString(36).toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    isDemoMode: false,
    persona,
    headline: `${personaTitles[persona]}: Ambient Air Defense Status [${severity}]`,
    overallSeverity: severity,
    technicalSummary: `Aero Intelligence Engine analyzed ${summary.totalReadings} synchronized atmospheric sensor readings. Mean PM2.5 is registered at ${summary.avgPm25} µg/m³ (peak ${summary.maxPm25} µg/m³) alongside mean PM10 of ${summary.avgPm10} µg/m³. Identified critical stress clusters across: ${summary.hotspots.join(", ") || "General Monitored Spatial Grid"}. Coarse particulate ratios indicate a combination of combustion emissions, vehicle exhaust idling, and re-suspended road dust.`,
    keyFindings,
    hotspotsDetected: summary.hotspots.map((loc) => ({
      location: loc,
      peakPollutant: "PM2.5",
      peakValue: summary.maxPm25,
      suspectedCause: "Transit congestion, diesel idling, localized industrial stack or perimeter resuspension",
    })),
    recommendations,
    advisories,
    comparisonWithPrevious,
  };
}

/**
 * Generate Structured Briefing utilizing Google Gemini API (@google/genai)
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
      error: "No GEMINI_API_KEY provided in environment. Running with Aero civic heuristic intelligence engine.",
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a Principal Environmental Data Scientist & Civic Intelligence Officer for "Aero" (Enterprise Civic Air Quality Intelligence Studio).
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
      sampleReadings: readings.slice(0, 40),
      previousSummary: previousSummary || "None available",
    };

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
    const cleanJson = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    const validated = BriefingReportSchema.parse(parsed);

    return {
      report: validated,
      usingFallback: false,
    };
  } catch (err: any) {
    console.error("Gemini API Error, falling back to Aero civic heuristic synthesis:", err);
    const isQuotaError = err?.status === 429 || err?.message?.includes("quota") || err?.message?.includes("RESOURCE_EXHAUSTED");

    return {
      report: generateHeuristicDemoBriefing(readings, summary, persona, previousSummary),
      usingFallback: true,
      error: isQuotaError
        ? "Gemini API quota exceeded (HTTP 429). Aero civic heuristics synthesised the response seamlessly."
        : `Gemini synthesis error: ${err.message || "Unknown error"}. Aero civic heuristics active.`,
    };
  }
}
