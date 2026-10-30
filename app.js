/**
 * SupplyChainPro - Core Application Controller & Hash Router
 */

class AppRouter {
    constructor() {
        this.currentRoute = 'dashboard';
        this.contentElement = document.getElementById('mainContent');
        this.breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        this.init();
    }

    init() {
        // Setup Hash Listener
        window.addEventListener('hashchange', () => this.handleHashChange());

        // Setup theme
        this.initTheme();

        // Close dropdowns on outside click
        document.addEventListener('click', (e) => {
            const notifDropdown = document.getElementById('notifDropdown');
            const notifBtn = document.getElementById('notifToggleBtn');
            if (notifDropdown && !notifDropdown.contains(e.target) && notifBtn && !notifBtn.contains(e.target)) {
                notifDropdown.classList.remove('show');
            }

            const userDropdown = document.getElementById('userDropdown');
            const userBtn = document.getElementById('userMenuBtn');
            if (userDropdown && !userDropdown.contains(e.target) && userBtn && !userBtn.contains(e.target)) {
                userDropdown.classList.remove('show');
            }

            // Close mobile sidebar on backdrop click
            const sidebar = document.getElementById('appSidebar');
            const mobileToggle = document.getElementById('mobileMenuToggle');
            if (window.innerWidth <= 840 && sidebar && sidebar.classList.contains('mobile-open')) {
                if (!sidebar.contains(e.target) && mobileToggle && !mobileToggle.contains(e.target)) {
                    sidebar.classList.remove('mobile-open');
                }
            }
        });

        // Trigger initial navigation based on current location hash or default to dashboard
        if (!window.location.hash) {
            window.location.hash = '#/dashboard';
        } else {
            this.handleHashChange();
        }
    }

    handleHashChange() {
        const hash = window.location.hash.replace('#/', '').trim() || 'dashboard';
        const parts = hash.split('?');
        const routeName = parts[0] || 'dashboard';
        this.navigateTo(routeName, false);
    }

    navigateTo(route, updateHash = true) {
        this.currentRoute = route;
        if (updateHash) {
            window.location.hash = `#/${route}`;
        }

        // Close mobile sidebar if open
        const sidebar = document.getElementById('appSidebar');
        if (sidebar) sidebar.classList.remove('mobile-open');

        // Update active class on sidebar navigation links
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#/${route}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update breadcrumb
        const titleMap = {
            dashboard: 'Dashboard',
            suppliers: 'Supplier Management',
            procurement: 'Procurement & Orders',
            inventory: 'Inventory & Warehouses',
            orders: 'Order Fulfillment',
            logistics: 'Logistics & Shipping',
            analytics: 'Analytics & Reports',
            login: 'User Authentication'
        };

        if (this.breadcrumbCurrent) {
            this.breadcrumbCurrent.textContent = titleMap[route] || 'SupplyChainPro';
        }

        // Render matching module
        if (!this.contentElement) {
            this.contentElement = document.getElementById('mainContent');
        }

        switch (route) {
            case 'dashboard':
                this.contentElement.innerHTML = window.DashboardModule.render();
                break;
            case 'suppliers':
                this.contentElement.innerHTML = window.SuppliersModule.render();
                break;
            case 'procurement':
                this.contentElement.innerHTML = window.ProcurementModule.render();
                break;
            case 'inventory':
                this.contentElement.innerHTML = window.InventoryModule.render();
                break;
            case 'orders':
                this.contentElement.innerHTML = window.OrdersModule.render();
                break;
            case 'logistics':
                this.contentElement.innerHTML = window.LogisticsModule.render();
                break;
            case 'analytics':
                this.contentElement.innerHTML = window.AnalyticsModule.render();
                // Initialize Chart.js
                setTimeout(() => {
                    window.AnalyticsModule.initCharts();
                }, 50);
                break;
            case 'login':
                this.contentElement.innerHTML = window.AuthViewModule.render();
                break;
            default:
                this.contentElement.innerHTML = window.DashboardModule.render();
                break;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    refreshCurrentModule() {
        this.navigateTo(this.currentRoute, false);
    }

    // Dark Mode Toggle (Bonus Feature)
    initTheme() {
        const savedTheme = window.dataStore.getTheme();
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        window.dataStore.setTheme(next);
        this.updateThemeIcon(next);

        // Re-render charts in analytics if active
        if (this.currentRoute === 'analytics' && window.AnalyticsModule) {
            window.AnalyticsModule.initCharts();
        }

        window.notifications.showToast(
            `${next.charAt(0).toUpperCase() + next.slice(1)} Mode Enabled`,
            `Switched to ${next} theme interface.`,
            'info',
            2000
        );
    }

    updateThemeIcon(theme) {
        const icon = document.getElementById('themeToggleIcon');
        if (icon) {
            if (theme === 'dark') {
                icon.className = 'ri-sun-line';
                icon.title = 'Switch to Light Mode';
            } else {
                icon.className = 'ri-moon-line';
                icon.title = 'Switch to Dark Mode';
            }
        }
    }

    toggleMobileMenu() {
        const sidebar = document.getElementById('appSidebar');
        if (sidebar) {
            sidebar.classList.toggle('mobile-open');
        }
    }

    handleGlobalSearch(query) {
        if (!query.trim()) return;
        const q = query.toLowerCase();

        // Check if query matches any supplier, po, inventory item, order or shipment
        const suppliers = window.dataStore.getSuppliers();
        const pos = window.dataStore.getPurchaseOrders();
        const inv = window.dataStore.getInventory();
        const ords = window.dataStore.getOrders();
        const shps = window.dataStore.getShipments();

        if (shps.some(s => s.trackingNumber.toLowerCase().includes(q))) {
            window.LogisticsModule.currentSearch = query;
            this.navigateTo('logistics');
        } else if (suppliers.some(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))) {
            window.SuppliersModule.currentSearch = query;
            this.navigateTo('suppliers');
        } else if (pos.some(p => p.id.toLowerCase().includes(q) || p.title.toLowerCase().includes(q))) {
            window.ProcurementModule.currentSearch = query;
            this.navigateTo('procurement');
        } else if (inv.some(i => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q))) {
            window.InventoryModule.currentSearch = query;
            this.navigateTo('inventory');
        } else if (ords.some(o => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q))) {
            window.OrdersModule.currentSearch = query;
            this.navigateTo('orders');
        } else {
            // Default search in inventory
            window.InventoryModule.currentSearch = query;
            this.navigateTo('inventory');
        }
    }
}

// Global bootstrap when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.router = new AppRouter();
});

