// ------------------------------------------------------------------
// Capa de acceso a la API — el único lugar del front que sabe que
// existe un backend REST. app.js nunca llama a fetch() directamente.
// ------------------------------------------------------------------

async function handleResponse(response, errorMessage) {
    if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || errorMessage);
    }
    if (response.status === 204) return null;
    return response.json();
}

// ---------- Productos ----------

async function fetchAllProducts() {
    const res = await fetch(`${API_BASE_URL}/products`);
    return handleResponse(res, "No se pudo obtener el listado de productos");
}

async function fetchLowStockProducts() {
    const res = await fetch(`${API_BASE_URL}/products/low_stock`);
    return handleResponse(res, "No se pudo obtener el listado de bajo stock");
}

async function createProduct(data) {
    const res = await fetch(`${API_BASE_URL}/products/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return handleResponse(res, "No se pudo crear el producto");
}

async function updateProduct(id, data) {
    const res = await fetch(`${API_BASE_URL}/products/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return handleResponse(res, "No se pudo actualizar el producto");
}

async function deleteProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/delete/${id}`, { method: "DELETE" });
    return handleResponse(res, "No se pudo eliminar el producto");
}

// ---------- Clientes ----------

async function fetchAllClients() {
    const res = await fetch(`${API_BASE_URL}/clients`);
    return handleResponse(res, "No se pudo obtener el listado de clientes");
}

async function createClient(data) {
    const res = await fetch(`${API_BASE_URL}/clients/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return handleResponse(res, "No se pudo crear el cliente");
}

async function updateClient(id, data) {
    const res = await fetch(`${API_BASE_URL}/clients/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return handleResponse(res, "No se pudo actualizar el cliente");
}

async function deleteClient(id) {
    const res = await fetch(`${API_BASE_URL}/clients/delete/${id}`, { method: "DELETE" });
    return handleResponse(res, "No se pudo eliminar el cliente");
}

// ---------- Ventas ----------

async function fetchAllSales() {
    const res = await fetch(`${API_BASE_URL}/sales`);
    return handleResponse(res, "No se pudo obtener el listado de ventas");
}

async function createSale(data) {
    const res = await fetch(`${API_BASE_URL}/sales/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return handleResponse(res, "No se pudo registrar la venta");
}

async function fetchSaleProducts(saleId) {
    const res = await fetch(`${API_BASE_URL}/sales/products/${saleId}`);
    return handleResponse(res, "No se pudo obtener los productos de la venta");
}

async function fetchSalesAmountByDate(isoDate) {
    const res = await fetch(`${API_BASE_URL}/sales/amount/${isoDate}`);
    return handleResponse(res, "No se pudo obtener el monto de ventas de esa fecha");
}

async function fetchHighestSale() {
    const res = await fetch(`${API_BASE_URL}/sales/highest`);
    return handleResponse(res, "No se pudo obtener la venta más alta");
}
