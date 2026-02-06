const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const http = require("http");
const fs = require("fs");

let mainWindow;
let server;

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "font/otf",
  ".wasm": "application/wasm",
  ".map": "application/json",
};

function startServer(outDir) {
  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      let urlPath = req.url.split("?")[0].split("#")[0];
      
      // Default to index.html
      if (urlPath === "/") {
        urlPath = "/index.html";
      }
      
      let filePath = path.join(outDir, urlPath);
      
      // Try adding .html extension for routes
      if (!fs.existsSync(filePath) && !path.extname(filePath)) {
        if (fs.existsSync(filePath + ".html")) {
          filePath = filePath + ".html";
        } else if (fs.existsSync(path.join(filePath, "index.html"))) {
          filePath = path.join(filePath, "index.html");
        }
      }
      
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end("Not Found");
          return;
        }
        
        const ext = path.extname(filePath).toLowerCase();
        const mimeType = MIME_TYPES[ext] || "application/octet-stream";
        
        res.writeHead(200, { "Content-Type": mimeType });
        res.end(data);
      });
    });
    
    // Find an available port
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      resolve(port);
    });
  });
}

async function createWindow() {
  const outDir = path.join(__dirname, "../out");
  const port = await startServer(outDir);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: "JSON Crack",
    icon: path.join(__dirname, "../public/assets/favicon.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${port}/`);

  // Create application menu
  const template = [
    {
      label: "File",
      submenu: [
        { role: "quit" }
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "close" },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
