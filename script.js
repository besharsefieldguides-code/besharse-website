document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. GLOBAL LOADER MANAGEMENT ---
    const loader = document.getElementById('page-loader');
    
    // Smoothly fade out spinner overlay once layout construction completes
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('fade-out');
            }, 200); // Tiny pause guarantees visual stabilization first
        });
    }

    // Capture all outbound and inner link interactions to prompt spin animations
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Check to skip default anchor click triggers, phone links, or dead hashes
            if (href && !href.startsWith('#') && !href.startsWith('javascript:') && link.target !== '_blank') {
                e.preventDefault();
                if (loader) {
                    loader.classList.remove('fade-out'); // Re-trigger smooth visual loader spin block
                }
                setTimeout(() => {
                    window.location.href = href;
                }, 250); // Small timeout allows loader animation to render gracefully before redirect
            }
        });
    });

    // --- 2. NAVIGATION BAR DROPDOWN ---
    const menuToggle = document.getElementById('menuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (menuToggle && dropdownMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        // Safe auto-close interaction frame
        document.addEventListener('click', (e) => {
            if (!dropdownMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // --- 3. AUTHENTICATION TAB SWITCHING LOGIC ---
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (tabLogin && tabRegister && loginForm && registerForm) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            loginForm.classList.add('active-form');
            registerForm.classList.remove('active-form');
        });

        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            registerForm.classList.add('active-form');
            loginForm.classList.remove('active-form');
        });
    }
});
