# LocalMD | Premium Local-First Markdown Architecture

A state-of-the-art, privacy-focused local-first Markdown editor and transformation engine built with Next.js 16. All your data stays on your device — no servers, no tracking, no cloud storage.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)

## ✨ Premium Features

### 🚀 Advanced Document Transformation
- **📄 PDF to Markdown**: High-fidelity text extraction with intelligent heading detection and structural preservation.
- **📊 PPTX to Markdown**: Transform PowerPoint presentations into structured Markdown slides instantly.
- **🔄 Smart Drag & Drop**: Drop any `.md`, `.pdf`, or `.pptx` file directly onto the window for instant conversion.

### 📝 Editor & Architecture
- **⏱️ Undo/Redo History**: Robust programmatic history engine — never lose an edit, even after complex toolbar transformations.
- **📝 Split-Screen Editor**: Edit Markdown on the left, see live preview on the right with **Sync-Scroll**.
- **🎨 Liquid Glassmorphism**: Stunning, high-performance UI with premium blurring, gradients, and interactive animations.
- **📑 Table of Contents**: Auto-generated floating TOC panel for instant document navigation.
- **✅ Interactive Tasks**: Click task checkboxes in the preview — they update the source Markdown live.

### 📊 Rendering Engine
- **📐 LaTeX & Math**: Professional math formulas rendered with `KaTeX`.
- **📊 Mermaid Diagrams**: Flowcharts, sequence diagrams, and more — live and theme-aware.
- **📋 Premium Tables**: Glass-style tables with striped rows, hover highlights, and rounded architecture.
- **🎯 Syntax Highlighting**: Beautiful code blocks with GitHub Dark theme and hover-copy support.

### 🔒 Privacy & Performance
- **🔐 100% Local**: All processing happens in-browser. No analytics, no data collection.
- **⚡ Offline-First**: PWA support with local storage sync and service worker caching.
- **💾 Native File System**: Direct read/write access via the File System Access API.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + O` | Open a local file (Markdown, PDF, PPTX) |
| `Ctrl + S` | Save current file (Save As for untitled docs) |
| `Ctrl + Z` | **Undo** last edit |
| `Ctrl + Y` | **Redo** last edit |
| `Ctrl + M` | Export as Markdown file |
| `Ctrl + E` | Export as standalone HTML |
| `Ctrl + P` | Print / Export as PDF |
| `Ctrl + /` | Toggle Split/Editor/Preview View |
| `Ctrl + D` | Toggle Dark/Light Theme |

| `Ctrl + P` | Export as PDF / open print dialog |
| `Ctrl + /` | Cycle view modes: Split → Editor → Preview |
| `Ctrl + D` | Toggle Light / Dark theme |

---

## 📖 Usage

1. **Open a File** — Click **Open** in the toolbar, press `Ctrl+O`, or drag a `.md` file onto the window
2. **Edit** — Write Markdown in the left pane; the right pane updates live
3. **Resize** — Drag the center divider to adjust the editor/preview split
4. **Save** — Click **Save** (amber when unsaved), or press `Ctrl+S`; `Ctrl+Shift+S` to save to a new file
5. **Export** — Click the download icon for HTML, or the file icon for PDF
6. **Navigate** — Click the list icon (bottom-right) to open the Table of Contents
7. **Theme** — Click ☀️/🌙 in the toolbar or press `Ctrl+D`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Webpack) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| UI Library | [React 19](https://react.dev/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) + `@tailwindcss/typography` |
| Markdown | `react-markdown`, `remark-gfm`, `remark-math`, `remark-gemoji`, `remark-github-blockquote-alert` |
| Math | `rehype-katex` + `KaTeX` |
| Diagrams | [Mermaid](https://mermaid.js.org/) |
| Code Highlighting | `rehype-highlight` (GitHub Dark theme) |
| Icons | [Lucide React](https://lucide.dev/) |
| Theme | [next-themes](https://github.com/pacocoursey/next-themes) |
| PWA | [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa) |

---

## 📁 Project Structure

```
markdown-viewer/
├── app/
│   ├── globals.css           # Tailwind v4 design system + glassmorphism tokens + print styles
│   ├── github-alerts.css     # GitHub-style blockquote alert styles
│   ├── layout.tsx            # Root layout — SEO metadata, fonts, ThemeProvider
│   ├── manifest.ts           # PWA manifest
│   └── page.tsx              # Entry point — renders <MarkdownViewer />
├── components/
│   ├── MarkdownViewer.tsx    # Core orchestrator: layout, resizing, drag-drop, exports
│   ├── MarkdownPreview.tsx   # Markdown → HTML render pipeline
│   ├── Toolbar.tsx           # Floating toolbar: open, save, view modes, export, theme
│   ├── EditorToolbar.tsx     # Markdown formatting insertion buttons
│   ├── MermaidDiagram.tsx    # Theme-aware Mermaid SVG renderer
│   ├── TableOfContents.tsx   # Auto-generated TOC floating panel
│   └── theme-provider.tsx    # next-themes wrapper
├── hooks/
│   ├── useFileHandler.ts     # File open, save, save-as, drag-drop, autosave
│   └── useKeyboardShortcuts.ts # Global keyboard shortcut bindings
├── lib/
│   └── utils.ts              # cn() utility (clsx + tailwind-merge)
├── types/
│   └── file-system.d.ts      # TypeScript declarations for File System Access API
└── public/
    ├── icon.png              # PWA icon
    └── sw.js                 # Generated service worker (production only)
```

---

## 🌐 Browser Support

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Basic Viewer & Editor | ✅ | ✅ | ✅ | ✅ |
| File System Access API (Open/Save) | ✅ | ✅ | ⚠️ | ⚠️ |
| Save As dialog | ✅ | ✅ | ⚠️ | ⚠️ |
| PWA Install | ✅ | ✅ | ❌ | ✅ |

*⚠️ = Falls back gracefully to standard `<input type="file">` / blob download*

---

## 🔐 Privacy & Security

- **No Server**: Everything runs in your browser — zero backend
- **No Analytics**: No tracking, telemetry, or third-party scripts
- **No Cloud**: Your files never leave your device
- **No Network after Load**: Works fully offline once the PWA is cached

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Feel free to report bugs, suggest features, or submit pull requests.

## 👨‍💻 Author

**Yash Ghodele** — [@yash-ghodele](https://github.com/yash-ghodele)

---

*Made with ❤️ for developers who value privacy and simplicity.*
