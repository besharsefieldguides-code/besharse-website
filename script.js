// --- STATE & AUTHENTICATION MANAGEMENT ENGINE ---
const authManager = {
    // Check session data tracking
    isLoggedIn: () => localStorage.getItem('isLoggedIn') === 'true',
    
    // Retrieve tracking user parameters
    getUserName: () => localStorage.getItem('userName') || 'User Account',
    
    // Explicit Validation Login Routing Framework
    validateAndLogin: (email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        
        // Admin Account Verification Ruleset
        if (cleanEmail === 'austinbmatthew1811@gmail.com' && password === 'Matthew#2024') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', 'Admin');
            return true;
        } 
        
        // Default Mock Registration Validation Fallback
        if (cleanEmail !== '' && password.length >= 4) {
            // Extracts name string segment safely out of email pattern
            const extractedName = cleanEmail.split('@')[0];
            const structuredName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', structuredName);
            return true;
        }
        
        return false;
    },

    signOut: () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        window.location.reload();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // --- PAGE LOADER HANDLER ---
    const loader = document.getElementById('page-loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => loader.classList.add('fade-out'), 250);
        });
    }

    // --- RE-EVALUATE PROFILE DISPLAY LABELS ---
    const profileLabel = document.getElementById('profileLabel');
    if (profileLabel) {
        if (authManager.isLoggedIn()) {
            profileLabel.textContent = authManager.getUserName();
        } else {
            profileLabel.textContent = 'Sign In';
        }
    }

    // --- PROFILE ICON INTERACTION ROUTER ---
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (authManager.isLoggedIn()) {
                // When signed in, toggle the dropdown menu (Shifted up 75%)
                profileDropdown.classList.toggle('show');
            } else {
                // When signed out, redirect directly to auth entry page
                window.location.href = 'auth.html';
            }
        });
    }

    // --- HAMBURGER TOGGLE LOGIC ---
    const menuToggle = document.getElementById('menuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (menuToggle && dropdownMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
    }

    // Intercept outside interface context mouse gestures to clear popup modals safely
    document.addEventListener('click', () => {
        if (profileDropdown) profileDropdown.classList.remove('show');
        if (dropdownMenu) dropdownMenu.classList.remove('show');
    });

    // --- INTER-TAB SPEED SPIN OVERLAY TRIGGER ---
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('javascript:') && link.target !== '_blank') {
                e.preventDefault();
                if (loader) loader.classList.remove('fade-out');
                setTimeout(() => { window.location.href = href; }, 200);
            }
        });
    });

    // --- AUTH FORM TABS LOGIC ---
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (tabLogin && tabRegister) {
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

// --- ENGINE CONTROLLER DISPATCH ENTRY POINTS ---
function processAuthForm(formId) {
    let emailValue = '';
    let passValue = '';

    if (formId === 'login') {
        emailValue = document.getElementById('login-email').value;
        passValue = document.getElementById('login-password').value;
    } else {
        emailValue = document.getElementById('reg-email').value;
        passValue = document.getElementById('reg-password').value;
    }

    const success = authManager.validateAndLogin(emailValue, passValue);
    if (success) {
        // Automatic routing home standard execution
        window.location.href = 'index.html';
    } else {
        alert('Authentication failed. Please verify credentials.');
    }
}

function handleSignOut() {
    authManager.signOut();
}

function switchAccount() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    window.location.href = 'auth.html';
}