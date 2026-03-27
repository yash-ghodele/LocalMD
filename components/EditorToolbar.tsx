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
        <div className="flex items-center gap-1.5 px-6 py-3 border-b border-white/10 bg-white/5 backdrop-blur-md flex-wrap print:hidden">
            {buttons.map((button, idx) => {
                if ("divider" in button && button.divider) {
                    return (
                        <div
                            key={`divider-${idx}`}
                            className="w-px h-4 bg-white/10 mx-1.5"
                        />
                    );
                }

                const Icon = button.icon!;
                return (
                    <button
                        key={idx}
                        onClick={button.action}
                        className="p-1.5 hover:bg-white/10 text-muted-foreground hover:text-white rounded-lg transition-all active:scale-90"
                        title={button.label}
                        type="button"
                    >
                        <Icon className="w-3.5 h-3.5" />
                    </button>
                );
            })}
        </div>
    );
}
