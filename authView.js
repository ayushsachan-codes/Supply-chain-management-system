/**
 * SupplyChainPro - User Authentication View (Login / Register)
 */

const AuthViewModule = {
    activeTab: 'login', // 'login' or 'register'

    render() {
        const currentUser = window.auth.getCurrentUser();

        return `
            <div class="auth-page-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="brand-icon" style="margin: 0 auto; width: 48px; height: 48px; font-size: 1.5rem;">
                            <i class="ri-globe-line"></i>
                        </div>
                        <h2>SupplyChain<span>Pro</span></h2>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Enterprise Supply Chain Visibility Platform</p>
                    </div>

                    ${currentUser ? `
                        <div style="text-align: center; padding: 12px 0;">
                            <div class="user-avatar-circle" style="width: 58px; height: 58px; font-size: 1.3rem; margin: 0 auto 12px;">
                                ${currentUser.avatar || 'SC'}
                            </div>
                            <h3 style="font-size: 1.2rem; font-weight: 700;">${Utils.escapeHtml(currentUser.name)}</h3>
                            <div style="font-size: 0.85rem; color: var(--text-muted);">${Utils.escapeHtml(currentUser.role)} • ${Utils.escapeHtml(currentUser.email)}</div>

                            <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 10px;">
                                <button class="btn btn-primary" onclick="window.router.navigateTo('dashboard')" style="justify-content: center;">
                                    <i class="ri-dashboard-line"></i> Enter Supply Chain Dashboard
                                </button>
                                <button class="btn btn-secondary" onclick="window.auth.logout(); window.router.refreshCurrentModule();" style="justify-content: center; color: var(--status-delayed);">
                                    <i class="ri-logout-box-r-line"></i> Sign Out of Account
                                </button>
                            </div>
                        </div>
                    ` : `
                        <div class="auth-tabs">
                            <button class="auth-tab-btn ${this.activeTab === 'login' ? 'active' : ''}" onclick="AuthViewModule.switchTab('login')">
                                Sign In
                            </button>
                            <button class="auth-tab-btn ${this.activeTab === 'register' ? 'active' : ''}" onclick="AuthViewModule.switchTab('register')">
                                Create Account
                            </button>
                        </div>

                        ${this.activeTab === 'login' ? this.renderLoginForm() : this.renderRegisterForm()}

                        <!-- Quick Demo Credentials Box -->
                        <div class="demo-credentials-box">
                            <p><i class="ri-flashlight-line" style="color: #F59E0B;"></i> Instant Demo Access (Click to Fill):</p>
                            <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
                                <span class="demo-chip" onclick="AuthViewModule.fillDemo('admin@supplychainpro.com', 'admin')">
                                    <strong>Director:</strong> admin@supplychainpro.com / admin
                                </span>
                                <span class="demo-chip" onclick="AuthViewModule.fillDemo('elena@supplychainpro.com', 'user123')">
                                    <strong>Logistics Lead:</strong> elena@supplychainpro.com / user123
                                </span>
                            </div>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    renderLoginForm() {
        return `
            <form id="authLoginForm" onsubmit="AuthViewModule.handleLogin(event)">
                <div class="form-group">
                    <label>Corporate Email</label>
                    <input type="email" id="loginEmail" class="form-control" required placeholder="name@company.com" value="admin@supplychainpro.com">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="loginPassword" class="form-control" required placeholder="••••••••" value="admin">
                </div>
                <div id="loginErrorMsg" style="color: var(--status-delayed); font-size: 0.8rem; margin-bottom: 12px; display: none;"></div>
                <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 11px;">
                    <i class="ri-login-box-line"></i> Sign In to System
                </button>
            </form>
        `;
    },

    renderRegisterForm() {
        return `
            <form id="authRegisterForm" onsubmit="AuthViewModule.handleRegister(event)">
                <div class="form-group">
                    <label>Full Name *</label>
                    <input type="text" id="regName" class="form-control" required placeholder="e.g. Liam Sterling">
                </div>
                <div class="form-group">
                    <label>Corporate Email *</label>
                    <input type="email" id="regEmail" class="form-control" required placeholder="l.sterling@company.com">
                </div>
                <div class="form-group">
                    <label>Job Role / Position</label>
                    <select id="regRole" class="form-control">
                        <option value="Supply Chain Analyst">Supply Chain Analyst</option>
                        <option value="Procurement Specialist">Procurement Specialist</option>
                        <option value="Warehouse Supervisor">Warehouse Supervisor</option>
                        <option value="Logistics Coordinator">Logistics Coordinator</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Password *</label>
                    <input type="password" id="regPassword" class="form-control" required placeholder="Min 6 characters">
                </div>
                <div id="regErrorMsg" style="color: var(--status-delayed); font-size: 0.8rem; margin-bottom: 12px; display: none;"></div>
                <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 11px;">
                    <i class="ri-user-add-line"></i> Complete Registration
                </button>
            </form>
        `;
    },

    switchTab(tab) {
        this.activeTab = tab;
        window.router.refreshCurrentModule();
    },

    fillDemo(email, pass) {
        this.activeTab = 'login';
        window.router.refreshCurrentModule();
        setTimeout(() => {
            const emailInput = document.getElementById('loginEmail');
            const passInput = document.getElementById('loginPassword');
            if (emailInput && passInput) {
                emailInput.value = email;
                passInput.value = pass;
            }
        }, 50);
    },

    handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;
        const errEl = document.getElementById('loginErrorMsg');

        const res = window.auth.login(email, pass);
        if (!res.success && errEl) {
            errEl.textContent = res.message;
            errEl.style.display = 'block';
        }
    },

    handleRegister(event) {
        event.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const role = document.getElementById('regRole').value;
        const pass = document.getElementById('regPassword').value;
        const errEl = document.getElementById('regErrorMsg');

        const res = window.auth.register(name, email, pass, role);
        if (!res.success && errEl) {
            errEl.textContent = res.message;
            errEl.style.display = 'block';
        }
    }
};

window.AuthViewModule = AuthViewModule;

