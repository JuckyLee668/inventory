const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('inventoryApi', {
  getInventory: () => ipcRenderer.invoke('inventory:list'),
  inbound: (payload) => ipcRenderer.invoke('inventory:inbound', payload),
  outbound: (payload) => ipcRenderer.invoke('inventory:outbound', payload),
  warnings: (threshold) => ipcRenderer.invoke('inventory:warnings', threshold),

  scanBarcode: (payload) => ipcRenderer.invoke('recognition:barcode', payload),
  transcribeVoice: (payload) => ipcRenderer.invoke('recognition:voice', payload),

  syncData: (payload) => ipcRenderer.invoke('upload:sync', payload)
});
