// ==========================================
// 1. HORIZONTAL PULL SLIDESHOW LOGIC
// ==========================================

let currentSlideIndex = 0;
const totalSlidesCount = 6; 
const slideIntervalTime = 10000; 
let sliderTimer;

function updateSlider() {
    const track = document.getElementById("slider-track");
    const dots = document.getElementsByClassName("dot");
    if (!track) return;
    
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active");
    }
    if (dots[currentSlideIndex]) {
        dots[currentSlideIndex].classList.add("active");
    }
}

function changeSlide(direction) {
    currentSlideIndex += direction;
    if (currentSlideIndex >= totalSlidesCount) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = totalSlidesCount - 1;
    }
    updateSlider();
    resetTimer();
}

function setSlide(index) {
    currentSlideIndex = index;
    updateSlider();
    resetTimer();
}

function startTimer() {
    sliderTimer = setInterval(() => {
        changeSlide(1);
    }, slideIntervalTime);
}

function resetTimer() {
    clearInterval(sliderTimer);
    startTimer();
}

// ==========================================
// 2. PROTOTYPE NAVBAR SELECTION TRACKING
// ==========================================

function selectTab(clickedTabId) {
    const allTabs = document.getElementsByClassName('nav-item');
    
    for (let i = 0; i < allTabs.length; i++) {
        allTabs[i].classList.remove('active-tab');
    }
    
    const activeTab = document.getElementById(clickedTabId);
    if (activeTab) {
        activeTab.classList.add('active-tab');
    }
    
    sessionStorage.setItem('selectedNavbarTab', clickedTabId);

    const hashName = clickedTabId.replace('tab-', '#');
    window.history.pushState(null, null, hashName);
}

function applySavedTabHighlight() {
    const currentHash = window.location.hash;
    
    // SAFE HARDENING: Clears stuck storage if hash is empty or explicitly #home
    if (!currentHash || currentHash === '' || currentHash === '#home') {
        sessionStorage.removeItem('selectedNavbarTab');
    }

    const activeTabId = sessionStorage.getItem('selectedNavbarTab');
    const allTabs = document.getElementsByClassName('nav-item');
    
    for (let i = 0; i < allTabs.length; i++) {
        allTabs[i].classList.remove('active-tab');
    }
    
    if (activeTabId && document.getElementById(activeTabId)) {
        document.getElementById(activeTabId).classList.add('active-tab');
    } else {
        const homeTab = document.getElementById('tab-home');
        if (homeTab) {
            homeTab.classList.add('active-tab');
        }
    }
}

// ==========================================
// 3. INITIALIZATION ENGINE & OVERLAY GUARD
// ==========================================

function hideLoadingScreen() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0'; 
        setTimeout(() => {
            loadingOverlay.style.display = 'none'; 
        }, 500); 
    }
}

window.onload = function() {
    try {
        updateSlider();            
        startTimer();              
        applySavedTabHighlight();  
    } catch (error) {
        console.error("Interface loop exception guard active:", error);
    } finally {
        // Unconditional execution ensures the screen never freezes
        hideLoadingScreen();
    }
};
