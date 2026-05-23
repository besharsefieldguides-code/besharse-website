// Toggle the dropdown menu visibility
document.getElementById('menuToggle').addEventListener('click', function(event) {
    document.getElementById('dropdownMenu').classList.toggle('show');
    event.stopPropagation();
});

// Close the dropdown if the user clicks anywhere else on the screen
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn') && !event.target.matches('.fa-bars')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}
