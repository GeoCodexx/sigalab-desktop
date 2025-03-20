import React from "react";

const Navbar = ({ activeView, setActiveView }) => {
  return (
    <nav className="menu-navbar">
      <ul>
        <li>
          <button
            className={activeView === "home" ? "active" : ""}
            onClick={() => setActiveView("home")}
          >
            Inicio
          </button>
        </li>
        <li>
          <button
            className={activeView === "register" ? "active" : ""}
            onClick={() => setActiveView("register")}
          >
            Guardar Huella
          </button>
        </li>
        <li>
          <button
            className={activeView === "report" ? "active" : ""}
            onClick={() => setActiveView("report")}
          >
            Reportar Problema
          </button>
        </li>
        <li>
          <button onClick={() => window.close()}>Salir</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
