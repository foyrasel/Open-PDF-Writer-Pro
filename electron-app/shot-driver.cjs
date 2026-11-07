// Screenshot driver: loads the real app, injects a PDF, captures README screenshots.
// Usage: xvfb-run -a node shot-driver.cjs <pdf-path> <out-dir>
const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

const pdfPath = process.argv[2] || "/tmp/sample.pdf";
const outDir = process.argv[3] || "/tmp/shots";
fs.mkdirSync(outDir, { recursive: true });

let win;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

app.commandLine.appendSwitch("no-sandbox");
app.whenReady().then(async () => {
  win = new BrowserWindow({
    width: 1400, height: 900,
    webPreferences: {
      contextIsolation: true, nodeIntegration: false, sandbox: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });
  win.loadFile(path.join(__dirname, "renderer", "index.html"));

  win.webContents.on("did-finish-load", async () => {
    try {
      await sleep(1200);
      // 1) Welcome screen
      await shot("01-welcome.png");

      // 2) Load the sample PDF
      const b64 = fs.readFileSync(pdfPath).toString("base64");
      await win.webContents.executeJavaScript(
        `loadPdfFromBase64(${JSON.stringify(b64)}, ${JSON.stringify(path.basename(pdfPath))}, ${JSON.stringify(pdfPath)})`, true);
      await sleep(1500);

      // 3) Design-review cloud + comment panel (light)
      await win.webContents.executeJavaScript(`(async () => {
        UI.switchTab("annotate");
        addAnnotation({
          id: "demo1", kind: "cloud_review", pageNumber: 1,
          x: 300, y: 150, width: 230, height: 110,
          color: "#ea580c", strokeWidth: 2, opacity: 1, fill: "rgba(234,88,12,0.06)",
          author: "Review Engineer", body: "Check clearance to the structural beam above the access shaft — needs 25 mm minimum.",
          createdAt: new Date().toISOString(), issueNumber: 1, reviewStatus: "open"
        });
        addAnnotation({
          id: "demo2", kind: "cloud_review", pageNumber: 1,
          x: 80, y: 560, width: 260, height: 90,
          color: "#ea580c", strokeWidth: 2, opacity: 1, fill: "rgba(234,88,12,0.06)",
          author: "Review Engineer", body: "Confirm switchboard rating against VSD inrush current.",
          createdAt: new Date().toISOString(), issueNumber: 2, reviewStatus: "open"
        });
        selectAnnotation("demo1");
        UI.openCommentPanel("demo1");
      })()`, true);
      await sleep(900);
      await shot("02-design-review.png");

      // 4) Search in light mode
      await win.webContents.executeJavaScript(`(async () => {
        UI.closeRightPanel();
        UI.switchTab("home");
        openSearch();
        document.getElementById("searchInput").value = "specification";
        await runSearch();
      })()`, true);
      await sleep(1200);
      await shot("03-search.png");

      // 5) Same view in dark mode
      await win.webContents.executeJavaScript(`toggleDarkMode()`, true);
      await sleep(700);
      await shot("04-dark.png");

      // 6) Comments sidebar in dark mode
      await win.webContents.executeJavaScript(`UI.switchSidebar("comments")`, true);
      await sleep(600);
      await shot("05-dark-comments.png");

      console.log("SCREENSHOTS_DONE");
      process.exit(0);
    } catch (e) {
      console.error("DRIVER_ERROR", e);
      process.exit(1);
    }
  });
});

async function shot(name) {
  const img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, name), img.toPNG());
  console.log("captured", name, img.getSize());
}
