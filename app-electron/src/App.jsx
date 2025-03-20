import React, { useState } from "react";
import "./App.css";

import Navbar from "./components/NavBar";
import Home from "./components/Home";
import Register from "./components/Register";
import Report from "./components/Report";

const App = () => {
  const [activeView, setActiveView] = useState("home");

  const renderView = () => {
    switch (activeView) {
      case "home":
        return <Home />;
      case "register":
        return <Register setActiveView={setActiveView}/>;
      case "report":
        return <Report />;
      default:
        return <Home />;
    }
  };
  return (
    <div className="app-container dark-theme">
      <Navbar activeView={activeView} setActiveView={setActiveView} />
      <div className="content">{renderView()}</div>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Developed by GeoCodexx Design</p>
      </footer>
    </div>
  );
};

export default App;
