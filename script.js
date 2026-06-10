document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const servicesGrid = document.getElementById('servicesGrid');
    const cards = servicesGrid.querySelectorAll('.card-services');

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const searchTerm = searchInput.value.toLowerCase().trim();

            cards.forEach(card => {
                const serviceName = card.dataset.serviceName.toLowerCase();
                if (serviceName.includes(searchTerm)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        }
    });
});