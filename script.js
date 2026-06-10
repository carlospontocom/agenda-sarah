document.addEventListener('DOMContentLoaded', () => {
    // Referências de Páginas Virtuais
    const servicesPage = document.getElementById('servicesPage');
    const calendarPage = document.getElementById('calendarPage');
    const navHome = document.getElementById('navHome');

    // Filtros e Busca
    const searchInput = document.getElementById('searchInput');
    const cards = document.querySelectorAll('.card-services');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Elementos de Modais
    const bookingModal = document.getElementById('bookingModal');
    const actionModal = document.getElementById('actionModal');
    const calendarGrid = document.getElementById('calendarGrid');

    // Form de Criação
    const bookingForm = document.getElementById('bookingForm');
    const modalServiceInput = document.getElementById('modalService');
    const bookingDateInput = document.getElementById('bookingDate');
    const bookingTimeSelect = document.getElementById('bookingTime');

    // Form de Edição
    const editForm = document.getElementById('editForm');
    const editDateInput = document.getElementById('editDate');
    const editTimeSelect = document.getElementById('editTime');
    const actionModalTitle = document.getElementById('actionModalTitle');

    // Botões Controladores
    const btnGoToCalendar = document.getElementById('btnGoToCalendar');
    const btnBackToServices = document.getElementById('btnBackToServices');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeActionModalBtn = document.getElementById('closeActionModalBtn');
    const btnTriggerEdit = document.getElementById('btnTriggerEdit');
    const btnDeleteAppointment = document.getElementById('btnDeleteAppointment');

    // Variáveis Globais de Estado
    let selectedAppointmentId = null; 
    const availableHoursRange = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

    // Base de dados simulada inicial (Junho de 2026)
    let appointmentsDatabase = [
        { id: 1, service: "Nutrição", date: "2026-06-03", time: "09:00" },
        { id: 2, service: "Fisioterapia Esportiva", date: "2026-06-03", time: "14:00" },
        { id: 3, service: "Terapia Ocupacional", date: "2026-06-15", time: "10:00" }
    ];

    /* ==========================================================================
       1. SISTEMA DE NAVEGAÇÃO DE PÁGINAS (ROTEAMENTO INTERNO)
       ========================================================================== */
    function showCalendarPage() {
        servicesPage.classList.add('hidden');
        calendarPage.classList.remove('hidden');
        navHome.classList.remove('active');
        renderMonthlyCalendar(); 
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
       2. FILTRO DE BUSCA DOS CARDS
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
       3. GESTÃO E CÁLCULO DE HORÁRIOS LIVRES POR DATA
       ========================================================================== */
    function updateHoursDropdown(dateInput, timeSelect, ignoreAppId = null) {
        const selectedDate = dateInput.value;
        if (!selectedDate) {
            timeSelect.disabled = true;
            return;
        }

        // Filtra horários ocupados naquele dia (Ignora o ID editado se aplicável)
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
            timeSelect.innerHTML = '<option value="">Sem horários livres</option>';
        }
    }

    bookingDateInput.addEventListener('change', () => updateHoursDropdown(bookingDateInput, bookingTimeSelect));
    editDateInput.addEventListener('change', () => updateHoursDropdown(editDateInput, editTimeSelect, selectedAppointmentId));

    /* ==========================================================================
       4. CRIAÇÃO DE NOVOS AGENDAMENTOS
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
        
        if(confirm("Agendamento efetuado! Deseja visualizar no calendário completo?")) {
            showCalendarPage();
        }
    });

    /* ==========================================================================
       5. RENDERIZAÇÃO DA FOLHA DE CALENDÁRIO MENSAL (JUNHO DE 2026)
       ========================================================================== */
    function renderMonthlyCalendar() {
        calendarGrid.innerHTML = "";
        const totalDays = 30; 
        const startDayOfWeek = 1; // Segunda-feira

        // Células vazias iniciais
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = "calendar-day-cell empty-cell";
            calendarGrid.appendChild(emptyCell);
        }

        // Geração dos dias do mês
        for (let day = 1; day <= totalDays; day++) {
            const cell = document.createElement('div');
            cell.className = "calendar-day-cell";
            const dayString = day < 10 ? `0${day}` : `${day}`;
            const currentCellDate = `2026-06-${dayString}`;

            cell.innerHTML = `<span class="day-number">${day}</span>`;

            // Filtro e ordenação cronológica dos agendamentos do dia
            const appointmentsToday = appointmentsDatabase.filter(app => app.date === currentCellDate);
            
            const eventsContainer = document.createElement('div');
            eventsContainer.className = "day-events-container";

            if (appointmentsToday.length > 0) {
                appointmentsToday.sort((a, b) => a.time.localeCompare(b.time));
                appointmentsToday.forEach(app => {
                    const tag = document.createElement('div');
                    tag.className = "calendar-event-tag";
                    tag.textContent = `${app.time} - ${app.service}`;
                    tag.title = `Clique para gerenciar: ${app.service} às ${app.time}h`;
                    
                    // Dispara as ações do agendamento específico
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
       6. GERENCIAMENTO DE CADASTROS EXISTENTES (ATUALIZAR / DELETAR)
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
            alert("Agendamento modificado com sucesso!");
        }
    });

    btnDeleteAppointment.addEventListener('click', () => {
        if (confirm("Tem certeza que deseja cancelar em definitivo esta consulta?")) {
            appointmentsDatabase = appointmentsDatabase.filter(app => app.id !== selectedAppointmentId);
            actionModal.classList.add('hidden');
            renderMonthlyCalendar();
            alert("Agendamento excluído.");
        } 
    });

    /* ==========================================================================
       7. FECHAMENTO DOS MODAIS
       ========================================================================== */
    closeModalBtn.addEventListener('click', () => { bookingModal.classList.add('hidden'); bookingForm.reset(); bookingTimeSelect.disabled = true; });
    closeActionModalBtn.addEventListener('click', () => actionModal.classList.add('hidden'));

    window.addEventListener('click', (e) => {
        if (e.target === bookingModal) { bookingModal.classList.add('hidden'); bookingForm.reset(); bookingTimeSelect.disabled = true; }
        if (e.target === actionModal) actionModal.classList.add('hidden');
    });
});