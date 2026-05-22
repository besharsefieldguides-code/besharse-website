document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const menuScreen = document.getElementById('menu-screen');
    const progressFill = document.getElementById('progress-fill');
    
    let progress = 0;
    
    // Simulate loading progress
    const interval = setInterval(() => {
        progress += 2;
        progressFill.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            transitionToMenu();
        }
    }, 50);

    function transitionToMenu() {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            menuScreen.classList.remove('hidden');
        }, 500);
    }
});
