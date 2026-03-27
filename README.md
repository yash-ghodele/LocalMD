# Local Markdown Viewer

A fast, secure, and privacy-focused local-first Markdown viewer and editor built with Next.js. All your data stays on your device—no servers, no tracking, no cloud storage.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

### Core Functionality
- **📝 Split-Screen Editor**: Edit Markdown on the left, see live preview on the right
- **↔️ Resizable Partition**: Drag the vertical divider to customize your workspace layout
- **🎨 GitHub-Flavored Markdown**: Full support for tables, task lists, and [GitHub alerts](https://github.com/orgs/community/discussions/16925)
- **📐 LaTeX & Math**: Beautiful math formulas with `remark-math` and `katex`
- **📊 Mermaid Diagrams**: Render flowcharts and diagrams directly from code
- **🎯 Syntax Highlighting**: Beautiful code blocks with `rehype-highlight`
- **🌓 Dark/Light Mode**: System-aware theme with manual toggle
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### File Management
- **📂 File System Access API**: Native file picker with write access (Chrome, Edge)
- **🔄 Drag & Drop**: Simply drag `.md` files onto the window
- **💾 Graceful Fallback**: Standard file input for unsupported browsers

### Export Options
- **📄 Export to HTML**: Standalone HTML file with embedded styles
- **🖨️ Export to PDF**: Print-optimized layout via browser print dialog

### Privacy & Performance
- **🔒 100% Local**: No analytics, no external requests, no data collection
- **⚡ Offline-First**: PWA support with service worker caching
- **🚀 Fast Loading**: Optimized bundle with code splitting

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
# Create optimized production build
npm run build

# Start production server
npm start
```

## 📖 Usage

1. **Open a File**
   - Click the "Open File" button
   - Or drag a `.md` file onto the window

2. **Edit and Preview**
   - Type Markdown in the left pane
   - See live preview on the right
   - **Adjust Workspace**: Drag the vertical divider to resize panes
   - Toggle between Editor/Split/Preview modes

3. **Export**
   - Click "HTML" to download standalone HTML
   - Click "PDF" to open print dialog for PDF export

4. **Customize**
   - Click the sun/moon icon to toggle dark/light theme

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + Typography plugin
- **Markdown**: 
  - [react-markdown](https://github.com/remarkjs/react-markdown)
  - [remark-gfm](https://github.com/remarkjs/remark-gfm)
  - [remark-math](https://github.com/remarkjs/remark-math) & [katex](https://katex.org/)
  - [mermaid](https://mermaid.js.org/)
  - [rehype-highlight](https://github.com/rehypejs/rehype-highlight)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **PWA**: [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa)

## 📁 Project Structure

```
markdown-viewer/
├── app/
│   ├── globals.css          # Global styles and Tailwind config
│   ├── layout.tsx           # Root layout with theme provider
│   ├── manifest.ts          # PWA manifest
│   └── page.tsx             # Main entry point
├── components/
│   ├── MarkdownViewer.tsx   # Main viewer component
│   ├── MarkdownPreview.tsx  # Markdown rendering component
│   ├── Toolbar.tsx          # Top toolbar with controls
│   └── theme-provider.tsx   # Theme context wrapper
├── hooks/
│   └── useFileHandler.ts    # File system access logic
├── lib/
│   └── utils.ts             # Utility functions (cn)
├── types/
│   └── file-system.d.ts     # TypeScript declarations for FS API
└── public/
    ├── icon.svg             # PWA icon
    └── sw.js                # Generated service worker
```

## 🔐 Privacy & Security

- **No Server**: Everything runs in your browser
- **No Analytics**: Zero tracking or telemetry
- **No Cloud**: Files never leave your device
- **No Network Calls**: After initial load, works completely offline

## 🌐 Browser Support

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Basic Viewer | ✅ | ✅ | ✅ | ✅ |
| File System Access API | ✅ | ✅ | ⚠️ | ⚠️ |
| PWA Install | ✅ | ✅ | ❌ | ✅ |

*⚠️ = Falls back to standard file input*

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 👨‍💻 Author

**Yash Ghodele**
- GitHub: [@yash-ghodele](https://github.com/yash-ghodele)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [rehype](https://github.com/rehypejs) and [remark](https://github.com/remarkjs) ecosystems

---

**Made with ❤️ for developers who value privacy and simplicity.**
