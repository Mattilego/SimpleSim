const { app, ipcMain, BrowserWindow } = require("electron");

console.log("Are these imported properly?", app, ipcMain, BrowserWindow);

app.on('ready', () => {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('GUI/GUI.html');
});
