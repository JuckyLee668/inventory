const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { getInventory, addInbound, addOutbound, getWarnings } = require('./services/inventory-service');
const { scanBarcodeByPhoto, transcribeVoice } = require('./services/recognition-service');
const { simulatedUpload } = require('./services/upload-service');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'admin.html'));
}

app.whenReady().then(() => {
  ipcMain.handle('inventory:list', () => getInventory());
  ipcMain.handle('inventory:inbound', (_, payload) => addInbound(payload));
  ipcMain.handle('inventory:outbound', (_, payload) => addOutbound(payload));
  ipcMain.handle('inventory:warnings', (_, threshold) => getWarnings(threshold));

  ipcMain.handle('recognition:barcode', (_, payload) => scanBarcodeByPhoto(payload));
  ipcMain.handle('recognition:voice', (_, payload) => transcribeVoice(payload));

  ipcMain.handle('upload:sync', async (_, payload) => simulatedUpload(payload));

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
