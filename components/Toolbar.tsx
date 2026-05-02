"use client";

import React from "react";
import Image from "next/image";
import { Moon, Sun, FileText, Columns, Eye, Download, FileUp, Save, Link as LinkIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ToolbarProps {
    onOpenFile: () => void;
    onSaveFile: () => void;
    onExportHtml: () => void;
    onExportPdf: () => void;
    viewMode: "split" | "editor" | "preview";
    setViewMode: (mode: "split" | "editor" | "preview") => void;
    isSyncScroll?: boolean;
    setIsSyncScroll?: (isSync: boolean) => void;
    isModified?: boolean;
    hasFileHandle?: boolean;
}

export function Toolbar({
    onOpenFile,
    onSaveFile,
    onExportHtml,
    onExportPdf,
    viewMode,
    setViewMode,
    isSyncScroll,
    setIsSyncScroll,
    isModified,
    hasFileHandle,
}: ToolbarProps) {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center justify-center pt-4 sticky top-0 z-50 pointer-events-none">
            <div className="flex items-center gap-4 px-6 py-2.5 glass rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10 pointer-events-auto transition-all duration-500 hover:scale-[1.02] hover:shadow-primary/20">
                <div className="flex items-center gap-3 pr-4 border-r border-black/5 dark:border-white/10">
                    <Image src="/icon.png" alt="App Icon" width={28} height={28} className="rounded-lg shadow-lg" />
                    <h1 className="text-xs font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[var(--logo-from)] to-[var(--logo-to)] hidden lg:block uppercase italic">Local MD</h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onOpenFile}
                        className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-xl bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/40 transition-all active:scale-95"
                        title="Open File (Ctrl+O)"
                    >
                        <FileUp className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Open</span>
                    </button>

                    {/* Save button — shown only when there is content to save */}
                    <button
                        onClick={onSaveFile}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95",
                            isModified
                                ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border border-amber-500/30"
                                : "text-muted-foreground hover:bg-white/5 border border-transparent"
                        )}
                        title={hasFileHandle ? "Save (Ctrl+S)" : "Save As (Ctrl+S)"}
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{hasFileHandle ? "Save" : "Save As"}</span>
                    </button>

                    <div className="flex bg-muted/50 dark:bg-white/5 rounded-xl p-1 border border-black/5 dark:border-white/5">
                        <ViewToggle
                            active={viewMode === "editor"}
                            onClick={() => setViewMode("editor")}
                            icon={FileText}
                            label="Editor"
                        />
                        <ViewToggle
                            active={viewMode === "split"}
                            onClick={() => setViewMode("split")}
                            icon={Columns}
                            label="Split"
                        />
                        <ViewToggle
                            active={viewMode === "preview"}
                            onClick={() => setViewMode("preview")}
                            icon={Eye}
                            label="Preview"
                        />
                    </div>
                </div>

                <div className="h-6 w-px bg-black/5 dark:bg-white/10 mx-1" />

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-muted/50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 overflow-hidden">
                        <button
                            onClick={onExportHtml}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                            title="Export as HTML"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onExportPdf}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all border-l border-black/5 dark:border-white/5"
                            title="Export as PDF"
                        >
                            <FileText className="w-4 h-4" />
                        </button>
                    </div>

                    {setIsSyncScroll && (
                        <button
                            onClick={() => setIsSyncScroll(!isSyncScroll)}
                            className={cn(
                                "p-2 rounded-xl transition-all border",
                                isSyncScroll
                                    ? "bg-primary/10 text-primary border-primary/20"
                                    : "text-muted-foreground hover:bg-muted bg-muted/30 border-black/5 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10"
                            )}
                            title={isSyncScroll ? "Sync Scroll On" : "Sync Scroll Off"}
                        >
                            <LinkIcon className="h-4 w-4" />
                        </button>
                    )}

                    <div className="flex items-center bg-muted/50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 p-1 gap-1">
                        <button
                            onClick={() => setTheme("light")}
                            suppressHydrationWarning
                            className={cn(
                                "p-2 rounded-lg transition-all duration-300 active:scale-90",
                                theme === "light" 
                                    ? "bg-white text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] border border-black/5" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                            )}
                            title="Light Mode"
                        >
                            <Sun className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setTheme("dark")}
                            suppressHydrationWarning
                            className={cn(
                                "p-2 rounded-lg transition-all duration-300 active:scale-90",
                                theme === "dark" 
                                    ? "bg-primary text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]" 
                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                            )}
                            title="Dark Mode"
                        >
                            <Moon className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ViewToggle({
    active,
    onClick,
    icon: Icon,
    label,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all flex items-center gap-2 active:scale-95",
                active 
                    ? "bg-primary/10 text-primary dark:bg-white/10 dark:text-white shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:text-white dark:hover:bg-white/5"
            )}
        >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}
