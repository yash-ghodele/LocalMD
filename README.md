# Local Markdown Viewer

A fast, secure, and privacy-focused local-first Markdown viewer and editor built with Next.js. All your data stays on your device — no servers, no tracking, no cloud storage.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)

## ✨ Features

### Core Functionality
- **📝 Split-Screen Editor**: Edit Markdown on the left, see live preview on the right
- **↔️ Resizable Partition**: Drag the vertical divider to customize your workspace layout (15–85% range)
- **🎨 GitHub-Flavored Markdown**: Full support for tables, task lists, and [GitHub alerts](https://github.com/orgs/community/discussions/16925)
- **📐 LaTeX & Math**: Beautiful math formulas rendered with `remark-math` + `KaTeX`
- **📊 Mermaid Diagrams**: Flowcharts, sequence diagrams, and more — theme-aware and live
- **🎯 Syntax Highlighting**: Beautiful code blocks with `rehype-highlight` (GitHub Dark theme)
- **📋 Copy Code Button**: One-click copy on hover for every code block
- **✅ Interactive Tasks**: Click task checkboxes in the preview — they update the source Markdown live
- **🌓 Dark/Light Mode**: System-aware theme with manual toggle (Light / Dark)
- **📑 Table of Contents**: Auto-generated floating TOC panel from your headings
- **📊 Live Stats**: Real-time word count and character count in the status bar

### File Management
- **📂 Open File**: Native file picker via the File System Access API (Chrome/Edge) with fallback `<input>` for all browsers
- **💾 Save File**: Write changes back to the original file directly — no re-download needed
- **💾 Save As**: Choose a new destination for any document, including unsaved drafts
- **🔄 Drag & Drop**: Drop any `.md`, `.markdown`, or `.txt` file directly onto the window
- **🕐 Auto-Save**: Content is debounce-saved to `localStorage` every 2 seconds — you never lose a draft
- **🔧 Self-Healing**: Automatically resets a corrupted Welcome Guide from older app versions

### Editor Toolbar
Insert common Markdown syntax with one click: **Bold**, *Italic*, ~~Strikethrough~~, `Code`, H1, H2, lists, task lists, blockquotes, links, images, and tables.

### Export Options
- **📄 Export to HTML**: Standalone self-contained HTML file with embedded GitHub-style CSS
- **🖨️ Export to PDF**: Clean print-optimized layout via the browser print dialog (glassmorphism removed for clean output)

### Privacy & Performance
- **🔒 100% Local**: No analytics, no external requests, no data collection
- **⚡ Offline-First**: PWA support with service worker caching
- **🚀 Fast Loading**: Optimized production bundle with code splitting and dynamic imports

---

## 📖 Documentation

| Doc | Description |
|-----|-------------|
| [🧬 Brand DNA](doc/dna.md) | Core mission, identity, and target audience persona |
| [🚀 Overview](doc/overview.md) | Project goals and core philosophy |
| [🏗️ Tech Stack](doc/tech-stack.md) | Breakdown of the Next.js 16 + Tailwind v4 architecture |
| [✨ Features](doc/features.md) | Deep dive into all premium features |
| [🧩 Architecture](doc/architecture.md) | Component map, hooks, and rendering pipeline |
| [🔌 API Reference](doc/api-reference.md) | File System Access API, hooks, and design tokens |
| [⌨️ User Guide](doc/user-guide.md) | Keyboard shortcuts and power interactions |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yash-ghodele/markdown-viewer.git
cd markdown-viewer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + O` | Open a local Markdown file |
| `Ctrl + S` | Save to current file (Save As for untitled docs) |
| `Ctrl + Shift + S` | Save As — choose a new destination |
| `Ctrl + E` | Export as standalone HTML |
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
