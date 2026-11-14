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
  FileText,
  Table,
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
}) => {
  const [activeTab, setActiveTab] = useState<"current" | "previous">("current");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isBaseline: boolean) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (fileExt === "csv" || fileExt === "txt") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (isBaseline) {
          setPreviousCsvText(content);
        } else {
          setCsvText(content);
        }
      };
      reader.readAsText(file);
    } else if (fileExt === "xlsx" || fileExt === "xls") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const buffer = event.target?.result as ArrayBuffer;
          const workbook = XLSX.read(buffer, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const convertedCsv = XLSX.utils.sheet_to_csv(worksheet);
          if (isBaseline) {
            setPreviousCsvText(convertedCsv);
          } else {
            setCsvText(convertedCsv);
          }
        } catch (err: any) {
          setUploadError("Failed to parse Excel workbook. Please verify sheet formatting.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setUploadError("Unsupported format. Accepted: .csv, .xlsx, .xls, .txt");
    }
  };

  const personas = [
    {
      id: "MUNICIPAL_WARD" as TargetPersona,
      title: "Municipal Ward Authority",
      role: "Public Works & Urban Enforcement",
      icon: Building2,
      badge: "Gov / CPCB Compliance",
    },
    {
      id: "RWA_HOUSING" as TargetPersona,
      title: "Housing Society / RWA",
      role: "Resident Safety & Estate Management",
      icon: Home,
      badge: "Community Level",
    },
    {
      id: "EDUCATIONAL_INSTITUTION" as TargetPersona,
      title: "Educational Campus",
      role: "Student Exposure & Activity Controls",
      icon: GraduationCap,
      badge: "Campus Protocols",
    },
  ];

  const currentRecordsCount = csvText.trim()
    ? Math.max(0, csvText.trim().split("\n").filter(Boolean).length - 1)
    : 0;
  const previousRecordsCount = previousCsvText.trim()
    ? Math.max(0, previousCsvText.trim().split("\n").filter(Boolean).length - 1)
    : 0;

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
      {/* 1. Executive Persona Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Operational Persona & Protocol Scope
          </label>
          <span className="text-[11px] text-slate-500">Determines briefing tone, thresholds & directives</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {personas.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p.id)}
                className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${isSelected
                  ? "bg-gradient-to-b from-indigo-950/60 to-slate-900 border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50"
                  : "bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40"
                  }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`p-2.5 rounded-xl ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-800/80 text-slate-400 group-hover:text-slate-200"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isSelected
                      ? "bg-indigo-900/80 text-indigo-300 border border-indigo-700/60"
                      : "bg-slate-800/60 text-slate-500"
                      }`}
                  >
                    {p.badge}
                  </span>
                </div>
                <div className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                  {p.title}
                </div>
                <div className="text-xs text-slate-400 mt-1">{p.role}</div>
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-sky-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Telemetry Ingestion Controls */}
      <div className="space-y-4 pt-2 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              Sensor Telemetry Ingestion Pipeline
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Production telemetry intake: Auto-synced live spatial station readings or custom verified enterprise uploads.
            </p>
          </div>

          {/* Controls: Pull Live + Manual Upload Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onFetchLiveTelemetry}
              disabled={isFetchingLive}
              className="text-xs px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all flex items-center gap-2 shadow-md shadow-emerald-950/40"
            >
              <Radio className={`w-3.5 h-3.5 ${isFetchingLive ? "animate-spin" : "text-emerald-200"}`} />
              {isFetchingLive ? "Fetching Live Sensors..." : "Pull Live Station Telemetry"}
            </button>

            <button
              onClick={() => setShowManualUpload(!showManualUpload)}
              className={`text-xs px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${showManualUpload
                ? "bg-indigo-950 border-indigo-600 text-indigo-300"
                : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
              {showManualUpload ? "Hide Upload Console" : "Manual CSV / Excel Upload"}
            </button>

            {currentRecordsCount > 0 && (
              <button
                onClick={() => setShowRawTable(!showRawTable)}
                className={`text-xs px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${showRawTable
                  ? "bg-indigo-950 border-indigo-700 text-indigo-300"
                  : "bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white"
                  }`}
              >
                <Table className="w-3.5 h-3.5 text-indigo-400" />
                {showRawTable ? "Hide Data Table" : "Inspect Data Grid"}
              </button>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${currentRecordsCount > 0 ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
            />
            <span className="text-slate-300">
              {currentRecordsCount > 0
                ? `Active Ingested Telemetry: ${currentRecordsCount} verified records synchronized.`
                : "No telemetry stream loaded yet. Click 'Pull Live Station Telemetry' or upload custom sensor files."}
            </span>
          </div>
          {currentRecordsCount > 0 && (
            <span className="font-mono text-[11px] text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-900">
              Ready for Analysis
            </span>
          )}
        </div>

        {/* Manual Upload Drawer */}
        {showManualUpload && (
          <div className="space-y-4 p-5 rounded-2xl bg-slate-950/60 border border-indigo-950/60 transition-all">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("current")}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition-all ${activeTab === "current"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "bg-slate-800/40 text-slate-400 hover:text-slate-200"
                    }`}
                >
                  Active Telemetry Stream ({currentRecordsCount} records)
                </button>
                <button
                  onClick={() => setActiveTab("previous")}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition-all ${activeTab === "previous"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "bg-slate-800/40 text-slate-400 hover:text-slate-200"
                    }`}
                >
                  Historical Reference ({previousRecordsCount} records)
                </button>
              </div>

              <label className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-slate-200 cursor-pointer flex items-center gap-1.5 transition-all shadow-sm">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
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
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                {uploadError}
              </div>
            )}

            {/* Manual CSV raw text editor */}
            <div className="relative">
              <textarea
                rows={6}
                value={activeTab === "current" ? csvText : previousCsvText}
                onChange={(e) => {
                  if (activeTab === "current") setCsvText(e.target.value);
                  else setPreviousCsvText(e.target.value);
                }}
                placeholder="timestamp,location,pm25,pm10,aqi,no2,temperature,humidity,notes"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y shadow-inner"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-500 px-1 mt-1">
                <span>Format: timestamp, location, pm25, pm10, aqi, no2, notes</span>
                <span className="font-mono text-slate-400">
                  {activeTab === "current" ? "Active Stream" : "Baseline Stream"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Action Trigger Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Ingestion pipeline connected: Auto-pulls live atmospheric sensors if CSV is empty.</span>
        </div>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-bold text-sm transition-all shadow-xl shadow-indigo-500/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
        >
          {isAnalyzing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Synthesizing Executive Briefing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              Generate Executive Intelligence Briefing
            </>
          )}
        </button>
      </div>
    </div>
  );
};
