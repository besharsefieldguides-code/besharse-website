const toggleBtn = document.getElementById('menuToggleBtn');
const drawer = document.getElementById('dropdownDrawer');
const navbar = document.querySelector('.navbar');

// Hamburger Toggle
toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    drawer.classList.toggle('active');
});

// Close drawer on outside click
document.addEventListener('click', (e) => {
    if (!drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
        drawer.classList.remove('active');
    }
});

// Professional Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = "rgba(45, 58, 25, 0.98)";
        navbar.style.height = "50px";
    } else {
        navbar.style.background = "rgba(85, 107, 47, 0.85)";
        navbar.style.height = "60px";
    }
});
