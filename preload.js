const { contextBridge, ipcRenderer } = require("electron");
//const Store = require("electron-store");
let store;
try {
  const Store = require("electron-store").default;
  store = new Store();
} catch (err) {
  console.error("Error al inicializar electron-store:", err);
}

contextBridge.exposeInMainWorld("electronStore", {
  get: (key) => store.get(key),
  set: (key, value) => store.set(key, value),
});

contextBridge.exposeInMainWorld("electron", {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  sendCloseResponse: (shouldClose) => {
    ipcRenderer.send("close-app", shouldClose);
  },
  onConfirmClose: (callback) => {
    ipcRenderer.on("confirm-close", callback);
    return () => ipcRenderer.removeListener("confirm-close", callback);
  },
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
  },
});

//El preload script permite que React se comunique con ipcMain de forma segura.

//Esto hace que en React puedas llamar a window.electron.invoke(...) sin exponer ipcRenderer directamente.
