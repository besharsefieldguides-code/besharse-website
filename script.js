document.addEventListener('DOMContentLoaded', () => {
    // --- PAGE LOADER HANDLER ---
    const loader = document.getElementById('page-loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => loader.classList.add('fade-out'), 250);
        });
    }

    // --- HAMBURGER TOGGLE LOGIC ---
    const menuToggle = document.getElementById('menuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (menuToggle && dropdownMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
    }

    document.addEventListener('click', () => {
        if (dropdownMenu) dropdownMenu.classList.remove('show');
    });

    // --- INTER-TAB SPEED SPIN OVERLAY TRIGGER ---
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('javascript:') && link.target !== '_blank') {
                e.preventDefault();
                if (loader) loader.classList.remove('fade-out');
                setTimeout(() => { window.location.href = href; }, 200);
            }
        });
    });
});
