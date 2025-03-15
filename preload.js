const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electron", {
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
});

//El preload script permite que React se comunique con ipcMain de forma segura.

//Esto hace que en React puedas llamar a window.electron.invoke(...) sin exponer ipcRenderer directamente.