// --- SIMULATED BACKEND DATABASE ENGINE ---
// In a real app, this lives on a server. We use localStorage for the prototype.
const dbManager = {
    init: () => {
        if (!localStorage.getItem('bfg_users')) {
            // Seed database with a dummy user for demonstration
            const seedUsers = [
                { id: 'usr_1', name: 'John Doe', email: 'john@example.com', pass: '1234', ip: '192.168.0.45', status: 'active' },
                { id: 'usr_2', name: 'Rule Breaker', email: 'bad@example.com', pass: '1234', ip: '10.0.0.88', status: 'suspended' }
            ];
            localStorage.setItem('bfg_users', JSON.stringify(seedUsers));
        }
    },
    getUsers: () => JSON.parse(localStorage.getItem('bfg_users')) || [],
    saveUsers: (users) => localStorage.setItem('bfg_users', JSON.stringify(users)),
    generateMockIP: () => `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`
};

dbManager.init();

// --- STATE & AUTHENTICATION MANAGEMENT ENGINE ---
const authManager = {
    isLoggedIn: () => localStorage.getItem('isLoggedIn') === 'true',
    getUserName: () => localStorage.getItem('userName') || 'User Account',
    getUserEmail: () => localStorage.getItem('userEmail') || '',
    
    // Explicit Validation Login Routing Framework
    validateAndLogin: (email, password, isRegistering = false, name = '') => {
        const cleanEmail = email.trim().toLowerCase();
        const users = dbManager.getUsers();
        
        // Admin Master Bypass
        if (cleanEmail === 'austinbmatthew1811@gmail.com' && password === 'Matthew#2024') {
            authManager.setSession('Admin', cleanEmail);
            return { success: true };
        }

        if (isRegistering) {
            // Check if user exists
            if (users.find(u => u.email === cleanEmail)) {
                return { success: false, message: 'Email already registered.' };
            }
            // Create new user
            const newUser = {
                id: 'usr_' + Date.now(),
                name: name,
                email: cleanEmail,
                pass: password,
                ip: dbManager.generateMockIP(),
                status: 'active'
            };
            users.push(newUser);
            dbManager.saveUsers(users);
            authManager.setSession(name, cleanEmail);
            return { success: true };
        } else {
            // Login Logic
            const user = users.find(u => u.email === cleanEmail && u.pass === password);
            if (user) {
                if (user.status === 'banned') return { success: false, message: 'Your account and IP have been permanently banned.' };
                if (user.status === 'suspended') return { success: false, message: 'Your account is currently suspended.' };
                
                authManager.setSession(user.name, user.email);
                return { success: true };
            }
            return { success: false, message: 'Invalid credentials.' };
        }
    },

    setSession: (name, email) => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
    },

    signOut: () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        window.location.href = 'index.html'; // Force redirect to home on sign out
    }
};

// --- SESSION WATCHDOG (LIVE KICK/BAN ENFORCEMENT) ---
// This continuously checks if an admin banned the logged-in user in another tab
function startSessionWatchdog() {
    setInterval(() => {
        if (authManager.isLoggedIn() && authManager.getUserName() !== 'Admin') {
            const currentEmail = authManager.getUserEmail();
            const users = dbManager.getUsers();
            const userRecord = users.find(u => u.email === currentEmail);

            if (!userRecord) {
                alert("CRITICAL: Your account has been deleted by an Administrator.");
                authManager.signOut();
            } else if (userRecord.status === 'banned') {
                alert("NOTICE: Your account has been permanently BANNED by an Administrator. You are being disconnected.");
                authManager.signOut();
            } else if (userRecord.status === 'suspended') {
                alert("NOTICE: Your account has been SUSPENDED. Please contact support. You are being disconnected.");
                authManager.signOut();
            }
        }
    }, 2000); // Check every 2 seconds
}

document.addEventListener('DOMContentLoaded', () => {
    // Start live enforcement
    startSessionWatchdog();

    // Loader logic
    const loader = document.getElementById('page-loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 400); 
        }, 600);
    }

    // UI Updates based on Login state
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const profileLabel = document.getElementById('profileLabel');
    const manageBtn = document.getElementById('manageBtn');

    if (authManager.isLoggedIn() && profileLabel) {
        profileLabel.textContent = authManager.getUserName();
        
        // Admin conditional rendering
        if (manageBtn && authManager.getUserName() === 'Admin') {
            manageBtn.style.display = 'flex';
        }
    }

    // Dropdown Toggling
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!profileGroup.contains(e.target)) {
                profileDropdown.classList.remove('show');
            }
        });
    }

    // Auth Page Tab Switching
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

    // Admin Page Initializer
    if (document.getElementById('adminTableBody')) {
        renderAdminTable();
    }
});

// --- ENGINE CONTROLLER DISPATCH ENTRY POINTS ---
function processAuthForm(formId) {
    let response;

    if (formId === 'login') {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        response = authManager.validateAndLogin(email, pass, false);
    } else {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-password').value;
        response = authManager.validateAndLogin(email, pass, true, name);
    }

    if (response.success) {
        window.location.href = 'index.html';
    } else {
        alert(response.message);
    }
}

function handleSignOut() {
    authManager.signOut();
}

function switchAccount() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.location.href = 'auth.html';
}

// --- ADMIN CONTROL PANEL LOGIC ---
function renderAdminTable() {
    // Security check - kick out non-admins trying to access the page
    if (authManager.getUserName() !== 'Admin') {
        window.location.href = 'index.html';
        return;
    }

    const tbody = document.getElementById('adminTableBody');
    const users = dbManager.getUsers();
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No registered users found.</td></tr>`;
        return;
    }

    users.forEach(user => {
        let statusClass = 'status-active';
        if (user.status === 'suspended') statusClass = 'status-suspended';
        if (user.status === 'banned') statusClass = 'status-banned';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td style="font-family: monospace; color: rgba(255,255,255,0.6);">${user.ip}</td>
            <td><span class="status-badge ${statusClass}">${user.status.toUpperCase()}</span></td>
            <td>
                <select class="admin-action-select" onchange="handleAdminAction('${user.id}', this.value); this.value='';">
                    <option value="" disabled selected>Actions...</option>
                    <option value="active">Set Active</option>
                    <option value="suspended">Suspend User</option>
                    <option value="banned">Ban User & IP</option>
                    <option value="delete">Delete Account</option>
                </select>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function handleAdminAction(userId, action) {
    if (!action) return;
    
    let users = dbManager.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return;

    if (action === 'delete') {
        if (confirm(`Are you sure you want to completely delete ${users[userIndex].name}'s account? This cannot be undone.`)) {
            users.splice(userIndex, 1);
        }
    } else {
        users[userIndex].status = action;
        // The watchdog running on the user's browser will pick up this status change instantly
    }

    dbManager.saveUsers(users);
    renderAdminTable(); // Refresh UI
}
