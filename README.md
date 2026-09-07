# LocalMD | Local-First Knowledge Transformation Platform

A state-of-the-art, privacy-focused local-first knowledge transformation platform built with Next.js 16. Convert locked, proprietary document formats (PDF, DOCX, PPTX) into structured, portable, AI-ready Markdown — entirely on-device with zero cloud dependency.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)

---

## ✨ Core Pillars (v2)

### 🚀 On-Device Document Transformation
- **📄 PDF to Markdown**: Coordinate-aware line sorting, automatic heading level inference (`#`, `##`, `###`), list formatting, and LaTeX math detection via local `/pdf.worker.min.mjs` (0 external CDN calls).
- **📝 Word (.docx) to Markdown**: High-fidelity semantic conversion preserving headings, bold/italics, and tables using Mammoth.js.
- **📊 PowerPoint (.pptx) to Markdown**: Slide-by-slide sectioning, tables, hierarchical indented bullet points, and extracted **speaker notes**.
- **📦 Multi-File Batch Mode**: Drop or import multiple documents simultaneously to produce a structured **Batch Knowledge Bundle** with an aggregated fidelity report.

### 🧠 AI-Readiness & Structure Intelligence
- **⏱️ Live Token Estimation**: Real-time token counter calibrated against GPT-4, Claude, and Llama tokenizers (~3.85–4 chars/token heuristic).
- **📊 Deterministic Structure Score**: 100-point rubric inspecting Heading Hierarchy (30 pts), Section Granularity (25 pts), Semantic Richness (25 pts), and Formatting Hygiene (20 pts).
- **⚡ 1-Click AI Context Package (`Ctrl + Shift + C`)**: Instant copy format wrapped in an inspectable `<document>` XML envelope with an auto-generated structural outline and file metadata.
- **📋 Conversion Fidelity & Degradation Reports**: Real-time telemetry disclosing preserved elements (headings, tables, math, speaker notes) and honest degradation warnings (e.g., scanned un-OCRable pages, multi-column linearization).

### 🎨 Premium Workspace & Rendering Suite
- **⏱️ 50-Step Programmatic Undo/Redo**: Deep history engine preserves your edits even after complex toolbar operations.
- **📐 Scientific LaTeX**: Live rendering of complex mathematical notations with KaTeX.
- **📊 Mermaid Diagrams**: Live, theme-aware architecture diagrams, sequence maps, and flowcharts.
- **📋 Liquid Glassmorphism**: High-performance UI with frosted glass design, hover highlights, and custom scrollbars.
- **📑 Table of Contents**: Floating navigation drawer auto-indexed from `#` to `######` headers.
- **✅ Interactive Task Lists**: Toggle checkboxes in the preview to update raw Markdown in real time.

### 🔒 100% Zero-Cloud Trust & Sovereignty
- **🔐 True Device-Only Execution**: Zero outbound network requests during document conversion; 0 telemetry or third-party analytics scripts.
- **⚡ Offline-First PWA**: Service workers cache assets locally for air-gapped operation.
- **💾 Native File System**: Direct read/write to local disk files via the Web File System Access API.

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + O` | Open local file (Markdown, PDF, DOCX, PPTX) |
| `Ctrl + S` | Save current file (Save As for untitled docs) |
| `Ctrl + Shift + S` | Save As new file |
| `Ctrl + Shift + C` | **AI Context Package & Structure Score** |
| `Ctrl + Z / Ctrl + Y` | **Undo / Redo** last edit |
| `Ctrl + M` | Export as Markdown file |
| `Ctrl + E` | Export as standalone HTML |
| `Ctrl + P` | Print / Export as vector PDF |
| `Ctrl + /` | Toggle Split / Editor / Preview View |
| `Ctrl + D` | Toggle Dark / Light Theme |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.1.6 (App Router, Webpack) |
| **Language** | TypeScript 5 |
| **UI Library** | React 19.2.3 |
| **Styling** | Tailwind CSS 4 + `@tailwindcss/typography` + Liquid Glassmorphism |
| **Markdown Pipeline** | `react-markdown`, `remark-gfm`, `remark-math`, `remark-gemoji`, `remark-github-blockquote-alert` |
| **Document Parsers** | `pdfjs-dist` (local worker), `mammoth` (Word), `jszip` (PowerPoint) |
| **Math & Diagrams** | `katex`, `rehype-katex`, `mermaid` |
| **Code Highlighting** | `rehype-highlight` (GitHub Dark theme) |
| **PWA & Theming** | `@ducanh2912/next-pwa`, `next-themes`, `lucide-react` |

---

## 📁 Project Structure

```
LocalMD/
├── app/
│   ├── globals.css           # Tailwind v4 design system + glassmorphism tokens + print styles
│   ├── github-alerts.css     # GitHub-style blockquote alert styles
│   ├── layout.tsx            # Root layout — SEO metadata, fonts, ThemeProvider
│   ├── manifest.ts           # PWA manifest
│   └── page.tsx              # Entry point — renders <MarkdownViewer />
├── components/
│   ├── MarkdownViewer.tsx    # Core orchestrator: layout, live stats, batch drop, shortcuts
│   ├── MarkdownPreview.tsx   # Markdown → HTML render pipeline with Mermaid & KaTeX
│   ├── Toolbar.tsx           # Floating toolbar: transform, fidelity, AI context, exports
│   ├── EditorToolbar.tsx     # Markdown formatting insertion buttons
│   ├── FidelityReportModal.tsx # Post-conversion fidelity & degradation telemetry modal
│   ├── TrustCenterModal.tsx  # In-app zero-backend & privacy audit modal
│   ├── AIContextModal.tsx    # Structure Score breakdown & AI context copy modal
│   ├── MermaidDiagram.tsx    # Theme-aware Mermaid SVG renderer
│   ├── TableOfContents.tsx   # Auto-generated TOC floating drawer
│   └── theme-provider.tsx    # next-themes wrapper
├── hooks/
│   ├── useFileHandler.ts     # Batch imports, File System Access API, autosave, undo/redo
│   └── useKeyboardShortcuts.ts # Global keyboard shortcut bindings
├── lib/
│   ├── aiReadiness.ts        # Deterministic 100-pt Structure Score & AI Context generator
│   ├── importers.ts          # Local PDF, DOCX, and PPTX transformation engines
│   └── utils.ts              # cn() utility (clsx + tailwind-merge)
└── public/
    ├── icon.png              # App icon
    ├── pdf.worker.min.mjs    # Local PDF.js worker (0 CDN calls)
    └── sw.js                 # Generated service worker (production)
```

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details. Built by **Yash Ghodele** / **Ugam Digital Studio**.
