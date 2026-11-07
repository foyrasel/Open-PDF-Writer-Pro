# Contributing to Open PDF Writer Pro

Thanks for helping build a free PDF editor! 🎉

## Getting started

```bash
git clone https://github.com/foyrasel/Open-PDF-Writer-Pro.git
cd Open-PDF-Writer-Pro/electron-app
npm install
npm start        # launches the app
```

## The one-file architecture

The entire UI — HTML, CSS and JS — lives in **`electron-app/renderer/index.html`**.
There is no framework and no build step: edit the file, restart `npm start`, done.

| File | Role |
|---|---|
| `renderer/index.html` | The whole app (ribbon, viewer, annotations, dialogs) |
| `main.cjs` | Electron main process — menus, native dialogs, IPC |
| `preload.cjs` | The sandbox bridge exposing `window.electronAPI` |

## Things to know before you change code

- **Annotation coordinates** are stored in PDF points (1/72"), top-left origin,
  independent of zoom. Screen positions are derived at render time.
- **Search highlights** use `pdfjsLib.Util.transform(viewport.transform, item.transform)`
  to map text items onto the current viewport — see `renderSearchHighlights()`.
- **Saving** flattens annotations into the PDF with pdf-lib (`burnAnnotationsIntoPdf()`).
- Keep the UI strings in English; i18n is coming (help wanted!).

## Taking screenshots

```bash
npm run shots    # headless capture of docs/screenshots/*.png (needs Xvfb on Linux)
```

## Pull requests

1. Keep PRs focused — one feature or fix per PR
2. Test on a real PDF, including **Save** (annotations must burn in correctly)
3. Update `README.md` if you add a user-visible feature
4. Screenshots for new UI are very welcome

## Good first issues

- Multi-language UI (strings are currently inline in `index.html`)
- New stamp types / annotation styles
- macOS & Linux packaging and testing
- Unit tests for page operations (extract/split/merge with pdf-lib)

## Reporting bugs

Please include: OS version, the PDF (if shareable), what you clicked, and what
happened vs. what you expected. Console output helps (`npm run dev`).
