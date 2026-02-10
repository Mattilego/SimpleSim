const { app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");

console.log("Are these imported properly?", app, ipcMain, BrowserWindow);

app.on('ready', () => {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, '../renderer/index.html'));
});
