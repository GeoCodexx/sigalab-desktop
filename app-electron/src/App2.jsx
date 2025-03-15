import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [time, setTime] = useState(new Date());
  const [fingerprintStatus, setFingerprintStatus] = useState('Esperando huella...');
  const [userData, setUserData] = useState(null);
  const [scanAnimation, setScanAnimation] = useState(false);

  // Actualizar el reloj cada segundo
  useEffect(() => {
    const timerID = setInterval(() => tick(), 1000);
    return () => clearInterval(timerID);
  }, []);

  const tick = () => {
    setTime(new Date());
  };

  const getFormattedDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return time.toLocaleDateString('es-ES', options);
  };

  const handleRegisterFingerprint = () => {
    alert('Redirigiendo a la pantalla de registro de huella...');
  };

  const handleReportIssue = () => {
    alert('Redirigiendo a la pantalla de reporte de problemas...');
  };

  const handleRefreshApp = () => {
    window.location.reload();
  };

  const handleExitApp = () => {
    window.close();
  };

  const handleCheckIn = () => {
    alert('Marcando INGRESO...');
  };

  const handleCheckOut = () => {
    alert('Marcando SALIDA...');
  };

  const handleFingerprintScan = () => {
    setFingerprintStatus('Escaneando...');
    setScanAnimation(true); // Iniciar animación de escaneo
    setTimeout(() => {
      setScanAnimation(false); // Detener animación de escaneo
      const success = Math.random() > 0.2; // Simular éxito o error aleatorio
      if (success) {
        setUserData({ name: 'Juan Pérez', id: '12345' });
        alert('Registro exitoso: Asistencia marcada.');
      } else {
        setUserData(null);
        alert('Error: No se pudo registrar la asistencia.');
      }
      setFingerprintStatus('Esperando huella...');
    }, 3000); // Simula un proceso de escaneo de 3 segundos
  };

  return (
    <div className="app-container dark-theme">
      {/* Menú Superior */}
      <div className="menu-bar">
        <button onClick={handleRegisterFingerprint}>Registrar Huella</button>
        <button onClick={handleReportIssue}>Reportar Problema</button>
        <button onClick={handleRefreshApp}>Refrescar/Reiniciar</button>
        <button onClick={handleExitApp}>Salir</button>
      </div>

      {/* Contenedor de Dos Columnas */}
      <div className="content-container">
        {/* Columna Izquierda: Reloj, Fecha y Botones */}
        <div className="left-column">
          <div className="clock-container">
            <h1 className="clock">{time.toLocaleTimeString()}</h1>
            <p className="date">{getFormattedDate()}</p>
          </div>
          <div className="buttons-container">
            <button className="check-in-button" onClick={handleCheckIn}>
              INGRESO
            </button>
            <button className="check-out-button" onClick={handleCheckOut}>
              SALIDA
            </button>
          </div>
        </div>

        {/* Columna Derecha: Sección de Huella Dactilar */}
        <div className="right-column">
          <div className={`fingerprint-section ${scanAnimation ? 'scanning' : ''}`} onClick={handleFingerprintScan}>
            <div className="fingerprint-icon">🖐️</div>
            <p className="fingerprint-status">{fingerprintStatus}</p>
          </div>
          {userData && (
            <div className="user-data">
              <p><strong>Nombre:</strong> {userData.name}</p>
              <p><strong>ID:</strong> {userData.id}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;