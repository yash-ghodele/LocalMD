"use client";

import React from "react";
import { 
    ShieldCheck, 
    WifiOff, 
    HardDrive, 
    Lock, 
    Cpu, 
    AlertCircle, 
    X, 
    CheckCircle2 
} from "lucide-react";

interface TrustCenterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TrustCenterModal({ isOpen, onClose }: TrustCenterModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 print:hidden">
            <div className="relative w-full max-w-xl bg-background/95 border border-white/10 dark:border-white/15 rounded-3xl shadow-2xl overflow-hidden glass">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground tracking-tight">Trust & Privacy Center</h3>
                            <p className="text-xs text-muted-foreground">Architectural Verification & Local-First Guarantees</p>
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
                <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-4">
                    {/* Live Audit Checkpoints */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                                <WifiOff className="w-4 h-4" />
                                <span>Zero Outbound Network</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Document parsing (PDF, Word, PPTX) runs completely inside browser WebWorkers and memory.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                                <Lock className="w-4 h-4" />
                                <span>Zero Telemetry / Analytics</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                No tracking scripts, Google Analytics, or third-party cookies are loaded on this domain.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                                <HardDrive className="w-4 h-4" />
                                <span>Native Disk Persistence</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Direct file read/write using the Web File System Access API without intermediary cloud storage.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                                <Cpu className="w-4 h-4" />
                                <span>Air-Gapped PWA Ready</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Service workers cache assets locally. LocalMD functions flawlessly in 100% offline environments.
                            </p>
                        </div>
                    </div>

                    {/* Architecture Verification Checklist */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Verified Client Architecture</h4>
                        
                        <div className="flex items-center gap-2.5 text-xs text-foreground/80">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>PDF.js worker served locally from <code>/pdf.worker.min.mjs</code> (0 CDN requests)</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-foreground/80">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>Client-side JSZip XML slide extraction for PowerPoint files</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-foreground/80">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>In-memory Mammoth.js Word binary document conversion</span>
                        </div>
                    </div>

                    {/* OCR Roadmap & Integrity Statement */}
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs">
                            <AlertCircle className="w-4 h-4" />
                            <span>OCR for Scanned Documents Roadmap</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            To protect our zero-cloud constraint, we do not send scanned pages to cloud OCR APIs. OCR is currently deferred to a future pure-client WASM update to ensure high-performance privacy remains uncompromised.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-black/5 dark:border-white/10 bg-white/5">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/40 transition-all active:scale-95"
                    >
                        Got It
                    </button>
                </div>
            </div>
        </div>
    );
}
