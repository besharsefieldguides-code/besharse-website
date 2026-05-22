const toggleBtn = document.getElementById('menuToggleBtn');
const drawer = document.getElementById('dropdownDrawer');

toggleBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    drawer.classList.toggle('active');
});

document.addEventListener('click', (event) => {
    if (!drawer.contains(event.target) && !toggleBtn.contains(event.target)) {
        drawer.classList.remove('active');
    }
});
