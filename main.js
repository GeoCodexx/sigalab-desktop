require("dotenv").config();
const { app, BrowserWindow, ipcMain } = require("electron");
const axios = require("axios");
const https = require("https");
const path = require("path");

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: false, // Desactiva para mayor seguridad
      contextIsolation: true, // Activa para seguridad
      preload: path.join(__dirname, "preload.js"), // Asegurar la ruta correcta
    },
  });

  // Cargar la app de Vite en desarrollo o el build en producción
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "app-electron/dist/index.html"));
  }
  //Para abrir el devtool del navegador.
  //mainWindow.webContents.openDevTools();
  mainWindow.setMenuBarVisibility(false); // Barra Menu Oculto

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});

//Permitir Certificados Autofirmados en Electron
app.on(
  "certificate-error",
  (event, webContents, url, error, certificate, callback) => {
    event.preventDefault(); // Evita que Electron bloquee la conexión
    callback(true); // Acepta el certificado autofirmado
  }
);

// Manejador para capturar huella dactilar
ipcMain.handle("capture-fingerprint", async () => {
  try {
    const agent = new https.Agent({ rejectUnauthorized: false }); // Ignorar certificados no confiables
    /*const response = await axios.post("https://localhost:8443/SGIFPCapture", {
      format: "ISO19794",
    });*/
    const response = await axios.post(
      "https://localhost:8443/SGIFPCapture",
      { format: "ISO19794" },
      {
        httpsAgent: agent,
        headers: {
          Origin: "https://localhost", // Agregar encabezado "Origin"
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al capturar huella:", error);
    return { error: "Error al capturar la huella" };
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
