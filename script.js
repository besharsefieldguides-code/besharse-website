// ==========================================
// 1. HORIZONTAL PULL SLIDESHOW LOGIC
// ==========================================

// STATE MATRIX: Global values tracking active slides and interval handlers
let currentSlideIndex = 0;
const totalSlidesCount = 6; 
const slideIntervalTime = 10000; 
let sliderTimer;

// DOM TRANSFORMATION: Moves the slider track horizontally based on current index
function updateSlider() {
    const track = document.getElementById("slider-track");
    const dots = document.getElementsByClassName("dot");
    if (!track) return;
    
    // Smooth Pull Transformation Equation
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    
    // Cycle matching pagination point rings active status
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active");
    }
    if (dots[currentSlideIndex]) {
        dots[currentSlideIndex].classList.add("active");
    }
}

// NAVIGATION MUTATION: Advances or reverses the slider via interactive arrow triggers
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

// PAGINATION ROUTING: Forces the slider directly to a specific target index node
function setSlide(index) {
    currentSlideIndex = index;
    updateSlider();
    resetTimer();
}

// CHRONOS SYSTEM: Initializes the automatic sliding background rotation loop
function startTimer() {
    sliderTimer = setInterval(() => {
        changeSlide(1);
    }, slideIntervalTime);
}

// CHRONOS RESET: Clears active slide timers to protect view pacing on manual interaction
function resetTimer() {
    clearInterval(sliderTimer);
    startTimer();
}

// ==========================================
// 2. PROTOTYPE NAVBAR SELECTION TRACKING
// ==========================================

// STATE ENGINE: Updates visual navbar tabs and updates session data storage paths
function selectTab(clickedTabId) {
    const allTabs = document.getElementsByClassName('nav-item');
    
    // Wipe highlight color configurations from all tags
    for (let i = 0; i < allTabs.length; i++) {
        allTabs[i].classList.remove('active-tab');
    }
    
    // Add the active tab color override matrix
    const activeTab = document.getElementById(clickedTabId);
    if (activeTab) {
        activeTab.classList.add('active-tab');
    }
    
    // Save state index key to local memory layout
    sessionStorage.setItem('selectedNavbarTab', clickedTabId);

    // Update URL bar path values quietly without forcing document jumps
    const hashName = clickedTabId.replace('tab-', '#');
    window.history.pushState(null, null, hashName);
}

// PERSISTENCE RESOLUTION: Synchronizes UI state with historical storage or URL hashes
function applySavedTabHighlight() {
    const currentHash = window.location.hash;
    
    // Hardening Check: Destroys old session strings if user returns to dashboard fresh
    if (!currentHash || currentHash === '' || currentHash === '#home') {
        sessionStorage.removeItem('selectedNavbarTab');
    }

    const activeTabId = sessionStorage.getItem('selectedNavbarTab');
    const allTabs = document.getElementsByClassName('nav-item');
    
    for (let i = 0; i < allTabs.length; i++) {
        allTabs[i].classList.remove('active-tab');
    }
    
    // Restore highlighted active element, fallback to standard Home tab highlight
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

// DOM TRANSITION: Fades and removes the application load mask on window completion
function hideLoadingScreen() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0'; 
        setTimeout(() => {
            loadingOverlay.style.display = 'none'; 
        }, 500); 
    }
}

// RUNTIME ENTRYPOINT: Safely executes core systems on document completely loaded event
window.onload = function() {
    try {
        updateSlider();            
        startTimer();              
        applySavedTabHighlight();  
    } catch (error) {
        console.error("Interface execution error safely bypassed:", error);
    } finally {
        // Crucial Loop Fix: Guarantees overlay destruction under all initialization paths
        hideLoadingScreen();
    }
};
