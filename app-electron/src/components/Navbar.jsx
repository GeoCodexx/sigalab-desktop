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
            INICIO
          </button>
        </li>
        <li>
          <button
            className={activeView === "register" ? "active" : ""}
            onClick={() => setActiveView("register")}
          >
            GUARDAR HUELLA
          </button>
        </li>
        <li>
          <button
            className={activeView === "help" ? "active" : ""}
            onClick={() => setActiveView("help")}
          >
            AYUDA
          </button>
        </li>
        <li>
          <button
            className={activeView === "about" ? "active" : ""}
            onClick={() => setActiveView("about")}
          >
            ACERCA DE
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
