// Configuración de la API
const API_URL = 'http://localhost:3000/api';

// Estado de la aplicación
const appState = {
    selectedDate: new Date().toISOString().split('T')[0],
    selectedTime: '',
    selectedGuests: 2,
    customerData: {
        name: '',
        phone: '',
        email: ''
    },
    availableSlots: [],
    reservations: [],
    tables: []
};

// Horarios disponibles
const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Configurar fecha mínima en el input
    const dateInput = document.getElementById('dateInput');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    dateInput.max = maxDate.toISOString().split('T')[0];

    // Event listeners para cambiar de vista
    document.getElementById('btnCustomerView').addEventListener('click', () => {
        switchView('customer');
    });

    document.getElementById('btnAdminView').addEventListener('click', () => {
        switchView('admin');
    });

    // Event listeners para la vista cliente
    dateInput.addEventListener('change', (e) => {
        appState.selectedDate = e.target.value;
        updateSelectedDateDisplay();
        fetchAvailableSlots();
    });

    document.getElementById('btnContinue').addEventListener('click', handleContinue);
    document.getElementById('btnConfirmReservation').addEventListener('click', handleConfirmReservation);

    // Inicializar componentes
    renderGuestsGrid();
    renderTimeGrid();
    updateSelectedDateDisplay();
    fetchAvailableSlots();
}

// Cambiar entre vistas
function switchView(view) {
    const customerBtn = document.getElementById('btnCustomerView');
    const adminBtn = document.getElementById('btnAdminView');
    const customerView = document.getElementById('customerView');
    const adminView = document.getElementById('adminView');

    if (view === 'customer') {
        customerBtn.classList.add('active');
        customerBtn.classList.remove('btn-outline');
        customerBtn.classList.add('btn-primary');
        
        adminBtn.classList.remove('active');
        adminBtn.classList.remove('btn-primary');
        adminBtn.classList.add('btn-outline');

        customerView.classList.add('active');
        adminView.classList.remove('active');
    } else {
        adminBtn.classList.add('active');
        adminBtn.classList.remove('btn-outline');
        adminBtn.classList.add('btn-primary');
        
        customerBtn.classList.remove('active');
        customerBtn.classList.remove('btn-primary');
        customerBtn.classList.add('btn-outline');

        adminView.classList.add('active');
        customerView.classList.remove('active');

        // Cargar datos del admin
        loadAdminData();
    }
}

// Renderizar grid de número de personas
function renderGuestsGrid() {
    const guestsGrid = document.getElementById('guestsGrid');
    guestsGrid.innerHTML = '';

    for (let i = 1; i <= 8; i++) {
        const button = document.createElement('button');
        button.className = 'guest-option';
        button.textContent = i;
        if (i === appState.selectedGuests) {
            button.classList.add('selected');
        }
        button.addEventListener('click', () => selectGuests(i));
        guestsGrid.appendChild(button);
    }
}

function selectGuests(num) {
    appState.selectedGuests = num;
    renderGuestsGrid();
}

// Renderizar grid de horarios
function renderTimeGrid() {
    const timeGrid = document.getElementById('timeGrid');
    timeGrid.innerHTML = '';

    timeSlots.forEach(time => {
        const button = document.createElement('button');
        button.className = 'time-option';
        button.textContent = time;
        
        const isAvailable = appState.availableSlots.includes(time);
        
        if (!isAvailable) {
            button.classList.add('disabled');
            button.disabled = true;
        }
        
        if (time === appState.selectedTime) {
            button.classList.add('selected');
        }
        
        button.addEventListener('click', () => {
            if (isAvailable) {
                selectTime(time);
            }
        });
        
        timeGrid.appendChild(button);
    });
}

function selectTime(time) {
    appState.selectedTime = time;
    renderTimeGrid();
}

// Actualizar display de fecha seleccionada
function updateSelectedDateDisplay() {
    const date = new Date(appState.selectedDate + 'T00:00:00');
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('es-ES', options);
    document.getElementById('selectedDateDisplay').textContent = formattedDate;
}

// Obtener horarios disponibles
async function fetchAvailableSlots() {
    try {
        const response = await fetch(`${API_URL}/reservations?date=${appState.selectedDate}`);
        const data = await response.json();
        
        if (data.success) {
            const bookedTimes = data.reservations.map(r => r.time);
            appState.availableSlots = timeSlots.filter(slot => !bookedTimes.includes(slot));
        } else {
            appState.availableSlots = timeSlots;
        }
        
        renderTimeGrid();
    } catch (error) {
        console.error('Error al obtener horarios disponibles:', error);
        appState.availableSlots = timeSlots;
        renderTimeGrid();
    }
}

// Manejar botón continuar
function handleContinue() {
    if (!appState.selectedDate || !appState.selectedTime) {
        alert('Por favor selecciona una fecha y hora');
        return;
    }

    document.getElementById('customerDataCard').style.display = 'block';
    document.getElementById('btnContinue').classList.add('hidden');
    document.getElementById('btnConfirmReservation').classList.remove('hidden');
    
    // Scroll hacia el formulario
    document.getElementById('customerDataCard').scrollIntoView({ behavior: 'smooth' });
}

// Confirmar reserva
async function handleConfirmReservation() {
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const email = document.getElementById('customerEmail').value.trim();

    if (!name) {
        alert('Por favor ingresa tu nombre');
        return;
    }

    appState.customerData = { name, phone, email };

    const btn = document.getElementById('btnConfirmReservation');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

    try {
        // Asignar mesa aleatoria
        const table = Math.floor(Math.random() * 9) + 1;

        const response = await fetch(`${API_URL}/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: appState.selectedDate,
                time: appState.selectedTime,
                guests: appState.selectedGuests,
                name: name,
                phone: phone,
                email: email,
                table: table
            })
        });

        const data = await response.json();

        if (data.success) {
            showConfirmation();
            resetForm();
        } else {
            alert('Error al crear la reserva: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error al confirmar reserva:', error);
        alert('Error al conectar con el servidor. Por favor intenta nuevamente.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check"></i> Confirmar Reserva';
    }
}

// Mostrar confirmación
function showConfirmation() {
    const date = new Date(appState.selectedDate + 'T00:00:00');
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const formattedDate = date.toLocaleDateString('es-ES', options);
    
    const guestsText = appState.selectedGuests === 1 ? 'persona' : 'personas';
    const contactInfo = appState.customerData.email || appState.customerData.phone;
    
    const details = `
        <p><strong>${formattedDate}</strong></p>
        <p>${appState.selectedTime} - ${appState.selectedGuests} ${guestsText}</p>
        ${contactInfo ? `<p>Confirmación enviada a: ${contactInfo}</p>` : ''}
    `;
    
    document.getElementById('confirmationDetails').innerHTML = details;
    document.getElementById('reservationForm').style.display = 'none';
    document.getElementById('confirmationCard').classList.remove('hidden');

    setTimeout(() => {
        document.getElementById('confirmationCard').classList.add('hidden');
        document.getElementById('reservationForm').style.display = 'block';
    }, 5000);
}

// Resetear formulario
function resetForm() {
    appState.selectedTime = '';
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerDataCard').style.display = 'none';
    document.getElementById('btnContinue').classList.remove('hidden');
    document.getElementById('btnConfirmReservation').classList.add('hidden');
    renderTimeGrid();
    fetchAvailableSlots();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// VISTA ADMINISTRADOR
// ============================================

async function loadAdminData() {
    await Promise.all([
        fetchReservations(),
        fetchTables()
    ]);
    renderFloorPlan();
    renderReservationsList();
    updateTodayDate();
}

function updateTodayDate() {
    const today = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    document.getElementById('todayDate').textContent = today.toLocaleDateString('es-ES', options);
}

// Obtener reservas
async function fetchReservations() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`${API_URL}/reservations?date=${today}`);
        const data = await response.json();
        
        if (data.success) {
            appState.reservations = data.reservations;
        }
    } catch (error) {
        console.error('Error al obtener reservas:', error);
    }
}

// Obtener mesas
async function fetchTables() {
    try {
        const response = await fetch(`${API_URL}/tables`);
        const data = await response.json();
        
        if (data.success) {
            appState.tables = data.tables;
        }
    } catch (error) {
        console.error('Error al obtener mesas:', error);
    }
}

// Renderizar plano de mesas
function renderFloorPlan() {
    const floorPlan = document.getElementById('floorPlan');
    floorPlan.innerHTML = '';

    const tableConfig = [
        { number: 1, capacity: 2 },
        { number: 2, capacity: 2 },
        { number: 3, capacity: 4 },
        { number: 4, capacity: 4 },
        { number: 5, capacity: 4 },
        { number: 6, capacity: 6 },
        { number: 7, capacity: 6 },
        { number: 8, capacity: 8 },
        { number: 9, capacity: 8 }
    ];

    tableConfig.forEach(config => {
        const tableData = appState.tables.find(t => t.table_number === config.number);
        const hasReservation = appState.reservations.find(r => r.table_number === config.number);
        
        let status = 'available';
        let statusText = 'Disponible';
        
        if (hasReservation) {
            status = 'occupied';
            statusText = 'Ocupada';
        }

        const tableDiv = document.createElement('div');
        tableDiv.className = `table-item ${status}`;
        tableDiv.innerHTML = `
            <div class="table-icon">
                <i class="fas fa-chair"></i>
            </div>
            <div class="table-number">Mesa ${config.number}</div>
            <div class="table-capacity">${config.capacity} personas</div>
            <span class="table-status">${statusText}</span>
        `;
        
        floorPlan.appendChild(tableDiv);
    });
}

// Renderizar lista de reservas
function renderReservationsList() {
    const reservationsList = document.getElementById('reservationsList');
    
    if (appState.reservations.length === 0) {
        reservationsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar"></i>
                <p>No hay reservas para hoy</p>
            </div>
        `;
        return;
    }

    // Ordenar por hora
    const sortedReservations = [...appState.reservations].sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });

    reservationsList.innerHTML = sortedReservations.map(reservation => `
        <div class="reservation-item" data-id="${reservation.id}">
            <div class="reservation-header">
                <div class="reservation-name">${reservation.name}</div>
                <div class="reservation-badges">
                    <span class="badge badge-blue">Mesa ${reservation.table_number}</span>
                    <span class="badge badge-green">Confirmada</span>
                </div>
            </div>
            <div class="reservation-details">
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>${reservation.time}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-users"></i>
                    <span>${reservation.guests} personas</span>
                </div>
                ${reservation.phone ? `
                    <div class="detail-item">
                        <i class="fas fa-phone"></i>
                        <span>${reservation.phone}</span>
                    </div>
                ` : ''}
                ${reservation.email ? `
                    <div class="detail-item">
                        <i class="fas fa-envelope"></i>
                        <span>${reservation.email}</span>
                    </div>
                ` : ''}
            </div>
            <div class="reservation-actions">
                <button class="btn btn-sm btn-danger" onclick="deleteReservation(${reservation.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

// Eliminar reserva
async function deleteReservation(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/reservations/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            await loadAdminData();
        } else {
            alert('Error al eliminar la reserva');
        }
    } catch (error) {
        console.error('Error al eliminar reserva:', error);
        alert('Error al conectar con el servidor');
    }
}

// Auto-refresh para la vista admin
setInterval(() => {
    const adminView = document.getElementById('adminView');
    if (adminView.classList.contains('active')) {
        loadAdminData();
    }
}, 10000); // Refresh cada 10 segundos
