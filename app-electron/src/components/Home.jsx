import React, { useEffect, useState } from "react";
import WaitingFingerImage from "../assets/waiting_finger.gif";
import axios from "axios";
import Alert from "@mui/material/Alert";
import { createAttendance } from "../services/user";

const Home = () => {
  const [time, setTime] = useState(new Date());
  const [fingerprintStatus, setFingerprintStatus] = useState(
    "Esperando huella..."
  );
  const [userData, setUserData] = useState(null);
  const [scanAnimation, setScanAnimation] = useState(false);
  const [fingerprintImage, setFingerprintImage] = useState(null);
  const [alertDynamic, setAlertDynamic] = useState({});

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

      const fingerprintImageUser = `data:image/bmp;base64,${scanResponse.BMPBase64}`;
      setFingerprintImage(fingerprintImageUser);

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
          name: `${bestMatch.patsurname} ${bestMatch.matsurname} ${bestMatch.name}`,
        });
        setFingerprintStatus("Usuario identificado");

        //Registrar asistencia

        const now = new Date();
        const hours = now.getHours();
        let attendanceStatus = "";

        //Condicionales para determinar Entrada o Salida
        /*checkIn: Entre 06:00-09:59 y 14:00-15:59.
        checkOut: Entre 12:00-13:59 y 17:00-20:59.*/

        if ((hours >= 6 && hours < 10) || (hours >= 14 && hours < 16)) {
          attendanceStatus = "checkIn";
        } else if ((hours >= 11 && hours < 14) || (hours >= 17 && hours < 21)) {
          attendanceStatus = "checkOut";
        }

        //Fecha actual, debe ser del sistema y no local del computador
        const resp = await createAttendance({
          userId: bestMatch._id,
          timestamp: now.toISOString(),
          type: attendanceStatus,
        });
        setAlertDynamic({
          severity: resp.success === true ? "success" : "warning",
          message:
            resp.success === true
              ? resp.data
                ? `${resp.message} | Estado: ${resp.data.status}`
                : resp.message
              : resp.message,
        });
      } else {
        setUserData(null);
        setFingerprintStatus("No se encontró coincidencia.");
      }
    } catch (error) {
      setScanAnimation(false);
      setFingerprintStatus("Error en el servidor.");
      alert(error.error);
    }
  };
  return (
    <>
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
            style={{ width: fingerprintImage ? "100px" : "120px" }}
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
              <p style={{ lineHeight: 1.4 }}>
                <strong>Usuario:</strong> {userData.name}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="alert-section">
        <Alert severity={alertDynamic.severity}>{alertDynamic.message}</Alert>
      </div>
    </>
  );
};

export default Home;
