// ------------------------------------------------------------------
// Estado en memoria de las tres entidades. Se recargan desde la API
// cada vez que algo cambia (crear/editar/borrar), nunca se calculan
// a mano en el cliente.
// ------------------------------------------------------------------
let products = [];
let clients = [];
let sales = [];

const LOW_STOCK_THRESHOLD = 5;

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}

function money(value) {
    return `$${Number(value).toFixed(2)}`;
}

// ---------- Tabs ----------

document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.hidden = true);
        btn.classList.add("active");
        document.querySelector(`#tab-${btn.dataset.tab}`).hidden = false;
    });
});

// ==================================================================
// PRODUCTOS
// ==================================================================

const productsTableBody = document.querySelector("#products-table tbody");
const productsEmptyState = document.querySelector("#products-empty-state");
const createProductForm = document.querySelector("#create-product-form");
const createProductFeedback = document.querySelector("#create-product-feedback");
const lowStockToggle = document.querySelector("#low-stock-toggle");

function renderProducts(list) {
    productsTableBody.innerHTML = "";
    productsEmptyState.hidden = list.length !== 0;

    for (const product of list) {
        const lowStock = product.stock < LOW_STOCK_THRESHOLD;
        const row = document.createElement("tr");
        if (lowStock) row.classList.add("row-low-stock");
        row.innerHTML = `
            <td>${product.productCode}</td>
            <td>${escapeHtml(product.name)}</td>
            <td>${escapeHtml(product.brand)}</td>
            <td>${money(product.price)}</td>
            <td>${product.stock}${lowStock ? ' <span class="badge badge-warning">bajo stock</span>' : ""}</td>
            <td class="actions">
                <button class="btn btn-small btn-edit" data-id="${product.productCode}">Editar</button>
                <button class="btn btn-small btn-danger" data-id="${product.productCode}">Eliminar</button>
            </td>
        `;
        productsTableBody.appendChild(row);
    }

    productsTableBody.querySelectorAll(".btn-edit").forEach(btn =>
        btn.addEventListener("click", () => openEditProductModal(Number(btn.dataset.id)))
    );
    productsTableBody.querySelectorAll(".btn-danger").forEach(btn =>
        btn.addEventListener("click", () => handleDeleteProduct(Number(btn.dataset.id)))
    );
}

async function loadProducts() {
    try {
        products = lowStockToggle.checked
            ? await fetchLowStockProducts()
            : await fetchAllProducts();
        renderProducts(products);
        refreshProductSelectsInSaleForm();
    } catch (err) {
        console.error(err);
        productsTableBody.innerHTML = `<tr><td colspan="6">Error al conectar con la API. ¿Está corriendo el backend?</td></tr>`;
    }
}

lowStockToggle.addEventListener("change", loadProducts);

createProductForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    createProductFeedback.textContent = "";

    const formData = new FormData(createProductForm);
    const data = {
        name: formData.get("name"),
        brand: formData.get("brand"),
        price: Number(formData.get("price")),
        stock: Number(formData.get("stock"))
    };

    try {
        await createProduct(data);
        createProductForm.reset();
        createProductFeedback.textContent = "Producto creado correctamente.";
        createProductFeedback.className = "feedback feedback-success";
        await loadProducts();
    } catch (err) {
        createProductFeedback.textContent = err.message;
        createProductFeedback.className = "feedback feedback-error";
    }
});

// ---------- Editar producto ----------

const editProductModal = document.querySelector("#edit-product-modal");
const editProductForm = document.querySelector("#edit-product-form");
const editProductFeedback = document.querySelector("#edit-product-feedback");

function openEditProductModal(id) {
    const product = products.find(p => p.productCode === id);
    if (!product) return;

    editProductForm.elements["id"].value = product.productCode;
    editProductForm.elements["name"].value = product.name;
    editProductForm.elements["brand"].value = product.brand;
    editProductForm.elements["price"].value = product.price;
    editProductForm.elements["stock"].value = product.stock;

    editProductFeedback.textContent = "";
    editProductModal.showModal();
}

document.querySelector("#cancel-edit-product").addEventListener("click", () => editProductModal.close());

editProductForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(editProductForm);
    const id = formData.get("id");
    const data = {
        name: formData.get("name") || null,
        brand: formData.get("brand") || null,
        price: formData.get("price") ? Number(formData.get("price")) : null,
        stock: formData.get("stock") ? Number(formData.get("stock")) : null
    };

    try {
        await updateProduct(id, data);
        editProductModal.close();
        await loadProducts();
    } catch (err) {
        editProductFeedback.textContent = err.message;
        editProductFeedback.className = "feedback feedback-error";
    }
});

async function handleDeleteProduct(id) {
    if (!confirm("¿Seguro que querés eliminar este producto?")) return;
    try {
        await deleteProduct(id);
        await loadProducts();
    } catch (err) {
        alert(err.message);
    }
}

// ==================================================================
// CLIENTES
// ==================================================================

const clientsTableBody = document.querySelector("#clients-table tbody");
const clientsEmptyState = document.querySelector("#clients-empty-state");
const createClientForm = document.querySelector("#create-client-form");
const createClientFeedback = document.querySelector("#create-client-feedback");

function renderClients(list) {
    clientsTableBody.innerHTML = "";
    clientsEmptyState.hidden = list.length !== 0;

    for (const client of list) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${client.clientId}</td>
            <td>${escapeHtml(client.name)}</td>
            <td>${escapeHtml(client.lastName)}</td>
            <td>${escapeHtml(client.dni)}</td>
            <td class="actions">
                <button class="btn btn-small btn-edit" data-id="${client.clientId}">Editar</button>
                <button class="btn btn-small btn-danger" data-id="${client.clientId}">Eliminar</button>
            </td>
        `;
        clientsTableBody.appendChild(row);
    }

    clientsTableBody.querySelectorAll(".btn-edit").forEach(btn =>
        btn.addEventListener("click", () => openEditClientModal(Number(btn.dataset.id)))
    );
    clientsTableBody.querySelectorAll(".btn-danger").forEach(btn =>
        btn.addEventListener("click", () => handleDeleteClient(Number(btn.dataset.id)))
    );
}

async function loadClients() {
    try {
        clients = await fetchAllClients();
        renderClients(clients);
        refreshClientSelectInSaleForm();
    } catch (err) {
        console.error(err);
        clientsTableBody.innerHTML = `<tr><td colspan="5">Error al conectar con la API. ¿Está corriendo el backend?</td></tr>`;
    }
}

createClientForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    createClientFeedback.textContent = "";

    const formData = new FormData(createClientForm);
    const data = {
        name: formData.get("name"),
        lastName: formData.get("lastName"),
        dni: formData.get("dni")
    };

    try {
        await createClient(data);
        createClientForm.reset();
        createClientFeedback.textContent = "Cliente creado correctamente.";
        createClientFeedback.className = "feedback feedback-success";
        await loadClients();
    } catch (err) {
        createClientFeedback.textContent = err.message;
        createClientFeedback.className = "feedback feedback-error";
    }
});

// ---------- Editar cliente ----------

const editClientModal = document.querySelector("#edit-client-modal");
const editClientForm = document.querySelector("#edit-client-form");
const editClientFeedback = document.querySelector("#edit-client-feedback");

function openEditClientModal(id) {
    const client = clients.find(c => c.clientId === id);
    if (!client) return;

    editClientForm.elements["id"].value = client.clientId;
    editClientForm.elements["name"].value = client.name;
    editClientForm.elements["lastName"].value = client.lastName;
    editClientForm.elements["dni"].value = client.dni;

    editClientFeedback.textContent = "";
    editClientModal.showModal();
}

document.querySelector("#cancel-edit-client").addEventListener("click", () => editClientModal.close());

editClientForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(editClientForm);
    const id = formData.get("id");
    const data = {
        name: formData.get("name") || null,
        lastName: formData.get("lastName") || null,
        dni: formData.get("dni") || null
    };

    try {
        await updateClient(id, data);
        editClientModal.close();
        await loadClients();
    } catch (err) {
        editClientFeedback.textContent = err.message;
        editClientFeedback.className = "feedback feedback-error";
    }
});

async function handleDeleteClient(id) {
    if (!confirm("¿Seguro que querés eliminar este cliente?")) return;
    try {
        await deleteClient(id);
        await loadClients();
    } catch (err) {
        alert(err.message);
    }
}

// ==================================================================
// VENTAS
// ==================================================================
// Nota: el backend todavía no expone edición/eliminación de ventas
// (solo crear / listar / obtener una / las 3 consultas extra), por
// eso esta sección no tiene botones de "Editar"/"Eliminar" en la
// tabla -- agregarlos cuando esos endpoints existan del lado de la API.

const salesTableBody = document.querySelector("#sales-table tbody");
const salesEmptyState = document.querySelector("#sales-empty-state");
const createSaleForm = document.querySelector("#create-sale-form");
const createSaleFeedback = document.querySelector("#create-sale-feedback");
const saleClientSelect = document.querySelector("#sale-client-select");
const saleItemsContainer = document.querySelector("#sale-items-container");

function renderSales(list) {
    salesTableBody.innerHTML = "";
    salesEmptyState.hidden = list.length !== 0;

    for (const sale of list) {
        const row = document.createElement("tr");
        const itemCount = sale.saleItems?.length ?? 0;
        row.innerHTML = `
            <td>${sale.saleId}</td>
            <td>${sale.saleDate}</td>
            <td>${money(sale.amount)}</td>
            <td>${itemCount}</td>
            <td>${sale.clientId}</td>
            <td class="actions">
                <button class="btn btn-small btn-secondary" data-id="${sale.saleId}">Ver productos</button>
            </td>
        `;
        salesTableBody.appendChild(row);
    }

    salesTableBody.querySelectorAll(".btn-secondary").forEach(btn =>
        btn.addEventListener("click", () => openSaleProductsModal(Number(btn.dataset.id)))
    );
}

async function loadSales() {
    try {
        sales = await fetchAllSales();
        renderSales(sales);
    } catch (err) {
        console.error(err);
        salesTableBody.innerHTML = `<tr><td colspan="6">Error al conectar con la API. ¿Está corriendo el backend?</td></tr>`;
    }
}

// ---------- Formulario de creación de venta ----------

function refreshClientSelectInSaleForm() {
    saleClientSelect.innerHTML = '<option value="">Seleccionar cliente...</option>' +
        clients.map(c => `<option value="${c.clientId}">${escapeHtml(c.name)} ${escapeHtml(c.lastName)} (DNI ${escapeHtml(c.dni)})</option>`).join("");
}

function productOptionsHtml() {
    return '<option value="">Seleccionar producto...</option>' +
        products.map(p => `<option value="${p.productCode}" data-price="${p.price}">${escapeHtml(p.name)} - ${escapeHtml(p.brand)} (stock: ${p.stock})</option>`).join("");
}

function refreshProductSelectsInSaleForm() {
    saleItemsContainer.querySelectorAll(".sale-item-line select.product-select").forEach(select => {
        const current = select.value;
        select.innerHTML = productOptionsHtml();
        select.value = current;
    });
}

function recalculateLineSubtotal(line) {
    const quantity = Number(line.querySelector(".quantity-input").value) || 0;
    const unitPrice = Number(line.querySelector(".unit-price-input").value) || 0;
    line.querySelector(".subtotal-output").value = (quantity * unitPrice).toFixed(2);
}

function addSaleItemLine() {
    const line = document.createElement("div");
    line.className = "sale-item-line";
    line.innerHTML = `
        <select class="product-select">${productOptionsHtml()}</select>
        <input type="number" class="quantity-input" placeholder="Cantidad" min="0.01" step="0.01">
        <input type="number" class="unit-price-input" placeholder="Precio unit." min="0" step="0.01">
        <input type="text" class="subtotal-output" placeholder="Subtotal" readonly>
        <button type="button" class="btn btn-small btn-danger remove-line">✕</button>
    `;

    line.querySelector(".product-select").addEventListener("change", (event) => {
        const selected = event.target.selectedOptions[0];
        const price = selected?.dataset.price;
        if (price) {
            line.querySelector(".unit-price-input").value = price;
        }
        recalculateLineSubtotal(line);
    });
    line.querySelector(".quantity-input").addEventListener("input", () => recalculateLineSubtotal(line));
    line.querySelector(".unit-price-input").addEventListener("input", () => recalculateLineSubtotal(line));
    line.querySelector(".remove-line").addEventListener("click", () => line.remove());

    saleItemsContainer.appendChild(line);
}

document.querySelector("#add-sale-item").addEventListener("click", addSaleItemLine);

createSaleForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    createSaleFeedback.textContent = "";

    const clientId = Number(saleClientSelect.value);
    if (!clientId) {
        createSaleFeedback.textContent = "Seleccioná un cliente.";
        createSaleFeedback.className = "feedback feedback-error";
        return;
    }

    const saleItems = [];
    for (const line of saleItemsContainer.querySelectorAll(".sale-item-line")) {
        const productCode = Number(line.querySelector(".product-select").value);
        const quantity = Number(line.querySelector(".quantity-input").value);
        const unitPrice = Number(line.querySelector(".unit-price-input").value);
        if (!productCode || !quantity || !unitPrice) continue;
        saleItems.push({
            productCode,
            quantity,
            unitPrice,
            subtotal: Number((quantity * unitPrice).toFixed(2))
        });
    }

    if (saleItems.length === 0) {
        createSaleFeedback.textContent = "Agregá al menos un producto a la venta.";
        createSaleFeedback.className = "feedback feedback-error";
        return;
    }

    try {
        await createSale({ clientId, saleItems });
        saleItemsContainer.innerHTML = "";
        addSaleItemLine();
        saleClientSelect.value = "";
        createSaleFeedback.textContent = "Venta registrada correctamente.";
        createSaleFeedback.className = "feedback feedback-success";
        await Promise.all([loadSales(), loadProducts()]); // el stock de los productos cambió
    } catch (err) {
        createSaleFeedback.textContent = err.message;
        createSaleFeedback.className = "feedback feedback-error";
    }
});

// ---------- Ver productos de una venta ----------

const saleProductsModal = document.querySelector("#sale-products-modal");
const saleProductsList = document.querySelector("#sale-products-list");

async function openSaleProductsModal(saleId) {
    saleProductsList.innerHTML = "<li>Cargando...</li>";
    saleProductsModal.showModal();
    try {
        const saleProducts = await fetchSaleProducts(saleId);
        saleProductsList.innerHTML = saleProducts.length
            ? saleProducts.map(p => `<li>${escapeHtml(p.name)} — ${escapeHtml(p.brand)} (${money(p.price)})</li>`).join("")
            : "<li>Esta venta no tiene productos.</li>";
    } catch (err) {
        saleProductsList.innerHTML = `<li>${escapeHtml(err.message)}</li>`;
    }
}

document.querySelector("#close-sale-products").addEventListener("click", () => saleProductsModal.close());

// ==================================================================
// REPORTES
// ==================================================================

document.querySelector("#query-amount-by-date").addEventListener("click", async () => {
    const dateInput = document.querySelector("#report-date");
    const output = document.querySelector("#amount-by-date-output");
    if (!dateInput.value) {
        output.textContent = "Elegí una fecha primero.";
        return;
    }
    try {
        const total = await fetchSalesAmountByDate(dateInput.value);
        output.textContent = `Total vendido el ${dateInput.value}: ${money(total ?? 0)}`;
    } catch (err) {
        output.textContent = err.message;
    }
});

document.querySelector("#query-highest-sale").addEventListener("click", async () => {
    const output = document.querySelector("#highest-sale-output");
    try {
        const highest = await fetchHighestSale();
        if (!highest) {
            output.textContent = "Todavía no hay ventas registradas.";
            return;
        }
        output.innerHTML = `
            Venta #${highest.saleId} — ${money(highest.total)}<br>
            Cantidad de productos: ${highest.productQuantity}<br>
            Cliente: ${escapeHtml(highest.clientName)} ${escapeHtml(highest.clientLastName)}
        `;
    } catch (err) {
        output.textContent = err.message;
    }
});

// ---------- Arranque ----------
// Todas las listas se cargan solas al abrir la página (sin necesidad
// de hacer un POST primero).

addSaleItemLine();
loadProducts();
loadClients();
loadSales();
