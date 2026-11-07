# Open PDF Writer Pro

A complete, open-source **desktop PDF editor** with annotations, drawing, page operations, forms, comments, and security. Built as an Acrobat-style alternative for Windows, macOS, and Linux.

**MIT License** — free for personal and commercial use.

## Features

### 7 Ribbon Tabs (Acrobat-style)

| Tab | Features |
|---|---|
| **HOME** | Open, Save, Undo/Redo, Select, Hand, Zoom, Page nav, Style controls (color, width, opacity, font size) |
| **ANNOTATE** | Highlight, Underline, Strikethrough, Sticky Note, Text Box, **8 Stamps** (Approved, Draft, Final, Completed, Confidential, Received, Reviewed, VOID) |
| **DRAW** | Freehand Pen, Rectangle, Ellipse, Line, Arrow, Cloud, Eraser, Fill toggle |
| **PAGE** | Rotate ←/→, Extract, Delete, Insert, Move, Split, Merge, Crop |
| **EDIT** | Add Text, Whiteout, Add Image, Properties editor (title/author/subject/keywords) |
| **TOOLS** | Form fields (Text, Checkbox, Radio, Signature), Password info, Export as PNG, Export as single-page PDFs |
| **VIEW** | Zoom controls, Rotate view, Reset, Panel toggles |

### Sidebar — 3 tabs
- **Pages** — thumbnails with per-page rotate/delete buttons
- **Comments** — full comment list with author + status badges
- **Bookmarks** — saved in localStorage between sessions

### Page Operations (all persist to PDF via pdf-lib)
- Rotate page 90° left/right
- Extract pages by range (`1-3, 5, 7-9` or `all`)
- Delete page
- Insert pages from another PDF
- Move page to new position
- Split PDF (every N pages, or by ranges)
- Merge with other PDFs
- Crop page (set margins)

### Edit Operations
- Add text (with font size, color, opacity)
- Whiteout (white rectangle)
- Add image (PNG/JPEG embedded)
- Edit PDF metadata (title, author, subject, keywords, creator, producer)

### Export
- Save PDF with all annotations burned in as vector graphics
- Export each page as PNG (2x resolution)
- Export each page as a separate PDF
- Print

### Keyboard Shortcuts
`Ctrl+O` open · `Ctrl+S` save · `Ctrl+Z` undo · `Ctrl+Y` redo · `Ctrl+=` zoom in · `Ctrl+-` zoom out · `←/→` page nav · `Esc` close dialog

## Quick Start (Development)

```bash
git clone https://github.com/foyrasel/Open-PDF-Writer-Pro.git
cd Open-PDF-Writer-Pro/electron-app
npm install
npm start
```

## Build the .exe / .dmg / .AppImage

```bash
cd electron-app

# Windows portable .exe (run on Windows or via Wine)
npm run dist:win

# macOS .dmg (run on macOS)
npm run dist:mac

# Linux .AppImage (run on Linux)
npm run dist:linux
```

Output appears in `electron-app/release/`.

## System Requirements (for end users)

- Windows 10 (64-bit) or later / macOS 10.15+ / Linux x64
- Microsoft Visual C++ Redistributable 2015-2022 (x64) on Windows
  - Download: https://aka.ms/vs/17/release/vc_redist.x64.exe

## Tech Stack

- **Electron 44** — cross-platform desktop shell
- **PDF.js 6** (Mozilla) — PDF rendering
- **pdf-lib 1.17** — programmatic PDF manipulation
- **MIT License**

## Project Structure

```
electron-app/
├── main.cjs              # Electron main process (menus, file dialogs, IPC)
├── preload.cjs           # Sandbox-safe IPC bridge
├── package.json          # Build config (electron-builder)
└── renderer/
    ├── index.html        # Full app UI + JS (single file)
    ├── pdf.min.mjs       # PDF.js library
    ├── pdf.worker.min.mjs  # PDF.js worker
    └── pdf-lib.min.js    # pdf-lib library
```

## Notes

- **Password protection**: pdf-lib doesn't support PDF encryption. Use [qpdf](https://github.com/qpdf/qpdf) externally:
  ```bash
  qpdf --encrypt user_pwd owner_pwd 256 -- input.pdf output.pdf
  ```
- **OCR** (text recognition): not included. Use [tesseract.js](https://github.com/naptha/tesseract.js) externally if needed.
- **Edit existing text**: PDFs don't truly support text editing; use the "Add Text" tool to overlay corrections.

## License

MIT © Open PDF Writer contributors
