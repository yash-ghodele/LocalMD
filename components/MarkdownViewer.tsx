"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { Toolbar } from "./Toolbar";
import { EditorToolbar } from "./EditorToolbar";
import { FidelityReportModal } from "./FidelityReportModal";
import { TrustCenterModal } from "./TrustCenterModal";
import { AIContextModal } from "./AIContextModal";
import { cn } from "@/lib/utils";
import { useFileHandler } from "@/hooks/useFileHandler";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTheme } from "next-themes";
import { remark } from "remark";
import html from "remark-html";
import { FileText, Columns, Eye, Sparkles, ShieldCheck, HelpCircle } from "lucide-react";
import { calculateStructureScore, formatForAIContext } from "@/lib/aiReadiness";

const MarkdownPreview = dynamic(() => import("./MarkdownPreview"), { ssr: false });
const TableOfContents = dynamic(() => import("./TableOfContents").then(mod => ({ default: mod.TableOfContents })), { ssr: false });

const WELCOME_MD = `# 🚀 LocalMD: Local-First Knowledge Transformation

Transform proprietary documents (PDF, Word, PPTX) into structured, portable, and **AI-ready Markdown** — 100% on-device with zero cloud dependency.

## 📥 On-Device Document Transformation
Stop letting knowledge rot in locked proprietary formats.
- **📄 PDF to Markdown**: Coordinate-aware line sorting, heading inference (#, ##, ###), and LaTeX math detection.
- **📝 Word (.docx) to Markdown**: Clean semantic conversion preserving headings and tables using Mammoth.js.
- **📊 PowerPoint (.pptx) to Markdown**: Slide-by-slide sectioning, tables, hierarchical bullet points, and extracted speaker notes.
- **📦 Multi-File Batch Mode**: Drop multiple files at once to compile a unified **Batch Knowledge Bundle**.

---

## 🧠 AI-Readiness & Structure Intelligence

| Pillar | Capability |
| :--- | :--- |
| **Token Estimation** | Live token estimation calibrated for GPT-4, Claude & Llama models |
| **Structure Score** | Deterministic 100-point rubric inspecting hierarchy, density, and formatting |
| **AI Context Package** | 1-click export (\`Ctrl + Shift + C\`) wrapped in clean \`<document>\` envelope with outline |
| **Fidelity Telemetry** | Inspect preserved tables, math, headings, and degradation notes in real time |

---

## ⌨️ Productivity Command Center

| Action | Shortcut |
| :--- | :--- |
| **Open Local File** | \`Ctrl + O\` |
| **Undo / Redo** | \`Ctrl + Z / Y\` |
| **Save Changes** | \`Ctrl + S\` |
| **Save As / New File** | \`Ctrl + Shift + S\` |
| **AI Context & Score** | \`Ctrl + Shift + C\` |
| **Export Markdown** | \`Ctrl + M\` |
| **Export Standalone HTML** | \`Ctrl + E\` |
| **Print / Vector PDF** | \`Ctrl + P\` |
| **Toggle View Layout** | \`Ctrl + /\` |
| **Switch Visual Theme** | \`Ctrl + D\` |

---

## ✨ Advanced Rendering Suite

### 📊 Engineering & Architecture Diagrams (Mermaid)
\`\`\`mermaid
graph LR
    A[PDF / DOCX / PPTX] -->|100% Local Ingestion| B(LocalMD Engine)
    B -->|Structured Knowledge| C{AI-Readiness Layer}
    C -->|Vector / RAG| D[LLM Context]
    C -->|Future-Proof| E[Markdown Files]
    C -->|Publication| F[Standalone HTML / PDF]
\`\`\`

### 🧪 Scientific LaTeX Notation
Quantum Field Theory (Schrödinger Equation):
$$i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\left [ -\\frac{\\hbar^2}{2m}\\nabla^2 + V(\\mathbf{r},t) \\right ]\\Psi(\\mathbf{r},t)$$

---

### 🛡️ Verified Local-First Privacy
> [!IMPORTANT]
> **Zero-Cloud Guarantee**: All document transformation, PDF parsing, unzipping, and markdown rendering happen 100% locally in browser memory. No backend. No database. No telemetry.

---

### ✅ Transformation Readiness
- [x] Liquid Glassmorphism Workspace
- [x] Multi-format On-Device Transformation Engine
- [x] Deterministic Structure Score & Token Estimator
- [x] 1-Click AI Context Generation
- [ ] Transform my first document

*Drop a file or delete this text to ignite your workflow.*
`;

export default function MarkdownViewer() {
    const { 
        content, fileName, isModified, fileHandle, setContent, 
        openFile, saveFile, saveFileAs, importFile, handleDrop, 
        isImporting, undo, redo, canUndo, canRedo,
        fidelityReport, isFidelityModalOpen, setIsFidelityModalOpen
    } = useFileHandler(WELCOME_MD);

    const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");
    const { setTheme, theme } = useTheme();
    const [isSyncScroll, setIsSyncScroll] = useState(true);
    const [splitPosition, setSplitPosition] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Modals
    const [isTrustCenterOpen, setIsTrustCenterOpen] = useState(false);
    const [isAIContextModalOpen, setIsAIContextModalOpen] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);
    const mainRef = useRef<HTMLElement>(null);

    // Real-time Structure & Token Analysis
    const structureAnalysis = useMemo(() => {
        return calculateStructureScore(content);
    }, [content]);

    const activeFidelityReport = useMemo(() => {
        if (fidelityReport) return fidelityReport;
        return {
            format: (fileName.endsWith(".pdf") ? "PDF" : fileName.endsWith(".pptx") ? "PPTX" : fileName.endsWith(".docx") ? "DOCX" : "Markdown") as any,
            originalFileName: fileName,
            fileSizeFormatted: `${Math.max(0.1, Math.round(content.length / 1024 * 10) / 10)} KB`,
            headingsPreserved: structureAnalysis.metrics.headingsCount,
            tablesPreserved: structureAnalysis.metrics.tablesCount,
            listsPreserved: structureAnalysis.metrics.listsCount,
            mathExpressionsDetected: structureAnalysis.metrics.mathCount,
            degradationsAndWarnings: [
                "Document parsed and validated in browser memory.",
                "Semantic elements, code blocks, and headings cataloged for LLM context."
            ],
            structureScore: structureAnalysis.totalScore,
            structureGrade: structureAnalysis.grade,
            structureTier: structureAnalysis.tierName,
            estimatedTokens: structureAnalysis.metrics.estimatedTokens,
            processedAt: "Active Session",
        };
    }, [fidelityReport, fileName, content.length, structureAnalysis]);

    const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (!isSyncScroll || viewMode !== "split" || isScrollingRef.current) return;

        const textarea = e.currentTarget;
        const preview = previewContainerRef.current;
        if (!preview) return;

        isScrollingRef.current = true;
        const scrollHeight = textarea.scrollHeight - textarea.clientHeight;
        if (scrollHeight > 0) {
            const percentage = textarea.scrollTop / scrollHeight;
            const targetScroll = percentage * (preview.scrollHeight - preview.clientHeight);
            preview.scrollTop = targetScroll;
        }

        setTimeout(() => { isScrollingRef.current = false; }, 20);
    };

    const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (!isSyncScroll || viewMode !== "split" || isScrollingRef.current) return;

        const preview = e.currentTarget;
        const textarea = textareaRef.current;
        if (!textarea) return;

        isScrollingRef.current = true;
        const scrollHeight = preview.scrollHeight - preview.clientHeight;
        if (scrollHeight > 0) {
            const percentage = preview.scrollTop / scrollHeight;
            const targetScroll = percentage * (textarea.scrollHeight - textarea.clientHeight);
            textarea.scrollTop = targetScroll;
        }

        setTimeout(() => { isScrollingRef.current = false; }, 20);
    };

    const handleExportMarkdown = () => {
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName.endsWith(".md") ? fileName : `${fileName}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportHtml = async () => {
        try {
            const processedContent = await remark().use(html).process(content);
            const contentHtml = processedContent.toString();

            const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #24292e; }
        pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
        code { font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; font-size: 85%; background: rgba(27,31,35,0.05); padding: 0.2em 0.4em; border-radius: 3px; }
        pre > code { background: transparent; padding: 0; }
        table { border-collapse: collapse; width: 100%; }
        table th, table td { border: 1px solid #dfe2e5; padding: 6px 13px; }
        table tr:nth-child(2n) { background-color: #f6f8fa; }
        blockquote { border-left: 0.25em solid #dfe2e5; color: #6a737d; padding: 0 1em; margin: 0; }
        img { max-width: 100%; box-sizing: content-box; background-color: #fff; }
    </style>
</head>
<body>
    ${contentHtml}
</body>
</html>`;

            const blob = new Blob([fullHtml], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName.replace(/\.(md|markdown|txt)$/i, "") + ".html";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Export failed", e);
            alert("Failed to export HTML");
        }
    };

    const handleExportPdf = () => {
        window.print();
    };

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onOpen: openFile,
        onSave: saveFile,
        onSaveAs: saveFileAs,
        onUndo: undo,
        onRedo: redo,
        onExportMarkdown: handleExportMarkdown,
        onExportHtml: handleExportHtml,
        onExportPdf: handleExportPdf,
        onOpenAIContext: () => setIsAIContextModalOpen(true),
        onToggleView: () => {
            setViewMode((prev) => (prev === "split" ? "editor" : prev === "editor" ? "preview" : "split"));
        },
        onToggleTheme: () => {
            setTheme(theme === "dark" ? "light" : "dark");
        },
    });

    const handleToggleTask = (index: number, checked: boolean) => {
        const lines = content.split("\n");
        let currentIndex = 0;

        const newLines = lines.map(line => {
            const taskMatch = line.match(/^(\s*-\s+)\[([ x])\]/);
            if (taskMatch) {
                if (currentIndex === index) {
                    return line.replace(/^(\s*-\s+)\[([ x])\]/, `$1[${checked ? "x" : " "}]`);
                }
                currentIndex++;
            }
            return line;
        });

        if (currentIndex > index) {
            setContent(newLines.join("\n"));
        }
    };

    const handleInsert = (before: string, after: string = "") => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

        setContent(newText);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length + (selectedText ? selectedText.length : 0);
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const [isDragging, setIsDragging] = useState(false);
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const onDragLeave = () => setIsDragging(false);
    const onDrop = (e: React.DragEvent) => {
        setIsDragging(false);
        handleDrop(e);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !mainRef.current) return;

            const rect = mainRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = (x / rect.width) * 100;

            if (percentage >= 15 && percentage <= 85) {
                setSplitPosition(percentage);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [isResizing]);

    return (
        <div
            className="flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible bg-liquid text-foreground font-sans selection:bg-primary/30"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {/* Top Status Bar with AI Readiness & Local Verification */}
            <div className="flex items-center justify-between px-4 md:px-6 py-2 bg-white/5 backdrop-blur-md border-b border-white/10 text-[10px] uppercase tracking-widest text-muted-foreground/80 print:hidden z-50">
                <div className="flex items-center gap-3 md:gap-6 flex-wrap">
                    <span className="flex items-center gap-2" suppressHydrationWarning>
                        <div className={cn("w-1.5 h-1.5 rounded-full", isModified ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
                        <span className="font-semibold text-foreground/90 truncate max-w-[150px] md:max-w-[240px]" suppressHydrationWarning>{fileName}</span>
                    </span>

                    <span className="hidden sm:inline border-l border-white/10 pl-4 md:pl-6 space-x-3">
                        <span suppressHydrationWarning>{structureAnalysis.metrics.wordCount} Words</span>
                        <span suppressHydrationWarning>{structureAnalysis.metrics.charCount} Chars</span>
                    </span>

                    {/* Live Token Count Estimation */}
                    <span 
                        className="hidden md:inline border-l border-white/10 pl-4 md:pl-6 text-purple-400 font-semibold cursor-help"
                        title="Estimated token count (~3.85-4 chars/token heuristic across GPT-4, Claude & Llama models)"
                    >
                        ~{structureAnalysis.metrics.estimatedTokens.toLocaleString()} Est. Tokens
                    </span>

                    {/* Structure Score Badge */}
                    <button
                        onClick={() => setIsAIContextModalOpen(true)}
                        className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-[9px] font-bold text-foreground cursor-pointer"
                        title="Click to view full structure breakdown & export AI context"
                    >
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span>Score: {structureAnalysis.totalScore}/100</span>
                        <span className="text-emerald-400">({structureAnalysis.tierName})</span>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsTrustCenterOpen(true)}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
                        title="Open Trust & Architecture Center"
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline font-bold">100% On-Device</span>
                    </button>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                </div>
            </div>

            {/* Floating Top Toolbar */}
            <div className="print:hidden relative z-40">
                <Toolbar
                    onOpenFile={openFile}
                    onImportFile={importFile}
                    onSaveFile={saveFile}
                    onExportMarkdown={handleExportMarkdown}
                    onExportHtml={handleExportHtml}
                    onExportPdf={handleExportPdf}
                    onOpenAIContext={() => setIsAIContextModalOpen(true)}
                    onOpenTrustCenter={() => setIsTrustCenterOpen(true)}
                    onOpenFidelityReport={() => setIsFidelityModalOpen(true)}
                    hasFidelityReport={!!fidelityReport}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    isSyncScroll={isSyncScroll}
                    setIsSyncScroll={setIsSyncScroll}
                    isModified={isModified}
                    hasFileHandle={!!fileHandle}
                    isImporting={isImporting}
                />
            </div>

            {/* Main Editor & Preview Viewport */}
            <main ref={mainRef} className="flex-1 flex flex-col md:flex-row gap-2 md:gap-4 p-2 md:p-4 overflow-hidden relative">
                {/* Drag Overlay */}
                {isDragging && (
                    <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center m-4 rounded-2xl border-2 border-primary border-dashed animate-pulse print:hidden pointer-events-none gap-2">
                        <div className="text-2xl font-bold text-primary pointer-events-none">Drop Document(s) for Local Transformation</div>
                        <p className="text-sm text-muted-foreground pointer-events-none">Supports batch conversion for .pdf, .docx, .pptx, and .md</p>
                    </div>
                )}

                {/* Importing Overlay */}
                {isImporting && (
                    <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-xl flex flex-col items-center justify-center m-4 rounded-2xl border border-white/10 shadow-2xl print:hidden animate-in fade-in zoom-in duration-300">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 bg-primary/20 rounded-full animate-ping" />
                            </div>
                        </div>
                        <h2 className="mt-6 text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
                            Transforming Document On-Device
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground animate-pulse">
                            Extracting structured semantic Markdown (0 cloud telemetry)...
                        </p>
                    </div>
                )}

                {/* Resizing Overlay */}
                {isResizing && (
                    <div className="absolute inset-0 z-40 cursor-col-resize print:hidden" />
                )}

                {/* Editor Pane */}
                <div
                    className={cn(
                        "flex flex-col min-w-0 glass rounded-2xl overflow-hidden transition-all duration-500 print:hidden shadow-2xl",
                        viewMode === "preview" ? "hidden" : "flex",
                        "max-md:flex-1",
                        isResizing ? "transition-none" : ""
                    )}
                    style={{
                        flex: (viewMode === "split" && isMounted) ? `0 0 ${splitPosition}%` : undefined
                    }}
                >
                    <EditorToolbar 
                        onInsert={handleInsert} 
                        onUndo={undo} 
                        onRedo={redo}
                        canUndo={canUndo}
                        canRedo={canRedo}
                    />
                    <textarea
                        ref={textareaRef}
                        onScroll={handleEditorScroll}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 w-full h-full p-4 md:p-8 resize-none bg-transparent font-mono text-sm leading-relaxed focus:outline-none focus:ring-0 placeholder:text-muted-foreground/30 text-foreground/90 selection:bg-primary/40 custom-scrollbar"
                        placeholder="Ignite your creativity..."
                        spellCheck={false}
                    />
                </div>

                {/* Draggable Divider */}
                {viewMode === "split" && (
                    <div
                        onMouseDown={handleMouseDown}
                        className={cn(
                            "hidden md:flex w-1.5 h-1/2 self-center cursor-col-resize transition-all z-30 group print:hidden rounded-full items-center justify-center",
                            isResizing 
                                ? "bg-primary scale-y-110 shadow-[0_0_20px_rgba(139,92,246,0.6)]" 
                                : "bg-black/20 dark:bg-white/40 hover:bg-primary/60 dark:shadow-[0_0_10px_rgba(139,92,246,0.1)]"
                        )}
                    >
                        <div className="w-1 h-12 flex flex-col items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="w-1 h-4 bg-black/60 dark:bg-white rounded-full" />
                            <div className="w-1 h-4 bg-black/60 dark:bg-white rounded-full" />
                        </div>
                    </div>
                )}

                {/* Preview Pane */}
                <div
                    className={cn(
                        "flex flex-col min-w-0 glass rounded-2xl overflow-hidden transition-all duration-500 shadow-2xl print:bg-white print:overflow-visible print:block",
                        viewMode === "editor" ? "hidden" : "flex",
                        "max-md:flex-1",
                        isResizing ? "transition-none" : ""
                    )}
                    style={{
                        flex: (viewMode === "split" && isMounted) ? `0 0 ${100 - splitPosition}%` : undefined
                    }}
                >
                    <div
                        ref={previewContainerRef}
                        onScroll={handlePreviewScroll}
                        className="h-full w-full overflow-auto p-6 md:p-10 print:p-0 print:overflow-visible custom-scrollbar"
                    >
                        <MarkdownPreview content={content} onToggleTask={handleToggleTask} />
                    </div>
                </div>
            </main>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center justify-around p-3 pb-6 bg-white/90 dark:bg-black/40 backdrop-blur-2xl border-t border-black/5 dark:border-white/10 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
                <button 
                    onClick={() => setViewMode("editor")}
                    className={cn(
                        "flex flex-col items-center gap-1.5 transition-all duration-300",
                        viewMode === "editor" ? "text-primary scale-110" : "text-foreground/40 dark:text-muted-foreground"
                    )}
                >
                    <FileText className="w-5 h-5" />
                    <div className="text-[10px] font-bold uppercase tracking-widest">Editor</div>
                </button>
                <button 
                    onClick={() => setViewMode("split")}
                    className={cn(
                        "flex flex-col items-center gap-1.5 transition-all duration-300",
                        viewMode === "split" ? "text-primary scale-110" : "text-foreground/40 dark:text-muted-foreground"
                    )}
                >
                    <Columns className="w-5 h-5" />
                    <div className="text-[10px] font-bold uppercase tracking-widest">Split</div>
                </button>
                <button 
                    onClick={() => setViewMode("preview")}
                    className={cn(
                        "flex flex-col items-center gap-1.5 transition-all duration-300",
                        viewMode === "preview" ? "text-primary scale-110" : "text-foreground/40 dark:text-muted-foreground"
                    )}
                >
                    <Eye className="w-5 h-5" />
                    <div className="text-[10px] font-bold uppercase tracking-widest">Preview</div>
                </button>
            </div>

            {/* Floating Table of Contents */}
            <div className="hidden md:block">
                <TableOfContents content={content} />
            </div>

            {/* Modals */}
            <FidelityReportModal
                report={activeFidelityReport}
                isOpen={isFidelityModalOpen}
                onClose={() => setIsFidelityModalOpen(false)}
                onCopyAIContext={() => {
                    const aiText = formatForAIContext({ content, fileName });
                    navigator.clipboard.writeText(aiText);
                }}
            />

            <TrustCenterModal
                isOpen={isTrustCenterOpen}
                onClose={() => setIsTrustCenterOpen(false)}
            />

            <AIContextModal
                isOpen={isAIContextModalOpen}
                onClose={() => setIsAIContextModalOpen(false)}
                content={content}
                fileName={fileName}
            />
        </div>
    );
}
