"use client";

import { useState, useCallback, useEffect } from "react";

export interface FileHandlerState {
    content: string;
    fileHandle: FileSystemFileHandle | null;
    fileName: string;
    isModified: boolean;
}

const AUTOSAVE_KEY = "markdown-viewer-autosave";
const AUTOSAVE_DELAY = 2000; // 2 seconds

export function useFileHandler(initialContent: string) {
    const [state, setState] = useState<FileHandlerState>(() => {
        // Load from localStorage on init
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(AUTOSAVE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    let content = parsed.content || initialContent;

                    // Self-healing: Detect broken math syntax from previous unescaped versions
                    // If it contains "ihbar" or "Psi(" or the form feed character from broken \frac
                    const isCorrupted = content.includes("ihbar") || content.includes("Psi(") || content.includes("\u000c");
                    if (isCorrupted && content.includes("# 🚀 Welcome")) {
                        console.log("Self-healing: Detected corrupted Welcome Guide, resetting to latest version.");
                        content = initialContent;
                    }

                    return {
                        content: content,
                        fileHandle: null,
                        fileName: parsed.fileName || "Untitled.md",
                        isModified: false,
                    };
                } catch (e) {
                    console.error("Failed to load autosave:", e);
                }
            }
        }
        return {
            content: initialContent,
            fileHandle: null,
            fileName: "Untitled.md",
            isModified: false,
        };
    });

    // Auto-save to localStorage
    useEffect(() => {
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
    }, [state.content, state.fileName]);

    const setContent = useCallback((newContent: string) => {
        setState((prev) => ({
            ...prev,
            content: newContent,
            isModified: true,
        }));
    }, []);

    const openFile = useCallback(async () => {
        try {
            if ("showOpenFilePicker" in window) {
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

    const saveFile = useCallback(async () => {
        try {
            if (state.fileHandle) {
                const writable = await (state.fileHandle as any).createWritable();
                await writable.write(state.content);
                await writable.close();
                setState((prev) => ({ ...prev, isModified: false }));
            } else {
                // No file handle, can't save
                alert("No file to save. Please open or save as a new file.");
            }
        } catch (err) {
            console.error("Error saving file:", err);
            alert("Failed to save file");
        }
    }, [state.fileHandle, state.content]);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        const items = Array.from(e.dataTransfer.items);

        if (items.length === 0) return;

        // Check for File System Access API support in DataTransferItem
        const item = items[0];
        if (item.kind === "file") {
            try {
                // getAsFileSystemHandle returns a Promise!
                const entry = await (item as any).getAsFileSystemHandle?.(); 

                if (entry && (entry.kind === "file") && (entry.name.endsWith(".md") || entry.name.endsWith(".markdown") || entry.name.endsWith(".txt"))) {
                    const file = await (entry as FileSystemFileHandle).getFile();
                    const text = await file.text();
                    setState({
                        content: text,
                        fileHandle: entry as FileSystemFileHandle,
                        fileName: file.name,
                        isModified: false,
                    });
                    return;
                }
            } catch (err) {
                console.warn("Experimental getAsFileSystemHandle failed, falling back to standard API:", err);
            }

            // Standard file (fallback or non-FS access)
            const file = item.getAsFile();
            if (file && (file.name.endsWith(".md") || file.name.endsWith(".markdown") || file.name.endsWith(".txt"))) {
                const text = await file.text();
                setState({
                    content: text,
                    fileHandle: null,
                    fileName: file.name,
                    isModified: false,
                });
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
        handleDrop,
    };
}
