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
  CircularProgress,
} from "@mui/material";
import axios from "axios";

export default function DeviceLogin({ onAuthenticated }) {
  const [deviceId, setDeviceId] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deviceIdError, setDeviceIdError] = useState(false);
  const [secretError, setSecretError] = useState(false);

  const validateFields = () => {
    const deviceIdValid = deviceId.trim() !== "";
    const secretValid = secret.trim() !== "";
    setDeviceIdError(!deviceIdValid);
    setSecretError(!secretValid);
    return deviceIdValid && secretValid;
  };

  const handleLogin = async () => {
    setError("");
    if (!validateFields()) return;

    setLoading(true);
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
      window.electron.ipcRenderer.send("device-authenticated");
      onAuthenticated();
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al autenticar dispositivo"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
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
          label="ID-Dispositivo"
          margin="normal"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          onKeyDown={handleKeyPress}
          error={deviceIdError}
          helperText={deviceIdError && "Ingrese el ID del dispositivo"}
        />
        <TextField
          fullWidth
          label="Clave Secreta"
          type="password"
          margin="normal"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          onKeyDown={handleKeyPress}
          error={secretError}
          helperText={secretError && "Ingrese la clave secreta"}
        />
        <Box mt={2}>
          <Button
            variant="contained"
            fullWidth
            color="primary"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Validar"
            )}
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
