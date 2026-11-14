"use client";

import React, { useState } from "react";
import { AirQualityReading, AirQualitySummary } from "@/types/airQuality";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Activity,
  MapPin,
  Gauge,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";

interface AnalyticsDashboardProps {
  readings: AirQualityReading[];
  summary: AirQualitySummary;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ readings, summary }) => {
  const [selectedMetric, setSelectedMetric] = useState<"pm25" | "pm10" | "aqi">("pm25");

  // Aggregate pollutant averages per location for Bar Chart
  const locationDataMap: Record<string, { location: string; pm25: number; pm10: number; aqi: number; count: number }> = {};
  readings.forEach((r) => {
    if (!locationDataMap[r.location]) {
      locationDataMap[r.location] = { location: r.location, pm25: 0, pm10: 0, aqi: 0, count: 0 };
    }
    if (r.pm25 !== null && r.pm25 !== undefined) locationDataMap[r.location].pm25 += r.pm25;
    if (r.pm10 !== null && r.pm10 !== undefined) locationDataMap[r.location].pm10 += r.pm10;
    if (r.aqi !== null && r.aqi !== undefined) locationDataMap[r.location].aqi += r.aqi;
    locationDataMap[r.location].count += 1;
  });

  const locationChartData = Object.values(locationDataMap).map((item) => ({
    location: item.location.length > 20 ? item.location.slice(0, 18) + "…" : item.location,
    pm25: Math.round(item.pm25 / (item.count || 1)),
    pm10: Math.round(item.pm10 / (item.count || 1)),
    aqi: Math.round(item.aqi / (item.count || 1)),
  }));

  // Timeline readings for Progression curve
  const timelineData = readings.map((r, i) => ({
    time: r.timestamp.includes(" ") ? r.timestamp.split(" ")[1] : `Point ${i + 1}`,
    location: r.location,
    pm25: r.pm25 || 0,
    pm10: r.pm10 || 0,
    aqi: r.aqi || 0,
    no2: r.no2 || 0,
  }));

  const getAQIBand = (aqi: number) => {
    if (aqi <= 50) return { label: "Good", color: "text-emerald-400", bg: "bg-emerald-950/40 border-emerald-800/60" };
    if (aqi <= 100) return { label: "Satisfactory", color: "text-green-400", bg: "bg-green-950/40 border-green-800/60" };
    if (aqi <= 200) return { label: "Moderate", color: "text-amber-400", bg: "bg-amber-950/40 border-amber-800/60" };
    if (aqi <= 300) return { label: "Poor", color: "text-orange-400", bg: "bg-orange-950/40 border-orange-800/60" };
    if (aqi <= 400) return { label: "Very Poor", color: "text-rose-400", bg: "bg-rose-950/40 border-rose-800/60" };
    return { label: "Severe+", color: "text-purple-400", bg: "bg-purple-950/40 border-purple-800/60" };
  };

  const aqiBand = getAQIBand(summary.maxAqi);

  return (
    <div className="space-y-6">
      {/* Enterprise Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Mean PM2.5 */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Mean Particulate PM2.5</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{summary.avgPm25}</span>
            <span className="text-xs text-slate-400 font-medium">µg/m³</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">WHO Standard (24h)</span>
            <span className="text-amber-400 font-mono font-semibold">15 µg/m³</span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 2: Peak AQI & Hazard Level */}
        <div className={`p-5 rounded-3xl border ${aqiBand.bg} relative overflow-hidden group transition-all shadow-xl`}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
            <span className={aqiBand.color}>Peak AQI Index</span>
            <div className={`p-2 rounded-xl bg-black/20 ${aqiBand.color}`}>
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tracking-tight ${aqiBand.color}`}>{summary.maxAqi}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-black/40 text-slate-200">
              {aqiBand.label}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/60">
            <span className="text-slate-400">Public Health Risk</span>
            <span className={`font-semibold ${aqiBand.color}`}>High Alert Status</span>
          </div>
        </div>

        {/* Card 3: Hotspot Nodes */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Critical Hotspot Nodes</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-300 tracking-tight">{summary.hotspots.length}</span>
            <span className="text-xs text-slate-400">/ {summary.locationsCount} spatial zones</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Top Hotspot</span>
            <span className="text-amber-200 font-semibold truncate max-w-[140px]">
              {summary.hotspots[0] || "None detected"}
            </span>
          </div>
        </div>

        {/* Card 4: Sensor Ingestion Quality Audit */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Data Ingestion Integrity</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              {Math.round(((readings.length - summary.anomaliesDetected) / (readings.length || 1)) * 100)}%
            </span>
            <span className="text-xs text-slate-400">Validated</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Anomalies Detected</span>
            <span className="text-rose-300 font-mono font-semibold">
              {summary.anomaliesDetected} suspect rows
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Charting Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spatial Distribution Bar Chart */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Spatial Concentration Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Comparative particulate load across monitored zones</p>
            </div>
            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
              <button
                onClick={() => setSelectedMetric("pm25")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedMetric === "pm25" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                PM2.5 & PM10
              </button>
              <button
                onClick={() => setSelectedMetric("aqi")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedMetric === "aqi" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                AQI Index
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {selectedMetric === "pm25" ? (
                <BarChart data={locationChartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="location" stroke="#64748b" fontSize={10} angle={-20} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                  <Bar dataKey="pm25" name="PM2.5 (Fine)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pm10" name="PM10 (Coarse)" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={locationChartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="location" stroke="#64748b" fontSize={10} angle={-20} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                  <Bar dataKey="aqi" name="Calculated AQI" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temporal Trajectory & Inversion Chart */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Temporal Trajectory Curve
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Chronological sensor readings across diurnal cycles</p>
            </div>
            <div className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-xl border border-indigo-900/50">
              {readings.length} Chrono-Points
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <defs>
                  <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPm25" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  name="AQI Hazard Curve"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAqi)"
                />
                <Line
                  type="monotone"
                  dataKey="pm25"
                  name="PM2.5 Trajectory"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
