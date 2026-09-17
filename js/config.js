// ------------------------------------------------------------------
// Detecta automáticamente dónde está corriendo este front, para no
// tener que editar nada a mano según el entorno:
//   - Servido en localhost/127.0.0.1 (desarrollo local) -> backend local
//   - Servido en cualquier otro dominio (ej. GitHub Pages) -> backend deployado
// ------------------------------------------------------------------
const API_BASE_URL =
  (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "http://localhost:8080"
    : "https://api-bazar-ejercicio-curso-todocode.onrender.com"; // TODO: reemplazar por la URL real una vez deployado
