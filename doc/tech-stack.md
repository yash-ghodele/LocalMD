# Tech Stack & Dependencies

The Local Markdown Viewer is built with a cutting-edge, "Type-First" modern web stack.

## 🏗️ Core Frameworks
- **Next.js 16 (App Router)**: Utilizing the latest React Server Components (RSC) patterns and improved bundling performance.
- **React 19**: Leveraging the latest concurrent features and the "Compiler" architecture for optimized rendering.
- **TypeScript**: Ensuring 100% type safety across the file handling and UI logic.

## 🎨 Styling & Design
- **Tailwind CSS 4**: The CSS-only engine that uses the latest browser native features and a high-performance Rust-based compiler. 
    - *Note: Our `globals.css` uses the new `@theme` and `@plugin` rules for a future-proof architecture.*
- **Glassmorphism System**: Custom CSS variables and `backdrop-blur` utilities for a depth-rich interface.

## 📝 Markdown Processing
- **react-markdown**: The robust, standard-compliant renderer.
- **remark-gfm**: GitHub Flavored Markdown (Tables, Task Lists).
- **remark-math & rehype-katex**: Support for high-fidelity LaTeX mathematical typesetting.
- **mermaid**: Live rendering of complex flowcharts and diagrams.
- **remark-github-blockquote-alert**: Support for GitHub-style Tip/Warning/Important blocks.

## 🔌 APIs & PWA
- **File System Access API**: For native "Open" and "Save" dialogs that interact directly with your local files.
- **next-pwa**: To provide a reliable offline experience and "Install to Desktop" capabilities.
- **lucide-react**: A beautiful, consistent set of icons for the interface.
