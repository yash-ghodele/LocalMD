"use client";

import React, { useState } from "react";
import { calculateStructureScore, formatForAIContext } from "@/lib/aiReadiness";
import { 
    Sparkles, 
    Copy, 
    Check, 
    X, 
    FileCode, 
    ListTree, 
    HelpCircle, 
    ChevronRight 
} from "lucide-react";

interface AIContextModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: string;
    fileName: string;
}

export function AIContextModal({
    isOpen,
    onClose,
    content,
    fileName,
}: AIContextModalProps) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const analysis = calculateStructureScore(content);

    if (!isOpen) return null;

    const copyToClipboard = async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleCopyFullAIContext = () => {
        const aiText = formatForAIContext({ content, fileName });
        copyToClipboard(aiText, "ai-full");
    };

    const handleCopyOutline = () => {
        const lines = content.split("\n");
        const outline: string[] = [];
        lines.forEach(line => {
            const match = line.match(/^(#{1,6})\s+(.+)$/);
            if (match) {
                const indent = "  ".repeat(match[1].length - 1);
                outline.push(`${indent}- ${match[2].trim()}`);
            }
        });
        copyToClipboard(outline.join("\n") || "No headings found.", "outline");
    };

    const handleCopyRaw = () => {
        copyToClipboard(content, "raw");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 print:hidden">
            <div className="relative w-full max-w-2xl bg-background/95 border border-white/10 dark:border-white/15 rounded-3xl shadow-2xl overflow-hidden glass">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground tracking-tight">AI Context & Readiness Engine</h3>
                            <p className="text-xs text-muted-foreground">Export clean, structured Markdown for LLM & RAG pipelines</p>
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
                    {/* Score & Token stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Structure Score</div>
                            <div className="text-2xl font-black text-foreground">
                                {analysis.totalScore} <span className="text-sm font-semibold text-muted-foreground">/ 100</span>
                            </div>
                            <div className="text-[11px] font-bold text-emerald-400">
                                {analysis.tierName} (Grade {analysis.grade})
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground" title="Estimated using ~3.85-4 chars/token heuristic across GPT-4, Claude & Llama">
                                <span>Estimated Tokens</span>
                                <HelpCircle className="w-3 h-3 text-muted-foreground/60" />
                            </div>
                            <div className="text-2xl font-black text-foreground">
                                ~{analysis.metrics.estimatedTokens.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                                ~{analysis.metrics.wordCount.toLocaleString()} words • {analysis.metrics.charCount.toLocaleString()} chars
                            </div>
                        </div>
                    </div>

                    {/* 4 Pillars Breakdown */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Deterministic Rubric Breakdown</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {analysis.pillars.map((pillar, idx) => (
                                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                                    <div className="flex items-center justify-between font-bold text-foreground mb-1">
                                        <span>{pillar.name}</span>
                                        <span className="text-primary">{pillar.score}/{pillar.maxScore}</span>
                                    </div>
                                    <div className="text-[11px] text-muted-foreground line-clamp-2">
                                        {pillar.details}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Optimization Suggestions */}
                    {analysis.suggestions.length > 0 && (
                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
                            <div className="text-xs font-bold uppercase tracking-wider text-primary">Structure Insights</div>
                            <div className="space-y-1 text-xs text-foreground/80">
                                {analysis.suggestions.map((sug, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                                        <span>{sug}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Export Actions */}
                    <div className="space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Copy Formats</h4>
                        
                        <button
                            onClick={handleCopyFullAIContext}
                            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.99] text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 flex-shrink-0" />
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wide">Copy AI Context Package (Recommended)</div>
                                    <div className="text-[11px] opacity-80">Includes &lt;document&gt; envelope, outline hierarchy, token count, and clean Markdown</div>
                                </div>
                            </div>
                            <div className="p-2 rounded-xl bg-white/20">
                                {copiedKey === "ai-full" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </div>
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleCopyOutline}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground transition-all text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <ListTree className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-xs font-medium">Copy Outline Only</span>
                                </div>
                                {copiedKey === "outline" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                            </button>

                            <button
                                onClick={handleCopyRaw}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground transition-all text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <FileCode className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-xs font-medium">Copy Raw Markdown</span>
                                </div>
                                {copiedKey === "raw" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-black/5 dark:border-white/10 bg-white/5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
