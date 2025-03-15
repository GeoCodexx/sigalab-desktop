const { exec } = require('child_process');

// Función para iniciar el escaneo de huella
export function scanFingerprint() {
  return new Promise((resolve, reject) => {
    // Llama al ejecutable del SDK SecuGen para capturar la huella
    exec('path/to/SecuGenSDKExecutable', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al escanear la huella: ${stderr}`);
        reject(error);
      } else {
        const fingerprintTemplate = stdout.trim(); // Supongamos que el SDK devuelve la plantilla
        resolve(fingerprintTemplate);
      }
    });
  });
}
