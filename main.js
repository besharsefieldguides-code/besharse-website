document.addEventListener('DOMContentLoaded', () => {
    const statusText = document.getElementById('status-text');
    const progressFill = document.getElementById('progress-fill');
    const loadingScreen = document.getElementById('loading-screen');
    const menuScreen = document.getElementById('menu-screen');

    const bootSequences = [
        "INITIALIZING WEBGL_CONTEXT...",
        "STREAMING ASSET_CHUNKS...",
        "SYNCING WEBRTC_NODES...",
        "CALIBRATING PHYSICS_ENGINE...",
        "FINALIZING SHADER_COMPILATION..."
    ];

    let progress = 0;
    let seqIndex = 0;

    const interval = setInterval(() => {
        progress += 1;
        progressFill.style.width = progress + '%';

        // Update status text dynamically
        if (progress % 20 === 0 && seqIndex < bootSequences.length) {
            statusText.innerText = bootSequences[seqIndex];
            seqIndex++;
        }

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(transitionToMenu, 500);
        }
    }, 40);

    function transitionToMenu() {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            menuScreen.classList.remove('hidden');
        }, 800);
    }
});
