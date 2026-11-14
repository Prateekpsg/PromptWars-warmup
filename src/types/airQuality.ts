import { z } from "zod";

// Raw measurement item schema
export const AirQualityReadingSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  location: z.string(),
  pm25: z.number().nullable().optional(),
  pm10: z.number().nullable().optional(),
  aqi: z.number().nullable().optional(),
  no2: z.number().nullable().optional(),
  co: z.number().nullable().optional(),
  humidity: z.number().nullable().optional(),
  temperature: z.number().nullable().optional(),
  sensorStatus: z.enum(["VALID", "SUSPECT", "MISSING_DATA", "ANOMALY"]).default("VALID"),
  notes: z.string().optional(),
});

export type AirQualityReading = z.infer<typeof AirQualityReadingSchema>;

// Summary statistics calculated on client/server
export interface AirQualitySummary {
  totalReadings: number;
  locationsCount: number;
  avgPm25: number;
  maxPm25: number;
  avgPm10: number;
  maxAqi: number;
  hotspots: string[];
  anomaliesDetected: number;
  dateRange: {
    start: string;
    end: string;
  };
}

// User persona roles supported
export type TargetPersona = "MUNICIPAL_WARD" | "RWA_HOUSING" | "EDUCATIONAL_INSTITUTION";

// Structured recommendations item
export const RecommendationItemSchema = z.object({
  priority: z.enum(["CRITICAL", "HIGH", "MODERATE", "INFORMATIONAL"]),
  category: z.string(),
  action: z.string(),
  rationale: z.string(),
  traceableLocations: z.array(z.string()),
  timeframe: z.string(),
});

export type RecommendationItem = z.infer<typeof RecommendationItemSchema>;

// Multi-lingual Advisory
export const CitizenAdvisoriesSchema = z.object({
  english: z.object({
    citizenLevel: z.string(),
    schoolChildLevel: z.string(),
    actionableBullets: z.array(z.string()),
  }),
  hindi: z.object({
    citizenLevel: z.string(),
    schoolChildLevel: z.string(),
    actionableBullets: z.array(z.string()),
  }),
});

export type CitizenAdvisories = z.infer<typeof CitizenAdvisoriesSchema>;

// Structured Briefing Report
export const BriefingReportSchema = z.object({
  reportId: z.string(),
  generatedAt: z.string(),
  isDemoMode: z.boolean(),
  persona: z.enum(["MUNICIPAL_WARD", "RWA_HOUSING", "EDUCATIONAL_INSTITUTION"]),
  headline: z.string(),
  overallSeverity: z.enum(["GOOD", "MODERATE", "POOR", "VERY_POOR", "SEVERE"]),
  technicalSummary: z.string(),
  keyFindings: z.array(
    z.object({
      finding: z.string(),
      evidence: z.string(),
      location: z.string(),
    })
  ),
  hotspotsDetected: z.array(
    z.object({
      location: z.string(),
      peakPollutant: z.string(),
      peakValue: numberOrString(),
      suspectedCause: z.string(),
    })
  ),
  recommendations: z.array(RecommendationItemSchema),
  advisories: CitizenAdvisoriesSchema,
  comparisonWithPrevious: z
    .object({
      trend: z.enum(["DETERIORATING", "IMPROVING", "STABLE"]),
      deltaSummary: z.string(),
      notableChanges: z.array(z.string()),
    })
    .optional(),
});

function numberOrString() {
  return z.union([z.number(), z.string()]);
}

export type BriefingReport = z.infer<typeof BriefingReportSchema>;
