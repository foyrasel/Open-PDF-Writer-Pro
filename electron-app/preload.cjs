const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  openPdf: () => ipcRenderer.invoke("dialog:open-pdf"),
  openRecent: (filePath) => ipcRenderer.invoke("file:open-recent", filePath),
  electronSavePdf: (bytes, suggestedName) =>
    ipcRenderer.invoke("dialog:save-pdf", bytes, suggestedName),
  onPdfLoaded: (cb) => {
    const h = (_e, d) => cb(d);
    ipcRenderer.on("pdf:loaded", h);
    return () => ipcRenderer.removeListener("pdf:loaded", h);
  },
  onMenuSave: (cb) => {
    const h = () => cb();
    ipcRenderer.on("menu:save", h);
    return () => ipcRenderer.removeListener("menu:save", h);
  },
  onMenuFind: (cb) => {
    const h = () => cb();
    ipcRenderer.on("menu:find", h);
    return () => ipcRenderer.removeListener("menu:find", h);
  },
  onMenuShortcuts: (cb) => {
    const h = () => cb();
    ipcRenderer.on("menu:shortcuts", h);
    return () => ipcRenderer.removeListener("menu:shortcuts", h);
  },
});
