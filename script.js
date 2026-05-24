const authManager = {
    isLoggedIn: () => localStorage.getItem('isLoggedIn') === 'true',
    getUserName: () => localStorage.getItem('userName') || 'User',
    isAdmin: () => localStorage.getItem('userRole') === 'ADMIN',
    
    validateAndLogin: (email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        
        if (cleanEmail === 'austinbmatthew1811@gmail.com' && password === 'Matthew#2024') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', 'Admin');
            localStorage.setItem('userRole', 'ADMIN');
            return true;
        } 
        
        if (cleanEmail !== '' && password.length >= 4) {
            const name = cleanEmail.split('@')[0];
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', name.charAt(0).toUpperCase() + name.slice(1));
            localStorage.setItem('userRole', 'USER');
            mockDB.addUser(localStorage.getItem('userName'), cleanEmail);
            return true;
        }
        return false;
    },

    signOut: () => {
        localStorage.clear();
        window.location.href = 'index.html';
    }
};

const mockDB = {
    getUsers: () => {
        const data = localStorage.getItem('user_registry');
        // Initial state: NO accounts except the logged in admin
        return data ? JSON.parse(data) : [];
    },
    saveUsers: (data) => localStorage.setItem('user_registry', JSON.stringify(data)),
    addUser: (name, email) => {
        let users = mockDB.getUsers();
        if(!users.find(u => u.email === email)) {
            users.push({ id: Date.now(), name, email, status: 'Active' });
            mockDB.saveUsers(users);
        }
    },
    removeUser: (id) => {
        let users = mockDB.getUsers().filter(u => u.id !== id);
        mockDB.saveUsers(users);
        renderAdminTable();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Loader
    const loader = document.getElementById('page-loader');
    window.addEventListener('load', () => setTimeout(() => loader.classList.add('fade-out'), 300));

    // Profile Label
    const profileLabel = document.getElementById('profileLabel');
    if (profileLabel) profileLabel.textContent = authManager.isLoggedIn() ? authManager.getUserName() : 'Sign In';

    // Dropdown Toggles
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (authManager.isLoggedIn()) profileDropdown.classList.toggle('show');
            else window.location.href = 'auth.html';
        });
    }

    // Admin Table Rendering
    if (window.location.pathname.includes('admin.html')) {
        if (!authManager.isAdmin()) window.location.href = 'index.html';
        else renderAdminTable();
    }
});

function renderAdminTable() {
    const tbody = document.getElementById('admin-user-rows');
    const emptyState = document.getElementById('empty-state');
    const users = mockDB.getUsers();

    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><b>${user.name}</b></td>
                <td>${user.email}</td> <td>User</td>
                <td>${user.status}</td>
                <td class="text-right">
                    <button class="btn-mod remove" onclick="mockDB.removeUser(${user.id})">Remove</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    document.getElementById('stat-total').textContent = users.length;
}

function handleSignOut() { authManager.signOut(); }
function processAuthForm(type) {
    const email = document.getElementById(type === 'login' ? 'login-email' : 'reg-email').value;
    const pass = document.getElementById(type === 'login' ? 'login-password' : 'reg-password').value;
    if (authManager.validateAndLogin(email, pass)) window.location.href = 'index.html';
    else alert('Login Failed');
}
