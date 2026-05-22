window.addEventListener('load', () => {
    const loader = document.getElementById('loader-wrapper');
    loader.classList.add('loader-hidden');
});

const toggleBtn = document.getElementById('menuToggleBtn');
const drawer = document.getElementById('dropdownDrawer');

toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    drawer.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
        drawer.classList.remove('active');
    }
});
