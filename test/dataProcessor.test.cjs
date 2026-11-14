const test = require("node:test");
const assert = require("node:assert");
const Papa = require("papaparse");

// Testing core parsing logic
function parseCSV(csv) {
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
  const readings = parsed.data.map((row, idx) => {
    const pm25 = parseFloat(row.pm25) || 0;
    const pm10 = parseFloat(row.pm10) || 0;
    const aqi = parseFloat(row.aqi) || Math.round(pm25 * 1.35);
    const isAnomaly = pm25 > pm10 && pm10 > 0;
    return {
      id: String(idx + 1),
      location: row.location || "Unknown Node",
      pm25,
      pm10,
      aqi,
      sensorStatus: isAnomaly ? "ANOMALY" : "VALID",
    };
  });
  return readings;
}

function computeMetrics(readings) {
  if (readings.length === 0) return null;
  const pm25Values = readings.map(r => r.pm25);
  const maxPm25 = Math.max(...pm25Values);
  const avgPm25 = Math.round(pm25Values.reduce((a, b) => a + b, 0) / readings.length);
  const anomalies = readings.filter(r => r.sensorStatus === "ANOMALY").length;
  return { maxPm25, avgPm25, anomalies, total: readings.length };
}

test("Air Quality CSV Parsing & Schema Normalization", () => {
  const sample = `timestamp,location,pm25,pm10,aqi,no2,temperature,humidity,notes
2026-11-14 06:00,Zone Alpha Hub,85,120,135,28,19,62,Moderate tree cover
2026-11-14 06:00,Zone Beta Industrial,380,490,410,112,20,55,Boiler stack emissions`;

  const readings = parseCSV(sample);
  assert.strictEqual(readings.length, 2);
  assert.strictEqual(readings[0].location, "Zone Alpha Hub");
  assert.strictEqual(readings[0].sensorStatus, "VALID");
  assert.strictEqual(readings[1].sensorStatus, "VALID");

  const summary = computeMetrics(readings);
  assert.strictEqual(summary.total, 2);
  assert.strictEqual(summary.maxPm25, 380);
  assert.strictEqual(summary.avgPm25, 233);
  assert.strictEqual(summary.anomalies, 0);
});

test("Sensor Anomaly Detection: PM2.5 > PM10 constraint check", () => {
  const anomalyCsv = `timestamp,location,pm25,pm10,aqi,no2,temperature,humidity,notes
2026-11-14 06:00,Sensor Error Node,450,110,480,20,22,60,Inverted physical density`;

  const readings = parseCSV(anomalyCsv);
  assert.strictEqual(readings[0].sensorStatus, "ANOMALY");

  const summary = computeMetrics(readings);
  assert.strictEqual(summary.anomalies, 1);
});
