"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

interface KeyboardShortcutsConfig {
    onOpen?: () => void;
    onSave?: () => void;
    onSaveAs?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    onExportMarkdown?: () => void;
    onExportHtml?: () => void;
    onExportPdf?: () => void;
    onToggleView?: () => void;
    onToggleTheme?: () => void;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
    // Store latest callbacks in a ref so the effect never needs to re-run
    // when the caller re-creates the config object on each render.
    const configRef = useRef(config);
    // useLayoutEffect runs synchronously after each render, before paint —
    // this satisfies react-hooks/refs while keeping configRef always up to date.
    useLayoutEffect(() => {
        configRef.current = config;
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const ctrl = e.ctrlKey || e.metaKey;

            // Ctrl/Cmd + O: Open file
            if (ctrl && e.key === "o") {
                e.preventDefault();
                configRef.current.onOpen?.();
            }

            // Ctrl/Cmd + Shift + S: Save As
            if (ctrl && e.shiftKey && e.key === "S") {
                e.preventDefault();
                configRef.current.onSaveAs?.();
            }

            // Ctrl/Cmd + S (no shift): Save file
            if (ctrl && !e.shiftKey && e.key === "s") {
                e.preventDefault();
                configRef.current.onSave?.();
            }

            // Ctrl/Cmd + Z: Undo
            if (ctrl && !e.shiftKey && e.key === "z") {
                e.preventDefault();
                configRef.current.onUndo?.();
            }

            // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
            if ((ctrl && e.shiftKey && e.key === "Z") || (ctrl && e.key === "y")) {
                e.preventDefault();
                configRef.current.onRedo?.();
            }

            // Ctrl/Cmd + E: Export HTML
            if (ctrl && e.key === "e") {
                e.preventDefault();
                configRef.current.onExportHtml?.();
            }

            // Ctrl/Cmd + M: Export Markdown
            if (ctrl && e.key === "m") {
                e.preventDefault();
                configRef.current.onExportMarkdown?.();
            }

            // Ctrl/Cmd + P: Export PDF/Print
            if (ctrl && e.key === "p") {
                e.preventDefault();
                configRef.current.onExportPdf?.();
            }

            // Ctrl/Cmd + /: Toggle view mode
            if (ctrl && e.key === "/") {
                e.preventDefault();
                configRef.current.onToggleView?.();
            }

            // Ctrl/Cmd + D: Toggle dark mode
            if (ctrl && e.key === "d") {
                e.preventDefault();
                configRef.current.onToggleTheme?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []); // Empty deps — runs once, always reads latest via ref
}
