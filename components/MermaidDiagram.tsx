"use client";

import React, { useEffect, useState } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
    chart: string;
}

// Initialize Mermaid once
if (typeof window !== "undefined") {
    mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "loose",
        fontFamily: "inherit",
    });
}

let idCounter = 0;

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [id] = useState(() => `mermaid-${Date.now()}-${idCounter++}`);

    useEffect(() => {
        const timer = setTimeout(() => {
            const renderDiagram = async () => {
                try {
                    const { svg: renderedSvg } = await mermaid.render(id, chart);
                    setSvg(renderedSvg);
                    setError("");
                } catch (err) {
                    console.error("Mermaid rendering error:", err);
                    setError(err instanceof Error ? err.message : "Unknown error");
                }
            };

            renderDiagram();
        }, 300);

        return () => clearTimeout(timer);
    }, [chart, id]);

    if (error) {
        return (
            <div className="text-red-500 text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <strong>Mermaid Error:</strong> {error}
            </div>
        );
    }

    if (!svg) {
        return (
            <div className="text-muted-foreground text-xs p-2 bg-muted rounded">
                Rendering diagram...
            </div>
        );
    }

    return <div className="mermaid-diagram my-4" dangerouslySetInnerHTML={{ __html: svg }} />;
}
