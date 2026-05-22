document.addEventListener('DOMContentLoaded', () => {
    const statusText = document.getElementById('status-text');
    const progressFill = document.getElementById('progress-fill');
    const loadingScreen = document.getElementById('loading-screen');
    const menuScreen = document.getElementById('menu-screen');

    const sequences = [
        "UPLINK_ESTABLISHED...",
        "DECRYPTING_SECURE_CHANNEL...",
        "ACCESSING_TERMINAL...",
        "SYSTEM_OVERRIDE_ACTIVE...",
        "READY_FOR_DEPLOYMENT..."
    ];

    let progress = 0;
    let seqIdx = 0;

    const interval = setInterval(() => {
        progress += 2;
        progressFill.style.width = progress + '%';

        if (progress % 20 === 0 && seqIdx < sequences.length) {
            statusText.innerText = sequences[seqIdx];
            seqIdx++;
        }

        if (progress >= 100) {
            clearInterval(interval);
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                menuScreen.classList.remove('hidden');
            }, 500);
        }
    }, 60);
});
