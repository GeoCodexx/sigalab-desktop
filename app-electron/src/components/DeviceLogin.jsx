// renderer/DeviceLogin.jsx
import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import axios from "axios";

export default function DeviceLogin({ onAuthenticated }) {
  const [deviceId, setDeviceId] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      const res = await axios.post(
        "http://localhost:3000/api/devices/device-login",
        {
          deviceId,
          secret,
        }
      );
      const token = res.data.token;
      window.electronStore.set("deviceToken", token);
      // Notifica al proceso principal que se autenticó correctamente
      window.electron.ipcRenderer.send("device-authenticated");
      onAuthenticated(); // Activa el acceso a la app
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al autenticar dispositivo"
      );
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Autenticación del Dispositivo
        </Typography>
        <TextField
          fullWidth
          label="Device ID"
          margin="normal"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        />
        <TextField
          fullWidth
          label="Secret Key"
          type="password"
          margin="normal"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />
        <Box mt={2}>
          <Button
            variant="contained"
            color="teal"
            fullWidth
            onClick={handleLogin}
          >
            Iniciar sesión
          </Button>
        </Box>
        {error && (
          <Box mt={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
