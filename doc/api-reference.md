# API Reference & Implementation

Detailed technical information for developers working on the Local Markdown Viewer.

## 📁 File System Access API
The application utilizes the experimental [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) to manage local files directly.

### Core Handlers in `useFileHandler.ts`
- **`openFile()`**: Invokes `window.showOpenFilePicker`. It requests permission to read and store a `FileSystemFileHandle` for subsequent saves.
- **`saveFile()`**: Uses `FileSystemFileHandle.createWritable()` to stream content directly into the local file.
- **`handleDrop()`**: Uses `item.getAsFileSystemHandle()` for a modern drag-and-drop experience that maintains file connectivity.

## ⌨️ Global Shortcuts
Controlled via `useKeyboardShortcuts.ts`.
- `onOpen`: Triggers file picker.
- `onSave`: Triggers save logic (only active when a file handle is present).
- `onToggleView`: Cycles between "Split", "Editor Only", and "Preview Only".
- `onToggleTheme`: Toggles "Light" and "Dark" via `next-themes`.

## 📐 Liquid Design Tokens
Defined in `globals.css` using the **Tailwind 4** spec.
- `--liquid-1` & `--liquid-2`: Primary aesthetic gradient origins.
- `--glass`: Theme-aware base RGBA for frosted glass effect.
- `--glass-highlight`: Subtle gloss layer for depth.

## 🧬 Mermaid Initialization
Managed by `MermaidDiagram.tsx`.
- The component uses `mermaid.initialize` inside a `useEffect` to ensure it is always theme-aware.
- It re-renders diagrams when `resolvedTheme` changes from `next-themes`.
