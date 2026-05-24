// --- AUTHENTICATION MOCK ENGINE ---
const authManager = {
    isLoggedIn: () => localStorage.getItem('isLoggedIn') === 'true',
    signIn: () => {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'index.html';
    },
    signOut: () => {
        localStorage.removeItem('isLoggedIn');
        window.location.reload();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // --- PAGE LOADER ---
    const loader = document.getElementById('page-loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => loader.classList.add('fade-out'), 300);
        });
    }

    // --- PROFILE ICON LOGIC ---
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (authManager.isLoggedIn()) {
                // If logged in, show the 3-button menu
                profileDropdown.classList.toggle('show');
            } else {
                // If logged out, go to sign in page
                window.location.href = 'auth.html';
            }
        });
    }

    // --- DROPDOWN (HAMBURGER) ---
    const menuToggle = document.getElementById('menuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
    }

    // Close menus on outside click
    document.addEventListener('click', () => {
        if (profileDropdown) profileDropdown.classList.remove('show');
        if (dropdownMenu) dropdownMenu.classList.remove('show');
    });

    // --- AUTH TAB SWITCHING ---
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (tabLogin) {
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

// --- BUTTON ACTIONS ---
function handleAuthSubmit() {
    // This simulates a successful login
    authManager.signIn();
}

function handleSignOut() {
    authManager.signOut();
}

function switchAccount() {
    // Switches accounts by clearing session and going back to login
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'auth.html';
}
