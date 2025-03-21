import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid2,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import WaitingFingerImage from "../assets/waiting_finger.gif";
import LoginImage from "../assets/6184159_3094350.svg";
import { authenticateUser, dataUser } from "../services/user";

const Register = ({ setActiveView }) => {
  const [fingerprintImage, setFingerprintImage] = useState(null);
  const [fingerprintStatus, setFingerprintStatus] = useState({
    type: "info",
    message: "Esperando huella...",
  });
  const [scanAnimation, setScanAnimation] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [hasFingerprint, setHasFingerprint] = useState(null);
  const [userData, setUserData] = useState({});

  const handleChange = (e) => {
    //setCredentials({ ...credentials, [e.target.name]: e.target.value });
    const { name, value } = e.target;
    setCredentials((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Si el usuario comienza a escribir, eliminar el error de ese campo
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value.trim() ? "" : prevErrors[name], // Elimina el error si hay contenido
    }));
  };

  const validateForm = () => {
    let newErrors = {};

    /*if (!credentials.username) newErrors.username = "El usuario es requerido";
    if (!credentials.password)
      newErrors.password = "La contraseña es requerida";
    */
    if (!credentials.username) {
      newErrors.username = "El usuario es requerido";
    } /*else if (credentials.username.length < 5) {
      newErrors.username = "Debe tener al menos 5 caracteres";
    }*/

    if (!credentials.password) {
      newErrors.password = "La contraseña es requerida";
    } /*else if (credentials.password.length < 5) {
      newErrors.password = "Debe tener al menos 5 caracteres";
    }*/

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /*Priemra version de prueba con simulacion de carga
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Simulación de autenticación y verificación de huella en backend
      setTimeout(() => {
        setLoading(false);
        const isAuthenticated =
          credentials.username === "admin" && credentials.password === "12345";
        if (isAuthenticated) {
          const userHasFingerprint = Math.random() > 0.5; // Simulación de estado de huella
          setAuthenticated(true);
          setHasFingerprint(userHasFingerprint);
        } else {
          setErrors({ general: "Usuario o contraseña incorrectos" });
          setAuthenticated(false);
        }
      }, 2000);
    } catch (error) {
      setLoading(false);
      setErrors({ general: "Error en la autenticación" });
    }
  };*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Llamada real a la API para autenticar usuario
      const response = await authenticateUser(
        credentials.username,
        credentials.password
      );
      console.log(response);
      if (response.token) {
        // Guardar el token en localStorage para usarlo en el registro de huella
        localStorage.setItem("authTokenDesktop", response.token);
        setAuthenticated(true);

        // Verificar si el usuario ya tiene una huella registrada
        const userInfo = await dataUser();
        //console.log(userInfo)
        if (userInfo.fingerprintimage) {
          setHasFingerprint(true);
          setUserData({});
        } else {
          setHasFingerprint(false);
          setUserData(userInfo);
        }
      } else {
        setErrors({ general: "No se recibió token de autenticación" });
      }
    } catch (error) {
      setErrors({
        general: error.message || "Usuario o contraseña incorrectos",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFingerprintScan = async () => {
    setFingerprintStatus({
      type: "warning",
      message: "Escaneando... No retire el dedo.",
    });
    setScanAnimation(true);
    setFingerprintImage(null); // Limpia la imagen anterior

    try {
      const response = await window.electron.invoke("capture-fingerprint"); // Simulación del backend

      // Simular tiempo de escaneo de 3 segundos antes de mostrar la huella
      setTimeout(() => {
        setScanAnimation(false);
        if (response.ErrorCode === 0 && response.BMPBase64) {
          setFingerprintImage(`data:image/bmp;base64,${response.BMPBase64}`);
          
          setFingerprintStatus({
            type: "success",
            message: "Huella escaneada con éxito",
          });
        } else {
          setUserData(null);
          setFingerprintStatus({
            type: "error",
            message: `Error al escanear huella. COD: ${response.ErrorCode}`,
          });
        }
      }, 2000);
    } catch (error) {
      setScanAnimation(false);
      setFingerprintStatus({
        type: "error",
        message: "Error Server: No se pudo escanear la huella.",
      });
    }
  };

  // Redirigir a Home si el usuario no existe o ya tiene huella
  useEffect(() => {
    if (hasFingerprint === true) {
      setTimeout(() => {
        setActiveView("home"); // Cambia la vista a Home
      }, 2000);
    }
  }, [hasFingerprint, setActiveView]);

  return (
    <Grid2 container spacing={2}>
      {/* Columna del formulario */}
      <Grid2 size={6} sx={{ p: 3 }}>
        <Card
          sx={{
            backgroundColor: "#1e1e1e",
            color: "#ABB2BF",
          }}
        >
          {!authenticated ? (
            <CardContent>
              <Typography variant="h6" align="center">
                Autenticación
              </Typography>
              <div>
                {errors.general && (
                  <Alert severity="error">{errors.general}</Alert>
                )}
              </div>
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Usuario"
                  name="username"
                  fullWidth
                  margin="normal"
                  value={credentials.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={errors.username}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#bdbdbd",
                      borderRadius: "10px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(250, 250, 250, 0.34)",
                      },
                      "&.Mui-focused": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#239086",
                          borderWidth: "2px",
                        },
                      },
                      "&:hover:not(.Mui-focused)": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#41a396",
                        },
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#bdbdbd",
                      "&.Mui-focused": {
                        color: "#239086",
                        fontWeight: "bold",
                      },
                    },
                  }}
                />
                <TextField
                  label="Contraseña"
                  type="password"
                  name="password"
                  fullWidth
                  margin="normal"
                  value={credentials.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#bdbdbd",
                      borderRadius: "10px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(250, 250, 250, 0.34)",
                      },
                      "&.Mui-focused": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#239086",
                          borderWidth: "2px",
                        },
                      },
                      "&:hover:not(.Mui-focused)": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#41a396",
                        },
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#bdbdbd",
                      "&.Mui-focused": {
                        color: "#239086",
                        fontWeight: "bold",
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="teal"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Ingresar"}
                </Button>
              </form>
            </CardContent>
          ) : (
            <CardContent>
              <Typography>{`Hola ${
                userData?.name || "Anonimo"
              }. Por favor siga estos pasos para el registro de su huella dactilar.`}</Typography>
              <Typography margin={2}>
                1. Limpie su dedo índice izquierdo con alcohol.
              </Typography>
              <Typography margin={2}>
                2. Coloque su dedo en la superficie del lector biometrico.
              </Typography>
              <Typography margin={2}>
                3. Haga click en el botón "CAPTURAR HUELLA".
              </Typography>
              <Typography margin={2}>
                4. No retire el dedo hasta recibir la notificación respectiva.
              </Typography>
              <Button
                variant="contained"
                color="teal"
                fullWidth
                disabled={loading}
                sx={{ marginTop: 0 }}
                onClick={handleFingerprintScan}
              >
                {loading ? <CircularProgress size={24} /> : "Capturar Huella"}
              </Button>
            </CardContent>
          )}
        </Card>
      </Grid2>

      {/* Columna de previsualización de huella */}
      <Grid2
        size={6}
        sx={{ display: "flex", justifyContent: "center", padding: 3 }}
      >
        <Card
          sx={{
            /*backgroundColor: "#1e1e1e",*/
            backgroundColor: "transparent",
            color: "#ABB2BF",
          }}
        >
          <CardContent
            style={{
              textAlign: "center",
            }}
          >
            {/* <Typography variant="h5">Registro de Huella</Typography> */}
            {authenticated ? (
              hasFingerprint ? (
                <Alert severity="error">
                  El usuario ya tiene una huella registrada.
                </Alert>
              ) : (
                <>
                  {/* <Alert severity="success">
                    Bienvenido, coloca tu dedo en el lector.
                  </Alert> */}
                  <Alert severity={fingerprintStatus.type}>
                    {fingerprintStatus.message}
                  </Alert>
                  <div
                    className={`fingerprint-section ${
                      scanAnimation ? "scanning" : ""
                    } ${fingerprintImage ? "fingerprint-detected" : ""}`}
                    style={{
                      marginTop: 20,
                      //padding: 20,
                      borderRadius: 10,
                    }}
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
                </>
              )
            ) : (
              // <Typography variant="body1">
              //   Autentíquese para continuar
              // </Typography>
              <img src={LoginImage} alt="Login Image" width={200} />
            )}
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
  );
};

export default Register;
