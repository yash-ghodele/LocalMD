"use client";

import React, { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkGemoji from "remark-gemoji";
import remarkGithubBlockquoteAlert from "remark-github-blockquote-alert";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import { MermaidDiagram } from "./MermaidDiagram";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownPreviewProps {
    content: string;
    onToggleTask?: (index: number, checked: boolean) => void;
}

const CodeBlock = function ({ className, children, ...props }: any) {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";
    const codeString = String(children).replace(/\n$/, "");
    const isInline = !match && !Buffer.isBuffer(children) && !String(children).includes("\n");

    // Render Mermaid diagrams with custom component (no DOM manipulation!)
    if (language === "mermaid") {
        return <MermaidDiagram chart={codeString} />;
    }

    // Inline code
    if (isInline) {
        return (
            <code className={className} {...props}>
                {children}
            </code>
        );
    }

    // Block code with copy button
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(codeString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <div className="relative group">
            <button
                onClick={handleCopy}
                className="absolute right-2 top-2 p-1.5 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                title="Copy code"
            >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <code className={className} {...props}>
                {children}
            </code>
        </div>
    );
};

const MarkdownPreview = memo(function MarkdownPreview({ content, onToggleTask }: MarkdownPreviewProps) {
    // Counter to track which checkbox we are rendering
    let checkboxIndex = 0;

    return (
        <div className="prose prose-sm dark:prose-invert max-w-none w-full break-words prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-pre:bg-white/5 prose-pre:backdrop-blur-sm prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath, remarkGemoji, remarkGithubBlockquoteAlert]}
                rehypePlugins={[rehypeHighlight, rehypeKatex]}
                components={{
                    code: CodeBlock,
                    input: (props) => {
                        if (props.type !== "checkbox") {
                            return <input {...props} />;
                        }

                        const currentIndex = checkboxIndex;
                        checkboxIndex++;

                        return (
                            <input
                                {...props}
                                type="checkbox"
                                onChange={() => {
                                    if (onToggleTask) {
                                        onToggleTask(currentIndex, !props.checked);
                                    }
                                }}
                                className="cursor-pointer"
                                disabled={!onToggleTask}
                            />
                        );
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
});

export default MarkdownPreview;
