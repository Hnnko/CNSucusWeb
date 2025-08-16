// Variables del DOM
const tableSize = document.getElementById('table_size');
const searchInput = document.getElementById('search');
const userInfo = document.querySelector('.userInfo');
const showEntries = document.querySelector('.showEntries');
const pagination = document.querySelector('.pagination');
const addMemberBtn = document.querySelector('.addMemberBtn button');
const darkBg = document.querySelector('.dark_bg');
const closeBtn = document.querySelector('.closeBtn');
const popup = document.querySelector('.popup');
const form = document.querySelector('form');
const submitBtn = document.querySelector('.submitBtn');
const modalTitle = document.querySelector('.modalTitle');

// Campos del formulario
const saleCode = document.getElementById('saleCode');
const saleClientCode = document.getElementById('saleClientCode');
const saleClientName = document.getElementById('saleClientName');
const saleDate = document.getElementById('saleDate');
const salePaymentMethod = document.getElementById('salePaymentMethod');
const saleProduct = document.getElementById('saleProduct');
const saleNetAmount = document.getElementById('saleNetAmount');
const saleIvaAmount = document.getElementById('saleIvaAmount');
const saleTotalAmount = document.getElementById('saleTotalAmount');

// Variables para la gestión de datos
let originalData = [];
let currentIndex = 1;
let itemPerPage = 10;
let paginationLimit = 5;
let isEdit = false;
let editId = null;
const IVA_RATE = 0.19; // 19% IVA


// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadSalesData();
    loadProducts();
});

// Función para cargar datos de ventas
function loadSalesData() {
    fetch('/api/sells')
        .then(response => response.json())
        .then(data => {
            originalData = data;
            // Para cada venta, cargar sus items
            const promises = originalData.map(sale => 
                fetch(`/api/sellItems/${sale.codigo_venta}`)
                    .then(response => response.json())
                    .then(items => {
                        // Formatear productos para mostrar
                        sale.product = items.map(item => 
                            `${item.producto} (${item.cantidad})`
                        ).join(', ');
                        return sale;
                    })
                    .catch(error => {
                        console.error(`Error al cargar items de venta ${sale.codigo_venta}:`, error);
                        sale.product = 'Error al cargar productos';
                        return sale;
                    })
            );
            
            return Promise.all(promises);
        })
        .then(() => {
            // Guardar copia completa de los datos para el filtrado
            allSalesData = [...originalData];
            getData();
        })
        .catch(error => {
            console.error('Error al cargar ventas:', error);
            // En caso de error, inicializar arrays vacíos
            originalData = [];
            allSalesData = [];
            getData();
        });
}

// Función para mostrar los datos en la tabla
function getData() {
    userInfo.innerHTML = '';
    const startIndex = (currentIndex - 1) * itemPerPage;
    const endIndex = startIndex + itemPerPage;
    const paginatedItems = originalData.slice(startIndex, endIndex);

    if (paginatedItems.length > 0) {
        for (let i = 0; i < paginatedItems.length; i++) {
            const sale = paginatedItems[i];
            userInfo.innerHTML += `
                <tr>
                    <td>${startIndex + i + 1}</td>
                    <td>${sale.codigo_venta}</td>
                    <td>${sale.codigo_cliente}</td>
                    <td>${sale.cliente}</td>
                    <td>${sale.fecha_venta}</td>
                    <td>${sale.metodo_pago}</td>
                    <td>${sale.product}</td>
                    <td>${sale.monto_neto}</td>
                    <td>${sale.iva}</td>
                    <td>${sale.monto_total}</td>
                    <td>
                        <button class="editBtn" data-id="${sale.codigo_venta}">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button class="deleteBtn" data-id="${sale.codigo_venta}">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `;
        }
    } else {
        userInfo.innerHTML = `
            <tr>
                <td colspan="11" class="no-data" align="center">No hay datos disponibles en la tabla</td>
            </tr>
        `;
    }

    // Actualizar información de entradas mostradas
    showEntries.textContent = originalData.length > 0 ?
        `Mostrando ${startIndex + 1} a ${Math.min(endIndex, originalData.length)} de ${originalData.length} entradas` :
        'Mostrando 0 a 0 de 0 entradas';

    // Configurar paginación
    setupPagination();

    // Configurar botones de edición y eliminación
    const editBtns = document.querySelectorAll('.editBtn');
    const deleteBtns = document.querySelectorAll('.deleteBtn');

    editBtns.forEach(btn => {
        btn.addEventListener('click', () => editInfo(btn.dataset.id));
    });

    deleteBtns.forEach(btn => {
        btn.addEventListener('click', () => deleteInfo(btn.dataset.id));
    });
}

// Función para editar información
function editInfo(id) {
    isEdit = true;
    editId = id;
    const saleToEdit = originalData.find(sale => sale.codigo_venta === id);

    if (saleToEdit) {
        saleCode.value = saleToEdit.codigo_venta;
        saleClientCode.value = saleToEdit.codigo_cliente;
        saleClientName.value = saleToEdit.cliente;
        saleDate.value = saleToEdit.fecha_venta;
        salePaymentMethod.value = saleToEdit.metodo_pago;
        
        // Cargar productos de la venta al carrito
        loadCartFromSale(saleToEdit.codigo_venta);

        modalTitle.textContent = 'Editar Venta';
        submitBtn.textContent = 'Actualizar';
        darkBg.classList.add('active');
        popup.classList.add('active');
    }
}

// Función para cargar productos de una venta al carrito
function loadCartFromSale(saleCode) {
    fetch(`/api/sellItems/${saleCode}`)
        .then(response => response.json())
        .then(items => {
            cart = [];
            items.forEach(item => {
                cart.push({
                    codigo: item.codigo_producto,
                    nombre: item.producto,
                    precio: item.monto_total / item.cantidad, // Calcular precio unitario
                    quantity: item.cantidad
                });
            });
            updateCartDisplay();
            updateHiddenField();
            calculateTotals();
        })
        .catch(error => {
            console.error('Error al cargar items de venta:', error);
        });
}

// Función para eliminar información
function deleteInfo(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
        const saleToDelete = originalData.find(sale => sale.codigo_venta === id);
        if (saleToDelete) {
            fetch(`/api/sells/${saleToDelete.codigo_venta}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    loadSalesData();
                } else {
                    throw new Error('Error al eliminar venta');
                }
            })
            .catch(error => {
                console.error('Error al eliminar venta:', error);
                alert('Error al eliminar la venta');
            });
        }
    }
}

// Configuración de paginación
function setupPagination() {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(originalData.length / itemPerPage);

    if (totalPages > 0) {
        // Botón anterior
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Anterior';
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 1) {
                currentIndex--;
                getData();
            }
        });
        pagination.appendChild(prevBtn);

        // Botones de página
        const startPage = Math.max(1, currentIndex - Math.floor(paginationLimit / 2));
        const endPage = Math.min(totalPages, startPage + paginationLimit - 1);

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.classList.toggle('active', i === currentIndex);
            pageBtn.addEventListener('click', () => {
                currentIndex = i;
                getData();
            });
            pagination.appendChild(pageBtn);
        }

        // Botón siguiente
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Siguiente';
        nextBtn.addEventListener('click', () => {
            if (currentIndex < totalPages) {
                currentIndex++;
                getData();
            }
        });
        pagination.appendChild(nextBtn);

        // Deshabilitar botones si es necesario
        prevBtn.disabled = currentIndex === 1;
        nextBtn.disabled = currentIndex === totalPages;
    }
}

// Event Listeners

// Abrir formulario para agregar nueva venta
addMemberBtn.addEventListener('click', () => {
    isEdit = false;
    editId = null;
    form.reset();
    clearCart();
    modalTitle.textContent = 'Agregar Venta';
    submitBtn.textContent = 'Guardar';
    darkBg.classList.add('active');
    popup.classList.add('active');
});

// Cerrar formulario
closeBtn.addEventListener('click', () => {
    closeModal();
});

// Event listener para agregar producto al carrito
document.addEventListener('DOMContentLoaded', () => {
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', addToCart);
    }
});

// Envío del formulario
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
        alert('Debe agregar al menos un producto al carrito');
        return;
    }
    
    const formData = {
        codigo_venta: saleCode.value,
        codigo_cliente: saleClientCode.value,
        cliente: saleClientName.value,
        fecha_venta: saleDate.value,
        metodo_pago: salePaymentMethod.value,
        monto_neto: parseFloat(saleNetAmount.value),
        iva: parseFloat(saleIvaAmount.value),
        monto_total: parseFloat(saleTotalAmount.value)
    };
    
    if (isEdit) {
        // Actualizar venta existente
        fetch(`/api/sells/${editId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(() => {
            // Actualizar items de la venta
            return updateSaleItems(editId);
        })
        .then(() => {
            loadSalesData();
            closeModal();
        })
        .catch(error => {
            console.error('Error al actualizar venta:', error);
            alert('Error al actualizar la venta');
        });
    } else {
        // Crear nueva venta
        fetch('/api/sells', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            // Crear items de la venta
            return createSaleItems(data.codigo_venta || formData.codigo_venta);
        })
        .then(() => {
            loadSalesData();
            closeModal();
        })
        .catch(error => {
            console.error('Error al crear venta:', error);
            alert('Error al crear la venta');
        });
    }
});

// Función para crear items de venta
function createSaleItems(saleCode) {
    const promises = cart.map((item, index) => {
        const subtotal = (parseFloat(item.precio) || 0) * item.quantity;
        return fetch('/api/sellItems', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                codigo_item: `${saleCode}-${index + 1}`,
                codigo_venta: saleCode,
                codigo_producto: item.codigo,
                producto: item.nombre,
                cantidad: item.quantity,
                monto_total: subtotal
            })
        });
    });
    
    return Promise.all(promises);
}

// Función para actualizar items de venta
function updateSaleItems(saleCode) {
    // Primero obtener items existentes
    return fetch(`/api/sellItems/${saleCode}`)
        .then(response => response.json())
        .then(existingItems => {
            // Eliminar items existentes uno por uno
            const deletePromises = existingItems.map(item => 
                fetch(`/api/sellItems/${item.codigo_item}`, {
                    method: 'DELETE'
                })
            );
            return Promise.all(deletePromises);
        })
        .then(() => {
            // Luego crear los nuevos items
            return createSaleItems(saleCode);
        });
}

// Función para cerrar modal
function closeModal() {
    darkBg.classList.remove('active');
    popup.classList.remove('active');
    form.reset();
    clearCart();
    isEdit = false;
    editId = null;
}

// Cambiar tamaño de tabla
tableSize.addEventListener('change', () => {
    itemPerPage = parseInt(tableSize.value);
    currentIndex = 1;
    getData();
});

// Variables para el carrito de productos
let cart = [];
let allProducts = [];

// Función para cargar productos en el dropdown
function loadProducts() {
    fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            allProducts = data;
            const productSelect = document.getElementById('productSelect');
            productSelect.innerHTML = '<option value="">Seleccionar producto...</option>';
            
            data.forEach(product => {
                const option = document.createElement('option');
                option.value = JSON.stringify(product);
                option.textContent = `${product.codigo} - ${product.nombre}`;
                productSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar productos:', error);
        });
}

// Función para agregar producto al carrito
function addToCart() {
    const productSelect = document.getElementById('productSelect');
    const quantityInput = document.getElementById('productQuantity');
    
    if (!productSelect.value) {
        alert('Por favor selecciona un producto');
        return;
    }
    
    const product = JSON.parse(productSelect.value);
    const quantity = parseInt(quantityInput.value);
    
    if (quantity <= 0) {
        alert('La cantidad debe ser mayor a 0');
        return;
    }
    
    // Verificar si el producto ya está en el carrito
    const existingIndex = cart.findIndex(item => item.codigo === product.codigo);
    
    if (existingIndex !== -1) {
        // Si ya existe, actualizar cantidad
        cart[existingIndex].quantity += quantity;
    } else {
        // Si no existe, agregar nuevo producto
        cart.push({
            codigo: product.codigo,
            nombre: product.nombre,
            precio: parseFloat(product.costo) || 0,
            quantity: quantity
        });
    }
    
    // Limpiar selección
    productSelect.value = '';
    quantityInput.value = 1;
    
    // Actualizar vista del carrito y cálculos
    updateCartDisplay();
    updateHiddenField();
    calculateTotals();
}

// Función para actualizar la visualización del carrito
function updateCartDisplay() {
    const cartBody = document.getElementById('cartBody');
    const emptyRow = document.getElementById('emptyCartRow');
    
    if (cart.length === 0) {
        emptyRow.style.display = 'table-row';
        // Limpiar otras filas
        const rows = cartBody.querySelectorAll('tr:not(#emptyCartRow)');
        rows.forEach(row => row.remove());
        return;
    }
    
    emptyRow.style.display = 'none';
    
    // Limpiar filas existentes
    const rows = cartBody.querySelectorAll('tr:not(#emptyCartRow)');
    rows.forEach(row => row.remove());
    
    // Agregar filas del carrito
    cart.forEach((item, index) => {
        const precio = parseFloat(item.precio) || 0;
        const subtotal = (precio * item.quantity).toFixed(2);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 8px; border: 1px solid #ddd;">${item.codigo}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.nombre}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                <input type="number" value="${item.quantity}" min="1" 
                       onchange="updateQuantity(${index}, this.value)"
                       style="width: 60px; text-align: center; border: 1px solid #ddd; border-radius: 3px;">
            </td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${precio.toLocaleString('es-CL', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${parseFloat(subtotal).toLocaleString('es-CL', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                <button onclick="removeFromCart(${index})" 
                        style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </td>
        `;
        cartBody.appendChild(row);
    });
}

// Función para actualizar cantidad
function updateQuantity(index, newQuantity) {
    const quantity = parseInt(newQuantity);
    if (quantity <= 0) {
        removeFromCart(index);
        return;
    }
    
    cart[index].quantity = quantity;
    updateCartDisplay();
    updateHiddenField();
    calculateTotals();
}

// Función para eliminar producto del carrito
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
    updateHiddenField();
    calculateTotals();
}

// Función para limpiar el carrito
function clearCart() {
    cart = [];
    updateCartDisplay();
    updateHiddenField();
    calculateTotals();
}

// Función para calcular totales
function calculateTotals() {
    const netAmount = cart.reduce((total, item) => {
        const precio = parseFloat(item.precio) || 0;
        return total + (precio * item.quantity);
    }, 0);
    const ivaAmount = netAmount * IVA_RATE;
    const totalAmount = netAmount + ivaAmount;
    
    document.getElementById('saleNetAmount').value = netAmount.toFixed(2);
    document.getElementById('saleIvaAmount').value = ivaAmount.toFixed(2);
    document.getElementById('saleTotalAmount').value = totalAmount.toFixed(2);
}

// Función para actualizar campo oculto con datos del carrito
function updateHiddenField() {
    const hiddenField = document.getElementById('saleProducts');
    if (hiddenField) {
        hiddenField.value = JSON.stringify(cart);
    }
}

// Variables para el filtrado
let allSalesData = [];

// Búsqueda
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        // Si la búsqueda está vacía, restaurar datos originales
        originalData = [...allSalesData];
    } else {
        // Filtrar datos según término de búsqueda
        originalData = allSalesData.filter(sale => {
            return (
                sale.codigo_venta.toLowerCase().includes(searchTerm) ||
                sale.codigo_cliente.toLowerCase().includes(searchTerm) ||
                sale.cliente.toLowerCase().includes(searchTerm) ||
                sale.fecha_venta.includes(searchTerm) ||
                sale.metodo_pago.toLowerCase().includes(searchTerm) ||
                (sale.product && sale.product.toLowerCase().includes(searchTerm)) ||
                sale.monto_neto.toString().includes(searchTerm) ||
                sale.iva.toString().includes(searchTerm) ||
                sale.monto_total.toString().includes(searchTerm)
            );
        });
    }
    
    currentIndex = 1;
    getData();
});