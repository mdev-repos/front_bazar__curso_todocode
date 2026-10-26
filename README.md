<div align="center">
  <img src="./assets/bazar-icon.svg" width="120" alt="Bazar" />

  # Bazar | Front
</div>

Interfaz web para gestionar productos, clientes y ventas de un bazar. Consume la API
[`api_bazar__ejercicio_curso_todocode`](https://github.com/mdev-repos/api_bazar__ejercicio_curso_todocode).

**🖥️ Abrir el front**: https://mdev-repos.github.io/front_bazar__curso_todocode/
**🚀 API**: https://api-bazar-ejercicio-curso-todocode.onrender.com

No hace falta instalar ni ejecutar nada: el front está publicado en GitHub Pages y se conecta solo a la
API publicada.

![HTML](https://img.shields.io/badge/HTML5-vanilla-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-vanilla-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-sin%20dependencias-F7DF1E?logo=javascript&logoColor=black)

---

## Qué se puede hacer

La interfaz tiene cuatro pestañas:

- **Productos**: alta, edición, baja y listado, con una marca de "bajo stock" para los productos con menos
  de 5 unidades y un filtro para ver solo esos.
- **Clientes**: alta, edición, baja y listado.
- **Ventas**: registrar una venta con varios productos (cantidad y precio unitario editables, subtotal
  calculado en vivo), listarlas y ver los productos de cada una.
- **Reportes**: monto total vendido en una fecha y datos de la venta con el monto más alto.

Las listas se cargan solas al abrir la página: no hace falta hacer un alta primero para ver datos. Es una
demo compartida: lo que cargues lo puede ver cualquier visitante.

## El servidor y el semáforo

La API corre en un plan gratuito que se duerme tras un rato sin uso, así que la primera conexión puede tardar
hasta un minuto. Para que eso se note lo menos posible:

- **Apenas se abre la página**, el front le hace una consulta a la API. El servidor empieza a despertar
  mientras recorrés la pantalla.
- Un **semáforo** en la cabecera muestra el estado:

| Luz | Significa |
|---|---|
| 🟡 Amarillo | Conectando con el servidor (con un contador de segundos) |
| 🟢 Verde | El servidor responde: ya podés usar todo |
| 🔴 Rojo | Sin respuesta después de un rato. Sigue intentando solo y hay un botón para reintentar |

- Mientras la luz no está en verde, los **botones que necesitan al servidor quedan bloqueados**: al pasar el
  mouse aparece el cursor de prohibido y el aviso "Conectando al servidor...". Los campos de los formularios
  se pueden ir completando igual, sin perder lo escrito.
- Con la página abierta, el front vuelve a consultar al servidor cada tanto, lo que además evita que se
  duerma mientras lo estás usando.

## Correrlo en local

Sirve para ver el front con tu propio backend. Necesita servirse por HTTP (no abrir `index.html` directo con
`file://`). Cualquier servidor estático alcanza:

```bash
python3 -m http.server 5500
```

y abrir `http://localhost:5500`. También funciona con *Live Server* de VS Code o IntelliJ.

Para que consuma tu API local, levantala en `http://localhost:8080` (ver el
[README de la API](https://github.com/mdev-repos/api_bazar__ejercicio_curso_todocode#c%C3%B3mo-correrlo-en-local)).
Con el front servido en `localhost`, el semáforo y los bloqueos funcionan igual, con textos de "API local".

## Configuración de la URL de la API

Un solo punto de configuración: [`js/config.js`](js/config.js). Detecta solo desde dónde se sirve el front, sin
editar nada a mano:

```js
const API_IS_LOCAL = location.hostname === "localhost" || location.hostname === "127.0.0.1";

const API_BASE_URL = API_IS_LOCAL
    ? "http://localhost:8080"                                      // servido en local -> API local
    : "https://api-bazar-ejercicio-curso-todocode.onrender.com";   // servido en otro dominio -> API publicada
```

La API permite por defecto los orígenes `http://localhost:5500`, `http://127.0.0.1:5500` y
`https://mdev-repos.github.io`. Si servís el front en otro puerto, hay que incluirlo en la variable
`CORS_ALLOWED_ORIGINS` de la API.

## Estructura

```
index.html          página con pestañas: Productos / Clientes / Ventas / Reportes
css/style.css        estilos, sin frameworks
js/config.js          URL base de la API
js/api.js             todas las llamadas fetch a la API, nada de DOM acá
js/status.js          estado del servidor: consulta inicial, semáforo y bloqueo de botones
js/app.js             lógica de pantalla: render de tablas, formularios, modales, reportes
```

## Autor

**Matías Mazzitelli**
_Backend Developer | Java / Spring Boot_

[GitHub] https://github.com/mdev-repos | [LinkedIn] https://www.linkedin.com/in/mnm-dev
