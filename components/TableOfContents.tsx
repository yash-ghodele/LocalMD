"use client";

import React, { useMemo, useState } from "react";
import { List, X } from "lucide-react";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
    const [isOpen, setIsOpen] = useState(false);

    const headings = useMemo(() => {
        const items: TocItem[] = [];
        const lines = content.split("\n");

        lines.forEach((line, index) => {
            const match = line.match(/^(#{1,6})\s+(.+)$/);
            if (match) {
                const level = match[1].length;
                const text = match[2];
                const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
                items.push({ id, text, level });
            }
        });

        return items;
    }, [content]);

    if (headings.length === 0) return null;

    const scrollToHeading = (text: string) => {
        // Use the stable ID we set on the preview prose container
        const preview = document.getElementById("markdown-preview-prose");
        if (!preview) return;

        const headingElements = preview.querySelectorAll("h1, h2, h3, h4, h5, h6");
        const target = Array.from(headingElements).find((el) => el.textContent?.trim() === text.trim());

        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all z-50 print:hidden"
                title="Table of Contents"
            >
                {isOpen ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
            </button>

            {isOpen && (
                <div className="fixed bottom-20 right-4 w-72 max-h-96 bg-background border rounded-lg shadow-xl overflow-hidden z-40 print:hidden">
                    <div className="p-3 border-b bg-muted/50">
                        <h3 className="font-semibold text-sm">Table of Contents</h3>
                    </div>
                    <div className="overflow-y-auto max-h-80 p-2">
                        {headings.map((heading, idx) => (
                            <button
                                key={idx}
                                onClick={() => scrollToHeading(heading.text)}
                                className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded transition-colors"
                                style={{ paddingLeft: `${(heading.level - 1) * 0.75 + 0.5}rem` }}
                            >
                                <span className="text-muted-foreground mr-1.5">{"#".repeat(heading.level)}</span>
                                {heading.text}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
