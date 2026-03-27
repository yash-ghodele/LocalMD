# Project Architecture

A high-level view of the project's technical structure and component architecture.

## 📁 Project Structure
```text
/app             - Next.js App Router (Layouts, Global Styles)
/components      - Modular UI Elements
  MarkdownViewer - Main Layout & Resizing Logic
  MarkdownPreview- Rendering Engine (Remarks/Rehypes)
  Toolbar        - Main App Control Hub
  EditorToolbar  - Text Insertion & Formatting Control
  TableOfContents- Dynamic Outline Navigation
  MermaidDiagram - Theme-aware Diagram Component
/hooks           - Custom Application Logic
  useFileHandler - FileSystem API & Drag n Drop 
  useKeyboardShortcuts - Global App Shortcuts
/lib             - Shared Utilities (cn, etc.)
/public          - Static Assets (Manifests, PWA Icons)
/doc             - Comprehensive Project Documentation
```

## 🧩 Component Communication
The `MarkdownViewer` acts as the orchestrator.
1. It uses `useFileHandler` to manage the content state.
2. It passes the `content` to `MarkdownPreview` and `TableOfContents`.
3. It passes `openFile`/`saveFile` actions to the `Toolbar`.

## ⚙️ The Rendering Pipeline
The `MarkdownPreview` uses a complex pipeline to turn Markdown into high-fidelity HTML:
- **Markdown AST** (via `remark`)
- **Plugin Application** (GFM, Math, Gemoji, Alerts)
- **HTML AST** (via `rehype`)
- **Final Formatting** (Categorizing into `CodeBlock` or `MermaidDiagram` components)
