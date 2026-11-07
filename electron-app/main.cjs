// Open PDF Writer — minimal Electron main process
const { app, BrowserWindow, dialog, ipcMain, shell, Menu } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400, height: 900, minWidth: 800, minHeight: 600,
    title: "Open PDF Writer",
    backgroundColor: "#fff7ed",
    autoHideMenuBar: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });
  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) { shell.openExternal(url); return { action: "deny" }; }
    return { action: "allow" };
  });
  mainWindow.on("closed", () => { mainWindow = null; });
}

function buildMenu() {
  const isMac = process.platform === "darwin";
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(isMac ? [{ label: app.name, submenu: [{ role: "about" }, { type: "separator" }, { role: "quit" }] }] : []),
    { label: "File", submenu: [
      { label: "Open PDF…", accelerator: "CmdOrCtrl+O", click: () => openPdf() },
      { label: "Save PDF…", accelerator: "CmdOrCtrl+S", click: () => mainWindow && mainWindow.webContents.send("menu:save") },
      { type: "separator" },
      { label: "Find…", accelerator: "CmdOrCtrl+F", click: () => mainWindow && mainWindow.webContents.send("menu:find") },
      { type: "separator" },
      isMac ? { role: "close" } : { role: "quit" },
    ].filter(Boolean) },
    { label: "View", submenu: [
      { role: "zoomin" }, { role: "zoomout" }, { role: "resetzoom" },
      { type: "separator" }, { role: "togglefullscreen" },
      { type: "separator" }, { role: "toggleDevTools" },
    ]},
    { label: "Help", submenu: [
      { label: "Keyboard Shortcuts", accelerator: "CmdOrCtrl+/", click: () => mainWindow && mainWindow.webContents.send("menu:shortcuts") },
      { label: "About", click: () => {
        dialog.showMessageBox(mainWindow, {
          type: "info", title: "About", message: "Open PDF Writer v2.1.0",
          detail: "Free, open-source PDF reader + writer.\nFull-text search, dark mode, annotations, drawing, design review, page operations, forms.\nBuilt with Electron + PDF.js + pdf-lib.\nMIT License.",
          buttons: ["OK"],
        });
      }},
    ]},
  ]));
}

async function openPdf() {
  if (!mainWindow) return;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Open PDF", properties: ["openFile"],
    filters: [{ name: "PDF files", extensions: ["pdf"] }],
  });
  if (result.canceled || result.filePaths.length === 0) return;
  const filePath = result.filePaths[0];
  const buffer = await fs.promises.readFile(filePath);
  mainWindow.webContents.send("pdf:loaded", {
    fileName: path.basename(filePath),
    filePath,
    base64: buffer.toString("base64"),
  });
}

ipcMain.handle("dialog:open-pdf", async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Open PDF", properties: ["openFile"],
    filters: [{ name: "PDF files", extensions: ["pdf"] }],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  const filePath = result.filePaths[0];
  const buffer = await fs.promises.readFile(filePath);
  return { fileName: path.basename(filePath), filePath, base64: buffer.toString("base64") };
});

// Reopen a recent file by absolute path (renderer passes a path it previously opened)
ipcMain.handle("file:open-recent", async (_evt, filePath) => {
  try {
    if (!mainWindow) return null;
    if (typeof filePath !== "string" || !path.isAbsolute(filePath) || !filePath.toLowerCase().endsWith(".pdf")) return null;
    const buffer = await fs.promises.readFile(filePath);
    return { fileName: path.basename(filePath), filePath, base64: buffer.toString("base64") };
  } catch {
    return null; // file moved or deleted
  }
});

ipcMain.handle("dialog:save-pdf", async (_evt, bytes, suggestedName) => {
  if (!mainWindow) return null;
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "Save PDF",
    defaultPath: suggestedName || "output.pdf",
    filters: [{ name: "PDF files", extensions: ["pdf"] }],
  });
  if (result.canceled || !result.filePath) return null;
  const buf = Buffer.from(bytes);
  await fs.promises.writeFile(result.filePath, buf);
  return result.filePath;
});

app.whenReady().then(() => {
  console.log("[Open PDF Writer] ready");
  buildMenu();
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
