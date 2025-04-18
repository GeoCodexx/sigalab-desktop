const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  sendCloseResponse: (shouldClose) => {
    ipcRenderer.send("close-app", shouldClose);
  },
  onConfirmClose: (callback) => {
    ipcRenderer.on("confirm-close", callback);
    return () => ipcRenderer.removeListener("confirm-close", callback);
  },
});

//El preload script permite que React se comunique con ipcMain de forma segura.

//Esto hace que en React puedas llamar a window.electron.invoke(...) sin exponer ipcRenderer directamente.
