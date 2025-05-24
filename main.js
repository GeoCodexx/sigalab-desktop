require("dotenv").config();
const { app, BrowserWindow, ipcMain, shell } = require("electron");
const axios = require("axios");
const https = require("https");
const path = require("path");
const querystring = require("querystring"); // Módulo para convertir objetos a URL-encoded
const Store = require("electron-store"); // Para almacenar el token localmente seguro

const store = new Store();
let mainWindow;
let isClosing = false; // Bandera para controlar el estado de cierre

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 485,
    minWidth: 800,
    minHeight: 485,
    //resizable: false,
    webPreferences: {
      nodeIntegration: true, // Desactiva para mayor seguridad
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

  // Manejar el evento de cerrar
  mainWindow.on("close", (e) => {
    if (!isClosing) {
      e.preventDefault();
      mainWindow.webContents.send("confirm-close");
    }
  });

  // Escuchar la respuesta del renderer
  ipcMain.on("close-app", (_, shouldClose) => {
    if (shouldClose && mainWindow && !mainWindow.isDestroyed()) {
      isClosing = true;
      mainWindow.destroy();
    }
  });

  // Manejar enlaces externos en ventanas
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
      return { action: "deny" }; // Evita que Electron abra la ventana
    }
    return { action: "allow" }; // Permite otros tipos de enlaces
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createLoginWindow() {
  const loginWindow = new BrowserWindow({
    width: 800,
    height: 485,
    resizable: false,
    webPreferences: {
      nodeIntegration: true, // Se cambio a true para que funcione electron-store en preload.js
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  //loginWindow.webContents.openDevTools();

  if (process.env.VITE_DEV_SERVER_URL) {
    loginWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}/#/device-login`);
  } else {
    loginWindow.loadFile(
      path.join(__dirname, "app-electron/dist/device-login.html")
    );
  }

  loginWindow.setMenuBarVisibility(false);

  // Espera a que el renderer diga que se autenticó y debe abrir la app principal
  ipcMain.once("device-authenticated", () => {
    loginWindow.close();
    createMainWindow();
  });
}

//Cuando la app este lista crea una instancia de BrowserWindow para posteriormente cargar un archivo html o url
app.whenReady().then(() => {
  const token = store.get("deviceToken");

  if (!token) {
    createLoginWindow();
  } else {
    createMainWindow();
  }
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

// Manejador para comparar huellas dactilares
ipcMain.handle("match-fingerprint", async (_, { template1, template2 }) => {
  try {
    const agent = new https.Agent({ rejectUnauthorized: false }); // Ignorar SSL

    // Convertir los parámetros a formato x-www-form-urlencoded
    const payload = querystring.stringify({ template1, template2 });

    const response = await axios.post(
      "https://localhost:8443/SGIMatchScore",
      payload,
      //{ template1, template2 },
      {
        httpsAgent: agent,
        headers: {
          Origin: "https://localhost", // Simular origen
        },
      }
    );
    //console.log(response.data);
    return response.data; // Devuelve el resultado de la comparación
  } catch (error) {
    console.error("Error al comparar huellas:", error);
    return { error: "Error al comparar huellas" };
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
