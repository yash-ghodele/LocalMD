"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Toolbar } from "./Toolbar";
import { EditorToolbar } from "./EditorToolbar";
import { cn } from "@/lib/utils";
import { useFileHandler } from "@/hooks/useFileHandler";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTheme } from "next-themes";
import { remark } from "remark";
import html from "remark-html";

const MarkdownPreview = dynamic(() => import("./MarkdownPreview"), { ssr: false });
const TableOfContents = dynamic(() => import("./TableOfContents").then(mod => ({ default: mod.TableOfContents })), { ssr: false });

export default function MarkdownViewer() {
    const { content, fileName, isModified, fileHandle, setContent, openFile, saveFile, handleDrop } = useFileHandler(
        "# Welcome to Local Markdown Viewer\n\nStart typing or drag a file here."
    );
    const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");
    const { setTheme, theme } = useTheme();
    const [isSyncScroll, setIsSyncScroll] = useState(true);
    const [splitPosition, setSplitPosition] = useState(50);
    const [isResizing, setIsResizing] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);
    const mainRef = useRef<HTMLElement>(null);

    const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (!isSyncScroll || viewMode !== "split" || isScrollingRef.current) return;

        const textarea = e.currentTarget;
        const preview = previewContainerRef.current;
        if (!preview) return;

        isScrollingRef.current = true;
        const percentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
        preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);

        setTimeout(() => { isScrollingRef.current = false; }, 50);
    };

    const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (!isSyncScroll || viewMode !== "split" || isScrollingRef.current) return;

        const preview = e.currentTarget;
        const textarea = textareaRef.current;
        if (!textarea) return;

        isScrollingRef.current = true;
        const percentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
        textarea.scrollTop = percentage * (textarea.scrollHeight - textarea.clientHeight);

        setTimeout(() => { isScrollingRef.current = false; }, 50);
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
        onSave: fileHandle ? saveFile : undefined,
        onExportHtml: handleExportHtml,
        onExportPdf: handleExportPdf,
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
            // Check if line contains a task list item
            const taskMatch = line.match(/^(\s*-\s+)\[([ x])\]/);
            if (taskMatch) {
                if (currentIndex === index) {
                    // Toggle the checkbox
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

        // Set cursor position after insertion
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
            
            // Limit range between 20% and 80%
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
            className="flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div className="flex items-center justify-between px-4 py-1 bg-background border-b text-xs text-muted-foreground print:hidden">
                <span className="flex items-center gap-4">
                    <span>
                        {fileName}
                        {isModified ? "*" : ""}
                    </span>
                    <span className="hidden sm:inline opacity-70">
                        {content.trim().split(/\s+/).filter(w => w.length > 0).length} words
                        {" • "}
                        {content.length} chars
                    </span>
                </span>
                <span className="hidden sm:inline">Auto-saved to Local Storage</span>
            </div>

            <div className="print:hidden">
                <Toolbar
                    onOpenFile={openFile}
                    onExportHtml={handleExportHtml}
                    onExportPdf={handleExportPdf}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    isSyncScroll={isSyncScroll}
                    setIsSyncScroll={setIsSyncScroll}
                />
            </div>

            <main 
                ref={mainRef}
                className="flex-1 flex overflow-hidden relative print:overflow-visible print:block"
            >
                {/* Drag Overlay */}
                {isDragging && (
                    <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center m-4 rounded-xl border-2 border-primary border-dashed animate-pulse print:hidden">
                        <div className="text-xl font-medium text-primary">Drop Markdown file here</div>
                    </div>
                )}

                {/* Resizing Overlay to prevent interaction with textarea/preview while dragging */}
                {isResizing && (
                    <div className="absolute inset-0 z-40 cursor-col-resize print:hidden" />
                )}

                {/* Editor Pane */}
                <div
                    className={cn(
                        "flex flex-col min-w-0 border-r transition-none duration-300 print:hidden bg-background",
                        viewMode === "preview" ? "hidden" : "flex"
                    )}
                    style={{ 
                        flex: viewMode === "split" ? `0 0 ${splitPosition}%` : "1 1 0%" 
                    }}
                >
                    <EditorToolbar onInsert={handleInsert} />
                    <textarea
                        ref={textareaRef}
                        onScroll={handleEditorScroll}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 w-full h-full p-6 resize-none bg-transparent font-mono text-sm leading-relaxed focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
                        placeholder="Type markdown here..."
                        spellCheck={false}
                    />
                </div>

                {/* Draggable Divider */}
                {viewMode === "split" && (
                    <div
                        onMouseDown={handleMouseDown}
                        className={cn(
                            "w-1 h-full cursor-col-resize hover:bg-primary/50 transition-colors z-30 group print:hidden",
                            isResizing ? "bg-primary" : "bg-transparent -ml-0.5"
                        )}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-1 h-4 bg-muted-foreground rounded-full" />
                            <div className="w-1 h-4 bg-muted-foreground rounded-full ml-0.5" />
                        </div>
                    </div>
                )}

                {/* Preview Pane */}
                <div
                    className={cn(
                        "flex flex-col min-w-0 bg-secondary/30 transition-none duration-300 overflow-hidden print:bg-white print:overflow-visible print:block",
                        viewMode === "editor" ? "hidden" : "flex"
                    )}
                    style={{ 
                        flex: viewMode === "split" ? `0 0 ${100 - splitPosition}%` : "1 1 0%" 
                    }}
                >
                    <div
                        ref={previewContainerRef}
                        onScroll={handlePreviewScroll}
                        className="h-full w-full overflow-auto p-8 print:p-0 print:overflow-visible"
                    >
                        <MarkdownPreview content={content} onToggleTask={handleToggleTask} />
                    </div>
                </div>
            </main>

            {/* Table of Contents */}
            <TableOfContents content={content} />


            {/* Print Styles */}
            <style jsx global>{`
        @media print {
          body {
            background: white;
            color: black;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:overflow-visible {
            overflow: visible !important;
          }
          .print\\:h-auto {
            height: auto !important;
          }
          ::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
        </div>
    );
}
