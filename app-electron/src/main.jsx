import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createTheme, ThemeProvider } from "@mui/material/styles";

let theme = createTheme({
  // Theme customization goes here as usual, including tonalOffset and/or
  // contrastThreshold as the augmentColor() function relies on these
});
theme = createTheme(theme, {
  // Custom colors created with augmentColor go here
  palette: {
    mode: "dark",
    primary: {
      main: "#009688", // Teal
      contrastText: "#ffffff", // Texto blanco para contraste
    },
    secondary: {
      main: "#ff9800",
    },
    background: {
      default: "#121212", // Fondo oscuro
      paper: "#1e1e1e", // Fondo de componentes
    },
    text: {
      primary: "rgba(255, 255, 255, 0.87)", // Textos principales en blanco "#ffffff"
      secondary: "rgba(255, 255, 255, 0.6)", // Textos secundarios "rgba(255, 255, 255, 0.7)"
      disabled: "rgba(255, 255, 255, 0.38)", // Textos deshabilitados "rgba(255, 255, 255, 0.5)"
    },

    teal: theme.palette.augmentColor({
      color: {
        /*main: "#239086",*/
        main: "#0a5c5c",
      },
      name: "teal",
    }),
    teallight: theme.palette.augmentColor({
      color: {
        main: "#239086",
      },
      name: "teallight",
    }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>
);
