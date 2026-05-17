/* --- Base Reset & Fonts --- */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body, html {
    height: 100%;
    background-color: #f4f6f0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* --- Loading Spinner Overlay Styles --- */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.85); 
    z-index: 9999;
    display: flex; 
    justify-content: center;
    align-items: center;
    opacity: 1;
    transition: opacity 0.5s ease;
}

.spinner {
    width: 45px;
    height: 45px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #708238; /* Olive Green */
    border-radius: 50%;
    animation: spin 0.7s linear infinite; 
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* --- Navigation Bar --- */
.navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
    padding: 0 20px;
    height: 60px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
}

.nav-title {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 1.3rem;
    color: #708238; 
    white-space: nowrap;
    padding-right: 25px;
    letter-spacing: -0.5px;
}

.nav-links {
    display: flex;
    flex-grow: 1;
    height: 100%;
    align-items: center;
}

.nav-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-decoration: none;
    color: #000000;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-align: center;
    text-transform: uppercase; 
    transition: background-color 0.2s ease, color 0.2s ease;
}

.nav-item:hover {
    background-color: #708238; 
    color: #ffffff;
}

.nav-item.active-tab {
    background-color: #708238; 
    color: #ffffff;             
}

.nav-links .donate-btn {
    border-left: 1px solid #eeeeee;
    color: #708238; /* Exact Olive Green */
}

/* --- Hero Slider Section --- */
.hero-section {
    height: 100vh; 
    padding-top: 60px; 
    position: relative;
    display: flex;
    align-items: center; 
    justify-content: flex-start; 
    padding-left: 25px; 
    overflow: hidden; /* Prevents background scale leaking during transitions */
}

/* Isolated background rendering layer */
.hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 1;
}

.hero-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    z-index: 10; /* Ensures content displays clearly above the background layer */
}

.hero-title {
    font-family: 'Montserrat', sans-serif;
    color: #ffffff;
    font-size: 3rem; 
    line-height: 1.15;
    font-weight: 800;
    margin-bottom: 25px;
    letter-spacing: -1px;
    text-shadow: 2px 2px 12px rgba(0, 0, 0, 0.7);
}

.btn-read-more {
    font-family: 'Montserrat', sans-serif;
    display: inline-block;
    background-color: #708238; 
    color: #ffffff;
    text-decoration: none;
    padding: 14px 38px;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-radius: 4px;
    transition: background-color 0.3s ease;
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
}

.btn-read-more:hover {
    background-color: #55632a; 
}

/* --- Slider Controls Container --- */
.slider-controls-container {
    position: absolute;
    bottom: 40px;
    right: 25px; 
    display: flex;
    align-items: center;
    gap: 18px;
    z-index: 10; /* Keeps controls completely interactive above the animation background */
    background-color: rgba(0, 0, 0, 0.3);
    padding: 12px 18px;
    border-radius: 4px;
}

.slider-arrow {
    background: transparent;
    color: #ffffff;
    border: 1px solid #ffffff; 
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.slider-arrow:hover {
    background-color: #708238;
    border-color: #708238;
    color: #ffffff;
}

.slider-dots {
    display: flex;
    gap: 10px;
}

.dot {
    width: 14px;
    height: 14px;
    background: transparent;
    border: 1px solid #ffffff; 
    cursor: pointer;
    transition: all 0.3s ease;
}

.dot:hover, .dot.active {
    background-color: #708238;
    border-color: #708238;
}

/* --- Slider Slide Animation Rules --- */
.slide-fade {
    animation: imageFade 0.8s ease-in-out forwards;
}

@keyframes imageFade {
    0% {
        opacity: 0.4;
        transform: scale(1.02); /* Smooth zoom-in start */
    }
    100% {
        opacity: 1;
        transform: scale(1);    /* Settles cleanly to absolute center */
    }
}

/* --- Core Content Section Styles --- */
.content-container {
    padding: 40px 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.site-section {
    padding: 60px 20px;
    margin-bottom: 40px;
    background-color: #ffffff;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    
    /* Offset scroll target location to clear the 60px fixed top navbar */
    scroll-margin-top: 80px; 
}

.section-title {
    font-family: 'Montserrat', sans-serif;
    color: #708238;
    font-size: 2rem;
    margin-bottom: 20px;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 10px;
}

.section-text {
    font-size: 1rem;
    line-height: 1.6;
    color: #4a5568;
}

/* --- Flexible Content Grid Layout --- */
.content-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 20px;
}

.card {
    flex: 1;
    min-width: 280px;
    background-color: #f4f6f0;
    padding: 20px;
    border-left: 4px solid #708238;
    border-radius: 4px;
}

.card h3 {
    font-family: 'Montserrat', sans-serif;
    margin-bottom: 10px;
    color: #000000;
}

.card p {
    font-size: 0.95rem;
    color: #4a5568;
    line-height: 1.5;
}
