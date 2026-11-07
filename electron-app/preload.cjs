const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  openPdf: () => ipcRenderer.invoke("dialog:open-pdf"),
  electronSavePdf: (bytes, suggestedName) =>
    ipcRenderer.invoke("dialog:save-pdf", bytes, suggestedName),
  onPdfLoaded: (cb) => {
    const h = (_e, d) => cb(d);
    ipcRenderer.on("pdf:loaded", h);
    return () => ipcRenderer.removeListener("pdf:loaded", h);
  },
});
