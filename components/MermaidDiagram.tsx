"use client";

import React, { useEffect, useState } from "react";
import mermaid from "mermaid";

import { useTheme } from "next-themes";

interface MermaidDiagramProps {
    chart: string;
}

let idCounter = 0;

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string>("");
    const { resolvedTheme } = useTheme();
    const [id] = useState(() => `mermaid-${Date.now()}-${idCounter++}`);

    useEffect(() => {
        const timer = setTimeout(() => {
            const renderDiagram = async () => {
                try {
                    // Re-initialize mermaid with current theme
                    mermaid.initialize({
                        startOnLoad: false,
                        theme: resolvedTheme === "dark" ? "dark" : "default",
                        securityLevel: "loose",
                        fontFamily: "inherit",
                    });

                    const { svg: renderedSvg } = await mermaid.render(id, chart);
                    setSvg(renderedSvg);
                    setError("");
                } catch (err) {
                    console.error("Mermaid rendering error:", err);
                    setError(err instanceof Error ? err.message : "Unknown error");
                }
            };

            renderDiagram();
        }, 100); // Shorter delay

        return () => clearTimeout(timer);
    }, [chart, id, resolvedTheme]);

    if (error) {
        return (
            <div className="text-red-500 text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <strong>Mermaid Error:</strong> {error}
            </div>
        );
    }

    if (!svg) {
        return (
            <div className="text-muted-foreground text-xs p-2 bg-muted/20 rounded animate-pulse">
                Rendering diagram...
            </div>
        );
    }

    return (
        <div 
            className="mermaid-diagram my-6 overflow-x-auto flex justify-center bg-white/5 p-4 rounded-xl border border-white/10" 
            dangerouslySetInnerHTML={{ __html: svg }} 
        />
    );
}
