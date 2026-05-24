// --- STABLE SECURE ACCESS STORAGE CONTROLLER ---
const authManager = {
    isLoggedIn: () => localStorage.getItem('isLoggedIn') === 'true',
    getUserName: () => localStorage.getItem('userName') || 'User Account',
    isAdmin: () => localStorage.getItem('userRole') === 'ADMIN',
    
    validateAndLogin: (email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        
        // Locked High-Level Admin Identity Verification Check Rules
        if (cleanEmail === 'austinbmatthew1811@gmail.com' && password === 'Matthew#2024') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', 'Admin');
            localStorage.setItem('userRole', 'ADMIN');
            return true;
        } 
        
        // Standard Sandboxed Registration Account Pipeline
        if (cleanEmail !== '' && password.length >= 4) {
            const parsedPrefix = cleanEmail.split('@')[0];
            const profileDisplayTitle = parsedPrefix.charAt(0).toUpperCase() + parsedPrefix.slice(1);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', profileDisplayTitle);
            localStorage.setItem('userRole', 'USER');
            
            // Log directly into standard sandboxed data-store layer
            mockDB.addUser(profileDisplayTitle, cleanEmail);
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

// --- MODERN SANDBOX DATABASE INTEGRITY SHEET ---
const mockDB = {
    getUsers: () => {
        let registry = localStorage.getItem('besharse_users');
        // Initializing with clean empty array state as instructed (No default mock user templates)
        return registry ? JSON.parse(registry) : [];
    },
    saveUsers: (data) => {
        localStorage.setItem('besharse_users', JSON.stringify(data));
    },
    addUser: (name, email) => {
        let records = mockDB.getUsers();
        if(!records.some(r => r.email.toLowerCase() === email.toLowerCase())) {
            records.push({ id: Date.now(), name: name, email: email.toLowerCase(), role: 'USER', status: 'Active' });
            mockDB.saveUsers(records);
        }
    },
    alterStatus: (id, nextStatus) => {
        let records = mockDB.getUsers().map(user => {
            if (user.id === id) user.status = nextStatus;
            return user;
        });
        mockDB.saveUsers(records);
        renderAdminTable();
    },
    dropRecord: (id) => {
        if (confirm("Confirm removal of this user from database archives?")) {
            let records = mockDB.getUsers().filter(user => user.id !== id);
            mockDB.saveUsers(records);
            renderAdminTable();
        }
    }
};

// --- SYSTEM RUNTIME EVENT WIRE-UP ---
document.addEventListener('DOMContentLoaded', () => {
    // Structural transition element hook
    const loader = document.getElementById('page-loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => loader.classList.add('fade-out'), 200);
        });
    }

    // Nav component synchronization logic
    const profileLabel = document.getElementById('profileLabel');
    if (profileLabel) {
        if (authManager.isLoggedIn()) {
            profileLabel.textContent = authManager.getUserName();
            if (authManager.isAdmin()) {
                injectAdminManagementAnchors();
            }
        } else {
            profileLabel.textContent = 'Sign In';
        }
    }

    // Guard evaluation framework check for administrative directory routes
    if (window.location.pathname.includes('admin.html')) {
        if (!authManager.isAdmin()) {
            window.location.href = 'index.html';
        } else {
            renderAdminTable();
        }
    }

    // Navbar element dropdown interactions handler logic
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
});

// --- MENU BUTTON RUNTIME INJECTION WORKFLOW ---
function injectAdminManagementAnchors() {
    const desktopHook = document.getElementById('desktopNavLinks');
    const mobileHook = document.getElementById('mobileAdminPlaceholder');

    if (desktopHook && !document.getElementById('injectedDeskAdmin')) {
        const li = document.createElement('li');
        li.innerHTML = '<a href="admin.html" id="injectedDeskAdmin" class="admin-link-highlight"><i class="fas fa-shield-alt"></i> Manage</a>';
        desktopHook.appendChild(li);
    }

    if (mobileHook && !document.getElementById('injectedMobAdmin')) {
        mobileHook.innerHTML = '<a href="admin.html" id="injectedMobAdmin" class="admin-link-highlight"><i class="fas fa-shield-alt"></i> Manage Site</a>';
    }
}

// --- ADMINISTRATIVE ACCOUNTS LAYOUT INJECTOR ---
function renderAdminTable() {
    const tableBody = document.getElementById('admin-user-rows');
    const emptyPlaceholder = document.getElementById('admin-empty-view');
    if (!tableBody) return;

    const dataCollection = mockDB.getUsers();
    tableBody.innerHTML = '';

    if (dataCollection.length === 0) {
        if (emptyPlaceholder) emptyPlaceholder.style.display = 'block';
        document.getElementById('stat-total').textContent = '0';
        return;
    }

    if (emptyPlaceholder) emptyPlaceholder.style.display = 'none';

    dataCollection.forEach(user => {
        let badgeStateClass = 'status-active';
        if (user.status === 'Suspended') badgeStateClass = 'status-suspended';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:10px; font-weight:500;">
                    <i class="fas fa-user" style="opacity:0.5"></i>
                    <span>${user.name}</span>
                </div>
            </td>
            <td>${user.email}</td> <!-- FIXED: Extracted clean email string directly -->
            <td><span class="badge role-user">${user.role}</span></td>
            <td><span class="badge ${badgeStateClass}">${user.status}</span></td>
            <td class="text-right">
                <div class="mod-actions-group">
                    <button class="btn-mod suspend" onclick="mockDB.alterStatus(${user.id}, 'Suspended')">Suspend</button>
                    <button class="btn-mod remove" onclick="mockDB.dropRecord(${user.id})">Remove</button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    document.getElementById('stat-total').textContent = dataCollection.length;
}

// --- GLOBAL SIGN OUT FLOW PROCESSORS ---
function handleSignOut() { authManager.signOut(); }
function switchAccount() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    window.location.href = 'auth.html';
}
