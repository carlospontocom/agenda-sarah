document.addEventListener('DOMContentLoaded', () => {
    // Elementos de Busca
    const searchInput = document.getElementById('searchInput');
    const servicesGrid = document.getElementById('servicesGrid');
    const cards = servicesGrid.querySelectorAll('.card-services');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Elementos dos Modais
    const bookingModal = document.getElementById('bookingModal');
    const calendarModal = document.getElementById('calendarModal');
    const modalServiceInput = document.getElementById('modalService');
    const bookingForm = document.getElementById('bookingForm');

    // Botões de Abertura / Fechamento
    const btnViewCalendar = document.getElementById('btnViewCalendar');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeCalendarBtn = document.getElementById('closeCalendarBtn');

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

        if (hasResults) {
            noResultsMessage.classList.add('hidden');
        } else {
            noResultsMessage.classList.remove('hidden');
        }
    });

    /* ==========================================================================
       2. CONTROLE DO MODAL DE AGENDAMENTO
       ========================================================================== */
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const serviceName = card.dataset.serviceName;
            modalServiceInput.value = serviceName; // Insere o nome do card no input do form
            bookingModal.classList.remove('hidden'); // Exibe o modal
        });
    });

    // Fechar Modal de Agendamento
    closeModalBtn.addEventListener('click', () => {
        bookingModal.classList.add('hidden');
        bookingForm.reset();
    });

    // Envio do formulário (Simulação)
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const service = modalServiceInput.value;
        const date = document.getElementById('bookingDate').value;
        const time = document.getElementById('bookingTime').value;

        alert(`Sucesso!\nAgendamento confirmado para:\n${service}\nData: ${date} às ${time}`);
        
        bookingModal.classList.add('hidden');
        bookingForm.reset();
    });

    /* ==========================================================================
       3. CONTROLE DO MODAL DE VISUALIZAÇÃO EM CALENDÁRIO
       ========================================================================== */
    btnViewCalendar.addEventListener('click', () => {
        calendarModal.classList.remove('hidden');
    });

    // Fechar Modal de Calendário
    closeCalendarBtn.addEventListener('click', () => {
        calendarModal.classList.add('hidden');
    });

    // Fechar qualquer modal se clicar do lado de fora da caixinha branca
    window.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            bookingModal.classList.add('hidden');
            bookingForm.reset();
        }
        if (e.target === calendarModal) {
            calendarModal.classList.add('hidden');
        }
    });
});