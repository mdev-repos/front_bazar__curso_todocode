// ------------------------------------------------------------------
// Estado del servidor. Apenas se abre la página se le hace una consulta
// a la API: el servidor gratuito se duerme tras un rato sin uso y así
// empieza a despertar mientras la persona recorre la pantalla.
//
// Semáforo:
//   amarillo -> conectando (la primera vez puede tardar hasta ~1 minuto)
//   verde    -> el servidor responde
//   rojo     -> sin respuesta (se sigue intentando solo)
//
// Mientras no está en verde, los botones que impactan en el backend
// quedan bloqueados (los campos se pueden seguir completando).
// ------------------------------------------------------------------

const ATTEMPT_TIMEOUT_MS = 30000;
const RETRY_MS = 3000;
const GIVE_UP_MS = 120000;      // pasado este tiempo sin respuesta, la luz pasa a roja
const WATCH_MS = 120000;        // con el servidor arriba, lo consulta de vez en cuando (también evita que se duerma)

const BLOCKED_HINT = API_IS_LOCAL
    ? "🚫 Esperando a la API local..."
    : "🚫 Conectando al servidor...";

const statusBox = document.querySelector("#api-status");
const statusText = document.querySelector("#api-status-text");
const statusLights = document.querySelectorAll("#api-status .light");
const retryButton = document.querySelector("#retry-status");

let backendReady = false;
let waitStartedAt = Date.now();
let ticker = null;
let monitorCallbacks = { onReady() {}, onLost() {} };

function statusLabel(state) {
    if (state === "ready") return API_IS_LOCAL ? "API local disponible" : "Servidor listo";
    if (state === "down") return API_IS_LOCAL ? "No se detecta la API local" : "Sin respuesta del servidor";
    const seconds = Math.floor((Date.now() - waitStartedAt) / 1000);
    return API_IS_LOCAL
        ? "Verificando la API local..."
        : `Conectando al servidor... ${seconds}s`;
}

function setStatus(state) {
    const light = { checking: "yellow", ready: "green", down: "red" }[state];
    statusBox.dataset.state = state;
    statusText.textContent = statusLabel(state);
    statusLights.forEach(el => el.classList.toggle("on", el.dataset.light === light));
    retryButton.hidden = state !== "down";
    statusBox.title = state === "checking" && !API_IS_LOCAL
        ? "El servidor gratuito se duerme tras un rato sin uso: la primera conexión puede tardar hasta un minuto."
        : "";

    backendReady = state === "ready";
    document.body.dataset.backend = backendReady ? "ready" : "waiting";
    refreshBackendGuard();
}

// Marca (o desmarca) como bloqueados los botones que necesitan el backend.
function refreshBackendGuard() {
    document.querySelectorAll(".needs-backend").forEach(el => {
        if (backendReady) {
            el.removeAttribute("aria-disabled");
            el.removeAttribute("title");
        } else {
            el.setAttribute("aria-disabled", "true");
            el.title = BLOCKED_HINT;
        }
    });
}

// Captura clics y envíos antes que cualquier otro handler.
function blockWhileWaiting(event) {
    if (backendReady) return;
    const blocked = event.target.closest(".needs-backend");
    const form = event.type === "submit" ? event.target : null;
    if (!blocked && !form?.querySelector(".needs-backend")) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const feedback = (form ?? blocked?.closest("form"))?.querySelector(".feedback");
    if (feedback) {
        feedback.textContent = "Todavía se está conectando con el servidor. Probá de nuevo cuando la luz esté en verde.";
        feedback.className = "feedback feedback-error";
    }
}
document.addEventListener("click", blockWhileWaiting, true);
document.addEventListener("submit", blockWhileWaiting, true);

async function isBackendUp() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS)
        });
        return response.ok;
    } catch {
        return false;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitUntilReady() {
    waitStartedAt = Date.now();
    setStatus("checking");
    clearInterval(ticker);
    ticker = setInterval(() => {
        if (statusBox.dataset.state === "checking") statusText.textContent = statusLabel("checking");
    }, 1000);

    while (!(await isBackendUp())) {
        if (Date.now() - waitStartedAt > GIVE_UP_MS) setStatus("down");
        await sleep(RETRY_MS);
    }

    clearInterval(ticker);
    setStatus("ready");
    monitorCallbacks.onReady();
    watchBackend();
}

function watchBackend() {
    setTimeout(async () => {
        if (await isBackendUp()) {
            watchBackend();
        } else {
            monitorCallbacks.onLost();
            waitUntilReady();
        }
    }, WATCH_MS);
}

function startBackendMonitor(callbacks) {
    monitorCallbacks = callbacks;
    waitUntilReady();
}

retryButton.addEventListener("click", () => {
    if (backendReady) return;
    waitStartedAt = Date.now();
    setStatus("checking");
});
