"use client";

import React from "react";
import { Moon, Sun, FileText, Columns, Eye, Download, FileUp, Link as LinkIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ToolbarProps {
    onOpenFile: () => void;
    onExportHtml: () => void;
    onExportPdf: () => void;
    viewMode: "split" | "editor" | "preview";
    setViewMode: (mode: "split" | "editor" | "preview") => void;
    isSyncScroll?: boolean;
    setIsSyncScroll?: (isSync: boolean) => void;
}

export function Toolbar({
    onOpenFile,
    onExportHtml,
    onExportPdf,
    viewMode,
    setViewMode,
    isSyncScroll,
    setIsSyncScroll,
}: ToolbarProps) {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center justify-between border-b px-4 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-4">
                    <img src="/icon.png" alt="App Icon" className="w-6 h-6 rounded-md" />
                    <h1 className="text-sm font-semibold hidden md:block">MD Viewer</h1>
                </div>
                <button
                    onClick={onOpenFile}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                    title="Open File"
                >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Open File</span>
                </button>

                <div className="h-4 w-px bg-border mx-1" />

                <div className="flex bg-muted rounded-md p-1">
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

            <div className="flex items-center gap-1.5">
                <button
                    onClick={onExportHtml}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group"
                    title="Export as HTML"
                >
                    <Download className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                    <span className="sr-only sm:not-sr-only sm:inline-block">HTML</span>
                </button>
                <button
                    onClick={onExportPdf}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group"
                    title="Export as PDF"
                >
                    <FileText className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                    <span className="sr-only sm:not-sr-only sm:inline-block">PDF</span>
                </button>

                <div className="h-4 w-px bg-border mx-1" />

                {setIsSyncScroll && (
                    <button
                        onClick={() => setIsSyncScroll(!isSyncScroll)}
                        className={cn(
                            "relative p-2 rounded-md transition-all duration-200",
                            isSyncScroll
                                ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                        title={isSyncScroll ? "Sync Scrolling On" : "Sync Scrolling Off"}
                    >
                        <LinkIcon className="h-4 w-4" />
                        <span className="sr-only">Toggle Sync Scroll</span>
                    </button>
                )}

                <div className="h-4 w-px bg-border mx-1" />

                <div className="flex bg-muted rounded-md p-1 h-[28px] items-center">
                    <button
                        onClick={() => setTheme("light")}
                        className={cn(
                            "p-1 rounded-sm transition-all text-xs flex items-center justify-center w-7 h-5",
                            theme === "light" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                        title="Light Mode"
                    >
                        <Sun className="h-3.5 w-3.5" />
                        <span className="sr-only">Light</span>
                    </button>
                    <button
                        onClick={() => setTheme("dark")}
                        className={cn(
                            "p-1 rounded-sm transition-all text-xs flex items-center justify-center w-7 h-5",
                            theme === "dark" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                        title="Dark Mode"
                    >
                        <Moon className="h-3.5 w-3.5" />
                        <span className="sr-only">Dark</span>
                    </button>
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
                "px-3 py-1 text-xs font-medium rounded-sm transition-all flex items-center gap-1.5",
                active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
        >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}
