import React, { useEffect, useState } from "react";
import WaitingFingerImage from "../assets/waiting_finger.gif";
import axios from "axios";
import Alert from "@mui/material/Alert";
import { createAttendance } from "../services/user";
import { Snackbar } from "@mui/material";
import ErrorSound from "../assets/sounds/error_sound.mp3";
import SuccessSound from "../assets/sounds/success_sound.mp3";

const Home = () => {
  const [time, setTime] = useState(new Date());
  const [fingerprintStatus, setFingerprintStatus] = useState(
    "Esperando huella..."
  );
  const [userData, setUserData] = useState(null);
  const [scanAnimation, setScanAnimation] = useState(false);
  const [fingerprintImage, setFingerprintImage] = useState(null);
  const [alertDynamic, setAlertDynamic] = useState({});
  const [openAlerta, setOpenAlerta] = useState(false);
  const [isScanning, setIsScanning] = useState(false); // Nuevo estado para controlar el escaneo

  // Actualizar el reloj cada segundo
  useEffect(() => {
    const timerID = setInterval(() => tick(), 1000);
    return () => clearInterval(timerID);
  }, []);

  // Efecto para manejar la alerta automática
  useEffect(() => {
    let timeoutId;

    // Solo actuar cuando datosHuella pasa de vacío a tener contenido
    if (JSON.stringify(alertDynamic) !== "{}") {
      setOpenAlerta(true); // Mostrar alerta

      // Ocultar después de 5 segundos
      timeoutId = setTimeout(() => {
        setOpenAlerta(false);
        setUserData(null); // Limpiar datos
        setFingerprintStatus("Esperando huella...");
        setFingerprintImage(null);
      }, 7000);
    }

    // Limpieza del timeout si el componente se desmonta
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [alertDynamic]);

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

  const playSound = (type) => {
    let sound;
    if (type === "success") {
      sound = new Audio(SuccessSound); // Si los guardaste en public
    } else if (type === "error") {
      sound = new Audio(ErrorSound);
    }

    if (sound) {
      sound.play();
    }
  };

  const scanFingerprint = async () => {
    setFingerprintStatus("Escaneando...");
    setScanAnimation(true);
    setFingerprintImage(null);

    const scanResponse = await window.electron.invoke("capture-fingerprint");

    if (scanResponse.ErrorCode !== 0 || !scanResponse.TemplateBase64) {
      playSound("error");
      throw new Error(
        `Error al capturar la huella | Code:${scanResponse.ErrorCode}`
      );
    }

    return {
      template: scanResponse.TemplateBase64,
      image: `data:image/bmp;base64,${scanResponse.BMPBase64}`,
    };
  };

  const fetchUsers = async () => {
    const response = await axios.get("http://localhost:3000/api/users");
    return response.data; // [{ id, name, fingerprintimage }, ...]
  };

  const matchFingerprint = async (template, users) => {
    let bestMatch = null;
    let highestScore = 0;

    for (const user of users) {
      if (!user.fingerprintimage) continue;

      const matchResponse = await window.electron.invoke("match-fingerprint", {
        template1: template,
        template2: user.fingerprintimage,
      });

      const { ErrorCode, MatchingScore } = matchResponse;

      if (ErrorCode === 0 && MatchingScore > highestScore) {
        highestScore = MatchingScore;
        bestMatch = user;
      }
    }

    return bestMatch && highestScore >= 100 ? bestMatch : null;
  };

  const determineAttendanceType = () => {
    const hours = new Date().getHours();
    if ((hours >= 0 && hours < 12) || (hours >= 14 && hours < 16)) {
      return "checkIn";
    } else if ((hours >= 12 && hours < 14) || (hours >= 17 && hours < 21)) {
      return "checkOut";
    } else {
      return "checkOut";
    }
  };

  const registerAttendance = async (userId, type) => {
    const now = new Date().toISOString();
    return await createAttendance({ userId, timestamp: now, type });
  };

  const resetScanner = () => {
    setFingerprintImage(null);
    setIsScanning(false);
    setFingerprintStatus("Esperando huella...");
  };

  const handleFingerprintScan = async () => {
    if (isScanning) return;
    setIsScanning(true);

    try {
      const { template, image } = await scanFingerprint();
      setFingerprintImage(image);

      const users = await fetchUsers();
      if (!users.length) throw new Error("No hay usuarios registrados.");

      const matchedUser = await matchFingerprint(template, users);

      setScanAnimation(false);
      if (matchedUser) {
        setUserData({
          id: matchedUser.dni,
          name: `${matchedUser.patsurname} ${matchedUser.matsurname} ${matchedUser.name}`,
        });

        const attendanceType = determineAttendanceType();
        const response = await registerAttendance(
          matchedUser._id,
          attendanceType
        );

        setAlertDynamic({
          severity: response.success ? "success" : "warning",
          message: response.data
            ? `${response.message} | Estado: ${response.data?.status}`
            : response.message,
        });

        playSound(response.success ? "success" : "error");
        setFingerprintStatus("Usuario identificado");
        setTimeout(resetScanner, 7000);
      } else {
        setFingerprintStatus("No se encontró coincidencia");
        playSound("error");
        setTimeout(resetScanner, 7000);
      }
    } catch (error) {
      setScanAnimation(false);
      setFingerprintStatus("Error detectado");
      setFingerprintImage(null);
      setIsScanning(false);
      setAlertDynamic({ severity: "error", message: error.message });
      playSound("error");
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
        </div>

        <div className="right-column">
          <div
            className={`fingerprint-section ${
              scanAnimation ? "scanning" : ""
            } ${fingerprintImage ? "fingerprint-detected" : ""}`}
            style={{
              width: fingerprintImage ? "100px" : "120px",
              pointerEvents: isScanning ? "none" : "auto", // Deshabilita los eventos del mouse
            }}
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
          {userData ? (
            <div className="user-data">
              <p>
                <strong>DNI:</strong> {userData.id}
              </p>
              <p style={{ lineHeight: 1.4 }}>
                <strong>Usuario:</strong> {userData.name}
              </p>
            </div>
          ) : (
            <div>
              <p className="fingerprint-status">{fingerprintStatus}</p>
            </div>
          )}
        </div>
      </div>
      {/* Snackbar/MUI Alert */}
      <div className="alert-section">
        <Snackbar
          open={openAlerta}
          autoHideDuration={7000}
          onClose={() => setOpenAlerta(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          sx={{ width: "94%" }}
        >
          <Alert
            severity={alertDynamic.severity}
            sx={{ width: "100%" }}
            onClose={() => setOpenAlerta(false)}
          >
            {alertDynamic.message}
          </Alert>
        </Snackbar>
      </div>
    </>
  );
};

export default Home;
