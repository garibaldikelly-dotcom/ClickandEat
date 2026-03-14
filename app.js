
// VARIABLES GLOBALES

let selectedGuests = null;
let selectedTime = null;
let selectedDate = null;

const timeSlots = [
    "12:00","12:30","13:00","13:30",
    "14:00","14:30","15:00",
    "19:00","19:30","20:00","20:30",
    "21:00","21:30","22:00"
];

// INICIALIZACIÓN

document.addEventListener("DOMContentLoaded", () => {

    generateGuestsButtons();
    generateTimeSlots();

    document.getElementById("btnContinue")
        .addEventListener("click", showCustomerForm);

    document.getElementById("btnConfirmReservation")
        .addEventListener("click", confirmReservation);

    document.getElementById("btnCustomerView")
        .addEventListener("click", showCustomerView);

    document.getElementById("btnAdminView")
        .addEventListener("click", showAdminView);

    document.getElementById("dateInput")
        .addEventListener("change", updateSelectedDate);

    loadReservationsAdmin();
});


// ================================
// GENERAR BOTONES DE PERSONAS
// ================================

function generateGuestsButtons(){

    const grid = document.getElementById("guestsGrid");

    for(let i=1;i<=8;i++){

        const btn = document.createElement("button");

        btn.className="guest-btn";
        btn.textContent=i;

        btn.onclick=()=>{

            selectedGuests=i;

            document.querySelectorAll(".guest-btn")
            .forEach(b=>b.classList.remove("active"));

            btn.classList.add("active");
        };

        grid.appendChild(btn);
    }
}

// GENERAR HORARIOS

function generateTimeSlots(){

    const grid=document.getElementById("timeGrid");

    timeSlots.forEach(time=>{

        const btn=document.createElement("button");

        btn.className="time-btn";
        btn.textContent=time;

        btn.onclick=()=>{

            selectedTime=time;

            document.querySelectorAll(".time-btn")
            .forEach(b=>b.classList.remove("active"));

            btn.classList.add("active");
        };

        grid.appendChild(btn);

    });

}

// MOSTRAR FORMULARIO CLIENTE

function showCustomerForm(){

    selectedDate=document.getElementById("dateInput").value;

    if(!selectedDate || !selectedGuests || !selectedTime){

        alert("Debes seleccionar fecha, personas y horario");

        return;
    }

    document.getElementById("customerDataCard")
        .style.display="block";

    document.getElementById("btnContinue")
        .classList.add("hidden");

    document.getElementById("btnConfirmReservation")
        .classList.remove("hidden");
}


// CONFIRMAR RESERVA

function confirmReservation(){

    const name=document.getElementById("customerName").value;
    const phone=document.getElementById("customerPhone").value;
    const email=document.getElementById("customerEmail").value;

    if(!name){

        alert("El nombre es obligatorio");
        return;
    }

    const reservation={
        id:Date.now(),
        name,
        phone,
        email,
        guests:selectedGuests,
        time:selectedTime,
        date:selectedDate
    };

    saveReservation(reservation);

    showConfirmation(reservation);
}


// ================================
// GUARDAR RESERVA
// ================================

function saveReservation(reservation){

    let reservations =
    JSON.parse(localStorage.getItem("reservations")) || [];

    reservations.push(reservation);

    localStorage.setItem(
        "reservations",
        JSON.stringify(reservations)
    );
}


// ================================
// MOSTRAR CONFIRMACION
// ================================

function showConfirmation(reservation){

    const card=document.getElementById("confirmationCard");

    const details=`
    Reserva para ${reservation.name}
    el ${reservation.date}
    a las ${reservation.time}
    para ${reservation.guests} personas.
    `;

    document.getElementById("confirmationDetails")
        .innerText=details;

    card.classList.remove("hidden");

}


// ================================
// VISTAS
// ================================

function showCustomerView(){

    document.getElementById("customerView")
    .classList.add("active");

    document.getElementById("adminView")
    .classList.remove("active");

}


function showAdminView(){

    document.getElementById("adminView")
    .classList.add("active");

    document.getElementById("customerView")
    .classList.remove("active");

    loadReservationsAdmin();

}


// ================================
// CARGAR RESERVAS ADMIN
// ================================

function loadReservationsAdmin(){

    const container=document.getElementById("reservationsList");

    let reservations =
    JSON.parse(localStorage.getItem("reservations")) || [];

    if(reservations.length===0){

        container.innerHTML="<p>No hay reservas</p>";
        return;
    }

    container.innerHTML="";

    reservations.forEach(r=>{

        const div=document.createElement("div");

        div.className="reservation-item";

        div.innerHTML=`
        <strong>${r.name}</strong>
        <p>${r.date} - ${r.time}</p>
        <p>${r.guests} personas</p>
        `;

        container.appendChild(div);
    });

}


// ================================
// ACTUALIZAR FECHA
// ================================

function updateSelectedDate(){

    const date=this.value;

    document.getElementById("selectedDateDisplay")
        .textContent="Fecha seleccionada: "+date;
}