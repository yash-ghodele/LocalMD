# API Reference & Implementation

Detailed technical information for developers working on the Local Markdown Viewer.

---

## 📁 `useFileHandler.ts`

The core hook that manages all file I/O and content state.

### State Shape

```ts
interface FileHandlerState {
    content: string;
    fileHandle: FileSystemFileHandle | null; // null for untitled docs
    fileName: string;
    isModified: boolean;
}
```

### Exported Functions

| Function | Description |
|----------|-------------|
| `openFile()` | Invokes `window.showOpenFilePicker` (FSAPI) or falls back to `<input type="file">`. Stores the `FileSystemFileHandle` for subsequent saves. |
| `saveFile()` | Writes to the current `FileSystemFileHandle` via `createWritable()`. Delegates to `saveFileAs()` if no handle exists (untitled doc). |
| `saveFileAs()` | Opens `window.showSaveFilePicker` with a suggested filename. Falls back to a blob download in unsupported browsers. Updates the handle and filename on success. |
| `setContent(str)` | Updates content and sets `isModified: true`. |
| `handleDrop(e)` | Handles drag-and-drop: tries `item.getAsFileSystemHandle()` first for FS connectivity; falls back to `item.getAsFile()`. |

### Auto-Save
Content is debounce-written to `localStorage` (key: `markdown-viewer-autosave`) with a **2-second delay** after every change. On init, the hook reads this key and restores the previous session — including a self-healing check for corrupted Welcome Guide content.

---

## ⌨️ `useKeyboardShortcuts.ts`

Registers a single `keydown` listener on `window` using a **stable ref pattern** to avoid re-registering on every render.

```ts
// Pattern used internally:
const configRef = useRef(config);
useLayoutEffect(() => { configRef.current = config; }); // always up-to-date
useEffect(() => {
    window.addEventListener("keydown", handler); // registered once
    return () => window.removeEventListener("keydown", handler);
}, []); // empty deps — safe because handler reads from ref
```

### Supported Shortcuts

| Config Key | Keys | Action |
|------------|------|--------|
| `onOpen` | `Ctrl/Cmd + O` | Open file picker |
| `onSave` | `Ctrl/Cmd + S` | Save to current handle |
| `onSaveAs` | `Ctrl/Cmd + Shift + S` | Save As dialog |
| `onExportHtml` | `Ctrl/Cmd + E` | Export HTML |
| `onExportPdf` | `Ctrl/Cmd + P` | Print / PDF |
| `onToggleView` | `Ctrl/Cmd + /` | Cycle Split → Editor → Preview |
| `onToggleTheme` | `Ctrl/Cmd + D` | Toggle Light / Dark |

---

## 🧩 Component APIs

### `<MarkdownPreview content onToggleTask />`

| Prop | Type | Description |
|------|------|-------------|
| `content` | `string` | Raw Markdown string to render |
| `onToggleTask` | `(index, checked) => void` | Called when a task checkbox is clicked |

The preview renders into a `<div id="markdown-preview-prose">` — this stable ID is used by `TableOfContents` for reliable DOM querying.

### `<MermaidDiagram chart />`

Re-initializes Mermaid with the current `resolvedTheme` on every chart or theme change. Renders via `dangerouslySetInnerHTML` after receiving the SVG string from `mermaid.render()`.

### `<TableOfContents content />`

Parses headings (`#`–`######`) from raw Markdown using `useMemo`. Scroll-to-heading uses `document.getElementById("markdown-preview-prose")` — a stable, unique ID — then `querySelectorAll("h1,h2,h3,h4,h5,h6")` with a `.trim()` text match.

### `<EditorToolbar onInsert />`

Calls `onInsert(before, after)` which wraps the currently selected textarea text with the provided strings and restores cursor focus.

---

## 🎨 Liquid Design Tokens

Defined in `app/globals.css` using the **Tailwind CSS v4** `@theme` block.

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `--liquid-1` | `#e0f2fe` | `#1e1b4b` | Radial gradient corner 1 |
| `--liquid-2` | `#f0f9ff` | `#312e81` | Radial gradient corner 2 |
| `--liquid-bg` | `#ffffff` | `#050110` | Base background fill |
| `--glass` | `rgba(255,255,255,0.8)` | `rgba(13,13,35,0.4)` | Frosted glass base |
| `--glass-border` | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.08)` | Glass pane border |
| `--glass-highlight` | `rgba(255,255,255,0.5)` | `rgba(255,255,255,0.03)` | Glass gloss layer |
| `--primary` | `262° 83% 58%` | `263° 70% 55%` | Brand purple |

### Utility Classes

- `.glass` — Frosted glass pane (`backdrop-filter: blur(16px)` + border + shadow)
- `.glass-card` — Lighter glass card variant
- `.bg-liquid` — 4-corner radial gradient background

---

## 🖨️ Print / PDF Styles

Print styles live in `app/globals.css` under `@media print`. Key behaviors:
- All `.print:hidden` elements (toolbar, editor, status bar) are hidden
- `.glass` is reset to plain white background (no blur in print)
- Scrollbars are hidden
- The preview pane becomes a normal block-flow document
