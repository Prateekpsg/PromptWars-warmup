"use client";

import React, { useState } from "react";
import {
  UploadCloud, FileSpreadsheet, AlertCircle, Building2, Home,
  GraduationCap, Sparkles, Radio, Table, ChevronDown, ChevronUp,
} from "lucide-react";
import * as XLSX from "xlsx";
import { TargetPersona } from "@/types/airQuality";

interface DataIngestionProps {
  csvText: string;
  setCsvText: (text: string) => void;
  previousCsvText: string;
  setPreviousCsvText: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  selectedPersona: TargetPersona;
  setSelectedPersona: (p: TargetPersona) => void;
  showRawTable: boolean;
  setShowRawTable: (show: boolean) => void;
  onFetchLiveTelemetry: () => void;
  isFetchingLive: boolean;
  showManualUpload: boolean;
  setShowManualUpload: (show: boolean) => void;
}

export const DataIngestion: React.FC<DataIngestionProps> = ({
  csvText, setCsvText, previousCsvText, setPreviousCsvText,
  onAnalyze, isAnalyzing, selectedPersona, setSelectedPersona,
  showRawTable, setShowRawTable, onFetchLiveTelemetry, isFetchingLive,
  showManualUpload, setShowManualUpload,
}) => {
  const [activeTab, setActiveTab] = useState<"current" | "previous">("current");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isBaseline: boolean) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "csv" || ext === "txt") {
      const reader = new FileReader();
      reader.onload = ev => {
        const content = ev.target?.result as string;
        isBaseline ? setPreviousCsvText(content) : setCsvText(content);
      };
      reader.readAsText(file);
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const wb = XLSX.read(ev.target?.result as ArrayBuffer, { type: "array" });
          const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);
          isBaseline ? setPreviousCsvText(csv) : setCsvText(csv);
        } catch {
          setUploadError("Failed to parse Excel file. Please verify sheet formatting.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setUploadError("Unsupported format. Accepted: .csv, .xlsx, .xls, .txt");
    }
  };

  const personas = [
    { id: "MUNICIPAL_WARD" as TargetPersona, title: "Municipal Ward Authority", role: "Public Works & Urban Enforcement", icon: Building2, badge: "Gov / CPCB" },
    { id: "RWA_HOUSING" as TargetPersona, title: "Housing Society / RWA", role: "Resident Safety & Estate Management", icon: Home, badge: "Community" },
    { id: "EDUCATIONAL_INSTITUTION" as TargetPersona, title: "Educational Campus", role: "Student Exposure & Activity Controls", icon: GraduationCap, badge: "Campus" },
  ];

  const currentCount = csvText.trim() ? Math.max(0, csvText.trim().split("\n").filter(Boolean).length - 1) : 0;
  const previousCount = previousCsvText.trim() ? Math.max(0, previousCsvText.trim().split("\n").filter(Boolean).length - 1) : 0;
  const hasData = currentCount > 0;

  return (
    <div className="aero-card-elevated p-5 sm:p-7 space-y-7 theme-transition" style={{ background: "var(--aero-surface)" }}>

      {/* ── 1. Persona Selector ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="aero-section-label">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--aero-accent)" }} />
            Operational Persona
          </label>
          <span className="text-[11px]" style={{ color: "var(--aero-text-muted)" }}>Sets briefing tone, thresholds & directives</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {personas.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p.id)}
                className="text-left p-4 rounded-xl border-2 transition-all duration-150 relative overflow-hidden group"
                style={{
                  borderColor: isSelected ? "var(--aero-accent)" : "var(--aero-border)",
                  background: isSelected ? "var(--aero-accent-bg)" : "var(--aero-surface-2)",
                  boxShadow: isSelected ? "0 0 0 3px var(--aero-accent-border)" : "none",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg transition-colors"
                    style={{ background: isSelected ? "var(--aero-accent)" : "var(--aero-border)", color: isSelected ? "white" : "var(--aero-text-secondary)" }}>
                    <Icon size={16} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      background: isSelected ? "var(--aero-accent-bg)" : "transparent",
                      color: isSelected ? "var(--aero-accent)" : "var(--aero-text-muted)",
                      borderColor: isSelected ? "var(--aero-accent-border)" : "var(--aero-border)",
                    }}>
                    {p.badge}
                  </span>
                </div>
                <div className="text-sm font-bold" style={{ color: isSelected ? "var(--aero-accent)" : "var(--aero-text-primary)" }}>{p.title}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--aero-text-muted)" }}>{p.role}</div>
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, var(--aero-accent), #0ea5e9)" }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Telemetry Controls ── */}
      <div className="space-y-4 pt-5 border-t" style={{ borderColor: "var(--aero-border)" }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--aero-text-primary)" }}>
              <UploadCloud size={15} style={{ color: "var(--aero-accent)" }} />
              Sensor Telemetry Ingestion
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--aero-text-muted)" }}>
              Auto-syncs live station feeds · Supports custom CSV / XLSX enterprise uploads
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onFetchLiveTelemetry}
              disabled={isFetchingLive}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all"
              style={{
                background: "linear-gradient(135deg, #059669, #0d9488)",
                color: "white",
                boxShadow: "0 4px 12px rgb(5 150 105 / 0.3)",
                opacity: isFetchingLive ? 0.7 : 1,
              }}
            >
              <Radio size={13} className={isFetchingLive ? "animate-spin" : ""} />
              {isFetchingLive ? "Fetching…" : "Pull Live Telemetry"}
            </button>

            <button
              onClick={() => setShowManualUpload(!showManualUpload)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all"
              style={{
                borderColor: showManualUpload ? "var(--aero-accent)" : "var(--aero-border)",
                background: showManualUpload ? "var(--aero-accent-bg)" : "var(--aero-surface-2)",
                color: showManualUpload ? "var(--aero-accent)" : "var(--aero-text-secondary)",
              }}
            >
              <FileSpreadsheet size={13} />
              Manual Upload
              {showManualUpload ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {hasData && (
              <button
                onClick={() => setShowRawTable(!showRawTable)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all"
                style={{
                  borderColor: showRawTable ? "var(--aero-accent)" : "var(--aero-border)",
                  background: showRawTable ? "var(--aero-accent-bg)" : "var(--aero-surface-2)",
                  color: showRawTable ? "var(--aero-accent)" : "var(--aero-text-secondary)",
                }}
              >
                <Table size={13} />
                {showRawTable ? "Hide Grid" : "Inspect Grid"}
              </button>
            )}
          </div>
        </div>

        {/* Status pill */}
        <div className="flex items-center justify-between p-3 rounded-xl border theme-transition"
          style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-border)" }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--aero-text-secondary)" }}>
            <span className={`w-2 h-2 rounded-full ${hasData ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            {hasData
              ? `${currentCount} verified sensor records loaded and ready for analysis.`
              : "No data stream active. Click 'Pull Live Telemetry' or toggle 'Manual Upload'."}
          </div>
          {hasData && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg border"
              style={{ background: "var(--aero-accent-bg)", color: "var(--aero-accent)", borderColor: "var(--aero-accent-border)" }}>
              Ready
            </span>
          )}
        </div>

        {/* Manual Upload Drawer */}
        {showManualUpload && (
          <div className="rounded-xl border p-5 space-y-4 theme-transition"
            style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-accent-border)" }}>
            {/* Stream tabs */}
            <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-3" style={{ borderColor: "var(--aero-border)" }}>
              <div className="flex gap-1.5">
                {(["current", "previous"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="aero-tab"
                    style={activeTab === tab ? { background: "var(--aero-accent)", color: "white" } : {}}
                  >
                    {tab === "current" ? `Active Stream (${currentCount})` : `Baseline Reference (${previousCount})`}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-colors"
                style={{ borderColor: "var(--aero-border)", background: "var(--aero-surface)", color: "var(--aero-text-secondary)" }}>
                <FileSpreadsheet size={13} style={{ color: "#10b981" }} />
                Upload (.csv / .xlsx)
                <input type="file" accept=".csv,.xlsx,.xls,.txt" className="hidden"
                  onChange={e => handleFileUpload(e, activeTab === "previous")} />
              </label>
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 p-3 rounded-lg text-xs border"
                style={{ background: "#450a0a", borderColor: "#7f1d1d", color: "#fca5a5" }}>
                <AlertCircle size={13} className="shrink-0" />
                {uploadError}
              </div>
            )}

            <textarea
              rows={6}
              value={activeTab === "current" ? csvText : previousCsvText}
              onChange={e => activeTab === "current" ? setCsvText(e.target.value) : setPreviousCsvText(e.target.value)}
              placeholder="timestamp,location,pm25,pm10,aqi,no2,temperature,humidity,notes"
              className="aero-input"
            />
            <p className="text-[11px]" style={{ color: "var(--aero-text-muted)" }}>
              Expected columns: timestamp · location · pm25 · pm10 · aqi · no2 · temperature · humidity · notes
            </p>
          </div>
        )}
      </div>

      {/* ── 3. Generate CTA ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t" style={{ borderColor: "var(--aero-border)" }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--aero-text-muted)" }}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          If no CSV is loaded, live telemetry is auto-fetched before briefing generation.
        </div>
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="aero-btn-primary flex items-center gap-2.5 w-full sm:w-auto justify-center"
        >
          {isAnalyzing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Synthesizing Briefing…
            </>
          ) : (
            <>
              <Sparkles size={15} style={{ color: "#fcd34d" }} />
              Generate Executive Intelligence Briefing
            </>
          )}
        </button>
      </div>
    </div>
  );
};
