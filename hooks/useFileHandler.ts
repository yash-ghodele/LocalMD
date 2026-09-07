"use client";

import { useState, useCallback, useEffect } from "react";
import { 
    extractTextFromPDF, 
    extractTextFromPPTX, 
    extractTextFromDOCX, 
    ConversionFidelityReport 
} from "@/lib/importers";
import { calculateStructureScore, estimateTokens } from "@/lib/aiReadiness";

export interface FileHandlerState {
    content: string;
    fileHandle: FileSystemFileHandle | null;
    fileName: string;
    isModified: boolean;
}

const AUTOSAVE_KEY = "markdown-viewer-autosave";
const AUTOSAVE_DELAY = 2000; // 2 seconds

export function useFileHandler(initialContent: string) {
    const [isImporting, setIsImporting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [fidelityReport, setFidelityReport] = useState<ConversionFidelityReport | null>(null);
    const [isFidelityModalOpen, setIsFidelityModalOpen] = useState(false);
    const [state, setState] = useState<FileHandlerState>({
        content: initialContent,
        fileHandle: null,
        fileName: "Untitled.md",
        isModified: false,
    });

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(AUTOSAVE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    let content = parsed.content || initialContent;

                    // Self-healing: Detect broken math syntax from previous unescaped versions
                    const isCorrupted = content.includes("ihbar") || content.includes("Psi(") || content.includes("\u000c");
                    if (isCorrupted && content.includes("# 🚀 Local MD")) {
                        content = initialContent;
                    }

                    setState({
                        content: content,
                        fileHandle: null,
                        fileName: parsed.fileName || "Untitled.md",
                        isModified: false,
                    });
                } catch (e) {
                    console.error("Failed to load autosave:", e);
                }
            }
            setIsMounted(true);
        }
    }, [initialContent]);

    // Auto-save to localStorage
    useEffect(() => {
        if (!isMounted) return;
        
        const timer = setTimeout(() => {
            if (typeof window !== "undefined") {
                localStorage.setItem(
                    AUTOSAVE_KEY,
                    JSON.stringify({
                        content: state.content,
                        fileName: state.fileName,
                    })
                );
            }
        }, AUTOSAVE_DELAY);

        return () => clearTimeout(timer);
    }, [state.content, state.fileName, isMounted]);

    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const setContent = useCallback((newContent: string, skipHistory = false) => {
        setState((prev) => {
            if (prev.content === newContent) return prev;
            
            if (!skipHistory) {
                setHistory(prevHistory => {
                    const nextHistory = prevHistory.slice(0, historyIndex + 1);
                    nextHistory.push(newContent);
                    if (nextHistory.length > 50) nextHistory.shift();
                    setHistoryIndex(nextHistory.length - 1);
                    return nextHistory;
                });
            }

            return {
                ...prev,
                content: newContent,
                isModified: true,
            };
        });
    }, [historyIndex]);

    // Initialize history once state is set
    useEffect(() => {
        if (history.length === 0 && state.content) {
            setHistory([state.content]);
            setHistoryIndex(0);
        }
    }, [state.content, history.length]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const nextIndex = historyIndex - 1;
            const previousContent = history[nextIndex];
            setHistoryIndex(nextIndex);
            setState(prev => ({ ...prev, content: previousContent, isModified: true }));
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            const nextContent = history[nextIndex];
            setHistoryIndex(nextIndex);
            setState(prev => ({ ...prev, content: nextContent, isModified: true }));
        }
    }, [history, historyIndex]);

    /**
     * Process an array of files (supports batch conversions)
     */
    const processFiles = useCallback(async (files: File[]) => {
        if (!files || files.length === 0) return;
        setIsImporting(true);

        try {
            if (files.length === 1) {
                const file = files[0];
                const isMD = file.name.endsWith(".md") || file.name.endsWith(".markdown") || file.name.endsWith(".txt");
                const isPDF = file.name.endsWith(".pdf");
                const isPPTX = file.name.endsWith(".pptx");
                const isDOCX = file.name.endsWith(".docx");

                if (isMD) {
                    const text = await file.text();
                    setState({
                        content: text,
                        fileHandle: null,
                        fileName: file.name,
                        isModified: false,
                    });
                    setFidelityReport(null);
                } else if (isPDF) {
                    const result = await extractTextFromPDF(file);
                    setState({
                        content: result.markdown,
                        fileHandle: null,
                        fileName: file.name.replace(/\.pdf$/i, ".md"),
                        isModified: true,
                    });
                    setFidelityReport(result.report);
                    setIsFidelityModalOpen(true);
                } else if (isPPTX) {
                    const result = await extractTextFromPPTX(file);
                    setState({
                        content: result.markdown,
                        fileHandle: null,
                        fileName: file.name.replace(/\.pptx$/i, ".md"),
                        isModified: true,
                    });
                    setFidelityReport(result.report);
                    setIsFidelityModalOpen(true);
                } else if (isDOCX) {
                    const result = await extractTextFromDOCX(file);
                    setState({
                        content: result.markdown,
                        fileHandle: null,
                        fileName: file.name.replace(/\.docx$/i, ".md"),
                        isModified: true,
                    });
                    setFidelityReport(result.report);
                    setIsFidelityModalOpen(true);
                }
            } else {
                // Multi-file batch transformation
                let combinedMarkdown = `# 📦 LocalMD Batch Knowledge Bundle\n\nConverted ${files.length} documents on-device with zero cloud telemetry.\n\n---\n\n`;
                let totalHeadings = 0;
                let totalTables = 0;
                let totalLists = 0;
                let totalMath = 0;
                let totalSlidesOrPages = 0;
                const batchWarnings: string[] = [];

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    combinedMarkdown += `# Document ${i + 1}: ${file.name}\n\n`;

                    if (file.name.endsWith(".pdf")) {
                        const res = await extractTextFromPDF(file);
                        combinedMarkdown += res.markdown + "\n\n---\n\n";
                        totalHeadings += res.report.headingsPreserved;
                        totalTables += res.report.tablesPreserved;
                        totalLists += res.report.listsPreserved;
                        totalMath += res.report.mathExpressionsDetected;
                        totalSlidesOrPages += res.report.pageOrSlideCount || 0;
                        if (res.report.degradationsAndWarnings.length > 0) {
                            batchWarnings.push(`${file.name}: ${res.report.degradationsAndWarnings.join("; ")}`);
                        }
                    } else if (file.name.endsWith(".pptx")) {
                        const res = await extractTextFromPPTX(file);
                        combinedMarkdown += res.markdown + "\n\n---\n\n";
                        totalHeadings += res.report.headingsPreserved;
                        totalTables += res.report.tablesPreserved;
                        totalLists += res.report.listsPreserved;
                        totalSlidesOrPages += res.report.pageOrSlideCount || 0;
                    } else if (file.name.endsWith(".docx")) {
                        const res = await extractTextFromDOCX(file);
                        combinedMarkdown += res.markdown + "\n\n---\n\n";
                        totalHeadings += res.report.headingsPreserved;
                        totalTables += res.report.tablesPreserved;
                        totalLists += res.report.listsPreserved;
                    } else {
                        const text = await file.text();
                        combinedMarkdown += text + "\n\n---\n\n";
                    }
                }

                const finalMd = combinedMarkdown.trim();
                const analysis = calculateStructureScore(finalMd);

                const batchReport: ConversionFidelityReport = {
                    format: "Batch",
                    originalFileName: `Batch_${files.length}_Files`,
                    fileSizeFormatted: `${files.length} Documents`,
                    pageOrSlideCount: totalSlidesOrPages,
                    headingsPreserved: totalHeadings,
                    tablesPreserved: totalTables,
                    listsPreserved: totalLists,
                    mathExpressionsDetected: totalMath,
                    degradationsAndWarnings: batchWarnings.length > 0 ? batchWarnings : ["Batch compilation successful with clean semantic separation."],
                    structureScore: analysis.totalScore,
                    structureGrade: analysis.grade,
                    structureTier: analysis.tierName,
                    estimatedTokens: estimateTokens(finalMd),
                    processedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                };

                setState({
                    content: finalMd,
                    fileHandle: null,
                    fileName: `Batch_Knowledge_Bundle_${files.length}_Docs.md`,
                    isModified: true,
                });
                setFidelityReport(batchReport);
                setIsFidelityModalOpen(true);
            }
        } catch (err) {
            console.error("Batch processing error:", err);
            alert("Failed to process file(s)");
        } finally {
            setIsImporting(false);
        }
    }, []);

    const importFile = useCallback(async () => {
        try {
            if ("showOpenFilePicker" in window) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const handles = await (window as any).showOpenFilePicker({
                    types: [
                        {
                            description: "Documents to Markdown",
                            accept: {
                                "application/pdf": [".pdf"],
                                "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                            },
                        },
                    ],
                    excludeAcceptAllOption: false,
                    multiple: true,
                });

                const files: File[] = [];
                for (const h of handles) {
                    files.push(await h.getFile());
                }
                await processFiles(files);
            } else {
                // Fallback for browsers without File System Access API
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".pdf,.pptx,.docx";
                input.multiple = true;
                input.onchange = async (e) => {
                    const files = Array.from((e.target as HTMLInputElement).files || []);
                    await processFiles(files);
                };
                input.click();
            }
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                console.error("Error importing file:", err);
                alert("Failed to import file");
            }
        }
    }, [processFiles]);

    const openFile = useCallback(async () => {
        try {
            if ("showOpenFilePicker" in window) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const [handle] = await (window as any).showOpenFilePicker({
                    types: [
                        {
                            description: "Markdown Files",
                            accept: {
                                "text/markdown": [".md", ".markdown"],
                                "text/plain": [".txt"],
                            },
                        },
                    ],
                    excludeAcceptAllOption: false,
                    multiple: false,
                });

                const file = await handle.getFile();
                const text = await file.text();

                setState({
                    content: text,
                    fileHandle: handle,
                    fileName: file.name,
                    isModified: false,
                });
                setFidelityReport(null);
            } else {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".md,.markdown,.txt";
                input.onchange = async (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (!files || files.length === 0) return;
                    const file = files[0];
                    const text = await file.text();
                    setState({
                        content: text,
                        fileHandle: null,
                        fileName: file.name,
                        isModified: false,
                    });
                    setFidelityReport(null);
                };
                input.click();
            }
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                console.error("Error opening file:", err);
                alert("Failed to open file");
            }
        }
    }, []);

    const saveFile = useCallback(async () => {
        if (!state.fileHandle) {
            return saveFileAs();
        }
        try {
            const writable = await state.fileHandle.createWritable();
            await writable.write(state.content);
            await writable.close();
            setState((prev) => ({ ...prev, isModified: false }));
        } catch (err) {
            console.error("Error saving file:", err);
            alert("Failed to save file");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.fileHandle, state.content]);

    const saveFileAs = useCallback(async () => {
        try {
            if ("showSaveFilePicker" in window) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: state.fileName,
                    types: [
                        {
                            description: "Markdown File",
                            accept: { "text/markdown": [".md"] },
                        },
                    ],
                });
                const writable = await handle.createWritable();
                await writable.write(state.content);
                await writable.close();
                setState((prev) => ({
                    ...prev,
                    fileHandle: handle,
                    fileName: (handle as FileSystemFileHandle & { name: string }).name,
                    isModified: false,
                }));
            } else {
                const blob = new Blob([state.content], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = state.fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setState((prev) => ({ ...prev, isModified: false }));
            }
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                console.error("Error saving file:", err);
                alert("Failed to save file");
            }
        }
    }, [state.fileName, state.content]);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await processFiles(files);
        }
    }, [processFiles]);

    return {
        content: state.content,
        fileName: state.fileName,
        isModified: state.isModified,
        fileHandle: state.fileHandle,
        fidelityReport,
        isFidelityModalOpen,
        setIsFidelityModalOpen,
        setContent,
        openFile,
        saveFile,
        saveFileAs,
        importFile,
        handleDrop,
        isImporting,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
    };
}
