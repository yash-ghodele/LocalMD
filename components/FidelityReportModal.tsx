"use client";

import React from "react";
import { ConversionFidelityReport } from "@/lib/importers";
import { 
    CheckCircle2, 
    AlertTriangle, 
    FileCheck2, 
    Table, 
    List, 
    FileText, 
    Sigma, 
    MessageSquareQuote, 
    Sparkles, 
    Copy, 
    Check, 
    X,
    ShieldCheck
} from "lucide-react";

interface FidelityReportModalProps {
    report: ConversionFidelityReport | null;
    isOpen: boolean;
    onClose: () => void;
    onCopyAIContext: () => void;
}

export function FidelityReportModal({
    report,
    isOpen,
    onClose,
    onCopyAIContext,
}: FidelityReportModalProps) {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen || !report) return null;

    const handleCopy = () => {
        onCopyAIContext();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 print:hidden">
            <div className="relative w-full max-w-2xl bg-background/95 border border-white/10 dark:border-white/15 rounded-3xl shadow-2xl overflow-hidden glass">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                            <FileCheck2 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-foreground tracking-tight">Conversion Fidelity Report</h3>
                                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-primary text-primary-foreground">
                                    {report.format}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate max-w-md">
                                {report.originalFileName} ({report.fileSizeFormatted}) • Processed {report.processedAt}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-6">
                    {/* Structure Score Summary Banner */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border border-primary/20 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-xs font-bold uppercase tracking-wider text-primary">Structure Score</span>
                            </div>
                            <div className="text-2xl font-black tracking-tight text-foreground">
                                {report.structureScore} <span className="text-sm font-semibold text-muted-foreground">/ 100</span>
                                <span className="ml-3 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    Grade {report.structureGrade} • {report.structureTier}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-medium text-muted-foreground">Estimated Tokens</div>
                            <div className="text-xl font-bold text-foreground">~{report.estimatedTokens.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Preserved Elements Matrix */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Preserved Semantic Elements</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                                <FileText className="w-4 h-4 text-blue-400" />
                                <div>
                                    <div className="text-sm font-bold text-foreground">{report.headingsPreserved}</div>
                                    <div className="text-[11px] text-muted-foreground">Headings</div>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                                <Table className="w-4 h-4 text-emerald-400" />
                                <div>
                                    <div className="text-sm font-bold text-foreground">{report.tablesPreserved}</div>
                                    <div className="text-[11px] text-muted-foreground">Tables</div>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                                <List className="w-4 h-4 text-amber-400" />
                                <div>
                                    <div className="text-sm font-bold text-foreground">{report.listsPreserved}</div>
                                    <div className="text-[11px] text-muted-foreground">List Items</div>
                                </div>
                            </div>
                            {report.pageOrSlideCount !== undefined && (
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                                    <div>
                                        <div className="text-sm font-bold text-foreground">{report.pageOrSlideCount}</div>
                                        <div className="text-[11px] text-muted-foreground">{report.format === "PPTX" ? "Slides" : "Pages"}</div>
                                    </div>
                                </div>
                            )}
                            {report.mathExpressionsDetected > 0 && (
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                                    <Sigma className="w-4 h-4 text-cyan-400" />
                                    <div>
                                        <div className="text-sm font-bold text-foreground">{report.mathExpressionsDetected}</div>
                                        <div className="text-[11px] text-muted-foreground">Math Formulae</div>
                                    </div>
                                </div>
                            )}
                            {report.speakerNotesExtracted !== undefined && report.speakerNotesExtracted > 0 && (
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                                    <MessageSquareQuote className="w-4 h-4 text-pink-400" />
                                    <div>
                                        <div className="text-sm font-bold text-foreground">{report.speakerNotesExtracted}</div>
                                        <div className="text-[11px] text-muted-foreground">Speaker Notes</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transparency & Degradation Warnings */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Transparency & Degradation Notes</h4>
                        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
                            {report.degradationsAndWarnings.map((warning, idx) => {
                                const fileMatch = warning.match(/^([^:]+\.(?:pdf|docx|pptx|md|txt)):\s*(.+)$/i);
                                return (
                                    <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground/80">
                                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            {fileMatch ? (
                                                <div className="flex items-baseline gap-2 flex-wrap">
                                                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                        {fileMatch[1]}
                                                    </span>
                                                    <span>{fileMatch[2]}</span>
                                                </div>
                                            ) : (
                                                <span>{warning}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Local Execution Verification Badge */}
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                        <span>100% In-Browser Execution. File content never left your local memory.</span>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-black/5 dark:border-white/10 bg-white/5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                    >
                        Dismiss
                    </button>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/40 transition-all active:scale-95"
                    >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Copied AI Context!" : "Copy as AI Context"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
