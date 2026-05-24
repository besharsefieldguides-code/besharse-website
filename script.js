// --- CENTRAL DATA STORE & AUTH MANAGEMENT ENGINE ---
const authManager = {
    isLoggedIn: () => localStorage.getItem('isLoggedIn') === 'true',
    getUserName: () => localStorage.getItem('userName') || 'User Account',
    isAdmin: () => localStorage.getItem('userRole') === 'ADMIN',
    
    validateAndLogin: (email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        
        // Exact Hardcoded Rule Verification Check Matching Your Requirements
        if (cleanEmail === 'austinbmatthew1811@gmail.com' && password === 'Matthew#2024') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', 'Admin');
            localStorage.setItem('userRole', 'ADMIN');
            return true;
        } 
        
        // Generic Sandbox Standard Registration Flow
        if (cleanEmail !== '' && password.length >= 4) {
            const extractedName = cleanEmail.split('@')[0];
            const structuredName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', structuredName);
            localStorage.setItem('userRole', 'USER');
            
            // Register details into mock global tracking database instantly
            mockDB.addUser(structuredName, cleanEmail);
            return true;
        }
        return false;
    },

    signOut: () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        window.location.href = 'index.html';
    }
};

// --- MOCK PERSISTENT USER REGISTRY DATABASE DATABASE ---
const mockDB = {
    getUsers: () => {
        let current = localStorage.getItem('mock_user_registry');
        if (!current) {
            // High-fidelity standard production mock baseline initialization setup
            const seedData = [
                { id: 1, name: 'Austin Matthew', email: 'austinbmatthew1811@gmail.com', role: 'ADMIN', status: 'Active' },
                { id: 2, name: 'Sarah Jenkins', email: 's.jenkins@fieldresearch.org', role: 'USER', status: 'Active' },
                { id: 3, name: 'Marcus Vance', email: 'vancem@naturewildlife.net', role: 'USER', status: 'Suspended' },
                { id: 4, name: 'David Miller', email: 'miller_d@monetteventures.com', role: 'USER', status: 'Active' }
            ];
            localStorage.setItem('mock_user_registry', JSON.stringify(seedData));
            return seedData;
        }
        return JSON.parse(current);
    },
    saveUsers: (data) => {
        localStorage.setItem('mock_user_registry', JSON.stringify(data));
    },
    addUser: (name, email) => {
        let users = mockDB.getUsers();
        if(!users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            users.push({ id: Date.now(), name: name, email: email, role: 'USER', status: 'Active' });
            mockDB.saveUsers(users);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // --- TRANSITION LOADER DISPATCHER ---
    const loader = document.getElementById('page-loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => loader.classList.add('fade-out'), 250);
        });
    }

    // --- RE-EVALUATE AND INJECT CHANNELS ACCORDING TO USER ROLES ---
    const profileLabel = document.getElementById('profileLabel');
    if (profileLabel) {
        if (authManager.isLoggedIn()) {
            profileLabel.textContent = authManager.getUserName();
            
            // IF USER ROLE IS DETECTED AS ADMIN -> EXECUTING MANAGEMENT BUTTON LINKS GENERATION
            if (authManager.isAdmin()) {
                injectAdminControls();
            }
        } else {
            profileLabel.textContent = 'Sign In';
        }
    }

    // --- RENDER ADMIN CONTROLS INTERFACE SCREEN ---
    if (window.location.pathname.includes('admin.html')) {
        // Enforce basic dashboard route security lock protection framework
        if (!authManager.isAdmin()) {
            window.location.href = 'index.html';
        } else {
            renderAdminTable();
        }
    }

    // --- INTERACTION HOOKS AND EVENT ROUTERS ---
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (authManager.isLoggedIn()) {
                profileDropdown.classList.toggle('show');
            } else {
                window.location.href = 'auth.html';
            }
        });
    }

    const menuToggle = document.getElementById('menuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (menuToggle && dropdownMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
    }

    document.addEventListener('click', () => {
        if (profileDropdown) profileDropdown.classList.remove('show');
        if (dropdownMenu) dropdownMenu.classList.remove('show');
    });

    // --- LOADER FOR INTERNAL HYPERLINKS NAVIGATION ---
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
});

// --- ADMIN CONTROL BUTTON CONTEXT INSERTION ENGINE ---
function injectAdminControls() {
    const desktopContainer = document.getElementById('desktopNavLinks');
    const mobileContainer = document.getElementById('mobileAdminPlaceholder');

    // Generate link for standard display navbar layouts
    if (desktopContainer && !document.getElementById('adminManageLinkDesk')) {
        const li = document.createElement('li');
        li.innerHTML = '<a href="admin.html" id="adminManageLinkDesk" class="admin-link-highlight"><i class="fas fa-shield-alt"></i> Manage</a>';
        desktopContainer.appendChild(li);
    }

    // Generate link line item layout inside the mobile slider panel list container
    if (mobileContainer && !document.getElementById('adminManageLinkMob')) {
        mobileContainer.innerHTML = '<a href="admin.html" id="adminManageLinkMob" class="admin-link-highlight"><i class="fas fa-shield-alt"></i> Manage Dashboard</a>';
    }
}

// --- RENDERING ROUTINES FOR THE USER ACCOUNTS DATAGRID SHEET ---
function renderAdminTable() {
    const targetBody = document.getElementById('admin-user-rows');
    if (!targetBody) return;

    const dataset = mockDB.getUsers();
    targetBody.innerHTML = '';

    let banCounter = 0;

    dataset.forEach(user => {
        if (user.status === 'Banned') banCounter++;

        const isUserAdmin = user.role === 'ADMIN';
        const actionsHtml = isUserAdmin ? 
            `<em style="font-size:0.8rem; color:rgba(255,255,255,0.3)">System Owner Protected</em>` : 
            `<div class="mod-actions-group">
                <button class="btn-mod suspend" onclick="modAlterStatus(${user.id}, 'Suspended')">Suspend</button>
                <button class="btn-mod ban" onclick="modAlterStatus(${user.id}, 'Banned')">Ban</button>
                <button class="btn-mod remove" onclick="modDeleteRecord(${user.id})">Remove</button>
             </div>`;

        let statusClass = 'status-active';
        if (user.status === 'Suspended') statusClass = 'status-suspended';
        if (user.status === 'Banned') statusClass = 'status-banned';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="user-meta-cell">
                    <i class="fas ${isUserAdmin ? 'fa-user-shield' : 'fa-user'}"></i>
                    <span>${user.name}</span>
                </div>
            </td>
            <td>rgba(${user.email})</td>
            <td><span class="badge ${isUserAdmin ? 'role-admin' : 'role-user'}">${user.role}</span></td>
            <td><span class="badge ${statusClass}">${user.status}</span></td>
            <td class="text-right">${actionsHtml}</td>
        `;
        targetBody.appendChild(row);
    });

    // Refresh Dashboard Status Summary Numerical Display Blocks
    document.getElementById('stat-total').textContent = dataset.length;
    document.getElementById('stat-banned').textContent = banCounter;
}

// --- MODERATION ACTION INTERACTIVE LOGIC EXECUTORS ---
function modAlterStatus(id, targetStatus) {
    let users = mockDB.getUsers();
    users = users.map(u => {
        if(u.id === id) u.status = targetStatus;
        return u;
    });
    mockDB.saveUsers(users);
    renderAdminTable();
}

function modDeleteRecord(id) {
    if(confirm("Are you absolutely sure you want to completely drop this user record data line from the master system storage layer?")) {
        let users = mockDB.getUsers();
        users = users.filter(u => u.id !== id);
        mockDB.saveUsers(users);
        renderAdminTable();
    }
}

// --- DISPATCH CONTROLLERS ---
function processAuthForm(formId) {
    const emailValue = (formId === 'login') ? document.getElementById('login-email').value : document.getElementById('reg-email').value;
    const passValue = (formId === 'login') ? document.getElementById('login-password').value : document.getElementById('reg-password').value;

    if (authManager.validateAndLogin(emailValue, passValue)) {
        window.location.href = 'index.html';
    } else {
        alert('Authentication failed. Please check your credentials.');
    }
}

function handleSignOut() { authManager.signOut(); }
function switchAccount() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    window.location.href = 'auth.html';
}
