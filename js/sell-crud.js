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


// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const savedData = localStorage.getItem('salesData');
    if (savedData) {
        originalData = JSON.parse(savedData);
    } else {
        originalData = demoData;
        localStorage.setItem('salesData', JSON.stringify(originalData));
    }
    
    // Inicializar la tabla
    getData();
});

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
                    <td>${sale.code}</td>
                    <td>${sale.clientCode}</td>
                    <td>${sale.clientName}</td>
                    <td>${sale.date}</td>
                    <td>${sale.paymentMethod}</td>
                    <td>${sale.product}</td>
                    <td>${sale.netAmount}</td>
                    <td>${sale.ivaAmount}</td>
                    <td>${sale.totalAmount}</td>
                    <td>
                        <button class="editBtn" data-id="${sale.id}">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button class="deleteBtn" data-id="${sale.id}">
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
    editId = parseInt(id);
    const saleToEdit = originalData.find(sale => sale.id === parseInt(id));

    if (saleToEdit) {
        saleCode.value = saleToEdit.code;
        saleClientCode.value = saleToEdit.clientCode;
        saleClientName.value = saleToEdit.clientName;
        saleDate.value = saleToEdit.date;
        salePaymentMethod.value = saleToEdit.paymentMethod;
        saleProduct.value = saleToEdit.product;
        saleNetAmount.value = saleToEdit.netAmount;
        saleIvaAmount.value = saleToEdit.ivaAmount;
        saleTotalAmount.value = saleToEdit.totalAmount;

        modalTitle.textContent = 'Editar Venta';
        submitBtn.textContent = 'Actualizar';
        darkBg.classList.add('active');
        popup.classList.add('active');
    }
}

// Función para eliminar información
function deleteInfo(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
        const index = originalData.findIndex(sale => sale.id === parseInt(id));
        if (index !== -1) {
            originalData.splice(index, 1);
            localStorage.setItem('salesData', JSON.stringify(originalData));

            // Ajustar paginación si es necesario
            const totalPages = Math.ceil(originalData.length / itemPerPage);
            if (currentIndex > totalPages && totalPages > 0) {
                currentIndex = totalPages;
            } else if (totalPages === 0) {
                currentIndex = 1;
            }

            getData();
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
    modalTitle.textContent = 'Agregar Venta';
    submitBtn.textContent = 'Guardar';
    darkBg.classList.add('active');
    popup.classList.add('active');
});

// Cerrar formulario
closeBtn.addEventListener('click', () => {
    darkBg.classList.remove('active');
    popup.classList.remove('active');
});

// Envío del formulario
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newSale = {
        code: saleCode.value,
        clientCode: saleClientCode.value,
        clientName: saleClientName.value,
        date: saleDate.value,
        paymentMethod: salePaymentMethod.value,
        product: saleProduct.value,
        netAmount: saleNetAmount.value,
        ivaAmount: saleIvaAmount.value,
        totalAmount: saleTotalAmount.value,
    };

    if (isEdit) {
        // Actualizar venta existente
        const index = originalData.findIndex(sale => sale.id === editId);
        if (index !== -1) {
            newSale.id = editId;
            originalData[index] = newSale;
        }
    } else {
        // Agregar nueva venta
        newSale.id = originalData.length > 0 ? Math.max(...originalData.map(sale => sale.id)) + 1 : 1;
        originalData.unshift(newSale);
    }

    // Guardar en localStorage y actualizar tabla
    localStorage.setItem('salesData', JSON.stringify(originalData));
    darkBg.classList.remove('active');
    popup.classList.remove('active');
    getData();
});

// Cambiar tamaño de tabla
tableSize.addEventListener('change', () => {
    itemPerPage = parseInt(tableSize.value);
    currentIndex = 1;
    getData();
});

// Búsqueda
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (searchTerm.trim() === '') {
        // Si la búsqueda está vacía, restaurar datos originales
        originalData = localStorage.getItem('salesData') ? JSON.parse(localStorage.getItem('salesData')) : [];
    } else {
        // Filtrar datos según término de búsqueda
        const allData = localStorage.getItem('salesData') ? JSON.parse(localStorage.getItem('salesData')) : [];
        originalData = allData.filter(sale => {
            return (
                sale.code.toLowerCase().includes(searchTerm) ||
                sale.clientCode.toLowerCase().includes(searchTerm) ||
                sale.clientName.toLowerCase().includes(searchTerm) ||
                sale.date.includes(searchTerm) ||
                sale.paymentMethod.toLowerCase().includes(searchTerm) ||
                sale.product.toLowerCase().includes(searchTerm) ||
                sale.netAmount.toString().includes(searchTerm) ||
                sale.ivaAmount.toString().includes(searchTerm) ||
                sale.totalAmount.toString().includes(searchTerm)
            );
        });
    }
    
    currentIndex = 1;
    getData();
});