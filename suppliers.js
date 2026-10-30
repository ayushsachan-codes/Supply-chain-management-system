/**
 * SupplyChainPro - Supplier Management Module (CRUD & Performance Ratings)
 */

const SuppliersModule = {
    currentFilter: 'all',
    currentSearch: '',

    render() {
        const suppliers = this.getFilteredSuppliers();

        return `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Supplier Management & Partner Network</h1>
                    <p class="page-subtitle">Add, edit, track performance metrics, and oversee vendor contracts.</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="SuppliersModule.exportCSV()">
                        <i class="ri-download-2-line"></i> Export CSV
                    </button>
                    <button class="btn btn-primary" onclick="SuppliersModule.openModal()">
                        <i class="ri-user-add-line"></i> Add New Supplier
                    </button>
                </div>
            </div>

            <!-- Performance Overview Header Stats -->
            <div class="kpi-grid" style="margin-bottom: 20px;">
                <div class="kpi-card">
                    <div>
                        <div class="kpi-label">Average Supplier Rating</div>
                        <div class="kpi-value">${this.calculateAverageRating()} <span style="font-size: 1rem; color: #F59E0B;">★</span></div>
                        <div class="kpi-meta">
                            <span class="kpi-trend positive"><i class="ri-check-line"></i> Tier 1 Standard</span>
                        </div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-medal-line"></i></div>
                </div>

                <div class="kpi-card variant-success">
                    <div>
                        <div class="kpi-label">Average On-Time Delivery</div>
                        <div class="kpi-value">${this.calculateAvgOnTime()}%</div>
                        <div class="kpi-meta">
                            <span class="kpi-trend positive"><i class="ri-arrow-up-line"></i> +2.4%</span>
                            <span style="color: var(--text-muted);">SLA target 92%</span>
                        </div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-time-line"></i></div>
                </div>

                <div class="kpi-card">
                    <div>
                        <div class="kpi-label">Active Vendor Contracts</div>
                        <div class="kpi-value">${this.calculateTotalContracts()}</div>
                        <div class="kpi-meta">
                            <span class="kpi-trend neutral">Global Coverage</span>
                        </div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-article-line"></i></div>
                </div>

                <div class="kpi-card">
                    <div>
                        <div class="kpi-label">Total Supplier Spend</div>
                        <div class="kpi-value">${Utils.formatCurrency(this.calculateTotalSpend())}</div>
                        <div class="kpi-meta">
                            <span class="kpi-trend neutral">Fiscal Year 2026</span>
                        </div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-funds-box-line"></i></div>
                </div>
            </div>

            <!-- Filter & Search Controls -->
            <div class="card">
                <div class="card-body">
                    <div class="filter-bar">
                        <div class="filter-group">
                            <div style="position: relative; width: 280px;">
                                <input type="text" id="supplierSearchInput" class="form-control" placeholder="Search supplier, contact, category..." 
                                       value="${Utils.escapeHtml(this.currentSearch)}" oninput="SuppliersModule.handleSearch(this.value)">
                            </div>

                            <select class="form-control" onchange="SuppliersModule.handleCategoryFilter(this.value)">
                                <option value="all" ${this.currentFilter === 'all' ? 'selected' : ''}>All Categories</option>
                                <option value="Raw Materials" ${this.currentFilter === 'Raw Materials' ? 'selected' : ''}>Raw Materials</option>
                                <option value="Electronics" ${this.currentFilter === 'Electronics' ? 'selected' : ''}>Electronics</option>
                                <option value="Packaging" ${this.currentFilter === 'Packaging' ? 'selected' : ''}>Packaging</option>
                                <option value="Chemicals" ${this.currentFilter === 'Chemicals' ? 'selected' : ''}>Chemicals</option>
                                <option value="Logistics" ${this.currentFilter === 'Logistics' ? 'selected' : ''}>Logistics</option>
                            </select>
                        </div>

                        <div style="font-size: 0.85rem; color: var(--text-muted);">
                            Showing <strong>${suppliers.length}</strong> suppliers
                        </div>
                    </div>

                    <!-- Suppliers Table -->
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Supplier ID</th>
                                    <th>Company Name</th>
                                    <th>Category</th>
                                    <th>Primary Contact</th>
                                    <th>Lead Time</th>
                                    <th>Performance Rating</th>
                                    <th>On-Time Rate</th>
                                    <th>Status</th>
                                    <th style="text-align: right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${suppliers.length === 0 ? `
                                    <tr>
                                        <td colspan="9" style="text-align: center; padding: 36px; color: var(--text-muted);">
                                            No suppliers match the current filter or search criteria.
                                        </td>
                                    </tr>
                                ` : suppliers.map(s => `
                                    <tr>
                                        <td style="font-weight: 600; font-family: monospace;">${s.id}</td>
                                        <td>
                                            <div style="font-weight: 600; color: var(--text-primary);">${Utils.escapeHtml(s.name)}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);"><i class="ri-map-pin-line"></i> ${Utils.escapeHtml(s.location)}</div>
                                        </td>
                                        <td>
                                            <span style="display: inline-block; padding: 3px 8px; border-radius: var(--radius-sm); font-size: 0.78rem; background: var(--bg-hover); font-weight: 500;">
                                                ${Utils.escapeHtml(s.category)}
                                            </span>
                                        </td>
                                        <td>
                                            <div style="font-size: 0.88rem; font-weight: 500;">${Utils.escapeHtml(s.contactName)}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);">${Utils.escapeHtml(s.email)}</div>
                                        </td>
                                        <td>${s.leadTimeDays || 7} days</td>
                                        <td>
                                            ${Utils.getRatingStars(s.rating)}
                                            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Quality: ${s.qualityScore || 90}%</div>
                                        </td>
                                        <td>
                                            <div style="font-weight: 600; color: ${(s.onTimeRate || 90) >= 90 ? 'var(--status-completed)' : 'var(--status-pending)'};">
                                                ${s.onTimeRate || 92}%
                                            </div>
                                        </td>
                                        <td>
                                            <span class="status-badge ${s.status === 'Active' ? 'badge-completed' : 'badge-pending'}">
                                                ${s.status}
                                            </span>
                                        </td>
                                        <td style="text-align: right;">
                                            <div style="display: inline-flex; gap: 6px;">
                                                <button class="btn btn-secondary btn-sm btn-icon-only" title="View Scorecard" onclick="SuppliersModule.viewScorecard('${s.id}')">
                                                    <i class="ri-eye-line"></i>
                                                </button>
                                                <button class="btn btn-secondary btn-sm btn-icon-only" title="Edit Supplier" onclick="SuppliersModule.openModal('${s.id}')">
                                                    <i class="ri-edit-line"></i>
                                                </button>
                                                <button class="btn btn-secondary btn-sm btn-icon-only" style="color: var(--status-delayed);" title="Delete Supplier" onclick="SuppliersModule.confirmDelete('${s.id}')">
                                                    <i class="ri-delete-bin-line"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Add / Edit Supplier Modal -->
            <div id="supplierModal" class="modal-backdrop">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 class="modal-title" id="supplierModalTitle">Add New Supplier</h3>
                        <button class="modal-close-btn" onclick="Utils.closeModal('supplierModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="supplierForm" onsubmit="SuppliersModule.handleSubmit(event)">
                            <input type="hidden" id="suppFormId">
                            
                            <div class="form-group">
                                <label>Company Name *</label>
                                <input type="text" id="suppFormName" class="form-control" required placeholder="e.g. Apex Industrial Solutions">
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Category *</label>
                                    <select id="suppFormCategory" class="form-control" required>
                                        <option value="Raw Materials">Raw Materials</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Packaging">Packaging</option>
                                        <option value="Chemicals">Chemicals</option>
                                        <option value="Logistics">Logistics</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Operating Location *</label>
                                    <input type="text" id="suppFormLocation" class="form-control" required placeholder="City, Country">
                                </div>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Contact Person Name *</label>
                                    <input type="text" id="suppFormContact" class="form-control" required placeholder="Full Name">
                                </div>
                                <div class="form-group">
                                    <label>Contact Email *</label>
                                    <input type="email" id="suppFormEmail" class="form-control" required placeholder="contact@supplier.com">
                                </div>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Contact Phone</label>
                                    <input type="text" id="suppFormPhone" class="form-control" placeholder="+1 (555) 000-0000">
                                </div>
                                <div class="form-group">
                                    <label>Status</label>
                                    <select id="suppFormStatus" class="form-control">
                                        <option value="Active">Active</option>
                                        <option value="Pending Review">Pending Review</option>
                                        <option value="Under Audit">Under Audit</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Lead Time (Days)</label>
                                    <input type="number" id="suppFormLeadTime" class="form-control" min="1" max="90" value="7">
                                </div>
                                <div class="form-group">
                                    <label>Supplier Rating (1.0 to 5.0)</label>
                                    <input type="number" id="suppFormRating" class="form-control" step="0.1" min="1.0" max="5.0" value="4.5">
                                </div>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Quality Score (%)</label>
                                    <input type="number" id="suppFormQuality" class="form-control" min="1" max="100" value="95">
                                </div>
                                <div class="form-group">
                                    <label>On-Time Delivery Rate (%)</label>
                                    <input type="number" id="suppFormOnTime" class="form-control" min="1" max="100" value="94">
                                </div>
                            </div>

                            <div class="modal-footer" style="margin: 0 -24px -24px -24px; padding: 16px 24px;">
                                <button type="button" class="btn btn-secondary" onclick="Utils.closeModal('supplierModal')">Cancel</button>
                                <button type="submit" class="btn btn-primary">Save Supplier</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Scorecard View Modal -->
            <div id="scorecardModal" class="modal-backdrop">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 class="modal-title" id="scorecardTitle">Supplier Performance Scorecard</h3>
                        <button class="modal-close-btn" onclick="Utils.closeModal('scorecardModal')">&times;</button>
                    </div>
                    <div class="modal-body" id="scorecardBody">
                        <!-- Populated dynamically -->
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="Utils.closeModal('scorecardModal')">Close</button>
                    </div>
                </div>
            </div>
        `;
    },

    getFilteredSuppliers() {
        let list = window.dataStore.getSuppliers();
        if (this.currentFilter !== 'all') {
            list = list.filter(s => s.category === this.currentFilter);
        }
        if (this.currentSearch.trim()) {
            const term = this.currentSearch.toLowerCase();
            list = list.filter(s => 
                s.name.toLowerCase().includes(term) ||
                s.category.toLowerCase().includes(term) ||
                s.contactName.toLowerCase().includes(term) ||
                s.location.toLowerCase().includes(term) ||
                s.id.toLowerCase().includes(term)
            );
        }
        return list;
    },

    handleSearch(val) {
        this.currentSearch = val;
        window.router.refreshCurrentModule();
    },

    handleCategoryFilter(cat) {
        this.currentFilter = cat;
        window.router.refreshCurrentModule();
    },

    calculateAverageRating() {
        const suppliers = window.dataStore.getSuppliers();
        if (!suppliers.length) return '0.0';
        const sum = suppliers.reduce((acc, s) => acc + (parseFloat(s.rating) || 0), 0);
        return (sum / suppliers.length).toFixed(1);
    },

    calculateAvgOnTime() {
        const suppliers = window.dataStore.getSuppliers();
        if (!suppliers.length) return 0;
        const sum = suppliers.reduce((acc, s) => acc + (parseInt(s.onTimeRate) || 0), 0);
        return Math.round(sum / suppliers.length);
    },

    calculateTotalContracts() {
        const suppliers = window.dataStore.getSuppliers();
        return suppliers.reduce((acc, s) => acc + (parseInt(s.activeContracts) || 1), 0);
    },

    calculateTotalSpend() {
        const suppliers = window.dataStore.getSuppliers();
        return suppliers.reduce((acc, s) => acc + (parseInt(s.spend) || 0), 0);
    },

    openModal(id = null) {
        const title = document.getElementById('supplierModalTitle');
        const form = document.getElementById('supplierForm');
        if (form) form.reset();

        if (id) {
            const s = window.dataStore.getSupplierById(id);
            if (s) {
                if (title) title.textContent = `Edit Supplier (${s.id})`;
                document.getElementById('suppFormId').value = s.id;
                document.getElementById('suppFormName').value = s.name;
                document.getElementById('suppFormCategory').value = s.category;
                document.getElementById('suppFormLocation').value = s.location;
                document.getElementById('suppFormContact').value = s.contactName;
                document.getElementById('suppFormEmail').value = s.email;
                document.getElementById('suppFormPhone').value = s.phone || '';
                document.getElementById('suppFormStatus').value = s.status || 'Active';
                document.getElementById('suppFormLeadTime').value = s.leadTimeDays || 7;
                document.getElementById('suppFormRating').value = s.rating || 4.5;
                document.getElementById('suppFormQuality').value = s.qualityScore || 95;
                document.getElementById('suppFormOnTime').value = s.onTimeRate || 94;
            }
        } else {
            if (title) title.textContent = 'Add New Supplier';
            document.getElementById('suppFormId').value = '';
        }

        Utils.openModal('supplierModal');
    },

    handleSubmit(event) {
        event.preventDefault();
        const id = document.getElementById('suppFormId').value;
        const supplierData = {
            id: id || undefined,
            name: document.getElementById('suppFormName').value.trim(),
            category: document.getElementById('suppFormCategory').value,
            location: document.getElementById('suppFormLocation').value.trim(),
            contactName: document.getElementById('suppFormContact').value.trim(),
            email: document.getElementById('suppFormEmail').value.trim(),
            phone: document.getElementById('suppFormPhone').value.trim(),
            status: document.getElementById('suppFormStatus').value,
            leadTimeDays: parseInt(document.getElementById('suppFormLeadTime').value) || 7,
            rating: parseFloat(document.getElementById('suppFormRating').value) || 4.5,
            qualityScore: parseInt(document.getElementById('suppFormQuality').value) || 95,
            onTimeRate: parseInt(document.getElementById('suppFormOnTime').value) || 94,
            activeContracts: 2,
            spend: 50000
        };

        window.dataStore.saveSupplier(supplierData);
        Utils.closeModal('supplierModal');
        window.notifications.showToast('Supplier Saved', `${supplierData.name} has been updated in directory.`, 'success');
        window.router.refreshCurrentModule();
    },

    confirmDelete(id) {
        const s = window.dataStore.getSupplierById(id);
        if (!s) return;
        if (confirm(`Are you sure you want to delete supplier "${s.name}"?`)) {
            window.dataStore.deleteSupplier(id);
            window.notifications.showToast('Supplier Deleted', `${s.name} was removed.`, 'warning');
            window.router.refreshCurrentModule();
        }
    },

    viewScorecard(id) {
        const s = window.dataStore.getSupplierById(id);
        if (!s) return;

        const body = document.getElementById('scorecardBody');
        const title = document.getElementById('scorecardTitle');
        if (title) title.textContent = `Performance Scorecard - ${s.name}`;

        if (body) {
            body.innerHTML = `
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 2.2rem; font-weight: 800; color: var(--primary);">${s.rating} / 5.0</div>
                    <div>${Utils.getRatingStars(s.rating)}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Verified Tier-1 Partner</div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                    <div style="padding: 14px; background: var(--bg-main); border-radius: var(--radius-md);">
                        <div style="font-size: 0.78rem; color: var(--text-muted);">Quality Rating</div>
                        <div style="font-size: 1.4rem; font-weight: 700; color: var(--status-completed);">${s.qualityScore || 95}%</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">Defect rate < 0.2%</div>
                    </div>
                    <div style="padding: 14px; background: var(--bg-main); border-radius: var(--radius-md);">
                        <div style="font-size: 0.78rem; color: var(--text-muted);">On-Time Delivery SLA</div>
                        <div style="font-size: 1.4rem; font-weight: 700; color: var(--primary);">${s.onTimeRate || 92}%</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">Avg lead time: ${s.leadTimeDays || 7} days</div>
                    </div>
                </div>

                <div style="padding: 14px; background: var(--bg-main); border-radius: var(--radius-md);">
                    <div style="font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">Vendor Details</div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;">
                        <span style="color: var(--text-muted);">Vendor Category:</span>
                        <span style="font-weight: 600;">${s.category}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;">
                        <span style="color: var(--text-muted);">Contact:</span>
                        <span>${s.contactName} (${s.email})</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;">
                        <span style="color: var(--text-muted);">Active Contracts:</span>
                        <span style="font-weight: 600;">${s.activeContracts || 1} active agreements</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.82rem;">
                        <span style="color: var(--text-muted);">Cumulative Spend:</span>
                        <span style="font-weight: 600;">${Utils.formatCurrency(s.spend || 0)}</span>
                    </div>
                </div>
            `;
        }

        Utils.openModal('scorecardModal');
    },

    exportCSV() {
        const suppliers = this.getFilteredSuppliers();
        const headers = ['ID', 'Name', 'Category', 'Contact Person', 'Email', 'Phone', 'Location', 'Rating', 'Quality Score %', 'On-Time Rate %', 'Lead Time Days', 'Status'];
        const rows = suppliers.map(s => [
            s.id,
            s.name,
            s.category,
            s.contactName,
            s.email,
            s.phone || '',
            s.location,
            s.rating,
            s.qualityScore,
            s.onTimeRate,
            s.leadTimeDays,
            s.status
        ]);
        Utils.exportToCSV('Suppliers_Report', rows, headers);
    }
};

window.SuppliersModule = SuppliersModule;

