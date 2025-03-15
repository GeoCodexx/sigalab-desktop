import React, { useState, useEffect } from "react";
import "./App.css";
import WaitingFingerImage from "./assets/waiting_finger.gif";

const App = () => {
  const [time, setTime] = useState(new Date());
  const [fingerprintStatus, setFingerprintStatus] = useState(
    "Esperando huella..."
  );
  const [userData, setUserData] = useState(null);
  const [scanAnimation, setScanAnimation] = useState(false);
  const [fingerprintImage, setFingerprintImage] = useState(null);

  // Actualizar el reloj cada segundo
  useEffect(() => {
    const timerID = setInterval(() => tick(), 1000);
    return () => clearInterval(timerID);
  }, []);

  const tick = () => {
    setTime(new Date());
  };

  const getFormattedDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return time.toLocaleDateString("es-ES", options);
  };

  /*const handleFingerprintScan = async () => {
    setFingerprintStatus("Escaneando...");
    setScanAnimation(true);

    try {
      const response = await window.electron.invoke("capture-fingerprint"); // Llamada a backend
      if (response.ErrorCode === 0 && response.BMPBase64) {
        setFingerprintImage(`data:image/bmp;base64,${response.BMPBase64}`);
        setUserData({ name: "Juan Pérez", id: "12345" }); // Simulación de usuario
        alert("Registro exitoso: Asistencia marcada.");
      } else {
        setFingerprintImage(null);
        setUserData(null);
        alert("Error al escanear la huella.");
      }
    } catch (error) {
      alert("Error: No se pudo escanear la huella.");
    }

    setScanAnimation(false);
    setFingerprintStatus("Esperando huella...");
  };*/
  const handleFingerprintScan = async () => {
    setFingerprintStatus("Escaneando...");
    setScanAnimation(true);
    setFingerprintImage(null); // Limpia la imagen anterior

    try {
      const response = await window.electron.invoke("capture-fingerprint"); // Simulación del backend

      // Simular tiempo de escaneo de 3 segundos antes de mostrar la huella
      setTimeout(() => {
        setScanAnimation(false);
        if (response.ErrorCode === 0 && response.BMPBase64) {
          setFingerprintImage(`data:image/bmp;base64,${response.BMPBase64}`);
          setUserData({ name: "Juan Pérez", id: "12345" }); // Simulación de usuario
          setFingerprintStatus("Huella escaneada con éxito");
          //alert("Registro exitoso: Asistencia marcada.");
        } else {
          setUserData(null);
          setFingerprintStatus("Error al escanear la huella");
          //alert("Error al escanear la huella.");
        }
      }, 2000);
    } catch (error) {
      setScanAnimation(false);
      setFingerprintStatus("Error: No se pudo escanear la huella.");
      //alert("Error: No se pudo escanear la huella.");
    }
  };
  return (
    <div className="app-container dark-theme">
      <div className="menu-bar">
        <button onClick={() => alert("Registrar Huella")}>
          Registrar Huella
        </button>
        <button onClick={() => alert("Reportar Problema")}>
          Reportar Problema
        </button>
        <button onClick={() => window.location.reload()}>Refrescar</button>
        <button onClick={() => window.close()}>Salir</button>
      </div>

      <div className="content-container">
        <div className="left-column">
          <div className="clock-container">
            <h1 className="clock">{time.toLocaleTimeString()}</h1>
            <p className="date">{getFormattedDate()}</p>
          </div>
          {/*<div className="buttons-container">
            <button
              className="check-in-button"
              onClick={() => alert("Marcando INGRESO")}
            >
              INGRESO
            </button>
            <button
              className="check-out-button"
              onClick={() => alert("Marcando SALIDA")}
            >
              SALIDA
            </button>
          </div>*/}
        </div>

        <div className="right-column">
          {/*<div
            className={`fingerprint-section ${scanAnimation ? "scanning" : ""}`}
            onClick={handleFingerprintScan}
          >*/}
          <p className="fingerprint-status">{fingerprintStatus}</p>

          <div
            className={`fingerprint-section ${
              scanAnimation ? "scanning" : ""
            } ${fingerprintImage ? "fingerprint-detected" : ""}`}
            onClick={handleFingerprintScan}
          >
            <div className="fingerprint-icon">
              {fingerprintImage ? (
                <img
                  src={fingerprintImage}
                  alt="Huella escaneada"
                  className="fingerprint-image"
                />
              ) : (
                <img
                  src={WaitingFingerImage}
                  alt="Imagen de espera"
                  className="fingerprint-image"
                />
              )}
            </div>
            {/* <p className="fingerprint-status">{fingerprintStatus}</p> */}
          </div>
          {userData && (
            <div className="user-data">
              <p>
                <strong>Nombre:</strong> {userData.name}
              </p>
              <p>
                <strong>ID:</strong> {userData.id}
              </p>
            </div>
          )}
        </div>
      </div>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Developed by GeoCodexx Design</p>
      </footer>
    </div>
  );
};

export default App;
