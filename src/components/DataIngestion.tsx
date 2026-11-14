"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  Building2,
  Home,
  GraduationCap,
  Sparkles,
  Radio,
  Table,
  ChevronDown,
  ChevronUp,
  MapPin,
  Globe,
} from "lucide-react";
import * as XLSX from "xlsx";
import { TargetPersona } from "@/types/airQuality";

export interface RegionOption {
  id: string;
  name: string;
  state: string;
  stationCount: number;
}

export const AVAILABLE_REGIONS: RegionOption[] = [
  { id: "delhi-ncr", name: "Delhi-NCR", state: "National Capital Region", stationCount: 4 },
  { id: "bhopal-metro", name: "Bhopal", state: "Madhya Pradesh", stationCount: 4 },
  { id: "mumbai-metro", name: "Mumbai Metropolitan", state: "Maharashtra", stationCount: 4 },
  { id: "bengaluru-urban", name: "Bengaluru Tech Corridor", state: "Karnataka", stationCount: 4 },
];

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
  onFetchLiveTelemetry: (regionId?: string) => void;
  isFetchingLive: boolean;
  showManualUpload: boolean;
  setShowManualUpload: (show: boolean) => void;
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
}

export const DataIngestion: React.FC<DataIngestionProps> = ({
  csvText,
  setCsvText,
  previousCsvText,
  setPreviousCsvText,
  onAnalyze,
  isAnalyzing,
  selectedPersona,
  setSelectedPersona,
  showRawTable,
  setShowRawTable,
  onFetchLiveTelemetry,
  isFetchingLive,
  showManualUpload,
  setShowManualUpload,
  selectedRegionId,
  setSelectedRegionId,
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
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        isBaseline ? setPreviousCsvText(content) : setCsvText(content);
      };
      reader.readAsText(file);
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (ev) => {
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
      setUploadError("Unsupported format. Accepted formats: .csv, .xlsx, .xls, .txt");
    }
  };

  const personas = [
    {
      id: "MUNICIPAL_WARD" as TargetPersona,
      title: "Municipal Ward Authority",
      role: "Public Works & Urban Enforcement",
      icon: Building2,
      badge: "Gov / CPCB",
    },
    {
      id: "RWA_HOUSING" as TargetPersona,
      title: "Housing Society / RWA",
      role: "Resident Safety & Estate Management",
      icon: Home,
      badge: "Community",
    },
    {
      id: "EDUCATIONAL_INSTITUTION" as TargetPersona,
      title: "Educational Campus",
      role: "Student Exposure & Activity Controls",
      icon: GraduationCap,
      badge: "Campus Health",
    },
  ];

  const currentCount = csvText.trim() ? Math.max(0, csvText.trim().split("\n").filter(Boolean).length - 1) : 0;
  const previousCount = previousCsvText.trim() ? Math.max(0, previousCsvText.trim().split("\n").filter(Boolean).length - 1) : 0;
  const hasData = currentCount > 0;

  const currentRegion = AVAILABLE_REGIONS.find((r) => r.id === selectedRegionId) || AVAILABLE_REGIONS[0];

  return (
    <div className="aero-card-elevated p-5 sm:p-7 space-y-7 theme-transition" style={{ background: "var(--aero-surface)" }}>
      {/* ── 1. Operational Persona Selector ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="aero-section-label" htmlFor="persona-group">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--aero-neon-green)" }} />
            Operational Persona Directive Scope
          </label>
          <span className="text-[11px]" style={{ color: "var(--aero-text-muted)" }}>
            Calibrates executive tone, legal thresholds & actions
          </span>
        </div>

        <div id="persona-group" role="radiogroup" aria-label="Operational Persona" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {personas.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPersona === p.id;
            return (
              <button
                key={p.id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedPersona(p.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden group focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  isSelected ? "dark:border-[#00ff88] dark:shadow-[0_0_15px_rgba(0,255,136,0.2)]" : ""
                }`}
                style={{
                  borderColor: isSelected ? "var(--aero-neon-green)" : "var(--aero-border)",
                  background: isSelected ? "var(--aero-accent-bg)" : "var(--aero-surface-2)",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      background: isSelected ? "var(--aero-neon-green)" : "var(--aero-border)",
                      color: isSelected ? "#030712" : "var(--aero-text-secondary)",
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      background: isSelected ? "var(--aero-accent-bg)" : "transparent",
                      color: isSelected ? "var(--aero-neon-green)" : "var(--aero-text-muted)",
                      borderColor: isSelected ? "var(--aero-neon-green)" : "var(--aero-border)",
                    }}
                  >
                    {p.badge}
                  </span>
                </div>
                <div
                  className="text-sm font-extrabold"
                  style={{ color: isSelected ? "var(--aero-neon-green)" : "var(--aero-text-primary)" }}
                >
                  {p.title}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--aero-text-muted)" }}>
                  {p.role}
                </div>
                {isSelected && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{ background: "linear-gradient(90deg, var(--aero-neon-green), #0ea5e9)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Regional Area Selector & Telemetry Ingestion ── */}
      <div className="space-y-4 pt-5 border-t" style={{ borderColor: "var(--aero-border)" }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--aero-text-primary)" }}>
              <UploadCloud size={16} style={{ color: "var(--aero-neon-green)" }} />
              Atmospheric Telemetry Ingestion Engine
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--aero-text-muted)" }}>
              Select target urban sector for live satellite & CPCB sensors, or upload verified CSV/XLSX files.
            </p>
          </div>

          {/* Region Picker & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Local Area Selector Dropdown */}
            <div className="flex items-center gap-1.5 p-1 px-2.5 rounded-xl border" style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-border)" }}>
              <MapPin size={14} style={{ color: "var(--aero-neon-green)" }} />
              <label htmlFor="region-select" className="text-xs font-semibold" style={{ color: "var(--aero-text-muted)" }}>
                Region:
              </label>
              <select
                id="region-select"
                aria-label="Select Local Area Region"
                value={selectedRegionId}
                onChange={(e) => {
                  setSelectedRegionId(e.target.value);
                  onFetchLiveTelemetry(e.target.value);
                }}
                className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer py-1"
                style={{ color: "var(--aero-text-primary)" }}
              >
                {AVAILABLE_REGIONS.map((r) => (
                  <option key={r.id} value={r.id} style={{ background: "var(--aero-surface)", color: "var(--aero-text-primary)" }}>
                    {r.name} ({r.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Pull Live Button with Neon Styling in Dark Mode */}
            <button
              onClick={() => onFetchLiveTelemetry(selectedRegionId)}
              disabled={isFetchingLive}
              aria-label={`Pull Live Telemetry for ${currentRegion.name}`}
              className="aero-btn-neon flex items-center gap-2 text-xs px-4 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-60"
            >
              <Radio size={13} className={isFetchingLive ? "animate-spin" : ""} />
              {isFetchingLive ? "Connecting Sensors..." : `Sync ${currentRegion.name} Live`}
            </button>

            {/* Manual Upload Toggle */}
            <button
              onClick={() => setShowManualUpload(!showManualUpload)}
              aria-expanded={showManualUpload}
              aria-label="Toggle Manual CSV/Excel Upload"
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all"
              style={{
                borderColor: showManualUpload ? "var(--aero-neon-green)" : "var(--aero-border)",
                background: showManualUpload ? "var(--aero-accent-bg)" : "var(--aero-surface-2)",
                color: showManualUpload ? "var(--aero-neon-green)" : "var(--aero-text-secondary)",
              }}
            >
              <FileSpreadsheet size={13} />
              Manual Upload
              {showManualUpload ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {hasData && (
              <button
                onClick={() => setShowRawTable(!showRawTable)}
                aria-label={showRawTable ? "Hide Raw Data Table" : "Inspect Raw Sensor Data Table"}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all"
                style={{
                  borderColor: showRawTable ? "var(--aero-neon-green)" : "var(--aero-border)",
                  background: showRawTable ? "var(--aero-accent-bg)" : "var(--aero-surface-2)",
                  color: showRawTable ? "var(--aero-neon-green)" : "var(--aero-text-secondary)",
                }}
              >
                <Table size={13} />
                {showRawTable ? "Hide Grid" : "Inspect Grid"}
              </button>
            )}
          </div>
        </div>

        {/* Selected Sector Status Pill */}
        <div
          className="flex items-center justify-between p-3 rounded-xl border theme-transition"
          style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-border)" }}
        >
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--aero-text-secondary)" }}>
            <span className={`w-2 h-2 rounded-full ${hasData ? "bg-emerald-400 dark:bg-[#00ff88] animate-pulse" : "bg-amber-400"}`} />
            <span>
              {hasData
                ? `Active Station Cluster: ${currentRegion.name} (${currentRegion.state}) · ${currentCount} validated records synchronized.`
                : `No sensor telemetry loaded yet for ${currentRegion.name}. Click 'Sync ${currentRegion.name} Live' or upload a file.`}
            </span>
          </div>
          {hasData && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg border dark:aero-neon-pill"
              style={{
                background: "var(--aero-accent-bg)",
                color: "var(--aero-neon-green)",
                borderColor: "var(--aero-neon-green)",
              }}
            >
              Sensors Live
            </span>
          )}
        </div>

        {/* ── Manual Upload Drawer ── */}
        {showManualUpload && (
          <div
            className="rounded-xl border p-5 space-y-4 theme-transition"
            style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-accent-border)" }}
          >
            <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-3" style={{ borderColor: "var(--aero-border)" }}>
              <div className="flex gap-1.5" role="tablist">
                {(["current", "previous"] as const).map((tab) => (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                    className="aero-tab"
                    style={
                      activeTab === tab
                        ? { background: "var(--aero-neon-green)", color: "#030712", fontWeight: "800" }
                        : {}
                    }
                  >
                    {tab === "current" ? `Active Stream (${currentCount})` : `Baseline Reference (${previousCount})`}
                  </button>
                ))}
              </div>
              <label
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer transition-colors shadow-sm"
                style={{ borderColor: "var(--aero-border)", background: "var(--aero-surface)", color: "var(--aero-text-secondary)" }}
              >
                <FileSpreadsheet size={13} style={{ color: "var(--aero-neon-green)" }} />
                Upload (.csv / .xlsx)
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.txt"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, activeTab === "previous")}
                />
              </label>
            </div>

            {uploadError && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg text-xs border"
                style={{ background: "#450a0a", borderColor: "#7f1d1d", color: "#fca5a5" }}
              >
                <AlertCircle size={13} className="shrink-0" />
                {uploadError}
              </div>
            )}

            <textarea
              rows={6}
              value={activeTab === "current" ? csvText : previousCsvText}
              onChange={(e) => (activeTab === "current" ? setCsvText(e.target.value) : setPreviousCsvText(e.target.value))}
              placeholder="timestamp,location,pm25,pm10,aqi,no2,temperature,humidity,notes"
              className="aero-input"
              aria-label="Raw CSV sensor dataset editor"
            />
            <p className="text-[11px]" style={{ color: "var(--aero-text-muted)" }}>
              Required schema: timestamp, location, pm25, pm10, aqi, no2, temperature, humidity, notes
            </p>
          </div>
        )}
      </div>

      {/* ── 3. Generation CTA ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t" style={{ borderColor: "var(--aero-border)" }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--aero-text-muted)" }}>
          <Globe size={14} style={{ color: "var(--aero-neon-green)" }} />
          <span>If dataset is empty, Aero automatically syncs live sensors for {currentRegion.name} before synthesizing.</span>
        </div>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          aria-label="Generate Executive Intelligence Briefing"
          className="aero-btn-primary flex items-center gap-2.5 w-full sm:w-auto justify-center"
        >
          {isAnalyzing ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              Synthesizing Executive Directives...
            </>
          ) : (
            <>
              <Sparkles size={15} />
              Generate Executive Intelligence Briefing
            </>
          )}
        </button>
      </div>
    </div>
  );
};
