"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { DataIngestion } from "@/components/DataIngestion";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { BriefingViewer } from "@/components/BriefingViewer";
import { parseCSVData, computeSummary } from "@/services/dataProcessor";
import { AirQualityReading, AirQualitySummary, BriefingReport, TargetPersona } from "@/types/airQuality";
import {
  Wind,
  ShieldAlert,
  Sparkles,
  Database,
  CheckCircle,
  GitFork,
  Info,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Lock,
} from "lucide-react";

export default function Home() {
  const [csvText, setCsvText] = useState("");
  const [previousCsvText, setPreviousCsvText] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<TargetPersona>("MUNICIPAL_WARD");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showRawTable, setShowRawTable] = useState(false);
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [showManualUpload, setShowManualUpload] = useState(false);

  // Parsed telemetry states
  const [readings, setReadings] = useState<AirQualityReading[]>([]);
  const [summary, setSummary] = useState<AirQualitySummary | null>(null);
  const [briefingReport, setBriefingReport] = useState<BriefingReport | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [apiWarning, setApiWarning] = useState<string | undefined>();
  const [showArchitectureModal, setShowArchitectureModal] = useState(false);

  // Fetch real-time live atmospheric telemetry
  const handleFetchLiveTelemetry = async (): Promise<string | null> => {
    setIsFetchingLive(true);
    setApiWarning(undefined);
    try {
      const res = await fetch("/api/live-telemetry");
      const data = await res.json();
      if (!res.ok || !data.csvData) {
        throw new Error(data.error || "Failed to fetch live atmospheric sensor data");
      }
      setCsvText(data.csvData);
      const parsed = parseCSVData(data.csvData);
      setReadings(parsed.readings);
      setSummary(computeSummary(parsed.readings));
      setApiWarning(`✓ Synchronized ${parsed.readings.length} real-time atmospheric sensor readings across regional monitoring matrix.`);
      return data.csvData;
    } catch (err: any) {
      console.error("Live fetch error:", err);
      setApiWarning(`Sensor connection notice: ${err.message || "Failed to reach live telemetry stream"}.`);
      return null;
    } finally {
      setIsFetchingLive(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setApiWarning(undefined);

    try {
      let activeCsv = csvText.trim();

      // If user hasn't uploaded or provided CSV, automatically fetch live telemetry
      if (!activeCsv) {
        const fetchedCsv = await handleFetchLiveTelemetry();
        if (!fetchedCsv) {
          throw new Error("No telemetry stream provided and automatic live station fetch could not be established. Please upload a CSV.");
        }
        activeCsv = fetchedCsv;
      }

      // Re-parse current local data
      const parsed = parseCSVData(activeCsv);
      if (parsed.readings.length === 0) {
        throw new Error("Uploaded dataset contains no valid sensor rows. Please verify formatting.");
      }

      setReadings(parsed.readings);
      const computed = computeSummary(parsed.readings);
      setSummary(computed);

      // Invoke server briefing endpoint
      const res = await fetch("/api/briefings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvData: activeCsv,
          persona: selectedPersona,
          previousCsvData: previousCsvText.trim() ? previousCsvText : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate executive briefing");
      }

      setBriefingReport(data.report);
      setUsingFallback(data.usingFallback);
      if (data.warning) setApiWarning(data.warning);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setApiWarning(`Notice: ${err.message || "Network issue"}.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Banner Header */}
      <header className="border-b border-slate-800/80 sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-18 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 ring-1 ring-white/20">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-wider text-white flex items-center gap-1.5">
                  AERO
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/80 uppercase tracking-widest hidden sm:inline-block">
                  Enterprise Air Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Civic Air Quality Intelligence & Municipal Decision Directives
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowArchitectureModal(true)}
              className="text-xs px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              Architecture
            </button>
            <a
              href="https://github.com/Prateekpsg/PromptWars-warmup.git"
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1.5"
            >
              <GitFork className="w-3.5 h-3.5 text-indigo-400" />
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Project Value / Operational Context Header */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900/60 border border-indigo-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950/90 text-indigo-300 border border-indigo-800/60 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Enterprise Urban Air Defense & Decision Protocol
            </div>
            <h2 className="text-lg font-bold text-white">
              Convert Raw Sensor Data into Legally-Traceable Directives & Public Advisories
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Engineered for Municipal Ward Authorities, Residential Welfare Associations (RWAs), and Educational Campuses. Fully production-grade with live station telemetry ingestion.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-800 font-mono flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Enterprise Ready
            </span>
          </div>
        </div>

        {/* Global Warning / Notification Banner */}
        {apiWarning && (
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 text-indigo-200 text-xs flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{apiWarning}</span>
          </div>
        )}

        {/* Section 1: Ingestion Engine & Persona Selector */}
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

        {/* Section 1.5: Raw Ingestion Grid Table (Collapsible) */}
        {showRawTable && readings.length > 0 && (
          <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Raw Sensor Ingestion Records & Anomaly Verification ({readings.length} Rows)
              </h3>
              <span className="text-xs text-slate-500">Auto-schema mapped & verified</span>
            </div>

            <div className="overflow-x-auto max-h-72 border border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">PM2.5</th>
                    <th className="p-3">PM10</th>
                    <th className="p-3">AQI</th>
                    <th className="p-3">NO2</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {readings.map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 text-slate-500">{r.id}</td>
                      <td className="p-3 text-slate-300">{r.timestamp}</td>
                      <td className="p-3 font-semibold text-white">{r.location}</td>
                      <td className="p-3 text-indigo-300 font-bold">{r.pm25 ?? "-"}</td>
                      <td className="p-3 text-sky-300">{r.pm10 ?? "-"}</td>
                      <td className="p-3 text-rose-300 font-bold">{r.aqi ?? "-"}</td>
                      <td className="p-3 text-amber-300">{r.no2 ?? "-"}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.sensorStatus === "VALID"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : "bg-rose-950 text-rose-300 border border-rose-800"
                          }`}
                        >
                          {r.sensorStatus}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 truncate max-w-[200px]">{r.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Section 2: Sensor Analytics & Spatial Distribution */}
        {readings.length > 0 && summary && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Validated Spatial Telemetry & Environmental Curve
              </h3>
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                {readings.length} Synchronized Records
              </span>
            </div>
            <AnalyticsDashboard readings={readings} summary={summary} />
          </section>
        )}

        {/* Section 3: Generated Civic Intelligence Briefing */}
        {briefingReport && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Executive Civic Intelligence Output
              </h3>
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

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500 space-y-2 bg-slate-950">
        <p>
          © 2026 <strong>AERO Enterprise Studio</strong>. Powered by Next.js App Router, Tailwind CSS, Recharts & Google Gemini.
        </p>
      </footer>

      {/* Architecture Modal */}
      {showArchitectureModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                Aero Enterprise Architecture & Specifications
              </h3>
              <button
                onClick={() => setShowArchitectureModal(false)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">Production Intelligence Pipeline</div>
                <p>
                  Aero is designed for institutional and civic deployment. If live sensor files are not manually supplied, the platform seamlessly connects to continuous regional telemetry nodes. Google Gemini GenAI transforms validated sensor readings into legally-traceable action matrices and bilingual advisories.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-white text-[11px] uppercase tracking-wider">End-to-End Enterprise Flow</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li><strong>Live Telemetry Ingestion:</strong> Continuous API synchronization across urban monitoring stations.</li>
                  <li><strong>Manual Upload:</strong> Ingestion for custom CSV and XLSX enterprise audit sheets.</li>
                  <li><strong>Physical Anomaly Validation:</strong> Flagging impossible sensor readings (e.g., PM2.5 exceeding PM10).</li>
                  <li><strong>Bilingual Dissemination:</strong> Automated Hindi and English directives for authorities, parents, and citizens.</li>
                  <li><strong>Audit Trail:</strong> Traceable report generation with printable layouts.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Production ready for instant GitHub CI/CD and Vercel edge deployment.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
