/**
 * Besharse Field Guides - Navigation Logic
 */

const toggleBtn = document.getElementById('menuToggleBtn');
const drawer = document.getElementById('dropdownDrawer');

// Toggle the 'active' class on the drawer when the hamburger is clicked
toggleBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    drawer.classList.toggle('active');
});

// Close the drawer if the user clicks anywhere else on the screen
document.addEventListener('click', (event) => {
    if (!drawer.contains(event.target) && !toggleBtn.contains(event.target)) {
        drawer.classList.remove('active');
    }
});
