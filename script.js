document.addEventListener('DOMContentLoaded', () => {
    // Seletores de Busca e Grid
    const searchInput = document.getElementById('searchInput');
    const servicesGrid = document.getElementById('servicesGrid');
    const cards = servicesGrid.querySelectorAll('.card-services');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Seletores dos Modais e Formulário
    const bookingModal = document.getElementById('bookingModal');
    const calendarModal = document.getElementById('calendarModal');
    const modalServiceInput = document.getElementById('modalService');
    const bookingDateInput = document.getElementById('bookingDate');
    const bookingTimeSelect = document.getElementById('bookingTime');
    const bookingForm = document.getElementById('bookingForm');
    const calendarList = document.getElementById('calendarList');

    // Botões
    const btnViewCalendar = document.getElementById('btnViewCalendar');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeCalendarBtn = document.getElementById('closeCalendarBtn');

    // Banco de dados simulado no estado da aplicação (Array de objetos)
    // Suporta múltiplos agendamentos por data contanto que sejam em horários diferentes
    let appointmentsDatabase = [
        { id: 1, service: "Nutrição", date: "2026-06-12", time: "09:00" },
        { id: 2, service: "Fisioterapia Esportiva", date: "2026-06-12", time: "14:00" }
    ];

    // Horários permitidos pela regra de negócio (de 1h em 1h)
    const availableHoursRange = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

    /* ==========================================================================
       1. FILTRO DE BUSCA EM TEMPO REAL
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
       2. REGRAS DE HORÁRIO E MONTAGEM DO SELECT DINÂMICO
       ========================================================================== */
    // Monitora a escolha da data para calcular e exibir somente horários livres
    bookingDateInput.addEventListener('change', () => {
        const selectedDate = bookingDateInput.value;
        
        if (!selectedDate) {
            bookingTimeSelect.disabled = true;
            return;
        }

        // Filtra quais horários já estão ocupados naquela data específica
        const bookedTimesOnThisDate = appointmentsDatabase
            .filter(app => app.date === selectedDate)
            .map(app => app.time);

        // Limpa o select de horários
        bookingTimeSelect.innerHTML = '<option value="">-- Escolha um horário livre --</option>';

        let availableCount = 0;

        // Monta as opções dinamicamente removendo os horários já tomados
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
            bookingTimeSelect.innerHTML = '<option value="">Nenhum horário vago para esta data</option>';
            bookingTimeSelect.disabled = true;
        } else {
            bookingTimeSelect.disabled = false;
        }
    });

    /* ==========================================================================
       3. CONTROLE DO MODAL DE AGENDAMENTO
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

    // Enviar formulário e salvar novo agendamento no banco fictício
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newAppointment = {
            id: Date.now(),
            service: modalServiceInput.value,
            date: bookingDateInput.value,
            time: bookingTimeSelect.value
        };

        // Salva na lista global
        appointmentsDatabase.push(newAppointment);

        // Formata data para exibição amigável do alert
        const formattedDate = newAppointment.date.split('-').reverse().join('/');
        alert(`Confirmado com Sucesso!\nServiço: ${newAppointment.service}\nQuando: ${formattedDate} às ${newAppointment.time}h`);
        
        // Reseta e fecha o modal
        bookingModal.classList.add('hidden');
        bookingForm.reset();
        bookingTimeSelect.disabled = true;
    });

    /* ==========================================================================
       4. CONSTRUÇÃO E RENDERIZAÇÃO DA LISTA DE AGENDAMENTOS
       ========================================================================== */
    // Atualiza a visualização da agenda dinamicamente lendo o banco de dados
    function renderAppointmentsList() {
        calendarList.innerHTML = "";

        if (appointmentsDatabase.length === 0) {
            calendarList.innerHTML = '<p class="no-appointments">Nenhum agendamento realizado ainda.</p>';
            return;
        }

        // Ordena os agendamentos por data e horário para exibição cronológica correta
        const sortedAppointments = [...appointmentsDatabase].sort((a, b) => {
            return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
        });

        sortedAppointments.forEach(app => {
            const [year, month, day] = app.date.split('-');
            const item = document.createElement('div');
            item.className = "appointment-item";
            item.innerHTML = `
                <div class="appointment-info">
                    <h4>${app.service}</h4>
                    <p><span class="material-symbols-outlined" style="font-size:14px; vertical-align:middle;">calendar_today</span> ${day}/${month}/${year}</p>
                </div>
                <div class="appointment-time">
                    <strong>${app.time}h</strong>
                </div>
            `;
            calendarList.appendChild(item);
        });
    }

    btnViewCalendar.addEventListener('click', () => {
        renderAppointmentsList();
        calendarModal.classList.remove('hidden');
    });

    closeCalendarBtn.addEventListener('click', () => {
        calendarModal.classList.add('hidden');
    });

    // Fecha modais se houver clique fora do container do conteúdo
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