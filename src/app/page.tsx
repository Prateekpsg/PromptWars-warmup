"use client";

import React, { useState } from "react";
import { DataIngestion, AVAILABLE_REGIONS } from "@/components/DataIngestion";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { BriefingViewer } from "@/components/BriefingViewer";
import { useTheme } from "@/components/ThemeProvider";
import { parseCSVData, computeSummary } from "@/services/dataProcessor";
import { AirQualityReading, AirQualitySummary, BriefingReport, TargetPersona } from "@/types/airQuality";
import {
  Wind,
  Sparkles,
  Database,
  GitFork,
  Info,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Lock,
  Sun,
  Moon,
  X,
  MapPin,
} from "lucide-react";

export default function Home() {
  const { theme, toggle } = useTheme();

  const [csvText, setCsvText] = useState("");
  const [previousCsvText, setPreviousCsvText] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<TargetPersona>("MUNICIPAL_WARD");
  const [selectedRegionId, setSelectedRegionId] = useState("delhi-ncr");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showRawTable, setShowRawTable] = useState(false);
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [showManualUpload, setShowManualUpload] = useState(false);
  const [showArchitectureModal, setShowArchitectureModal] = useState(false);

  const [readings, setReadings] = useState<AirQualityReading[]>([]);
  const [summary, setSummary] = useState<AirQualitySummary | null>(null);
  const [briefingReport, setBriefingReport] = useState<BriefingReport | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [apiWarning, setApiWarning] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | undefined>();

  // Fetch real-time live telemetry for the chosen region
  const handleFetchLiveTelemetry = async (regionId = selectedRegionId): Promise<string | null> => {
    setIsFetchingLive(true);
    setApiWarning(undefined);
    setErrorMsg(undefined);
    try {
      const res = await fetch(`/api/live-telemetry?regionId=${encodeURIComponent(regionId)}`);
      const data = await res.json();
      if (!res.ok || !data.csvData) throw new Error(data.error || "Failed to fetch live regional data");
      setCsvText(data.csvData);
      const parsed = parseCSVData(data.csvData);
      setReadings(parsed.readings);
      setSummary(computeSummary(parsed.readings));
      const regionName = AVAILABLE_REGIONS.find((r) => r.id === regionId)?.name || data.city;
      setApiWarning(`✓ Synchronized ${parsed.readings.length} real-time atmospheric sensor readings across ${regionName} (${data.stationCount} CAAQMS stations).`);
      return data.csvData;
    } catch (err: any) {
      setErrorMsg(`Live station error: ${err.message}`);
      return null;
    } finally {
      setIsFetchingLive(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setApiWarning(undefined);
    setErrorMsg(undefined);
    try {
      let activeCsv = csvText.trim();
      if (!activeCsv) {
        const fetched = await handleFetchLiveTelemetry();
        if (!fetched) throw new Error("No sensor data available. Please select an area to pull live sensors or upload a CSV file.");
        activeCsv = fetched;
      }
      const parsed = parseCSVData(activeCsv);
      if (parsed.readings.length === 0)
        throw new Error("Dataset contains no valid sensor rows. Please verify formatting.");
      setReadings(parsed.readings);
      const computed = computeSummary(parsed.readings);
      setSummary(computed);

      const res = await fetch("/api/briefings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvData: activeCsv,
          persona: selectedPersona,
          previousCsvData: previousCsvText.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Executive briefing generation failed");
      setBriefingReport(data.report);
      setUsingFallback(data.usingFallback);
      if (data.warning) setApiWarning(data.warning);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during synthesis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectedRegionObj = AVAILABLE_REGIONS.find((r) => r.id === selectedRegionId) || AVAILABLE_REGIONS[0];

  return (
    <div className="min-h-screen flex flex-col theme-transition" style={{ backgroundColor: "var(--aero-bg)", color: "var(--aero-text-primary)" }}>
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 theme-transition"
        style={{
          backgroundColor: "var(--aero-surface)",
          borderBottom: "1px solid var(--aero-border)",
          boxShadow: "var(--aero-shadow-sm)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo + Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-900 shrink-0 font-bold dark:shadow-[0_0_15px_rgba(0,255,136,0.45)]"
              style={{
                background: theme === "dark" ? "#00ff88" : "linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)",
                color: theme === "dark" ? "#030712" : "#ffffff",
              }}
            >
              <Wind size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-widest" style={{ color: "var(--aero-text-primary)" }}>
                  AERO
                </span>
                <span
                  className="hidden sm:inline text-[10px] font-extrabold px-2 py-0.5 rounded-full border dark:aero-neon-pill"
                  style={{
                    background: "var(--aero-accent-bg)",
                    color: "var(--aero-neon-green)",
                    borderColor: "var(--aero-neon-green)",
                  }}
                >
                  ENTERPRISE CIVIC ENGINE
                </span>
              </div>
              <p className="text-[11px] hidden sm:block" style={{ color: "var(--aero-text-muted)" }}>
                Multi-Regional Air Quality Intelligence Studio
              </p>
            </div>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowArchitectureModal(true)}
              aria-label="View System Architecture & Specs"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border theme-transition focus-visible:ring-2"
              style={{ color: "var(--aero-text-secondary)", borderColor: "var(--aero-border)", background: "var(--aero-surface-2)" }}
            >
              <Info size={14} style={{ color: "var(--aero-neon-green)" }} />
              Architecture
            </button>
            <a
              href="https://github.com/Prateekpsg/PromptWars-warmup.git"
              target="_blank"
              rel="noreferrer"
              aria-label="View Source Code on GitHub"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border theme-transition focus-visible:ring-2"
              style={{ color: "var(--aero-text-secondary)", borderColor: "var(--aero-border)", background: "var(--aero-surface-2)" }}
            >
              <GitFork size={14} style={{ color: "var(--aero-neon-green)" }} />
              GitHub
            </a>

            {/* Theme Toggle Button */}
            <button
              onClick={toggle}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors duration-200 focus-visible:ring-2"
              style={{
                borderColor: "var(--aero-border)",
                background: "var(--aero-surface-2)",
                color: theme === "dark" ? "#00ff88" : "var(--aero-text-secondary)",
              }}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hero Operational Banner */}
        <div
          className="rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 theme-transition relative overflow-hidden"
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg, #0b1329 0%, #101c3d 50%, #0b1329 100%)"
                : "linear-gradient(135deg, #eef2ff 0%, #f0f9ff 50%, #eef2ff 100%)",
            border: theme === "dark" ? "1px solid rgba(0, 255, 136, 0.3)" : "1px solid var(--aero-accent-border)",
            boxShadow: theme === "dark" ? "0 0 25px rgba(0, 255, 136, 0.08)" : "none",
          }}
        >
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span
                className="flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full border dark:aero-neon-pill"
                style={{
                  background: "var(--aero-accent-bg)",
                  color: "var(--aero-neon-green)",
                  borderColor: "var(--aero-neon-green)",
                }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-[#00ff88] animate-pulse" />
                Multi-Sector Civic Telemetry Directive Protocol
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black leading-tight" style={{ color: "var(--aero-text-primary)" }}>
              Real-Time Atmospheric Intelligence for{" "}
              <span style={{ color: "var(--aero-neon-green)" }}>{selectedRegionObj.name}</span>
            </h1>
            <p className="text-sm max-w-2xl leading-relaxed" style={{ color: "var(--aero-text-secondary)" }}>
              Equipped with live CAAQMS telemetry streams across Delhi-NCR, Bhopal, Mumbai, and Bengaluru. Synthesizes legally-traceable action matrices and dual English & Hindi public health advisories via Google Gemini.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 relative z-10">
            <span
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border"
              style={{
                background: "var(--aero-surface)",
                borderColor: "var(--aero-border)",
                color: "var(--aero-neon-green)",
              }}
            >
              <Lock size={13} />
              Enterprise Validated
            </span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-xl border text-sm theme-transition"
            style={{
              background: theme === "dark" ? "#450a0a" : "#fef2f2",
              borderColor: theme === "dark" ? "#7f1d1d" : "#fecaca",
              color: theme === "dark" ? "#fca5a5" : "#991b1b",
            }}
          >
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span className="flex-1 font-medium">{errorMsg}</span>
            <button onClick={() => setErrorMsg(undefined)} aria-label="Dismiss error">
              <X size={15} />
            </button>
          </div>
        )}

        {/* Success / Info Telemetry Sync Notice */}
        {apiWarning && !errorMsg && (
          <div
            role="status"
            className="flex items-start gap-3 p-4 rounded-xl border text-sm theme-transition"
            style={{
              background: theme === "dark" ? "#064e3b30" : "#f0fdf4",
              borderColor: theme === "dark" ? "rgba(0, 255, 136, 0.4)" : "#bbf7d0",
              color: theme === "dark" ? "#00ff88" : "#166534",
            }}
          >
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span className="flex-1 font-medium">{apiWarning}</span>
            <button onClick={() => setApiWarning(undefined)} aria-label="Dismiss notification">
              <X size={15} />
            </button>
          </div>
        )}

        {/* Telemetry Ingestion & Region Selection Section */}
        <section aria-label="Data Ingestion & Local Area Selector">
          <DataIngestion
            csvText={csvText}
            setCsvText={setCsvText}
            previousCsvText={previousCsvText}
            setPreviousCsvText={setPreviousCsvText}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            selectedPersona={selectedPersona}
            setSelectedPersona={setSelectedPersona}
            showRawTable={showRawTable}
            setShowRawTable={setShowRawTable}
            onFetchLiveTelemetry={handleFetchLiveTelemetry}
            isFetchingLive={isFetchingLive}
            showManualUpload={showManualUpload}
            setShowManualUpload={setShowManualUpload}
            selectedRegionId={selectedRegionId}
            setSelectedRegionId={setSelectedRegionId}
          />
        </section>

        {/* Raw Ingestion Grid Table */}
        {showRawTable && readings.length > 0 && (
          <section aria-label="Raw Sensor Ingestion Records" className="aero-card overflow-hidden theme-transition">
            <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "var(--aero-border)" }}>
              <span className="aero-section-label">
                <Database size={13} style={{ color: "var(--aero-neon-green)" }} />
                Raw Telemetry Ingestion Records ({readings.length} Synchronized Rows)
              </span>
              <span className="text-[11px]" style={{ color: "var(--aero-text-muted)" }}>
                Auto-schema mapped & anomaly verified
              </span>
            </div>
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs">
                <thead style={{ backgroundColor: "var(--aero-surface-2)", borderBottom: "1px solid var(--aero-border)" }}>
                  <tr>
                    {["ID", "Timestamp", "Location", "PM2.5", "PM10", "AQI", "NO2", "Status", "Notes"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                        style={{ color: "var(--aero-text-muted)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {readings.map((r, i) => (
                    <tr
                      key={r.id || i}
                      className="border-b theme-transition"
                      style={{ borderColor: "var(--aero-border)" }}
                    >
                      <td className="px-4 py-2.5 font-mono" style={{ color: "var(--aero-text-muted)" }}>{r.id}</td>
                      <td className="px-4 py-2.5 font-mono" style={{ color: "var(--aero-text-secondary)" }}>{r.timestamp}</td>
                      <td className="px-4 py-2.5 font-semibold" style={{ color: "var(--aero-text-primary)" }}>{r.location}</td>
                      <td className="px-4 py-2.5 font-bold" style={{ color: "var(--aero-neon-green)" }}>{r.pm25 ?? "—"}</td>
                      <td className="px-4 py-2.5" style={{ color: "#0ea5e9" }}>{r.pm10 ?? "—"}</td>
                      <td className="px-4 py-2.5 font-bold" style={{ color: "#f87171" }}>{r.aqi ?? "—"}</td>
                      <td className="px-4 py-2.5" style={{ color: "#fbbf24" }}>{r.no2 ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.sensorStatus === "VALID" ? "sev-good" : "sev-severe"}`}>
                          {r.sensorStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 max-w-[180px] truncate" style={{ color: "var(--aero-text-muted)" }}>{r.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Analytics & Spatial Charts */}
        {readings.length > 0 && summary && (
          <section aria-label="Spatial & Temporal Analytics" className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="aero-section-label">
                <Database size={13} style={{ color: "var(--aero-neon-green)" }} />
                Spatial Telemetry & Environmental Curve ({selectedRegionObj.name})
              </span>
              <span
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg border dark:aero-neon-pill"
                style={{
                  color: "var(--aero-text-secondary)",
                  borderColor: "var(--aero-border)",
                  background: "var(--aero-surface-2)",
                }}
              >
                {readings.length} Records Verified
              </span>
            </div>
            <AnalyticsDashboard readings={readings} summary={summary} />
          </section>
        )}

        {/* Executive Directive Output */}
        {briefingReport && (
          <section aria-label="Executive Intelligence Output" className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="aero-section-label">
                <Sparkles size={13} style={{ color: "var(--aero-neon-green)" }} />
                Executive Civic Intelligence Output ({selectedRegionObj.name})
              </span>
            </div>
            <BriefingViewer
              report={briefingReport}
              persona={selectedPersona}
              usingFallback={usingFallback}
              warning={apiWarning}
            />
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer
        className="py-6 px-6 text-center text-xs border-t theme-transition"
        style={{ borderColor: "var(--aero-border)", color: "var(--aero-text-muted)", background: "var(--aero-surface)" }}
      >
        © 2026 <strong style={{ color: "var(--aero-text-secondary)" }}>AERO Enterprise Civic Studio</strong> · Regional Ingestion: Delhi-NCR, Bhopal, Mumbai, Bengaluru · Powered by Google Gemini GenAI
      </footer>

      {/* ── Architecture Modal ── */}
      {showArchitectureModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowArchitectureModal(false)}
        >
          <div
            className="aero-card-elevated w-full max-w-2xl max-h-[85vh] overflow-y-auto theme-transition"
            style={{ background: "var(--aero-surface)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--aero-border)" }}>
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--aero-text-primary)" }}>
                <Info size={16} style={{ color: "var(--aero-neon-green)" }} />
                Aero Enterprise Architecture & Verification Matrix
              </h3>
              <button
                onClick={() => setShowArchitectureModal(false)}
                aria-label="Close modal"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "var(--aero-surface-2)", color: "var(--aero-text-secondary)" }}
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-6 space-y-5 text-sm" style={{ color: "var(--aero-text-secondary)" }}>
              <div
                className="rounded-xl p-4 space-y-1 border"
                style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-border)" }}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--aero-neon-green)" }}>
                  Multi-Sector Regional Intelligence Pipeline
                </div>
                <p>
                  Aero provides localized atmospheric monitoring for Indian urban matrices (Delhi-NCR, Bhopal, Mumbai, Bengaluru). Real-time telemetry is ingested via Copernicus CAMS & Open-Meteo, checked against physical sensor constraints, and synthesized by Google Gemini into persona-directed actions.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--aero-text-primary)" }}>
                  System Reliability Pillars
                </div>
                <ul className="space-y-1.5 pl-4 list-disc" style={{ color: "var(--aero-text-secondary)" }}>
                  <li><strong>Local Area Selection:</strong> Instant live station switching across metropolitan regions.</li>
                  <li><strong>Security Middleware:</strong> Strict CSP, nosniff, frame-guard, and conditional OAuth headers.</li>
                  <li><strong>Zero Mock Data:</strong> Production workflow powered by real atmospheric sensors or user uploads.</li>
                  <li><strong>Automated Testing:</strong> Native unit test suite verifying data validation and anomaly heuristics.</li>
                </ul>
              </div>
              <div
                className="flex items-center gap-2 p-3.5 rounded-xl border dark:aero-neon-pill"
                style={{
                  background: "var(--aero-surface-2)",
                  borderColor: "var(--aero-border)",
                  color: "var(--aero-neon-green)",
                }}
              >
                <CheckCircle2 size={15} className="shrink-0" />
                <span>Production grade · High accessibility (WCAG AA) · Verified CI/CD</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
