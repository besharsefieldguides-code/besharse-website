document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-links');

    if (!toggleButton || !navMenu) return;

    toggleButton.addEventListener('click', () => {
        // Toggle the visible class
        const isOpen = navMenu.classList.toggle('is-open');
        
        // Update ARIA attribute for accessibility
        toggleButton.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    const links = navMenu.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('is-open')) {
                navMenu.classList.remove('is-open');
                toggleButton.setAttribute('aria-expanded', 'false');
            }
        });
    });
});
