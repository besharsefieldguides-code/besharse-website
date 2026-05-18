let currentSlideIndex = 0;
const totalSlidesCount = 6;
let sliderTimer;

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

function startTimer() { sliderTimer = setInterval(() => changeSlide(1), 10000); }
function resetTimer() { clearInterval(sliderTimer); startTimer(); }

function selectTab(id) {
    const tabs = document.getElementsByClassName('nav-item');
    for (let t of tabs) t.classList.remove('active-tab');
    if (document.getElementById(id)) document.getElementById(id).classList.add('active-tab');
}

window.onload = () => {
    updateSlider(); startTimer();
    const loader = document.getElementById('loading-overlay');
    if (loader) { loader.style.opacity = '0'; setTimeout(() => loader.style.display = 'none', 500); }
};
