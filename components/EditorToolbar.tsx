"use client";

import React from "react";
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Link2,
    Image,
    Table,
    CheckSquare,
    Quote,
} from "lucide-react";

interface EditorToolbarProps {
    onInsert: (before: string, after?: string) => void;
}

export function EditorToolbar({ onInsert }: EditorToolbarProps) {
    const buttons = [
        {
            icon: Bold,
            label: "Bold",
            action: () => onInsert("**", "**"),
        },
        {
            icon: Italic,
            label: "Italic",
            action: () => onInsert("*", "*"),
        },
        {
            icon: Strikethrough,
            label: "Strikethrough",
            action: () => onInsert("~~", "~~"),
        },
        {
            icon: Code,
            label: "Inline Code",
            action: () => onInsert("`", "`"),
        },
        { divider: true },
        {
            icon: Heading1,
            label: "H1",
            action: () => onInsert("# ", ""),
        },
        {
            icon: Heading2,
            label: "H2",
            action: () => onInsert("## ", ""),
        },
        { divider: true },
        {
            icon: List,
            label: "Bullet List",
            action: () => onInsert("- ", ""),
        },
        {
            icon: ListOrdered,
            label: "Numbered List",
            action: () => onInsert("1. ", ""),
        },
        {
            icon: CheckSquare,
            label: "Task List",
            action: () => onInsert("- [ ] ", ""),
        },
        { divider: true },
        {
            icon: Quote,
            label: "Quote",
            action: () => onInsert("> ", ""),
        },
        {
            icon: Link2,
            label: "Link",
            action: () => onInsert("[", "](url)"),
        },
        {
            icon: Image,
            label: "Image",
            action: () => onInsert("![alt](", ")"),
        },
        {
            icon: Table,
            label: "Table",
            action: () =>
                onInsert(
                    "| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n",
                    ""
                ),
        },
    ];

    return (
        <div className="flex items-center gap-1 px-2 py-1.5 border-b bg-muted/30 flex-wrap print:hidden">
            {buttons.map((button, idx) => {
                if ("divider" in button && button.divider) {
                    return (
                        <div
                            key={`divider-${idx}`}
                            className="w-px h-5 bg-border mx-1"
                        />
                    );
                }

                const Icon = button.icon!;
                return (
                    <button
                        key={idx}
                        onClick={button.action}
                        className="p-1.5 hover:bg-accent rounded transition-colors"
                        title={button.label}
                        type="button"
                    >
                        <Icon className="w-4 h-4" />
                    </button>
                );
            })}
        </div>
    );
}
