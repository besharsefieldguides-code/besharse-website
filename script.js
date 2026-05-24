const ADMIN_EMAIL = 'austinbmatthew1811@gmail.com';
const ADMIN_PASS = 'Matthew#2024';

const auth = {
    check: () => localStorage.getItem('isAuth') === 'true',
    isAdmin: () => localStorage.getItem('role') === 'ADMIN',
    getUser: () => localStorage.getItem('uName') || 'Guest',

    login: (email, pass) => {
        if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
            localStorage.setItem('isAuth', 'true');
            localStorage.setItem('role', 'ADMIN');
            localStorage.setItem('uName', 'Admin');
            return true;
        }
        if (email && pass.length >= 4) {
            localStorage.setItem('isAuth', 'true');
            localStorage.setItem('role', 'USER');
            localStorage.setItem('uName', email.split('@')[0]);
            db.saveUser(email);
            return true;
        }
        return false;
    },

    logout: () => {
        localStorage.clear();
        window.location.href = 'index.html';
    }
};

const db = {
    getUsers: () => JSON.parse(localStorage.getItem('user_db') || '[]'),
    saveUser: (email) => {
        let users = db.getUsers();
        if (!users.find(u => u.email === email)) {
            users.push({ id: Date.now(), name: email.split('@')[0], email: email, status: 'Active' });
            localStorage.setItem('user_db', JSON.stringify(users));
        }
    },
    deleteUser: (id) => {
        let users = db.getUsers().filter(u => u.id !== id);
        localStorage.setItem('user_db', JSON.stringify(users));
        renderAdmin();
    }
};

// UI Handling
document.addEventListener('DOMContentLoaded', () => {
    const profBtn = document.getElementById('profileBtn');
    const profMenu = document.getElementById('profileDropdown');
    const label = document.getElementById('profileLabel');
    const adminSlot = document.getElementById('adminLinkPlaceholder');

    if (label) label.textContent = auth.check() ? auth.getUser() : 'Sign In';

    if (profBtn) {
        profBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (auth.check()) profMenu.classList.toggle('show');
            else window.location.href = 'auth.html';
        });
    }

    if (auth.isAdmin() && adminSlot) {
        adminSlot.innerHTML = `<a href="admin.html" style="color: #ffd700; font-weight: bold;">Manage Site</a>`;
    }

    if (window.location.pathname.includes('admin.html')) {
        if (!auth.isAdmin()) window.location.href = 'index.html';
        renderAdmin();
    }

    document.addEventListener('click', () => profMenu?.classList.remove('show'));
});

function renderAdmin() {
    const tbody = document.getElementById('userRows');
    const empty = document.getElementById('noData');
    const users = db.getUsers();

    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        users.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><b>${u.name}</b></td>
                <td>${u.email}</td>
                <td><span style="color:#44ff44">${u.status}</span></td>
                <td style="text-align:right">
                    <button class="btn-act ban">Suspend</button>
                    <button class="btn-act del" onclick="db.deleteUser(${u.id})">Remove</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    document.getElementById('stat-count').textContent = users.length;
}

function handleSignOut() { auth.logout(); }
function processAuthForm(type) {
    const email = document.getElementById(type === 'login' ? 'login-email' : 'reg-email').value;
    const pass = document.getElementById(type === 'login' ? 'login-password' : 'reg-password').value;
    if (auth.login(email, pass)) window.location.href = 'index.html';
    else alert('Invalid Credentials');
}
