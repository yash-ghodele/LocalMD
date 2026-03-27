# User Guide & Keyboard Reference

Maximize your productivity with the Local Markdown Viewer.

## 🎹 Keyboard Shortcuts
| Shortcut | Action |
| :--- | :--- |
| **Ctrl + O** | Open a Local Markdown File |
| **Ctrl + S** | Save Changes (to current file) |
| **Ctrl + E** | Export as Portable HTML |
| **Ctrl + P** | Export as PDF / Print Mode |
| **Ctrl + /** | Cycle View Modes (Split / Editor / Preview) |
| **Ctrl + D** | Toggle Light / Dark Mode |
| **Enter** | Sync Scroll (Auto-enabled) |

## 🖱️ Power Interactions
- **Drag & Drop**: Drag any `.md` file onto the app to open it instantly.
- **Dynamic Split**: Hover over the central divider line and drag to resize your workspace.
- **Sync Scroll**: Typing in the editor automatically pans the preview to your current line.

## 📝 Markdown Extensions
### Alerts
Use Modern GitHub-style alert blocks:
```markdown
> [!TIP]
> This is a helpful tip.

> [!WARNING]
> This is a critical warning.
```

### Mathematical Notation
Standard display math ($$):
```markdown
$$ E = mc^2 $$
```

### Mermaid Diagrams
```markdown
` + "```mermaid" + `
graph LR
    A --> B
` + "```" + `
```
