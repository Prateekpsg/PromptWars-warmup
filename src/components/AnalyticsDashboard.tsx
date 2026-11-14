"use client";

import React, { useState } from "react";
import { AirQualityReading, AirQualitySummary } from "@/types/airQuality";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, AreaChart, Area, Line,
} from "recharts";
import { Activity, MapPin, Gauge, ShieldCheck } from "lucide-react";

interface Props { readings: AirQualityReading[]; summary: AirQualitySummary; }

const GRID_COLOR = "var(--aero-border)";
const AXIS_COLOR = "var(--aero-text-muted)";

const tooltipStyle = {
  backgroundColor: "var(--aero-surface)",
  border: "1px solid var(--aero-border)",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "var(--aero-shadow-md)",
  color: "var(--aero-text-primary)",
};

export const AnalyticsDashboard: React.FC<Props> = ({ readings, summary }) => {
  const [metric, setMetric] = useState<"pm25" | "aqi">("pm25");

  const locationMap: Record<string, { location: string; pm25: number; pm10: number; aqi: number; count: number }> = {};
  readings.forEach((r) => {
    if (!locationMap[r.location])
      locationMap[r.location] = { location: r.location, pm25: 0, pm10: 0, aqi: 0, count: 0 };
    if (r.pm25 != null) locationMap[r.location].pm25 += r.pm25;
    if (r.pm10 != null) locationMap[r.location].pm10 += r.pm10;
    if (r.aqi != null) locationMap[r.location].aqi += r.aqi;
    locationMap[r.location].count += 1;
  });

  const locationData = Object.values(locationMap).map((d) => ({
    location: d.location.length > 18 ? d.location.slice(0, 16) + "…" : d.location,
    pm25: Math.round(d.pm25 / (d.count || 1)),
    pm10: Math.round(d.pm10 / (d.count || 1)),
    aqi: Math.round(d.aqi / (d.count || 1)),
  }));

  const timelineData = readings.map((r, i) => ({
    time: r.timestamp.includes(" ") ? r.timestamp.split(" ")[1] : `T${i + 1}`,
    pm25: r.pm25 || 0,
    aqi: r.aqi || 0,
  }));

  const getAQIBand = (v: number) => {
    if (v <= 50)  return { label: "Good",      cls: "sev-good" };
    if (v <= 100) return { label: "Satisfactory", cls: "sev-good" };
    if (v <= 200) return { label: "Moderate",  cls: "sev-moderate" };
    if (v <= 300) return { label: "Poor",      cls: "sev-poor" };
    if (v <= 400) return { label: "Very Poor", cls: "sev-verypoor" };
    return { label: "Severe+", cls: "sev-severe" };
  };

  const aqiBand = getAQIBand(summary.maxAqi);
  const integrityPct = Math.round(((readings.length - summary.anomaliesDetected) / (readings.length || 1)) * 100);

  const statCards = [
    {
      label: "Mean PM2.5", value: `${summary.avgPm25}`, unit: "µg/m³",
      sub: "WHO 24h Standard: 15 µg/m³", subColor: "#f59e0b",
      accent: "#6366f1", icon: Activity,
    },
    {
      label: "Peak AQI", value: `${summary.maxAqi}`, unit: aqiBand.label,
      sub: "Public Health Risk Level", subColor: "var(--aero-text-secondary)",
      accent: "#f43f5e", icon: Gauge,
    },
    {
      label: "Critical Hotspots", value: `${summary.hotspots.length}`, unit: `/ ${summary.locationsCount} zones`,
      sub: summary.hotspots[0] || "None detected", subColor: "#f59e0b",
      accent: "#f59e0b", icon: MapPin,
    },
    {
      label: "Data Integrity", value: `${integrityPct}%`, unit: "validated",
      sub: `${summary.anomaliesDetected} anomalies flagged`, subColor: "#ef4444",
      accent: "#10b981", icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="aero-stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="aero-section-label" style={{ color: "var(--aero-text-muted)" }}>{card.label}</span>
                <div className="p-1.5 rounded-lg" style={{ background: `${card.accent}18`, color: card.accent }}>
                  <Icon size={14} />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black" style={{ color: card.accent }}>{card.value}</span>
                <span className="text-xs" style={{ color: "var(--aero-text-muted)" }}>{card.unit}</span>
              </div>
              <div className="mt-2.5 pt-2.5 border-t flex items-center justify-between text-[11px]"
                style={{ borderColor: "var(--aero-border)", color: "var(--aero-text-muted)" }}>
                <span className="truncate">{card.sub.length > 22 ? card.sub.slice(0, 20) + "…" : card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <div className="aero-card p-5 space-y-4">
          <div className="flex items-start justify-between gap-2 flex-wrap border-b pb-3" style={{ borderColor: "var(--aero-border)" }}>
            <div>
              <h3 className="text-sm font-bold" style={{ color: "var(--aero-text-primary)" }}>Spatial Distribution</h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--aero-text-muted)" }}>Comparative pollutant load by zone</p>
            </div>
            <div className="flex gap-1 p-1 rounded-lg border" style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-border)" }}>
              {(["pm25", "aqi"] as const).map((m) => (
                <button key={m} onClick={() => setMetric(m)}
                  className="text-[11px] px-2.5 py-1 rounded-md font-semibold transition-all"
                  style={metric === m
                    ? { background: "var(--aero-accent)", color: "white" }
                    : { color: "var(--aero-text-muted)", background: "transparent" }}>
                  {m === "pm25" ? "PM2.5 / PM10" : "AQI Index"}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData} margin={{ top: 5, right: 5, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} opacity={0.5} />
                <XAxis dataKey="location" stroke={AXIS_COLOR} fontSize={10} angle={-20} textAnchor="end" />
                <YAxis stroke={AXIS_COLOR} fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px", color: "var(--aero-text-secondary)" }} />
                {metric === "pm25" ? (
                  <>
                    <Bar dataKey="pm25" name="PM2.5" fill="#6366f1" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="pm10" name="PM10" fill="#0ea5e9" radius={[5, 5, 0, 0]} />
                  </>
                ) : (
                  <Bar dataKey="aqi" name="AQI" fill="#f43f5e" radius={[5, 5, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart */}
        <div className="aero-card p-5 space-y-4">
          <div className="flex items-start justify-between gap-2 border-b pb-3" style={{ borderColor: "var(--aero-border)" }}>
            <div>
              <h3 className="text-sm font-bold" style={{ color: "var(--aero-text-primary)" }}>Temporal Trajectory</h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--aero-text-muted)" }}>Chronological pollutant curve</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-1 rounded-lg border"
              style={{ background: "var(--aero-accent-bg)", color: "var(--aero-accent)", borderColor: "var(--aero-accent-border)" }}>
              {readings.length} pts
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 5, right: 5, left: -20, bottom: 10 }}>
                <defs>
                  <linearGradient id="gAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} opacity={0.5} />
                <XAxis dataKey="time" stroke={AXIS_COLOR} fontSize={10} />
                <YAxis stroke={AXIS_COLOR} fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px", color: "var(--aero-text-secondary)" }} />
                <Area type="monotone" dataKey="aqi" name="AQI" stroke="#f43f5e" strokeWidth={2} fill="url(#gAqi)" />
                <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="#818cf8" strokeWidth={2} dot={{ r: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
