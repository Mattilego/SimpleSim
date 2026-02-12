const { app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

app.on('ready', () => {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, '../renderer/index.html'));
});
