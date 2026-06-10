document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const servicesGrid = document.getElementById('servicesGrid');
    const cards = servicesGrid.querySelectorAll('.card-services');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Escuta o evento de digitação em tempo real
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let hasResults = false;

        // Se o campo estiver vazio, mostra todos os cards e remove o erro
        if (searchTerm === "") {
            cards.forEach(card => card.classList.remove('hidden'));
            noResultsMessage.classList.add('hidden');
            return;
        }

        // Filtra os cards baseando-se no que foi digitado
        cards.forEach(card => {
            const serviceName = card.dataset.serviceName.toLowerCase();
            
            if (serviceName.includes(searchTerm)) {
                card.classList.remove('hidden');
                hasResults = true; // Encontrou pelo menos um resultado
            } else {
                card.classList.add('hidden');
            }
        });

        // Mostra ou esconde a mensagem de "Não encontrado"
        if (hasResults) {
            noResultsMessage.classList.add('hidden');
        } else {
            noResultsMessage.classList.remove('hidden');
        }
    });
});