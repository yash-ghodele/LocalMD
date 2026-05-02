# Project Architecture

A complete view of the project's technical structure, component roles, and data flow.

---

## 📁 Directory Structure

```
/app
  layout.tsx          → Root layout: SEO metadata, Google Font (Inter), ThemeProvider, global CSS
  page.tsx            → Single route: renders <MarkdownViewer />
  globals.css         → Tailwind v4 design system, CSS vars, glassmorphism, print styles
  github-alerts.css   → GitHub blockquote alert visual styles

/components
  MarkdownViewer.tsx  → Core orchestrator: layout, resize, drag-drop, sync scroll, export
  MarkdownPreview.tsx → Stateless render engine: remark/rehype pipeline + custom components
  Toolbar.tsx         → Floating glass navbar: open, save, view modes, export, theme toggle
  EditorToolbar.tsx   → Markdown formatting buttons above the textarea
  MermaidDiagram.tsx  → Isolated Mermaid SVG renderer (theme-aware, unique IDs per instance)
  TableOfContents.tsx → FAB → floating panel, parses headings, smooth-scrolls to target
  theme-provider.tsx  → Thin next-themes ThemeProvider wrapper

/hooks
  useFileHandler.ts        → Core state: open, save, drag-drop, localStorage, and 50-state undo/redo history stack
  useKeyboardShortcuts.ts  → Stable-ref global keyboard shortcuts (single listener, zero re-runs)

/lib
  importers.ts        → Transformation engine: PDF (pdfjs), PPTX (jszip), and Word (mammoth) extraction
  utils.ts            → cn() = clsx + tailwind-merge

/types
  file-system.d.ts    → TypeScript global augmentations for File System Access API
```

---

## 🧩 Component Communication

`MarkdownViewer` is the single orchestrator — all state and actions flow through it:

```
useFileHandler  →  content, fileName, isModified, fileHandle, history, historyIndex
                   openFile, saveFile, saveFileAs, setContent, handleDrop, undo, redo
       ↓
MarkdownViewer  →  viewMode, splitPosition, isSyncScroll, isDragging, isResizing
       ↓                       ↓                           ↓
    Toolbar             MarkdownPreview              TableOfContents
  (actions out)         (content in)                 (content in)
       ↓                       ↓
  EditorToolbar        MermaidDiagram
  (onInsert → setContent)    (per mermaid code block)
```

### Key Design Decisions
- **`content`** lives in `useFileHandler` so the hook owns all persistence logic
- **`viewMode`** (`"split" | "editor" | "preview"`) controls pane visibility and the divider
- **`splitPosition`** is a percentage (15–85) driven by mouse drag events attached to `window`
- **`isScrollingRef`** is a `useRef` lock preventing scroll event feedback loops between panes

---

## ⚙️ The Rendering Pipeline

`MarkdownPreview` uses a multi-stage unified pipeline:

```
Raw Markdown string
       ↓
  remark plugins:
    remark-gfm                      → Tables, task lists, strikethrough, autolinks
    remark-math                     → Detect $...$ and $$...$$ as math nodes
    remark-gemoji                   → :emoji: shortcodes → Unicode
    remark-github-blockquote-alert  → [!TIP] / [!WARNING] / etc. blocks
       ↓
  rehype plugins:
    rehype-highlight   → Syntax-highlighted <code> blocks (highlight.js)
    rehype-katex       → Math nodes → KaTeX HTML
       ↓
  Custom React component overrides:
    code   → CodeBlock (copy button) or MermaidDiagram (language="mermaid")
    input  → Interactive checkbox → onToggleTask → mutates raw Markdown source
```

### Dynamic Imports
`MarkdownPreview` and `TableOfContents` use `next/dynamic` (`ssr: false`) to prevent server-side execution of browser-only APIs (Mermaid, localStorage, File System Access API).

---

## 🔒 Hydration Strategy

The app has intentional SSR/client mismatches handled with `suppressHydrationWarning`:

| Element | Reason |
|---------|--------|
| `<html>` | `next-themes` injects a class attribute client-side |
| `<body>` | Browser extensions inject attributes (e.g. Grammarly) |
| Status bar (filename, word/char count) | Values come from `localStorage`, unavailable on the server |
| Theme toggle buttons | `theme` is `undefined` during SSR with `next-themes` |
