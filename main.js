require("dotenv").config();
const { app, BrowserWindow, ipcMain, shell } = require("electron");
const axios = require("axios");
const https = require("https");
const path = require("path");
const querystring = require("querystring"); // Módulo para convertir objetos a URL-encoded

let mainWindow;
let isClosing = false; // Bandera para controlar el estado de cierre

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 485,
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
  /*mainWindow.webContents.openDevTools();*/
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
    /* console.log("Comparando huellas...");
    console.log("Template1 (capturado):", template1?.substring(0, 50), "..."); // Imprimir primeros 50 caracteres
    console.log(
      "Template2 (base de datos):",
      template2?.substring(0, 50),
      "..."
    );*/

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
