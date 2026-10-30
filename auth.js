/**
 * SupplyChainPro - Authentication & User Session Manager
 */

class AuthManager {
    constructor() {
        this.currentUser = window.dataStore.getCurrentUser();
        this.updateUserUI();
    }

    getCurrentUser() {
        return window.dataStore.getCurrentUser();
    }

    login(email, password) {
        const users = window.dataStore.getUsers();
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);

        if (found) {
            window.dataStore.setCurrentUser(found);
            this.currentUser = found;
            this.updateUserUI();
            window.notifications.showToast('Welcome Back', `Logged in as ${found.name}`, 'success');
            if (window.router) {
                window.router.navigateTo('dashboard');
            }
            return { success: true };
        } else {
            return { success: false, message: 'Invalid email or password. Try demo credentials below.' };
        }
    }

    register(name, email, password, role = 'Supply Chain Specialist') {
        const users = window.dataStore.getUsers();
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SC';
        const newUser = {
            id: 'USR-' + Date.now().toString().slice(-4),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password,
            role: role || 'Supply Chain Specialist',
            department: 'Operations',
            avatar: initials
        };

        window.dataStore.addUser(newUser);
        window.dataStore.setCurrentUser(newUser);
        this.currentUser = newUser;
        this.updateUserUI();
        window.notifications.showToast('Account Created', `Welcome to SupplyChainPro, ${newUser.name}!`, 'success');
        if (window.router) {
            window.router.navigateTo('dashboard');
        }
        return { success: true };
    }

    logout() {
        window.dataStore.setCurrentUser(null);
        this.currentUser = null;
        this.updateUserUI();
        window.notifications.showToast('Signed Out', 'You have been signed out safely.', 'info');
        if (window.router) {
            window.router.navigateTo('login');
        }
    }

    updateUserUI() {
        const user = this.getCurrentUser();
        const sidebarAvatar = document.getElementById('sidebarUserAvatar');
        const sidebarName = document.getElementById('sidebarUserName');
        const sidebarRole = document.getElementById('sidebarUserRole');
        const topbarAvatar = document.getElementById('topbarUserAvatar');
        const topbarName = document.getElementById('topbarUserName');

        if (user) {
            if (sidebarAvatar) sidebarAvatar.textContent = user.avatar || 'SC';
            if (sidebarName) sidebarName.textContent = user.name;
            if (sidebarRole) sidebarRole.textContent = user.role;
            if (topbarAvatar) topbarAvatar.textContent = user.avatar || 'SC';
            if (topbarName) topbarName.textContent = user.name;
        } else {
            if (sidebarAvatar) sidebarAvatar.textContent = 'G';
            if (sidebarName) sidebarName.textContent = 'Guest User';
            if (sidebarRole) sidebarRole.textContent = 'Not Signed In';
            if (topbarAvatar) topbarAvatar.textContent = 'G';
            if (topbarName) topbarName.textContent = 'Guest';
        }
    }

    toggleUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
            if (dropdown.classList.contains('show')) {
                const notifDropdown = document.getElementById('notifDropdown');
                if (notifDropdown) notifDropdown.classList.remove('show');
            }
        }
    }
}

window.auth = new AuthManager();

