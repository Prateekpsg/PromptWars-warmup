"use client";

import React, { useState } from "react";
import { DataIngestion } from "@/components/DataIngestion";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { BriefingViewer } from "@/components/BriefingViewer";
import { useTheme } from "@/components/ThemeProvider";
import { parseCSVData, computeSummary } from "@/services/dataProcessor";
import { AirQualityReading, AirQualitySummary, BriefingReport, TargetPersona } from "@/types/airQuality";
import {
  Wind, Sparkles, Database, GitFork, Info, CheckCircle2,
  AlertTriangle, Radio, Lock, Sun, Moon, X,
} from "lucide-react";

export default function Home() {
  const { theme, toggle } = useTheme();

  const [csvText, setCsvText] = useState("");
  const [previousCsvText, setPreviousCsvText] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<TargetPersona>("MUNICIPAL_WARD");
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

  const handleFetchLiveTelemetry = async (): Promise<string | null> => {
    setIsFetchingLive(true);
    setApiWarning(undefined);
    setErrorMsg(undefined);
    try {
      const res = await fetch("/api/live-telemetry");
      const data = await res.json();
      if (!res.ok || !data.csvData) throw new Error(data.error || "Failed to fetch live data");
      setCsvText(data.csvData);
      const parsed = parseCSVData(data.csvData);
      setReadings(parsed.readings);
      setSummary(computeSummary(parsed.readings));
      setApiWarning(`✓ Synchronized ${parsed.readings.length} real-time readings across ${data.stationCount} regional monitoring stations.`);
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
        if (!fetched) throw new Error("No data available. Please upload a CSV or ensure live station connectivity.");
        activeCsv = fetched;
      }
      const parsed = parseCSVData(activeCsv);
      if (parsed.readings.length === 0)
        throw new Error("Dataset contains no valid rows. Please check column formatting.");
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
      if (!res.ok) throw new Error(data.error || "Briefing generation failed");
      setBriefingReport(data.report);
      setUsingFallback(data.usingFallback);
      if (data.warning) setApiWarning(data.warning);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--aero-bg)", color: "var(--aero-text-primary)" }}>

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
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)", boxShadow: "0 4px 12px rgb(79 70 229 / 0.35)" }}>
              <Wind className="w-4.5 h-4.5" size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-widest" style={{ color: "var(--aero-text-primary)" }}>AERO</span>
                <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ background: "var(--aero-accent-bg)", color: "var(--aero-accent)", borderColor: "var(--aero-accent-border)" }}>
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[11px] hidden sm:block" style={{ color: "var(--aero-text-muted)" }}>
                Civic Air Quality Intelligence Studio
              </p>
            </div>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowArchitectureModal(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border theme-transition"
              style={{ color: "var(--aero-text-secondary)", borderColor: "var(--aero-border)", background: "var(--aero-surface-2)" }}
            >
              <Info size={14} />
              Architecture
            </button>
            <a
              href="https://github.com/Prateekpsg/PromptWars-warmup.git"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border theme-transition"
              style={{ color: "var(--aero-text-secondary)", borderColor: "var(--aero-border)", background: "var(--aero-surface-2)" }}
            >
              <GitFork size={14} />
              GitHub
            </a>

            {/* Theme Toggle */}
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors duration-200"
              style={{ borderColor: "var(--aero-border)", background: "var(--aero-surface-2)", color: "var(--aero-text-secondary)" }}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Hero Banner */}
        <div
          className="rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 theme-transition"
          style={{
            background: theme === "dark"
              ? "linear-gradient(135deg, #0d1526 0%, #111c30 50%, #0d1526 100%)"
              : "linear-gradient(135deg, #eef2ff 0%, #f0f9ff 50%, #eef2ff 100%)",
            border: "1px solid var(--aero-accent-border)",
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: "var(--aero-accent-bg)", color: "var(--aero-accent)", border: "1px solid var(--aero-accent-border)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Enterprise Air Defense Protocol
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black leading-tight" style={{ color: "var(--aero-text-primary)" }}>
              Convert Sensor Telemetry into<br className="hidden sm:block" />
              <span style={{ color: "var(--aero-accent)" }}> Traceable Civic Directives</span>
            </h1>
            <p className="text-sm max-w-2xl leading-relaxed" style={{ color: "var(--aero-text-secondary)" }}>
              Engineered for Municipal Ward Authorities, Residential Welfare Associations, and Educational Campuses. Live atmospheric ingestion, Gemini GenAI synthesis, and bilingual advisories — production-ready.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border"
              style={{ background: "var(--aero-surface)", borderColor: "var(--aero-border)", color: "var(--aero-success)" }}>
              <Lock size={13} />
              Enterprise Ready
            </span>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="flex items-start gap-3 p-4 rounded-xl border text-sm theme-transition"
            style={{ background: theme === "dark" ? "#450a0a" : "#fef2f2", borderColor: theme === "dark" ? "#7f1d1d" : "#fecaca", color: theme === "dark" ? "#fca5a5" : "#991b1b" }}>
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span className="flex-1">{errorMsg}</span>
            <button onClick={() => setErrorMsg(undefined)}><X size={15} /></button>
          </div>
        )}

        {/* Info/Success Banner */}
        {apiWarning && !errorMsg && (
          <div className="flex items-start gap-3 p-4 rounded-xl border text-sm theme-transition"
            style={{ background: theme === "dark" ? "#052e16" : "#f0fdf4", borderColor: theme === "dark" ? "#14532d" : "#bbf7d0", color: theme === "dark" ? "#86efac" : "#166534" }}>
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span className="flex-1">{apiWarning}</span>
            <button onClick={() => setApiWarning(undefined)}><X size={15} /></button>
          </div>
        )}

        {/* Data Ingestion Card */}
        <section>
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
          />
        </section>

        {/* Raw Data Table */}
        {showRawTable && readings.length > 0 && (
          <section className="aero-card overflow-hidden theme-transition">
            <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "var(--aero-border)" }}>
              <span className="aero-section-label">
                <Database size={13} />
                Raw Sensor Records ({readings.length} rows)
              </span>
              <span className="text-[11px]" style={{ color: "var(--aero-text-muted)" }}>Auto-schema mapped & anomaly verified</span>
            </div>
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs">
                <thead style={{ backgroundColor: "var(--aero-surface-2)", borderBottom: "1px solid var(--aero-border)" }}>
                  <tr>
                    {["ID", "Timestamp", "Location", "PM2.5", "PM10", "AQI", "NO2", "Status", "Notes"].map((h) => (
                      <th key={h} className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                        style={{ color: "var(--aero-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {readings.map((r, i) => (
                    <tr key={r.id || i}
                      className="border-b theme-transition"
                      style={{ borderColor: "var(--aero-border)" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--aero-surface-2)")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                      <td className="px-4 py-2.5 font-mono" style={{ color: "var(--aero-text-muted)" }}>{r.id}</td>
                      <td className="px-4 py-2.5 font-mono" style={{ color: "var(--aero-text-secondary)" }}>{r.timestamp}</td>
                      <td className="px-4 py-2.5 font-semibold" style={{ color: "var(--aero-text-primary)" }}>{r.location}</td>
                      <td className="px-4 py-2.5 font-bold" style={{ color: "var(--aero-accent)" }}>{r.pm25 ?? "—"}</td>
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

        {/* Analytics Dashboard */}
        {readings.length > 0 && summary && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="aero-section-label">
                <Database size={13} />
                Spatial Telemetry & Environmental Analytics
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg border"
                style={{ color: "var(--aero-text-secondary)", borderColor: "var(--aero-border)", background: "var(--aero-surface-2)" }}>
                {readings.length} records
              </span>
            </div>
            <AnalyticsDashboard readings={readings} summary={summary} />
          </section>
        )}

        {/* Briefing Output */}
        {briefingReport && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="aero-section-label">
                <Sparkles size={13} style={{ color: "#f59e0b" }} />
                Executive Intelligence Briefing
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
      <footer className="py-6 px-6 text-center text-xs border-t theme-transition"
        style={{ borderColor: "var(--aero-border)", color: "var(--aero-text-muted)", background: "var(--aero-surface)" }}>
        © 2026 <strong style={{ color: "var(--aero-text-secondary)" }}>AERO Enterprise Studio</strong> · Next.js · Tailwind CSS · Recharts · Google Gemini
      </footer>

      {/* ── Architecture Modal ── */}
      {showArchitectureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowArchitectureModal(false)}>
          <div className="aero-card-elevated w-full max-w-2xl max-h-[85vh] overflow-y-auto theme-transition"
            style={{ background: "var(--aero-surface)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--aero-border)" }}>
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--aero-text-primary)" }}>
                <Info size={16} style={{ color: "var(--aero-accent)" }} />
                Aero Enterprise Architecture
              </h3>
              <button onClick={() => setShowArchitectureModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "var(--aero-surface-2)", color: "var(--aero-text-secondary)" }}>
                <X size={15} />
              </button>
            </div>
            <div className="p-6 space-y-5 text-sm" style={{ color: "var(--aero-text-secondary)" }}>
              <div className="rounded-xl p-4 space-y-1 border" style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-border)" }}>
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--aero-accent)" }}>Production Intelligence Pipeline</div>
                <p>Aero connects to continuous regional atmospheric monitoring networks in real-time. When data is not manually uploaded, the platform automatically synchronizes with live telemetry nodes. Google Gemini GenAI converts sensor readings into legally-traceable bilingual advisory matrices.</p>
              </div>
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--aero-text-primary)" }}>End-to-End Flow</div>
                <ul className="space-y-1.5 pl-4 list-disc" style={{ color: "var(--aero-text-secondary)" }}>
                  <li><strong>Live Telemetry:</strong> Continuous API sync across urban monitoring stations (Open-Meteo / Copernicus CAMS).</li>
                  <li><strong>Manual Upload:</strong> CSV / XLSX ingestion for enterprise audit datasets.</li>
                  <li><strong>Anomaly Detection:</strong> Physical plausibility checks (PM2.5 &gt; PM10 flags).</li>
                  <li><strong>Bilingual Output:</strong> Hindi & English directives generated by Gemini GenAI.</li>
                  <li><strong>Audit Trail:</strong> Traceable report IDs with printable PDF layouts.</li>
                </ul>
              </div>
              <div className="flex items-center gap-2 p-3.5 rounded-xl border"
                style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-border)", color: "var(--aero-success)" }}>
                <CheckCircle2 size={15} className="shrink-0" />
                <span>Production-ready · GitHub CI/CD · Vercel edge deployment</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
