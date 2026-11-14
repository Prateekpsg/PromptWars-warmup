import Papa from "papaparse";
import * as XLSX from "xlsx";
import { AirQualityReading, AirQualitySummary } from "@/types/airQuality";

/**
 * Standardize keys from varied CSV/Excel header representations
 */
function normalizeKey(rawKey: string): string {
  const clean = rawKey.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (clean.includes("time") || clean.includes("date")) return "timestamp";
  if (clean.includes("loc") || clean.includes("station") || clean.includes("area") || clean.includes("ward")) return "location";
  if (clean.includes("pm25") || clean.includes("pm2.5")) return "pm25";
  if (clean.includes("pm10")) return "pm10";
  if (clean.includes("aqi")) return "aqi";
  if (clean.includes("no2")) return "no2";
  if (clean.includes("co")) return "co";
  if (clean.includes("hum")) return "humidity";
  if (clean.includes("temp")) return "temperature";
  if (clean.includes("note") || clean.includes("remark") || clean.includes("comment")) return "notes";
  return clean;
}

/**
 * Ingest CSV text and validate / normalize rows
 */
export function parseCSVData(csvText: string): { readings: AirQualityReading[]; errors: string[] } {
  const parsed = Papa.parse(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  const errors: string[] = [];
  const readings: AirQualityReading[] = [];

  parsed.data.forEach((row: any, idx: number) => {
    try {
      const normalizedRow: Record<string, any> = {};
      for (const [key, value] of Object.entries(row)) {
        normalizedRow[normalizeKey(key)] = value;
      }

      const id = `REC-${idx + 1}`;
      const timestamp = normalizedRow.timestamp ? String(normalizedRow.timestamp).trim() : "2026-11-14 06:00";
      const location = normalizedRow.location ? String(normalizedRow.location).trim() : `Monitored Point ${idx + 1}`;

      const pm25Raw = parseFloat(normalizedRow.pm25);
      const pm10Raw = parseFloat(normalizedRow.pm10);
      const aqiRaw = parseFloat(normalizedRow.aqi);
      const no2Raw = parseFloat(normalizedRow.no2);
      const tempRaw = parseFloat(normalizedRow.temperature);
      const humRaw = parseFloat(normalizedRow.humidity);

      const pm25 = isNaN(pm25Raw) ? null : pm25Raw;
      const pm10 = isNaN(pm10Raw) ? null : pm10Raw;
      let aqi = isNaN(aqiRaw) ? null : aqiRaw;
      const no2 = isNaN(no2Raw) ? null : no2Raw;
      const temperature = isNaN(tempRaw) ? null : tempRaw;
      const humidity = isNaN(humRaw) ? null : humRaw;

      // Calculate approximate AQI if missing and PM2.5 exists
      if (aqi === null && pm25 !== null) {
        aqi = Math.round(pm25 * 1.25);
      }

      // Detect sensor anomalies / suspect readings
      let sensorStatus: "VALID" | "SUSPECT" | "MISSING_DATA" | "ANOMALY" = "VALID";
      if (pm25 === null && pm10 === null) {
        sensorStatus = "MISSING_DATA";
      } else if ((pm25 !== null && pm25 > 900) || (pm10 !== null && pm10 > 1200)) {
        sensorStatus = "ANOMALY";
      } else if (pm25 !== null && pm10 !== null && pm25 > pm10 * 1.5) {
        // Physical impossibility: PM2.5 is a subset of PM10
        sensorStatus = "SUSPECT";
      }

      readings.push({
        id,
        timestamp,
        location,
        pm25,
        pm10,
        aqi,
        no2,
        humidity,
        temperature,
        sensorStatus,
        notes: normalizedRow.notes ? String(normalizedRow.notes).trim() : undefined,
      });
    } catch (e: any) {
      errors.push(`Row ${idx + 1}: ${e?.message || "Failed to parse"}`);
    }
  });

  return { readings, errors };
}

/**
 * Ingest Excel ArrayBuffer and convert to standard readings
 */
export function parseExcelData(buffer: ArrayBuffer): { readings: AirQualityReading[]; errors: string[] } {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const csvText = XLSX.utils.sheet_to_csv(worksheet);
  return parseCSVData(csvText);
}

/**
 * Compute aggregate statistics and identify hotspots across datasets
 */
export function computeSummary(readings: AirQualityReading[]): AirQualitySummary {
  if (readings.length === 0) {
    return {
      totalReadings: 0,
      locationsCount: 0,
      avgPm25: 0,
      maxPm25: 0,
      avgPm10: 0,
      maxAqi: 0,
      hotspots: [],
      anomaliesDetected: 0,
      dateRange: { start: "N/A", end: "N/A" },
    };
  }

  const validPm25 = readings.filter((r) => r.pm25 !== null && r.pm25 !== undefined).map((r) => r.pm25 as number);
  const validPm10 = readings.filter((r) => r.pm10 !== null && r.pm10 !== undefined).map((r) => r.pm10 as number);
  const validAqi = readings.filter((r) => r.aqi !== null && r.aqi !== undefined).map((r) => r.aqi as number);

  const avgPm25 = validPm25.length > 0 ? Math.round(validPm25.reduce((a, b) => a + b, 0) / validPm25.length) : 0;
  const maxPm25 = validPm25.length > 0 ? Math.max(...validPm25) : 0;

  const avgPm10 = validPm10.length > 0 ? Math.round(validPm10.reduce((a, b) => a + b, 0) / validPm10.length) : 0;
  const maxAqi = validAqi.length > 0 ? Math.max(...validAqi) : 0;

  const locations = Array.from(new Set(readings.map((r) => r.location)));

  // Identify locations where average PM2.5 or AQI exceeds high threshold
  const locationAverages: Record<string, { pm25Sum: number; count: number }> = {};
  readings.forEach((r) => {
    if (r.pm25 !== null && r.pm25 !== undefined) {
      if (!locationAverages[r.location]) locationAverages[r.location] = { pm25Sum: 0, count: 0 };
      locationAverages[r.location].pm25Sum += r.pm25;
      locationAverages[r.location].count += 1;
    }
  });

  const hotspots = Object.entries(locationAverages)
    .filter(([_, stats]) => stats.count > 0 && stats.pm25Sum / stats.count >= 150)
    .sort((a, b) => b[1].pm25Sum / b[1].count - a[1].pm25Sum / a[1].count)
    .map(([loc]) => loc);

  const anomaliesDetected = readings.filter((r) => r.sensorStatus !== "VALID").length;

  return {
    totalReadings: readings.length,
    locationsCount: locations.length,
    avgPm25,
    maxPm25,
    avgPm10,
    maxAqi,
    hotspots,
    anomaliesDetected,
    dateRange: {
      start: readings[0]?.timestamp || "N/A",
      end: readings[readings.length - 1]?.timestamp || "N/A",
    },
  };
}
