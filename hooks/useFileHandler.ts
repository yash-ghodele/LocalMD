"use client";

import { useState, useCallback, useEffect } from "react";
import { extractTextFromPDF, extractTextFromPPTX } from "@/lib/importers";

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
                    // Only add to history if it's significantly different or after a pause
                    // For simplicity, we add all programmatic changes here
                    nextHistory.push(newContent);
                    // Cap history at 50 items
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


    const importFile = useCallback(async () => {
        try {
            if ("showOpenFilePicker" in window) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const [handle] = await (window as any).showOpenFilePicker({
                    types: [
                        {
                            description: "Documents to Markdown",
                            accept: {
                                "application/pdf": [".pdf"],
                                "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
                            },
                        },
                    ],
                    excludeAcceptAllOption: false,
                    multiple: false,
                });

                const file = await handle.getFile();
                setIsImporting(true);
                
                let text = "";
                if (file.name.endsWith(".pdf")) {
                    text = await extractTextFromPDF(file);
                } else if (file.name.endsWith(".pptx")) {
                    text = await extractTextFromPPTX(file);
                }

                setState({
                    content: text,
                    fileHandle: null, // Importing creates a new unsaved document
                    fileName: file.name.replace(/\.(pdf|pptx)$/i, "") + ".md",
                    isModified: true,
                });
            } else {
                // Fallback for browsers without File System Access API
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".pdf,.pptx";
                input.onchange = async (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (!files || files.length === 0) return;
                    const file = files[0];
                    setIsImporting(true);
                    
                    let text = "";
                    if (file.name.endsWith(".pdf")) {
                        text = await extractTextFromPDF(file);
                    } else if (file.name.endsWith(".pptx")) {
                        text = await extractTextFromPPTX(file);
                    }

                    setState({
                        content: text,
                        fileHandle: null,
                        fileName: file.name.replace(/\.(pdf|pptx)$/i, "") + ".md",
                        isModified: true,
                    });
                    setIsImporting(false);
                };
                input.click();
            }
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                console.error("Error importing file:", err);
                alert("Failed to import file");
            }
        } finally {
            setIsImporting(false);
        }
    }, []);

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
            } else {
                // Fallback for browsers without File System Access API
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

    /**
     * Saves to the currently open file handle.
     * If no handle exists (untitled doc), falls through to saveFileAs.
     */
    const saveFile = useCallback(async () => {
        if (!state.fileHandle) {
            // No handle — delegate to Save As
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

    /**
     * Opens a Save As dialog so the user can choose a destination.
     * Works even for untitled (new) documents.
     */
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
                // Fallback: download via blob
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
        
        const { items, files } = e.dataTransfer;

        // Try to get files from items first (better for File System Access API)
        if (items && items.length > 0) {
            const item = items[0];
            if (item.kind === "file") {
                try {
                    const entry = await (item as DataTransferItem & { getAsFileSystemHandle?: () => Promise<FileSystemHandle | null> }).getAsFileSystemHandle?.();
                    if (entry && entry.kind === "file") {
                        const file = await (entry as FileSystemFileHandle).getFile();
                        const isMD = file.name.endsWith(".md") || file.name.endsWith(".markdown") || file.name.endsWith(".txt");
                        if (isMD) {
                            const text = await file.text();
                            setState({
                                content: text,
                                fileHandle: entry as FileSystemFileHandle,
                                fileName: file.name,
                                isModified: false,
                            });
                            return;
                        }
                    }
                } catch (err) {
                    console.warn("FileSystemHandle access failed, falling back:", err);
                }
            }
        }

        // Fallback to standard files
        if (files && files.length > 0) {
            const file = files[0];
            const isMarkdown = file.name.endsWith(".md") || file.name.endsWith(".markdown") || file.name.endsWith(".txt");
            const isPDF = file.name.endsWith(".pdf");
            const isPPTX = file.name.endsWith(".pptx");

            if (isMarkdown) {
                const text = await file.text();
                setState({
                    content: text,
                    fileHandle: null,
                    fileName: file.name,
                    isModified: false,
                });
            } else if (isPDF || isPPTX) {
                setIsImporting(true);
                try {
                    const text = isPDF ? await extractTextFromPDF(file) : await extractTextFromPPTX(file);
                    setState({
                        content: text,
                        fileHandle: null,
                        fileName: file.name.replace(/\.(pdf|pptx)$/i, "") + ".md",
                        isModified: true,
                    });
                } catch (err) {
                    console.error("Drop import failed:", err);
                    alert("Failed to import dropped file");
                } finally {
                    setIsImporting(false);
                }
            }
        }
    }, []);

    return {
        content: state.content,
        fileName: state.fileName,
        isModified: state.isModified,
        fileHandle: state.fileHandle,
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
