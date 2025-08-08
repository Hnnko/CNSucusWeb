// Variables para elementos del DOM
const newProductBtn = document.querySelector('.addMemberBtn button');
const darkBg = document.querySelector('.dark_bg');
const popupForm = document.querySelector('.popup');
const crossBtn = document.querySelector('.closeBtn');
const submitBtn = document.querySelector('.submitBtn');
const modalTitle = document.querySelector('.modalTitle');
const form = document.querySelector('form');
const formInputFields = document.querySelectorAll('form input');
const productCode = document.getElementById('productCode');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productStock = document.getElementById('productStock');
const entries = document.querySelector('.showEntries');
const tabSize = document.getElementById('table_size');
const userInfo = document.querySelector('.userInfo');
const table = document.querySelector('table');
const filterData = document.getElementById('search');

// Inicializar arrays vacíos
let originalData = [];
let getData = [];

// Variables para paginación
let isEdit = false, editId;
let arrayLength = 0;
let tableSize = 10;
let startIndex = 1;
let endIndex = 0;
let currentIndex = 1;
let maxIndex = 0;

// Función para cargar productos desde la API
async function loadProductsFromAPI() {
    try {
        const response = await fetch('/api/products');
        if (response.ok) {
            const products = await response.json();
            originalData = products;
            getData = [...originalData];
            preLoadCalculations();
            showInfo();
            highlightIndexBtn();
            displayIndexBtn();
        } else {
            console.error('Error al cargar productos:', response.statusText);
        }
    } catch (error) {
        console.error('Error al conectar con la API:', error);
    }
}

// Cargar datos iniciales
loadProductsFromAPI();

// Event Listeners
newProductBtn.addEventListener('click', () => {
    isEdit = false;
    submitBtn.innerHTML = "Guardar";
    modalTitle.innerHTML = "Agregar Producto";
    form.reset();
    darkBg.classList.add('active');
    popupForm.classList.add('active');
});

crossBtn.addEventListener('click', () => {
    darkBg.classList.remove('active');
    popupForm.classList.remove('active');
    form.reset();
});

// Función para calcular la paginación
function preLoadCalculations() {
    array = getData;
    arrayLength = array.length;
    maxIndex = arrayLength / tableSize;

    if ((arrayLength % tableSize) > 0) {
        maxIndex++;
    }
}

// Función para mostrar botones de paginación
function displayIndexBtn() {
    preLoadCalculations();

    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = "";
    pagination.innerHTML = '<button onclick="prev()" class="prev">Anterior</button>';

    for (let i = 1; i <= maxIndex; i++) {
        pagination.innerHTML += '<button onclick="paginationBtn(' + i + ')" index="' + i + '">' + i + '</button>';
    }

    pagination.innerHTML += '<button onclick="next()" class="next">Siguiente</button>';
    highlightIndexBtn();
}

// Función para resaltar el botón de paginación actual
function highlightIndexBtn() {
    startIndex = ((currentIndex - 1) * tableSize) + 1;
    endIndex = (startIndex + tableSize) - 1;

    if (endIndex > arrayLength) {
        endIndex = arrayLength;
    }

    if (maxIndex >= 2) {
        var nextBtn = document.querySelector(".next");
        nextBtn.classList.add("act");
    }

    entries.textContent = `Mostrando ${startIndex} a ${endIndex} de ${arrayLength} entradas`;

    var paginationBtns = document.querySelectorAll('.pagination button');
    paginationBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('index') === currentIndex.toString()) {
            btn.classList.add('active');
        }
    });

    showInfo();
}

// Función para mostrar información en la tabla
function showInfo() {
    document.querySelectorAll(".productDetails").forEach(info => info.remove());

    var tab_start = startIndex - 1;
    var tab_end = endIndex;

    if (getData.length > 0) {
        for (var i = tab_start; i < tab_end; i++) {
            var product = getData[i];

            if (product) {
                let createElement = `<tr class="productDetails">
                <td>${i + 1}</td>
                <td>${product.codigo}</td>
                <td>${product.nombre}</td>
                <td>$${product.costo}</td>
                <td>${product.stock}</td>
                <td>
                    <button onclick="readInfo('${product.codigo}', '${product.nombre}', '${product.costo}', '${product.stock}')"><i class="fa-regular fa-eye"></i></button>
                    <button onclick="editInfo('${product.codigo}', '${product.codigo}', '${product.nombre}', '${product.costo}', '${product.stock}')"><i class="fa-regular fa-pen-to-square"></i></button>
                    <button onclick="deleteInfo('${product.codigo}')"><i class="fa-regular fa-trash-can"></i></button>
                </td>
            </tr>`;

                userInfo.innerHTML += createElement;
            }
        }
    } else {
        userInfo.innerHTML = `<tr class="productDetails"><td class="empty" colspan="7" align="center">No hay datos disponibles en la tabla</td></tr>`;
    }
}

// Función para ver detalles de un producto
function readInfo(codigo, nombre, costo, stock) {
    productCode.value = codigo;
    productName.value = nombre;
    productPrice.value = costo;
    productStock.value = stock;

    darkBg.classList.add('active');
    popupForm.classList.add('active');
    modalTitle.innerHTML = "Detalles del Producto";
    submitBtn.style.display = "none";
    
    formInputFields.forEach(input => {
        input.disabled = true;
    });
}

// Función para editar un producto
function editInfo(id, codigo, nombre, costo, stock) {
    isEdit = true;
    editId = codigo; // Usar código como identificador

    productCode.value = codigo;
    productName.value = nombre;
    productPrice.value = costo;
    productStock.value = stock;

    darkBg.classList.add('active');
    popupForm.classList.add('active');
    modalTitle.innerHTML = "Editar Producto";
    submitBtn.innerHTML = "Actualizar";
    submitBtn.style.display = "block";
    
    formInputFields.forEach(input => {
        input.disabled = false;
    });
}

// Función para eliminar un producto
async function deleteInfo(codigo) {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
        try {
            const response = await fetch(`/api/products/${codigo}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Recargar datos desde la API
                await loadProductsFromAPI();
                
                // Recalcular paginación
                preLoadCalculations();

                if (getData.length === 0) {
                    currentIndex = 1;
                    startIndex = 1;
                    endIndex = 0;
                } else if (currentIndex > maxIndex) {
                    currentIndex = maxIndex;
                }

                showInfo();
                highlightIndexBtn();
                displayIndexBtn();

                var nextBtn = document.querySelector('.next');
                var prevBtn = document.querySelector('.prev');

                if (Math.floor(maxIndex) > currentIndex) {
                    nextBtn.classList.add("act");
                } else {
                    nextBtn.classList.remove("act");
                }

                if (currentIndex > 1) {
                    prevBtn.classList.add('act');
                }
            } else {
                alert('Error al eliminar el producto');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el producto');
        }
    }
}

// Event listener para el formulario
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const productData = {
        codigo: productCode.value,
        nombre: productName.value,
        costo: parseFloat(productPrice.value),
        stock: parseInt(productStock.value)
    };

    try {
        let response;
        if (!isEdit) {
            // Crear nuevo producto
            response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        } else {
            // Actualizar producto existente
            response = await fetch(`/api/products/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        }

        if (response.ok) {
            // Recargar datos desde la API
            await loadProductsFromAPI();
            
            // Resetear formulario
            submitBtn.innerHTML = "Guardar";
            modalTitle.innerHTML = "Agregar Producto";
            submitBtn.style.display = "block";
            isEdit = false;
            editId = null;

            darkBg.classList.remove('active');
            popupForm.classList.remove('active');
            form.reset();

            // Actualizar UI
            preLoadCalculations();
            highlightIndexBtn();
            displayIndexBtn();
            showInfo();

            var nextBtn = document.querySelector(".next");
            var prevBtn = document.querySelector(".prev");
            
            if (Math.floor(maxIndex) > currentIndex) {
                nextBtn.classList.add("act");
            } else {
                nextBtn.classList.remove("act");
            }

            if (currentIndex > 1) {
                prevBtn.classList.add("act");
            }
        } else {
            alert('Error al guardar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el producto');
    }
});

// Función para ir a la siguiente página
function next() {
    var prevBtn = document.querySelector('.prev');
    var nextBtn = document.querySelector('.next');

    if (currentIndex <= maxIndex - 1) {
        currentIndex++;
        prevBtn.classList.add("act");
        highlightIndexBtn();
    }

    if (currentIndex > maxIndex - 1) {
        nextBtn.classList.remove("act");
    }
}

// Función para ir a la página anterior
function prev() {
    var prevBtn = document.querySelector('.prev');

    if (currentIndex > 1) {
        currentIndex--;
        prevBtn.classList.add("act");
        highlightIndexBtn();
    }

    if (currentIndex < 2) {
        prevBtn.classList.remove("act");
    }
}

// Función para ir a una página específica
function paginationBtn(i) {
    currentIndex = i;

    var prevBtn = document.querySelector('.prev');
    var nextBtn = document.querySelector('.next');

    highlightIndexBtn();

    if (currentIndex > maxIndex - 1) {
        nextBtn.classList.remove('act');
    } else {
        nextBtn.classList.add("act");
    }

    if (currentIndex > 1) {
        prevBtn.classList.add("act");
    }

    if (currentIndex < 2) {
        prevBtn.classList.remove("act");
    }
}

// Event listener para cambiar el tamaño de la tabla
tabSize.addEventListener('change', () => {
    var selectedValue = parseInt(tabSize.value);
    tableSize = selectedValue;
    currentIndex = 1;
    startIndex = 1;
    displayIndexBtn();
});

// Event listener para filtrar datos
filterData.addEventListener("input", () => {
    const searchTerm = filterData.value.toLowerCase().trim();

    if (searchTerm !== "") {
        const filteredData = originalData.filter((item) => {
            const codigo = item.codigo.toString().toLowerCase();
            const nombre = item.nombre.toLowerCase();
            const costo = item.costo.toString().toLowerCase();
            const stock = item.stock.toString().toLowerCase();

            return (
                codigo.includes(searchTerm) ||
                nombre.includes(searchTerm) ||
                costo.includes(searchTerm) ||
                stock.includes(searchTerm)
            );
        });

        // Actualizar los datos actuales con los datos filtrados
        getData = filteredData;
    } else {
        getData = [...originalData];
    }

    currentIndex = 1;
    startIndex = 1;
    preLoadCalculations();
    showInfo();
    highlightIndexBtn();
    displayIndexBtn();
});

// Inicializar la paginación
displayIndexBtn();