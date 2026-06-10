document.addEventListener('DOMContentLoaded', () => {
    // Busca e Filtros
    const searchInput = document.getElementById('searchInput');
    const servicesGrid = document.getElementById('servicesGrid');
    const cards = servicesGrid.querySelectorAll('.card-services');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Modais e Inputs
    const bookingModal = document.getElementById('bookingModal');
    const calendarModal = document.getElementById('calendarModal');
    const modalServiceInput = document.getElementById('modalService');
    const bookingDateInput = document.getElementById('bookingDate');
    const bookingTimeSelect = document.getElementById('bookingTime');
    const bookingForm = document.getElementById('bookingForm');
    const calendarGrid = document.getElementById('calendarGrid');

    // Botões de Ação
    const btnViewCalendar = document.getElementById('btnViewCalendar');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeCalendarBtn = document.getElementById('closeCalendarBtn');

    // Banco de dados simulado com suporte a múltiplos agendamentos por dia
    let appointmentsDatabase = [
        { id: 1, service: "Nutrição", date: "2026-06-03", time: "09:00" },
        { id: 2, service: "Fisioterapia Esportiva", date: "2026-06-03", time: "14:00" },
        { id: 3, service: "Terapia Ocupacional", date: "2026-06-15", time: "10:00" }
    ];

    // Grade de horários padrão de 1 em 1h
    const availableHoursRange = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

    /* ==========================================================================
       1. BUSCA EM TEMPO REAL
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
       2. REGRA DE HORÁRIOS DISPONÍVEIS POR DATA
       ========================================================================== */
    bookingDateInput.addEventListener('change', () => {
        const selectedDate = bookingDateInput.value;
        if (!selectedDate) {
            bookingTimeSelect.disabled = true;
            return;
        }

        // Mapeia horários que já foram ocupados nesta data específica
        const bookedTimesOnThisDate = appointmentsDatabase
            .filter(app => app.date === selectedDate)
            .map(app => app.time);

        bookingTimeSelect.innerHTML = '<option value="">-- Escolha um horário livre --</option>';
        let availableCount = 0;

        availableHoursRange.forEach(hour => {
            if (!bookedTimesOnThisDate.includes(hour)) {
                const option = document.createElement('option');
                option.value = hour;
                option.textContent = `${hour}h`;
                bookingTimeSelect.appendChild(option);
                availableCount++;
            }
        });

        if (availableCount === 0) {
            bookingTimeSelect.innerHTML = '<option value="">Nenhum horário vago nesta data</option>';
            bookingTimeSelect.disabled = true;
        } else {
            bookingTimeSelect.disabled = false;
        }
    });

    /* ==========================================================================
       3. CONTROLE DO MODAL DE FORMULÁRIO
       ========================================================================== */
    cards.forEach(card => {
        card.addEventListener('click', () => {
            modalServiceInput.value = card.dataset.serviceName;
            bookingModal.classList.remove('hidden');
        });
    });

    closeModalBtn.addEventListener('click', () => {
        bookingModal.classList.add('hidden');
        bookingForm.reset();
        bookingTimeSelect.disabled = true;
        bookingTimeSelect.innerHTML = '<option value="">Selecione primeiro a data...</option>';
    });

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newAppointment = {
            id: Date.now(),
            service: modalServiceInput.value,
            date: bookingDateInput.value,
            time: bookingTimeSelect.value
        };

        appointmentsDatabase.push(newAppointment);

        const formattedDate = newAppointment.date.split('-').reverse().join('/');
        alert(`Agendamento Confirmado!\n${newAppointment.service}\nData: ${formattedDate} às ${newAppointment.time}h`);
        
        bookingModal.classList.add('hidden');
        bookingForm.reset();
        bookingTimeSelect.disabled = true;
    });

    /* ==========================================================================
       4. CONSTRUÇÃO E RENDERIZAÇÃO DO CALENDÁRIO MENSAL DINÂMICO
       ========================================================================== */
    function renderMonthlyCalendar() {
        calendarGrid.innerHTML = "";

        // Regra fixa para Junho de 2026: Começa numa Segunda-feira (1 espaço vazio no grid/Dom)
        // O mês tem exatamente 30 dias.
        const totalDays = 30;
        const startDayOfWeek = 1; // 0 = Dom, 1 = Seg, 2 = Ter...

        // 1. Inserir células vazias para alinhar os dias da semana corretamente
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = "calendar-day-cell empty-cell";
            calendarGrid.appendChild(emptyCell);
        }

        // 2. Construir cada um dos 30 dias do mês de Junho
        for (let day = 1; day <= totalDays; day++) {
            const cell = document.createElement('div');
            cell.className = "calendar-day-cell";

            // Monta a string idêntica ao formato 'YYYY-MM-DD' gerado pelo HTML5 input date
            const dayString = day < 10 ? `0${day}` : `${day}`;
            const currentCellDate = `2026-06-${dayString}`;

            // Número indicador do dia
            cell.innerHTML = `<span class="day-number">${day}</span>`;

            // Filtra se existem agendamentos para este dia corrente no laço
            const appointmentsToday = appointmentsDatabase.filter(app => app.date === currentCellDate);

            // Container interno para listar as tags de eventos do dia
            const eventsContainer = document.createElement('div');
            eventsContainer.className = "day-events-container";

            if (appointmentsToday.length > 0) {
                // Ordena os agendamentos do dia por hora
                appointmentsToday.sort((a, b) => a.time.localeCompare(b.time));

                appointmentsToday.forEach(app => {
                    const tag = document.createElement('div');
                    tag.className = "calendar-event-tag";
                    tag.title = `${app.service} às ${app.time}h`; // Dica de mouse completa
                    tag.textContent = `${app.time} - ${app.service}`;
                    eventsContainer.appendChild(tag);
                });
            }

            cell.appendChild(eventsContainer);
            calendarGrid.appendChild(cell);
        }
    }

    // Gatilho do botão Ver Calendário
    btnViewCalendar.addEventListener('click', () => {
        renderMonthlyCalendar();
        calendarModal.classList.remove('hidden');
    });

    closeCalendarBtn.addEventListener('click', () => {
        calendarModal.classList.add('hidden');
    });

    // Fechar ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            bookingModal.classList.add('hidden');
            bookingForm.reset();
            bookingTimeSelect.disabled = true;
        }
        if (e.target === calendarModal) {
            calendarModal.classList.add('hidden');
        }
    });
});