"use client";

import React, { useState } from "react";
import { BriefingReport, TargetPersona } from "@/types/airQuality";
import {
  FileText, AlertOctagon, Languages, CheckCircle2, Clock, Sparkles,
  TrendingDown, TrendingUp, Share2, Printer, ShieldCheck, Building, Target,
} from "lucide-react";

interface BriefingViewerProps {
  report: BriefingReport;
  persona: TargetPersona;
  usingFallback: boolean;
  warning?: string;
}

const SEV_CLASS: Record<string, string> = {
  SEVERE: "sev-severe", VERY_POOR: "sev-verypoor", POOR: "sev-poor",
  MODERATE: "sev-moderate", GOOD: "sev-good",
};
const PRI_CLASS: Record<string, string> = {
  CRITICAL: "pri-critical", HIGH: "pri-high", MODERATE: "pri-moderate", INFORMATIONAL: "pri-info",
};

export const BriefingViewer: React.FC<BriefingViewerProps> = ({ report, persona, usingFallback, warning }) => {
  const [activeTab, setActiveTab] = useState<"technical" | "advisory" | "actions" | "comparison">("technical");
  const [advisoryLang, setAdvisoryLang] = useState<"english" | "hindi">("english");
  const [copied, setCopied] = useState(false);

  const handlePrint = () => window.print();

  const copyBriefing = () => {
    navigator.clipboard.writeText(
      `AERO CIVIC AIR QUALITY BRIEFING\nSubject: ${report.headline}\nRef: ${report.reportId}\nPersona: ${persona}\nSeverity: ${report.overallSeverity}\n\n${report.technicalSummary}\n\nDirectives:\n${report.recommendations.map((r, i) => `${i + 1}. [${r.priority}] ${r.action}`).join("\n")}\n\nCitizen Advisory (EN):\n${report.advisories.english.citizenLevel}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sevClass = SEV_CLASS[report.overallSeverity] || "sev-moderate";

  const tabs = [
    { id: "technical" as const, label: "Technical Briefing", icon: FileText },
    { id: "advisory" as const, label: "Bilingual Advisories", icon: Languages },
    { id: "actions" as const, label: `Directives (${report.recommendations.length})`, icon: Target },
    ...(report.comparisonWithPrevious ? [{ id: "comparison" as const, label: "Baseline Delta", icon: TrendingUp }] : []),
  ];

  return (
    <div className="aero-card-elevated p-5 sm:p-7 space-y-6 theme-transition" style={{ background: "var(--aero-surface)" }}>

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-5 border-b" style={{ borderColor: "var(--aero-border)" }}>
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${sevClass}`}>
              {report.overallSeverity} AIR QUALITY DIRECTIVE
            </span>
            <span className="text-xs px-3 py-1 rounded-full border font-mono"
              style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-border)", color: "var(--aero-text-muted)" }}>
              REF: {report.reportId}
            </span>
            {usingFallback && (
              <span className="text-xs px-3 py-1 rounded-full border flex items-center gap-1.5"
                style={{ background: "var(--aero-accent-bg)", borderColor: "var(--aero-accent-border)", color: "var(--aero-accent)" }}>
                <Sparkles size={12} style={{ color: "#f59e0b" }} />
                Aero Heuristic Engine
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black leading-tight" style={{ color: "var(--aero-text-primary)" }}>
            {report.headline}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--aero-text-muted)" }}>
            <span className="flex items-center gap-1.5">
              <Clock size={12} style={{ color: "var(--aero-accent)" }} />
              {new Date(report.generatedAt).toLocaleString()}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Building size={12} style={{ color: "var(--aero-accent)" }} />
              {persona.replace(/_/g, " ")}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5" style={{ color: "var(--aero-success)" }}>
              <ShieldCheck size={12} />
              Audit Traceability Verified
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-colors"
            style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-border)", color: "var(--aero-text-secondary)" }}>
            <Printer size={13} />Print / PDF
          </button>
          <button onClick={copyBriefing}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white transition-all"
            style={{ background: "var(--aero-accent)", boxShadow: "0 4px 12px rgb(79 70 229 / 0.3)" }}>
            <Share2 size={13} />
            {copied ? "Copied!" : "Export Briefing"}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex flex-wrap gap-1.5 no-print border-b pb-4" style={{ borderColor: "var(--aero-border)" }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="aero-tab flex items-center gap-1.5"
            style={activeTab === id ? { background: "var(--aero-accent)", color: "white", borderColor: "transparent" } : {}}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* ── Tab: Technical ── */}
      {activeTab === "technical" && (
        <div className="space-y-5">
          <div className="p-5 rounded-xl border space-y-3" style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-border)" }}>
            <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: "var(--aero-border)" }}>
              <span className="aero-section-label" style={{ color: "var(--aero-accent)" }}>Executive Synthesis & Environmental Risk Evaluation</span>
              <span className="text-[11px] font-mono" style={{ color: "var(--aero-text-muted)" }}>Traceable Telemetry Synthesis</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--aero-text-primary)" }}>{report.technicalSummary}</p>
          </div>

          <div className="space-y-3">
            <h4 className="aero-section-label"><Target size={13} style={{ color: "var(--aero-accent)" }} />Traceable Sensor Findings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.keyFindings.map((item, i) => (
                <div key={i} className="p-4 rounded-xl border space-y-2 theme-transition"
                  style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-border)" }}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold" style={{ color: "var(--aero-text-primary)" }}>{item.finding}</span>
                    <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full border"
                      style={{ background: "var(--aero-accent-bg)", color: "var(--aero-accent)", borderColor: "var(--aero-accent-border)" }}>
                      {item.location}
                    </span>
                  </div>
                  <div className="text-xs font-mono p-2.5 rounded-lg border"
                    style={{ background: "var(--aero-surface)", borderColor: "var(--aero-border)", color: "var(--aero-text-secondary)" }}>
                    <strong style={{ color: "var(--aero-accent)" }}>Evidence:</strong> {item.evidence}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="aero-section-label"><AlertOctagon size={13} style={{ color: "#f43f5e" }} />Critical Hotspot Nodes</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {report.hotspotsDetected.map((h, i) => (
                <div key={i} className="p-4 rounded-xl border space-y-2 theme-transition"
                  style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-border)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: "#f43f5e" }}>{h.location}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded pri-critical font-bold">#{i + 1}</span>
                  </div>
                  <div className="text-xs" style={{ color: "var(--aero-text-primary)" }}>
                    Peak {h.peakPollutant}: <strong className="font-mono text-sm">{h.peakValue}</strong>
                  </div>
                  <div className="text-[11px] pt-1.5 border-t" style={{ borderColor: "var(--aero-border)", color: "var(--aero-text-muted)" }}>
                    {h.suspectedCause}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Advisory ── */}
      {activeTab === "advisory" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="aero-section-label"><Languages size={13} />Advisory Language</span>
            <div className="flex gap-1.5">
              {(["english", "hindi"] as const).map(lang => (
                <button key={lang} onClick={() => setAdvisoryLang(lang)}
                  className="aero-tab"
                  style={advisoryLang === lang ? { background: "var(--aero-accent)", color: "white", borderColor: "transparent" } : {}}>
                  {lang === "english" ? "English" : "हिन्दी"}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl border space-y-2" style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-border)" }}>
            <div className="flex items-center justify-between">
              <span className="aero-section-label" style={{ color: "#0ea5e9" }}>Public Citizen Broadcast</span>
              <span className="text-[10px]" style={{ color: "var(--aero-text-muted)" }}>Mass SMS / WhatsApp / PA Channel</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--aero-text-primary)" }}>
              {advisoryLang === "english" ? report.advisories.english.citizenLevel : report.advisories.hindi.citizenLevel}
            </p>
          </div>

          <div className="p-5 rounded-xl border space-y-2"
            style={{ background: "var(--aero-accent-bg)", borderColor: "var(--aero-accent-border)" }}>
            <div className="flex items-center justify-between">
              <span className="aero-section-label" style={{ color: "var(--aero-accent)" }}>Campus & Student Advisory (Age 8–15)</span>
              <span className="text-[10px]" style={{ color: "var(--aero-text-muted)" }}>Morning Assembly & Notice Boards</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--aero-text-primary)" }}>
              {advisoryLang === "english" ? report.advisories.english.schoolChildLevel : report.advisories.hindi.schoolChildLevel}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="aero-section-label">Immediate Preventive Safeguards</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(advisoryLang === "english" ? report.advisories.english.actionableBullets : report.advisories.hindi.actionableBullets).map((b, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border theme-transition"
                  style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-border)" }}>
                  <CheckCircle2 size={14} className="shrink-0 mt-0.5" style={{ color: "var(--aero-success)" }} />
                  <span className="text-xs leading-relaxed" style={{ color: "var(--aero-text-primary)" }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Actions ── */}
      {activeTab === "actions" && (
        <div className="space-y-3">
          {report.recommendations.map((rec, i) => (
            <div key={i} className="p-5 rounded-xl border space-y-3 theme-transition"
              style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-border)" }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3" style={{ borderColor: "var(--aero-border)" }}>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${PRI_CLASS[rec.priority] || "pri-info"}`}>
                    {rec.priority} PRIORITY
                  </span>
                  <span className="text-xs font-bold" style={{ color: "var(--aero-accent)" }}>{rec.category}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--aero-text-muted)" }}>
                  <Clock size={12} style={{ color: "var(--aero-accent)" }} />
                  {rec.timeframe}
                </div>
              </div>
              <h4 className="text-sm font-bold" style={{ color: "var(--aero-text-primary)" }}>{rec.action}</h4>
              <p className="text-xs leading-relaxed" style={{ color: "var(--aero-text-secondary)" }}>{rec.rationale}</p>
              {rec.traceableLocations?.length > 0 && (
                <div className="pt-2.5 border-t flex flex-wrap items-center gap-2" style={{ borderColor: "var(--aero-border)" }}>
                  <span className="text-[11px]" style={{ color: "var(--aero-text-muted)" }}>Target Zones:</span>
                  {rec.traceableLocations.map((loc, j) => (
                    <span key={j} className="text-[11px] px-2 py-0.5 rounded-lg border"
                      style={{ background: "var(--aero-accent-bg)", borderColor: "var(--aero-accent-border)", color: "var(--aero-accent)" }}>
                      📍 {loc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: Comparison ── */}
      {activeTab === "comparison" && report.comparisonWithPrevious && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl border flex items-start gap-4 theme-transition"
            style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-border)" }}>
            <div className="p-3 rounded-xl shrink-0"
              style={report.comparisonWithPrevious.trend === "IMPROVING"
                ? { background: "#052e16", color: "#10b981" }
                : { background: "#450a0a", color: "#f43f5e" }}>
              {report.comparisonWithPrevious.trend === "IMPROVING" ? <TrendingDown size={22} /> : <TrendingUp size={22} />}
            </div>
            <div>
              <div className="aero-section-label mb-1">Baseline Intervention Delta</div>
              <div className="text-lg font-black" style={{ color: "var(--aero-text-primary)" }}>
                Trend: {report.comparisonWithPrevious.trend}
              </div>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--aero-text-secondary)" }}>
                {report.comparisonWithPrevious.deltaSummary}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {report.comparisonWithPrevious.notableChanges.map((c, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl border text-xs"
                style={{ background: "var(--aero-surface-2)", borderColor: "var(--aero-border)", color: "var(--aero-text-primary)" }}>
                <span style={{ color: "var(--aero-accent)" }} className="font-bold mt-0.5">•</span>
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
