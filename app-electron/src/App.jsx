import React, { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Register from "./components/Register";
import { Button } from "@mui/material";
import Help from "./components/Help";
import About from "./components/About";
import DeviceLogin from "./components/DeviceLogin";

const App = () => {
  const [activeView, setActiveView] = useState("home");
  const [showExitModal, setShowExitModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = window.electronStore.get("deviceToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const handleConfirmClose = () => {
      setShowExitModal(true);
    };

    const cleanup = window.electron?.onConfirmClose(handleConfirmClose);

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const handleExitConfirm = (shouldClose) => {
    setShowExitModal(false);
    if (shouldClose) {
      // Solo enviar una vez la confirmación
      window.electron?.sendCloseResponse(true);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case "home":
        return <Home />;
      case "register":
        return <Register setActiveView={setActiveView} />;
      case "help":
        return <Help />;
      case "about":
        return <About />;
      default:
        return <Home />;
    }
  };

  if (!isAuthenticated) {
    return <DeviceLogin onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      <div className="app-container dark-theme">
        <Navbar activeView={activeView} setActiveView={setActiveView} />
        <div className="content">{renderView()}</div>
        {/* <footer className="footer">
          <p>&copy; {new Date().getFullYear()} Developed by GeoCodexx Design</p>
        </footer> */}
      </div>
      {/* Modal de confirmación con tema oscuro/teal */}
      {showExitModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <svg style={styles.warningIcon} viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 2L1 21h22L12 2zm0 3.5L18.5 19h-13L12 5.5z"
                />
                <path
                  fill="currentColor"
                  d="M12 16c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1zm0-4c.6 0 1-.4 1-1V8c0-.6-.4-1-1-1s-1 .4-1 1v3c0 .6.4 1 1 1z"
                />
              </svg>
              <h3 style={styles.modalTitle}>Confirmar Salida</h3>
            </div>

            <p style={styles.modalMessage}>
              ¿Estás seguro que deseas cerrar la aplicación?
            </p>

            <div style={styles.modalButtons}>
              <Button
                variant="outlined"
                color="teallight"
                size="small"
                onClick={() => handleExitConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="teal"
                size="small"
                onClick={() => handleExitConfirm(true)}
              >
                Salir
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;

// Estilos con tema oscuro y teal
const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(3px)",
  },
  modalContainer: {
    /*backgroundColor: "#1e1e2d",*/
    backgroundColor: "#2A2A2A",
    borderRadius: "10px",
    padding: "25px",
    width: "380px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
    border: "1px solid rgba(0, 150, 136, 0.3)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
    gap: "15px",
  },
  warningIcon: {
    width: "28px",
    height: "28px",
    color: "#009688", // Teal
  },
  modalTitle: {
    margin: 0,
    color: "#e0e0e0",
    fontSize: "1.3rem",
    fontWeight: "500",
  },
  modalMessage: {
    color: "#b0b0b0",
    margin: "0 0 25px 0",
    lineHeight: "1.5",
    fontSize: "0.95rem",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  cancelButton: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    background: "#2d2d3a",
    color: "#e0e0e0",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease",
    ":hover": {
      background: "#3a3a4a",
    },
  },
  exitButton: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    background: "#009688", // Teal
    color: "#fff",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease",
    ":hover": {
      background: "#00796b", // Teal más oscuro
    },
  },
};
