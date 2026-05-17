// ==========================================
// 1. AUTOMATIC IMAGE SLIDESHOW CONFIGURATION
// ==========================================

// Array containing your slideshow image filenames directly from your GitHub root directory
const images = [
    "url('forest.jpg')",    // Replace with your exact first filename
    "url('mountains.jpg')", // Replace with your exact second filename
    "url('wildlife.jpg')"   // Replace with your exact third filename
];

let currentSlideIndex = 0;
const slideIntervalTime = 10000; // 10 seconds slider transition gap
let sliderTimer;

function updateSlider() {
    const sliderContainer = document.getElementById("hero-slider");
    const dots = document.getElementsByClassName("dot");

    if (!sliderContainer) return;

    // Apply background image alongside a standard dark overlay tint
    sliderContainer.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), ${images[currentSlideIndex]}`;

    // Update active state class on the slideshow bullet points
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active");
    }
    if (dots[currentSlideIndex]) {
        dots[currentSlideIndex].classList.add("active");
    }
}

function changeSlide(direction) {
    currentSlideIndex += direction;
    if (currentSlideIndex >= images.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = images.length - 1;
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
// 2. REFRESH & PERSISTENT NAVIGATION LOGIC
// ==========================================

// This function runs when any link is clicked to trigger the fast refresh
function handleTabRefresh(clickedTabId) {
    // Save the identity of the clicked tab into temporary browser session memory
    sessionStorage.setItem('selectedNavbarTab', clickedTabId);
    
    // Turn on the white screen layout containing the spinning olive green circle
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    // Refresh the webpage after a crisp 0.4 second delay
    setTimeout(() => {
        window.location.reload();
    }, 400);
}

// This function runs immediately after the reload finishes to restore the highlight color
function applySavedTabHighlight() {
    // Look inside the browser memory to see if a specific tab was saved
    const savedTabId = sessionStorage.getItem('selectedNavbarTab');
    
    // Remove the highlighted class from all tabs to keep things clean
    const allTabs = document.getElementsByClassName('nav-item');
    for (let i = 0; i < allTabs.length; i++) {
        allTabs[i].classList.remove('active-tab');
    }
    
    // Check if the saved item exists. If it does, highlight it. 
    // If memory is empty (like a first-time visit), default highlight to the HOME tab.
    if (savedTabId && document.getElementById(savedTabId)) {
        document.getElementById(savedTabId).classList.add('active-tab');
    } else {
        const homeTab = document.getElementById('tab-home');
        if (homeTab) {
            homeTab.classList.add('active-tab');
        }
    }
}


// ==========================================
// 3. INITIALIZATION ENGINE
// ==========================================

// Fires off all systems simultaneously the millisecond the page reloads cleanly
window.onload = function() {
    updateSlider();            // Renders the current slideshow frame image
    startTimer();              // Fire up the 10-second automation loop counter
    applySavedTabHighlight();  // Checks memory and applies the solid Olive Green background box
};
