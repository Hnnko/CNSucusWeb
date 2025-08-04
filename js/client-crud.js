// Variables para elementos del DOM
const newClientBtn = document.querySelector('.addMemberBtn button');
const darkBg = document.querySelector('.dark_bg');
const popupForm = document.querySelector('.popup');
const crossBtn = document.querySelector('.closeBtn');
const submitBtn = document.querySelector('.submitBtn');
const modalTitle = document.querySelector('.modalTitle');
const form = document.querySelector('form');
const formInputFields = document.querySelectorAll('form input');
const clientRut = document.getElementById('clientRut');
const clientName = document.getElementById('clientName');
const clientEmail = document.getElementById('clientEmail');
const clientPhone = document.getElementById('clientPhone');
const entries = document.querySelector('.showEntries');
const tabSize = document.getElementById('table_size');
const userInfo = document.querySelector('.userInfo');
const table = document.querySelector('table');
const filterData = document.getElementById('search');

// Obtener datos del localStorage o inicializar un array vacío
let originalData = localStorage.getItem('clientData') ? JSON.parse(localStorage.getItem('clientData')) : [];
let getData = [...originalData];

// Variables para paginación
let isEdit = false, editId;
let arrayLength = 0;
let tableSize = 10;
let startIndex = 1;
let endIndex = 0;
let currentIndex = 1;
let maxIndex = 0;

// Mostrar información inicial
showInfo();

// Event Listeners
newClientBtn.addEventListener('click', () => {
    isEdit = false;
    submitBtn.innerHTML = "Guardar";
    modalTitle.innerHTML = "Agregar Cliente";
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
    document.querySelectorAll(".clientDetails").forEach(info => info.remove());

    var tab_start = startIndex - 1;
    var tab_end = endIndex;

    if (getData.length > 0) {
        for (var i = tab_start; i < tab_end; i++) {
            var client = getData[i];

            if (client) {
                let createElement = `<tr class="clientDetails">
                <td>${i + 1}</td>
                <td>${client.rut}</td>
                <td>${client.name}</td>
                <td>${client.email}</td>
                <td>${client.phone}</td>
                <td>
                    <button onclick="readInfo('${client.rut}', '${client.name}', '${client.email}', '${client.phone}')"><i class="fa-regular fa-eye"></i></button>
                    <button onclick="editInfo(${i}, '${client.rut}', '${client.name}', '${client.email}', '${client.phone}')"><i class="fa-regular fa-pen-to-square"></i></button>
                    <button onclick="deleteInfo(${i})"><i class="fa-regular fa-trash-can"></i></button>
                </td>
            </tr>`;

                userInfo.innerHTML += createElement;
            }
        }
    } else {
        userInfo.innerHTML = `<tr class="clientDetails"><td class="empty" colspan="7" align="center">No hay datos disponibles en la tabla</td></tr>`;
    }
}

// Función para ver detalles de un cliente
function readInfo(rut, name, email, phone) {
    clientRut.value = rut;
    clientName.value = name;
    clientEmail.value = email;
    clientPhone.value = phone;

    darkBg.classList.add('active');
    popupForm.classList.add('active');
    modalTitle.innerHTML = "Detalles del Cliente";
    submitBtn.style.display = "none";
    
    formInputFields.forEach(input => {
        input.disabled = true;
    });
}

// Función para editar un cliente
function editInfo(id, rut, name, email, phone) {
    isEdit = true;
    editId = id;

    clientRut.value = rut;
    clientName.value = name;
    clientEmail.value = email;
    clientPhone.value = phone;

    darkBg.classList.add('active');
    popupForm.classList.add('active');
    modalTitle.innerHTML = "Editar Cliente";
    submitBtn.innerHTML = "Actualizar";
    submitBtn.style.display = "block";
    
    formInputFields.forEach(input => {
        input.disabled = false;
    });
}

// Función para eliminar un cliente
function deleteInfo(index) {
    if (confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
        originalData.splice(index, 1);
        localStorage.setItem("clientData", JSON.stringify(originalData));
        
        // Actualizar getData después de eliminar el registro
        getData = [...originalData];

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
    }
}

// Event listener para el formulario
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const information = {
        id: Date.now(),
        rut: clientRut.value,
        name: clientName.value,
        email: clientEmail.value,
        phone: clientPhone.value
    };

    if (!isEdit) {
        originalData.unshift(information);
    } else {
        originalData[editId] = information;
    }
    
    getData = [...originalData];
    localStorage.setItem('clientData', JSON.stringify(originalData));

    submitBtn.innerHTML = "Guardar";
    modalTitle.innerHTML = "Agregar Cliente";
    submitBtn.style.display = "block";

    darkBg.classList.remove('active');
    popupForm.classList.remove('active');
    form.reset();

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
            const rut = item.rut.toLowerCase();
            const fullName = (item.name).toLowerCase();
            const email = item.email.toLowerCase();

            return (
                rut.includes(searchTerm) ||
                fullName.includes(searchTerm) ||
                email.includes(searchTerm)
            );
        });

        // Actualizar los datos actuales con los datos filtrados
        getData = filteredData;
    } else {
        getData = [...originalData];
    }

    currentIndex = 1;
    startIndex = 1;
    displayIndexBtn();
});

// Inicializar la paginación
displayIndexBtn();