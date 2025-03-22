import React, { useEffect, useState } from "react";
import WaitingFingerImage from "../assets/waiting_finger.gif";
import axios from "axios";

const Home = () => {
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

  //Comparar Huella
  /* const compareFingerprint = async (template1) => {
    try {
      setFingerprintStatus("Comparando huella...");
      
      // Obtener todas las huellas de la base de datos
      const usersResponse = await axios.get("https://tu-api.com/usuarios");
      const users = usersResponse.data;
  
      let bestMatch = null;
      let highestScore = 0;
  
      // Comparar con cada usuario
      for (const user of users) {
        if (!user.template) continue; // Saltar usuarios sin plantilla
  
        const matchResponse = await window.electron.invoke("match-fingerprint", {
          template1,
          template2: user.template,
        });
  
        const { ErrorCode, MatchingScore } = matchResponse;
  
        if (ErrorCode === 0 && MatchingScore > highestScore) {
          highestScore = MatchingScore;
          bestMatch = user;
        }
      }
  
      // Mostrar resultado
      if (bestMatch && highestScore >= 100) {
        setUserData({ name: bestMatch.name, id: bestMatch.id });
        setFingerprintStatus(`Usuario identificado: ${bestMatch.name} (Confianza: ${highestScore})`);
      } else {
        setUserData(null);
        setFingerprintStatus("No se encontró coincidencia.");
      }
    } catch (error) {
      setFingerprintStatus(`Error: ${error.message}`);
    }
  };*/

  /*const handleFingerprintScan = async () => {
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
  };*/
  const handleFingerprintScan = async () => {
    setFingerprintStatus("Escaneando...");
    setScanAnimation(true);
    setFingerprintImage(null); // Limpia la imagen anterior

    try {
      // 1. Escanear la huella con SecuGen
      const scanResponse = await window.electron.invoke("capture-fingerprint");

      if (scanResponse.ErrorCode !== 0 || !scanResponse.TemplateBase64) {
        throw new Error("Error al capturar la huella");
      }

      const template1 = scanResponse.TemplateBase64; // Huella escaneada
      setFingerprintStatus("Huella escaneada con éxito");

      // 2. Obtener todas las plantillas de usuarios desde la base de datos
      const usersResponse = await axios.get("http://localhost:3000/api/users");
      const users = usersResponse.data; // [{ id, name, template }, ...]

      if (!users.length) {
        throw new Error("No hay usuarios registrados en la base de datos.");
      }

      // 3. Comparar la huella escaneada con cada usuario registrado
      let bestMatch = null;
      let highestScore = 0;

      for (const user of users) {
        if (!user.fingerprintimage) continue; // Saltar si el usuario no tiene plantilla registrada

        const matchResponse = await window.electron.invoke(
          "match-fingerprint",
          {
            template1: template1,
            template2: user.fingerprintimage,
          }
        );

        const { ErrorCode, MatchingScore } = matchResponse;

        if (ErrorCode === 0 && MatchingScore > highestScore) {
          highestScore = MatchingScore;
          bestMatch = user;
        }
      }

      // 4. Evaluar resultado
      setScanAnimation(false);

      if (bestMatch && highestScore >= 100) {
        setUserData({
          id: bestMatch.dni,
          colaborador: `${bestMatch.patsurname} ${bestMatch.matsurname} ${bestMatch.name}`,
        });
        setFingerprintStatus(
          `Usuario identificado: ${bestMatch.name} ${bestMatch.patsurname} (Confianza: ${highestScore})`
        );
      } else {
        setUserData(null);
        setFingerprintStatus("No se encontró coincidencia.");
      }
    } catch (error) {
      setScanAnimation(false);
      setFingerprintStatus(`Error: ${error.message}`);
    }
  };
  return (
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
          className={`fingerprint-section ${scanAnimation ? "scanning" : ""} ${
            fingerprintImage ? "fingerprint-detected" : ""
          }`}
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
        </div>
        {userData && (
          <div className="user-data">
            <p>
              <strong>DNI:</strong> {userData.id}
            </p>
            <p>
              <strong>Colaborador:</strong> {userData.colaborador}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
