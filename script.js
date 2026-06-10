document.addEventListener('DOMContentLoaded', () => {
    // Referências das "Páginas" Virtuais
    const servicesPage = document.getElementById('servicesPage');
    const calendarPage = document.getElementById('calendarPage');
    const navHome = document.getElementById('navHome');

    // Elementos de Busca / Cards
    const searchInput = document.getElementById('searchInput');
    const cards = document.querySelectorAll('.card-services');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Modais e Formulários
    const bookingModal = document.getElementById('bookingModal');
    const actionModal = document.getElementById('actionModal');
    const calendarGrid = document.getElementById('calendarGrid');

    const bookingForm = document.getElementById('bookingForm');
    const modalServiceInput = document.getElementById('modalService');
    const bookingDateInput = document.getElementById('bookingDate');
    const bookingTimeSelect = document.getElementById('bookingTime');

    const editForm = document.getElementById('editForm');
    const editDateInput = document.getElementById('editDate');
    const editTimeSelect = document.getElementById('editTime');
    const actionModalTitle = document.getElementById('actionModalTitle');

    // Botões de Navegação e Ação
    const btnGoToCalendar = document.getElementById('btnGoToCalendar');
    const btnBackToServices = document.getElementById('btnBackToServices');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeActionModalBtn = document.getElementById('closeActionModalBtn');
    const btnTriggerEdit = document.getElementById('btnTriggerEdit');
    const btnDeleteAppointment = document.getElementById('btnDeleteAppointment');

    // Estado do App
    let selectedAppointmentId = null; 
    const availableHoursRange = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

    // Dados Fictícios Iniciais (Junho 2026)
    let appointmentsDatabase = [
        { id: 1, service: "Nutrição", date: "2026-06-03", time: "09:00" },
        { id: 2, service: "Fisioterapia Esportiva", date: "2026-06-03", time: "14:00" },
        { id: 3, service: "Terapia Ocupacional", date: "2026-06-15", time: "10:00" }
    ];

    /* ==========================================================================
       1. ROTEAMENTO INTERNO (MUDANÇA DE PÁGINAS)
       ========================================================================== */
    function showCalendarPage() {
        servicesPage.classList.add('hidden');
        calendarPage.classList.remove('hidden');
        navHome.classList.remove('active');
        renderMonthlyCalendar(); // Renderiza sempre atualizado
    }

    function showServicesPage() {
        calendarPage.classList.add('hidden');
        servicesPage.classList.remove('hidden');
        navHome.classList.add('active');
    }

    btnGoToCalendar.addEventListener('click', showCalendarPage);
    btnBackToServices.addEventListener('click', showServicesPage);
    navHome.addEventListener('click', (e) => { e.preventDefault(); showServicesPage(); });

    /* ==========================================================================
       2. FILTRO DE BUSCA (NA PÁGINA DE SERVIÇOS)
       ========================================================================== */
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let hasResults = false;

        if (searchTerm === "") {
            cards.forEach(card => card.classList.remove('hidden'));
            noResultsMessage.classList.add('hidden');
            return;
        }

        cards.forEach(card => {
            const serviceName = card.dataset.serviceName.toLowerCase();
            if (serviceName.includes(searchTerm)) {
                card.classList.remove('hidden');
                hasResults = true;
            } else {
                card.classList.add('hidden');
            }
        });

        noResultsMessage.classList.toggle('hidden', hasResults);
    });

    /* ==========================================================================
       3. LOGICA DE HORÁRIOS DISPONÍVEIS (VALIDAÇÃO DE CONFLITOS)
       ========================================================================== */
    function updateHoursDropdown(dateInput, timeSelect, ignoreAppId = null) {
        const selectedDate = dateInput.value;
        if (!selectedDate) {
            timeSelect.disabled = true;
            return;
        }

        const bookedTimes = appointmentsDatabase
            .filter(app => app.date === selectedDate && app.id !== ignoreAppId)
            .map(app => app.time);

        timeSelect.innerHTML = '<option value="">-- Escolha o horário --</option>';
        let freeSlots = 0;

        availableHoursRange.forEach(hour => {
            if (!bookedTimes.includes(hour)) {
                const option = document.createElement('option');
                option.value = hour;
                option.textContent = `${hour}h`;
                timeSelect.appendChild(option);
                freeSlots++;
            }
        });

        timeSelect.disabled = freeSlots === 0;
        if (freeSlots === 0) {
            timeSelect.innerHTML = '<option value="">Sem horários disponíveis</option>';
        }
    }

    bookingDateInput.addEventListener('change', () => updateHoursDropdown(bookingDateInput, bookingTimeSelect));
    editDateInput.addEventListener('change', () => updateHoursDropdown(editDateInput, editTimeSelect, selectedAppointmentId));

    /* ==========================================================================
       4. CRIAÇÃO DE NOVOS AGENDAMENTOS (VIA CARD)
       ========================================================================== */
    cards.forEach(card => {
        card.addEventListener('click', () => {
            modalServiceInput.value = card.dataset.serviceName;
            bookingModal.classList.remove('hidden');
        });
    });

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newApp = {
            id: Date.now(),
            service: modalServiceInput.value,
            date: bookingDateInput.value,
            time: bookingTimeSelect.value
        };
        appointmentsDatabase.push(newApp);
        bookingModal.classList.add('hidden');
        bookingForm.reset();
        bookingTimeSelect.disabled = true;
        
        if(confirm("Agendamento realizado! Deseja abrir o calendário para visualizar?")) {
            showCalendarPage();
        }
    });

    /* ==========================================================================
       5. MONTAGEM DINÂMICA DA PÁGINA DO CALENDÁRIO MATRIZ
       ========================================================================== */
    function renderMonthlyCalendar() {
        calendarGrid.innerHTML = "";
        const totalDays = 30; // Junho
        const startDayOfWeek = 1; // Segunda-feira em 2026

        // Espaços vazios do início da folha do mês
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = "calendar-day-cell empty-cell";
            calendarGrid.appendChild(emptyCell);
        }

        // Dias úteis de Junho
        for (let day = 1; day <= totalDays; day++) {
            const cell = document.createElement('div');
            cell.className = "calendar-day-cell";
            const dayString = day < 10 ? `0${day}` : `${day}`;
            const currentCellDate = `2026-06-${dayString}`;

            cell.innerHTML = `<span class="day-number">${day}</span>`;

            const appointmentsToday = appointmentsDatabase.filter(app => app.date === currentCellDate);
            const eventsContainer = document.createElement('div');
            eventsContainer.className = "day-events-container";

            if (appointmentsToday.length > 0) {
                appointmentsToday.sort((a, b) => a.time.localeCompare(b.time));
                appointmentsToday.forEach(app => {
                    const tag = document.createElement('div');
                    tag.className = "calendar-event-tag";
                    tag.textContent = `${app.time} - ${app.service}`;
                    
                    // Evento de clique para Editar/Excluir
                    tag.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openActionManager(app);
                    });

                    eventsContainer.appendChild(tag);
                });
            }
            cell.appendChild(eventsContainer);
            calendarGrid.appendChild(cell);
        }
    }

    /* ==========================================================================
       6. OPERAÇÕES DE GERENCIAMENTO (EDITAR / EXCLUIR)
       ========================================================================== */
    function openActionManager(app) {
        selectedAppointmentId = app.id;
        actionModalTitle.textContent = `Gerenciar: ${app.service}`;
        editForm.classList.add('hidden'); 
        
        editDateInput.value = app.date;
        updateHoursDropdown(editDateInput, editTimeSelect, app.id);
        editTimeSelect.value = app.time;

        actionModal.classList.remove('hidden');
    }

    btnTriggerEdit.addEventListener('click', () => {
        editForm.classList.remove('hidden');
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const appIndex = appointmentsDatabase.findIndex(app => app.id === selectedAppointmentId);
        if (appIndex !== -1) {
            appointmentsDatabase[appIndex].date = editDateInput.value;
            appointmentsDatabase[appIndex].time = editTimeSelect.value;
            
            actionModal.classList.add('hidden');
            renderMonthlyCalendar();
            alert("Agendamento modificado!");
        }
    });

    btnDeleteAppointment.addEventListener('click', () => {
        if (confirm("Deseja realmente cancelar este agendamento?")) {
            appointmentsDatabase = appointmentsDatabase.filter(app => app.id !== selectedAppointmentId);
            actionModal.classList.add('hidden');
            renderMonthlyCalendar();
            alert("Agendamento cancelado com sucesso.");
        }
    });

    /* ==========================================================================
       7. FECHAMENTO DE MODAIS EXTERNOS
       ========================================================================== */
    closeModalBtn.addEventListener('click', () => { bookingModal.classList.add('hidden'); bookingForm.reset(); bookingTimeSelect.disabled = true; });
    closeActionModalBtn.addEventListener('click', () => actionModal.classList.add('hidden'));

    window.addEventListener('click', (e) => {
        if (e.target === bookingModal) { bookingModal.classList.add('hidden'); bookingForm.reset(); bookingTimeSelect.disabled = true; }
        if (e.target === actionModal) actionModal.classList.add('hidden');
    });
});