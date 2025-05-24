import { useState } from "react";
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
import {
  authenticateUser,
  dataUser,
  registerFingerprint,
} from "../services/user";
import axios from "axios";

const Register = ({ setActiveView }) => {
  const [fingerprintImage, setFingerprintImage] = useState(null);
  //const [fingerprintTemplate, setFingerprintTemplate] = useState(null);
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
  const [buttonState, setButtonState] = useState(false);

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

  const scanFingerprint = async () => {
    setFingerprintStatus({
      type: "warning",
      message: "Escaneando... No retire el dedo.",
    });
    setScanAnimation(true);
    setFingerprintImage(null);

    const response = await window.electron.invoke("capture-fingerprint");

    setScanAnimation(false);

    if (response.ErrorCode !== 0 || !response.BMPBase64) {
      throw new Error(`Error al escanear huella. COD: ${response.ErrorCode}`);
    }

    return {
      template: response.TemplateBase64,
      image: `data:image/bmp;base64,${response.BMPBase64}`,
    };
  };

  const fetchUsers = async () => {
    const response = await axios.get("http://localhost:3000/api/users");
    return response.data; // [{ id, fingerprintimage }, ...]
  };

  const isFingerprintDuplicate = async (newTemplate, users) => {
    for (const user of users) {
      if (!user.fingerprintimage) continue;

      const matchResponse = await window.electron.invoke("match-fingerprint", {
        template1: newTemplate,
        template2: user.fingerprintimage,
      });

      if (matchResponse.ErrorCode === 0 && matchResponse.MatchingScore >= 100) {
        return true; // Se encontró una coincidencia con una huella existente
      }
    }
    return false;
  };

  const registerUserFingerprint = async (userId, template, token) => {
    return await registerFingerprint(userId, template, token);
  };

  //Escanear y enviar huella
  const handleRegisterFingerprint = async () => {
    setLoading(true);

    try {
      const { template, image } = await scanFingerprint();
      setFingerprintImage(image);
      setFingerprintStatus({
        type: "success",
        message: "Huella escaneada con éxito",
      });

      const users = await fetchUsers();
      if (!users.length)
        throw new Error("No hay usuarios registrados en la base de datos.");

      // Validar si la huella ya está registrada
      const isDuplicate = await isFingerprintDuplicate(template, users);
      if (isDuplicate) {
        setFingerprintStatus({
          type: "error",
          message: "Esta huella ya está registrada en otro usuario.",
        });
        setLoading(false);
        return;
      }

      // Obtener token de autenticación
      const token = localStorage.getItem("authTokenDesktop");
      if (!token) {
        setFingerprintStatus({
          type: "error",
          message: "Sesión expirada. Inicia sesión nuevamente.",
        });
        setLoading(false);
        return;
      }

      // Registrar huella en el backend
      const response = await registerUserFingerprint(
        userData._id,
        template,
        token
      );
      if (response.success) {
        setFingerprintStatus({
          type: "success",
          message: "Huella registrada correctamente.",
        });
        setButtonState(true);
      } else {
        setFingerprintStatus({ type: "warning", message: response.message });
        setButtonState(false);
      }
    } catch (error) {
      setFingerprintStatus({
        type: "error",
        message: error.message || "Error al registrar la huella.",
      });
    }

    setLoading(false);
  };

  //Escanear y enviar huella
  /*const handleRegisterFingerprint = async () => {
    setLoading(true);
    setFingerprintStatus({
      type: "warning",
      message: "Escaneando... No retire el dedo.",
    });
    setScanAnimation(true);
    setFingerprintImage(null); // Limpia la imagen anterior

    try {
      const response = await window.electron.invoke("capture-fingerprint"); // Simulación del escaneo

      setTimeout(async () => {
        setScanAnimation(false);

        if (response.ErrorCode === 0 && response.BMPBase64) {
          const fingerprintData = `data:image/bmp;base64,${response.BMPBase64}`;
          setFingerprintImage(fingerprintData);
          // setFingerprintTemplate(response.TemplateBase64);
          setFingerprintStatus({
            type: "success",
            message: "Huella escaneada con éxito",
          });

          // Obtener el token del usuario autenticado
          const token = localStorage.getItem("authTokenDesktop");
          if (!token) {
            setFingerprintStatus({
              type: "error",
              message: "Sesión expirada. Inicia sesión nuevamente.",
            });
            return;
          }

          // Enviar la huella escaneada al backend
          try {
            const rpta = await registerFingerprint(
              userData._id,
              response.TemplateBase64,
              token
            );
            if (rpta.success) {
              setFingerprintStatus({
                type: "success",
                message: "Huella registrada correctamente.",
              });
              setButtonState(true);
            } else {
              setFingerprintStatus({
                type: "warning",
                message: rpta.message,
              });
              setButtonState(false);
            }
          } catch (error) {
            setFingerprintStatus({
              type: "error",
              message: "Error al registrar la huella en el servidor.",
            });
          }
        } else {
          setFingerprintStatus({
            type: "error",
            message: `Error al escanear huella. COD: ${response.ErrorCode}`,
          });
        }
      }, 2000); // Mantener la simulación de 2s
    } catch (error) {
      setScanAnimation(false);
      setFingerprintStatus({
        type: "error",
        message: "Error Server: No se pudo escanear la huella.",
      });
    }
    setLoading(false);
  };*/

  // Redirigir a Home si el usuario no existe o ya tiene huella
  /*useEffect(() => {
    if (hasFingerprint === true) {
      setTimeout(() => {
        setActiveView("home"); // Cambia la vista a Home
      }, 4000);
    }
  }, [hasFingerprint, setActiveView]);*/

  return (
    <Grid2 container spacing={2}>
      {/* Columna del formulario */}
      <Grid2 size={6} sx={{ p: 3 }}>
        <Card
          sx={{
            //backgroundColor: "#1e1e1e",
            backgroundColor: "transparent",
            color: "#ABB2BF",
            boxShadow: "none",
          }}
        >
          {!authenticated ? (
            <CardContent sx={{ backgroundColor: "#2A2A2A" }}>
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
                  sx={{ marginTop: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Ingresar"}
                </Button>
              </form>
            </CardContent>
          ) : authenticated && !hasFingerprint ? (
            <CardContent sx={{ backgroundColor: "#2A2A2A" }}>
              {buttonState ? (
                <>
                  <Typography sx={{ color: "#8D939A" }} margin={4}>
                    Ahora ya puedes marcar tu asistencia.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="teallight"
                    fullWidth
                    onClick={() => setActiveView("Home")}
                  >
                    Ir a inicio
                  </Button>
                </>
              ) : (
                <>
                  <Typography sx={{ color: "#8D939A" }}>{`Hola ${
                    userData?.name || "Anonimo"
                  }. Por favor siga estos pasos para registrar su huella dactilar:`}</Typography>
                  <Typography sx={{ color: "#8D939A" }} margin={2}>
                    1. Limpie su dedo índice izquierdo con alcohol.
                  </Typography>
                  <Typography sx={{ color: "#8D939A" }} margin={2}>
                    2. Coloque su dedo en el lector biometrico y presione el
                    botón "Capturar huella".
                  </Typography>
                  <Button
                    variant="contained"
                    color="teal"
                    fullWidth
                    disabled={loading}
                    sx={{ marginTop: 0 }}
                    onClick={handleRegisterFingerprint}
                  >
                    {loading ? (
                      <CircularProgress color="teal" size={24} />
                    ) : (
                      "Capturar Huella"
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          ) : (
            <div
              style={{
                width: "100%",
                paddingTop: "30px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#2A2A2A",
              }}
            >
              <Button
                variant="outlined"
                color="teallight"
                onClick={() => setActiveView("Home")}
              >
                Regresar
              </Button>
            </div>
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
            color: "#ABB2BF",
            backgroundColor: "#2A2A2A",
          }}
        >
          <CardContent
            sx={
              authenticated
                ? {
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }
                : {
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#2A2A2A",
                  }
            }
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
                      //padding: 20,style={{
                      width: fingerprintImage ? "100px" : "120px",
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

              <img src={LoginImage} alt="Login Image" width={213} />
            )}
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
  );
};

export default Register;
