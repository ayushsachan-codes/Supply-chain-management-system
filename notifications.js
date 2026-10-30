/**
 * SupplyChainPro - Notifications and Toast Manager
 */

class NotificationManager {
    constructor() {
        this.container = null;
        this.dropdownMenu = null;
        this.badge = null;
        this.init();
    }

    init() {
        // Create toast container if not present
        if (!document.getElementById('toastContainer')) {
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
            this.container = container;
        } else {
            this.container = document.getElementById('toastContainer');
        }

        this.dropdownMenu = document.getElementById('notifDropdown');
        this.badge = document.getElementById('notifBadge');
        this.renderDropdown();
    }

    showToast(title, message, type = 'info', duration = 4000) {
        if (!this.container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const iconClass = {
            success: 'ri-checkbox-circle-fill',
            warning: 'ri-alert-fill',
            danger: 'ri-error-warning-fill',
            info: 'ri-information-fill'
        }[type] || 'ri-information-fill';

        toast.innerHTML = `
            <div class="toast-icon"><i class="${iconClass}"></i></div>
            <div class="toast-body">
                <div class="toast-title">${this.escapeHtml(title)}</div>
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
        `;

        this.container.appendChild(toast);

        // Also add to persistent notifications in dataStore
        window.dataStore.addNotification({
            title,
            message,
            type,
            time: 'Just now'
        });
        this.renderDropdown();

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(60px)';
            setTimeout(() => toast.remove(), 250);
        }, duration);
    }

    renderDropdown() {
        const notifs = window.dataStore.getNotifications();
        const unreadCount = notifs.filter(n => !n.read).length;

        if (this.badge) {
            if (unreadCount > 0) {
                this.badge.style.display = 'flex';
                this.badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            } else {
                this.badge.style.display = 'none';
            }
        }

        const listContainer = document.getElementById('notifList');
        if (!listContainer) return;

        if (notifs.length === 0) {
            listContainer.innerHTML = `
                <div style="padding: 28px; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
                    <i class="ri-notification-off-line" style="font-size: 2rem; display: block; margin-bottom: 8px;"></i>
                    No notifications at this time
                </div>
            `;
            return;
        }

        listContainer.innerHTML = notifs.map(n => {
            const iconClass = {
                success: 'ri-checkbox-circle-fill',
                warning: 'ri-alert-fill',
                danger: 'ri-error-warning-fill',
                info: 'ri-information-fill'
            }[n.type] || 'ri-notification-3-fill';

            const bgClass = {
                success: 'var(--status-completed-bg)',
                warning: 'var(--status-pending-bg)',
                danger: 'var(--status-delayed-bg)',
                info: 'var(--status-inprogress-bg)'
            }[n.type] || 'var(--primary-light)';

            const colorClass = {
                success: 'var(--status-completed)',
                warning: 'var(--status-pending)',
                danger: 'var(--status-delayed)',
                info: 'var(--status-inprogress)'
            }[n.type] || 'var(--primary)';

            return `
                <div class="notif-item ${!n.read ? 'unread' : ''}" onclick="window.notifications.handleClick('${n.id}', '${n.linkModule || ''}')">
                    <div class="notif-icon" style="background: ${bgClass}; color: ${colorClass};">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="notif-content">
                        <div class="notif-title">${this.escapeHtml(n.title)}</div>
                        <div class="notif-desc">${this.escapeHtml(n.message)}</div>
                        <div class="notif-time">${this.escapeHtml(n.time || 'Recent')}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    handleClick(id, moduleLink) {
        window.dataStore.markNotificationsAsRead();
        this.renderDropdown();
        if (moduleLink && window.router) {
            window.router.navigateTo(moduleLink);
        }
        if (this.dropdownMenu) {
            this.dropdownMenu.classList.remove('show');
        }
    }

    markAllAsRead() {
        window.dataStore.markNotificationsAsRead();
        this.renderDropdown();
    }

    clearAll() {
        window.dataStore.clearNotifications();
        this.renderDropdown();
        this.showToast('Cleared', 'All notifications have been cleared', 'info', 2000);
    }

    toggleDropdown() {
        if (!this.dropdownMenu) {
            this.dropdownMenu = document.getElementById('notifDropdown');
        }
        if (this.dropdownMenu) {
            this.dropdownMenu.classList.toggle('show');
            if (this.dropdownMenu.classList.contains('show')) {
                // close other dropdowns
                const userDropdown = document.getElementById('userDropdown');
                if (userDropdown) userDropdown.classList.remove('show');
            }
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

window.notifications = new NotificationManager();

