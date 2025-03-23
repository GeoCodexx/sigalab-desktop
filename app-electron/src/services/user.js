import axios from "axios";

const API_URL = "http://localhost:3000/api"; // Reemplaza con la URL de tu backend

/**
 * Autentica al usuario con su nombre y contraseña.
 * @param {string} email - Nombre de usuario.
 * @param {string} password - Contraseña.
 * @returns {Promise<object>} - Respuesta del backend con datos del usuario.
 */
export const authenticateUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error en la autenticación:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

/**
 * Obtener datos del usuario autenticado
 * @returns {Promise<object>} - Respuesta del backend.
 */
export const dataUser = async () => {
  const token = localStorage.getItem("authTokenDesktop"); // Obtener el token
  try {
    const response = await axios.get(
      `${API_URL}/users/profile`,
      { headers: { Authorization: `Bearer ${token}` } } // Enviar token en la cabecera
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error al obtener datos de usuario:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

/**
 * Registra la huella dactilar del usuario autenticado.
 * @param {string} userId - ID del usuario autenticado.
 * @param {string} fingerprintTemplate - Plantilla de la huella codificada en Base64.
 * @param {string} token - token de autenticacion de usuario.
 * @returns {Promise<object>} - Respuesta del backend.
 */
export const registerFingerprint = async (
  userId,
  fingerprintTemplate,
  token
) => {
  try {
    const response = await axios.post(
      `${API_URL}/users/register-fingerprint`,
      { userId, fingerprint: fingerprintTemplate },
      { headers: { Authorization: `Bearer ${token}` } } // Enviar token en la cabecera
    );
    return response.status === 200
      ? { success: true, ...response.data }
      : response.data;
  } catch (error) {
    console.error(
      "Error al registrar huella:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

// Obtener la huella de un usuario desde la base de datos
export const getFingerprintFromDB = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/users/get-fingerprint/${userId}`
    );
    return response.data.fingerprint;
  } catch (error) {
    console.error("Error al obtener la huella:", error);
    return null;
  }
};

// Comparar huella escaneada con la almacenada en SecuGen Web API
export const compareFingerprint = async (
  scannedFingerprint,
  storedFingerprint
) => {
  try {
    const response = await axios.post(
      "https://localhost:8443/SGIMatchScore",
      {
        template1: storedFingerprint,
        template2: scannedFingerprint,
      },
      {
        httpsAgent: agent,
        headers: {
          Origin: "https://localhost", // Agregar encabezado "Origin"
        },
      }
    );

    const { ErrorCode, Score } = response.data;

    if (ErrorCode === 0 && Score >= 150) {
      // SecuGen recomienda un mínimo de 150 para coincidencia
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error al comparar huellas:", error);
    return false;
  }
};

/**
 * Compara una huella dactilar escaneada con la almacenada en la base de datos.
 * @param {string} userId - ID del usuario.
 * @param {string} scannedFingerprint - Imagen de la huella escaneada en Base64.
 * @returns {Promise<boolean>} - `true` si la huella coincide, `false` si no.
 */
/*export const matchFingerprint = async (userId, scannedFingerprint) => {
  try {
    const response = await axios.post(`${API_URL}/match-fingerprint`, {
      userId,
      fingerprint: scannedFingerprint,
    });
    return response.data.match; // Suponiendo que el backend responde con { match: true/false }
  } catch (error) {
    console.error(
      "Error en la comparación de huellas:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};*/
