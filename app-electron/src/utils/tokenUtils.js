import { jwtDecode } from "jwt-decode";

export function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // en segundos
    return decoded.exp < currentTime;
  } catch (err) {
    console.error("Token inválido:", err);
    return true; // lo consideramos expirado o inválido
  }
}
