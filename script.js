// STATE MATRIX [cite: 9]
let currentSlideIndex = 0;
const totalSlidesCount = 6; 
const slideIntervalTime = 10000; 
let sliderTimer;

// DOM TRANSFORMATION [cite: 9]
function updateSlider() {
    const track = document.getElementById("slider-track");
    const dots = document.getElementsByClassName("dot");
    if (!track) return;
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    for (let i = 0; i < dots.length; i++) dots[i].classList.remove("active");
    if (dots[currentSlideIndex]) dots[currentSlideIndex].classList.add("active");
}

function changeSlide(direction) {
    currentSlideIndex = (currentSlideIndex + direction + totalSlidesCount) % totalSlidesCount;
    updateSlider();
    resetTimer();
}

function setSlide(index) {
    currentSlideIndex = index;
    updateSlider();
    resetTimer();
}

function startTimer() { sliderTimer = setInterval(() => changeSlide(1), slideIntervalTime); }
function resetTimer() { clearInterval(sliderTimer); startTimer(); }

// NAVBAR SELECTION [cite: 35]
function selectTab(clickedTabId) {
    const allTabs = document.getElementsByClassName('nav-item');
    for (let i = 0; i < allTabs.length; i++) allTabs[i].classList.remove('active-tab');
    const activeTab = document.getElementById(clickedTabId);
    if (activeTab) activeTab.classList.add('active-tab');
    sessionStorage.setItem('selectedNavbarTab', clickedTabId);
}

function applySavedTabHighlight() {
    const activeTabId = sessionStorage.getItem('selectedNavbarTab') || 'tab-home';
    const activeTab = document.getElementById(activeTabId);
    if (activeTab) activeTab.classList.add('active-tab');
}

// INITIALIZATION [cite: 21]
function hideLoadingScreen() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) { overlay.style.opacity = '0'; setTimeout(() => overlay.style.display = 'none', 500); }
}

window.onload = function() {
    updateSlider(); startTimer(); applySavedTabHighlight(); hideLoadingScreen();
};
