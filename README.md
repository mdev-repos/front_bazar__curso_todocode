# Front Bazar — TodoCode

Front vanilla (HTML + CSS + JS, sin frameworks ni dependencias) para consumir la API
[`api_bazar__ejercicio_curso_todocode`](../api_bazar__ejercicio_curso_todocode).

A diferencia del front de [Ferretería](../front_ferreteria__prueba_tecnica_todocode) (una
sola entidad), acá se gestionan **tres entidades relacionadas** (Productos, Clientes,
Ventas) desde una interfaz por pestañas, más una sección de reportes que consume las
tres consultas específicas del enunciado (productos de una venta, monto total por
fecha, venta más alta).

## Cómo correrlo en local

Necesita servirse por HTTP (no abrir el `index.html` directo con `file://`). Cualquier
servidor estático simple alcanza, por ejemplo:

```bash
python3 -m http.server 5500
```

y abrir `http://localhost:5500`. También funciona con *Live Server* de VS Code/IntelliJ.

## Configuración de la URL de la API

Un solo punto de configuración: [`js/config.js`](js/config.js). Detecta automáticamente
dónde está corriendo el front:

```js
const API_BASE_URL =
  (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "http://localhost:8080"                     // servido en local -> backend local
    : "https://api-bazar-ejercicio-curso-todocode.onrender.com"; // servido en otro dominio -> backend deployado
```

## Estructura

```
index.html          página con pestañas: Productos / Clientes / Ventas / Reportes
css/style.css        estilos, sin frameworks
js/config.js          URL base de la API
js/api.js             todas las llamadas fetch a la API, nada de DOM acá
js/app.js              lógica de pantalla: render de tablas, formularios, modales, reportes
```

## Funcionalidad por pestaña

- **Productos**: alta, edición, baja, listado (con badge de "bajo stock" para los
  productos con menos de 5 unidades — consume `/products/low_stock` con un toggle).
- **Clientes**: alta, edición, baja, listado.
- **Ventas**: alta (con líneas de producto dinámicas — cantidad y precio unitario
  editables, subtotal calculado en vivo), listado, y un botón "Ver productos" por cada
  venta que consume el endpoint de productos por venta.
- **Reportes**: monto total vendido en una fecha puntual, y datos de la venta más alta
  registrada.

## Notas de diseño

Todas las listas se cargan automáticamente al abrir la página (o al cambiar de
pestaña, según corresponda) — no hace falta hacer un alta primero para ver datos.
