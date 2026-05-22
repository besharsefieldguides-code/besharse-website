/**
 * Besharse Field Guides - Navigation Drawer Interaction Logic
 * Handles interactive opening, closing, and automatic click-outside detection.
 */

// Initialize reference nodes from the DOM
const toggleBtn = document.getElementById('menuToggleBtn');
const drawer = document.getElementById('dropdownDrawer');

// Toggle dropdown class drawer state on direct button activation click triggers
toggleBtn.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevents document click trigger event from immediately refiring
    drawer.classList.toggle('active');
});

// Automatically close the dropdown menu drawer if a user clicks anywhere outside the panel boundaries
document.addEventListener('click', (event) => {
    const isClickInsideDrawer = drawer.contains(event.target);
    const isClickInsideButton = toggleBtn.contains(event.target);

    if (!isClickInsideDrawer && !isClickInsideButton) {
        drawer.classList.remove('active');
    }
});
