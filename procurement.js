/**
 * SupplyChainPro - Procurement Management Module
 * Purchase Orders, Requisitions & Vendor Selection
 */

const ProcurementModule = {
    currentFilter: 'all',
    currentSearch: '',

    render() {
        const purchaseOrders = this.getFilteredPOs();
        const suppliers = window.dataStore.getSuppliers();

        // Calculate metrics
        const totalPOValue = purchaseOrders.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        const pendingApproval = purchaseOrders.filter(p => p.status === 'Pending').length;
        const inProgressCount = purchaseOrders.filter(p => p.status === 'In Progress').length;
        const completedCount = purchaseOrders.filter(p => p.status === 'Completed').length;

        return `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Procurement & Purchase Order Management</h1>
                    <p class="page-subtitle">Track purchase requisitions, coordinate with vendors, and approve order lifecycles.</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="ProcurementModule.exportCSV()">
                        <i class="ri-download-2-line"></i> Export POs (CSV)
                    </button>
                    <button class="btn btn-primary" onclick="ProcurementModule.openCreateModal()">
                        <i class="ri-file-add-line"></i> Create Purchase Order
                    </button>
                </div>
            </div>

            <!-- KPI Row -->
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div>
                        <div class="kpi-label">Total Spend Pipeline</div>
                        <div class="kpi-value">${Utils.formatCurrency(totalPOValue)}</div>
                        <div class="kpi-meta"><span style="color: var(--text-muted);">${purchaseOrders.length} total purchase orders</span></div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-wallet-3-line"></i></div>
                </div>

                <div class="kpi-card variant-warning">
                    <div>
                        <div class="kpi-label">Awaiting Approval (Pending)</div>
                        <div class="kpi-value">${pendingApproval}</div>
                        <div class="kpi-meta"><span class="kpi-trend neutral">Requires Sign-off</span></div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-hourglass-2-line"></i></div>
                </div>

                <div class="kpi-card">
                    <div>
                        <div class="kpi-label">Active (In Progress)</div>
                        <div class="kpi-value">${inProgressCount}</div>
                        <div class="kpi-meta"><span class="kpi-trend positive">Manufacturing / Transit</span></div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-refresh-line"></i></div>
                </div>

                <div class="kpi-card variant-success">
                    <div>
                        <div class="kpi-label">Fulfilled (Completed)</div>
                        <div class="kpi-value">${completedCount}</div>
                        <div class="kpi-meta"><span class="kpi-trend positive">Received at Hub</span></div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-checkbox-circle-line"></i></div>
                </div>
            </div>

            <!-- Filter Controls & PO Table -->
            <div class="card">
                <div class="card-body">
                    <div class="filter-bar">
                        <div class="filter-group">
                            <div style="position: relative; width: 280px;">
                                <input type="text" class="form-control" placeholder="Search PO #, title, supplier..." 
                                       value="${Utils.escapeHtml(this.currentSearch)}" oninput="ProcurementModule.handleSearch(this.value)">
                            </div>

                            <select class="form-control" onchange="ProcurementModule.handleStatusFilter(this.value)">
                                <option value="all" ${this.currentFilter === 'all' ? 'selected' : ''}>All Statuses</option>
                                <option value="Planned" ${this.currentFilter === 'Planned' ? 'selected' : ''}>Planned</option>
                                <option value="In Progress" ${this.currentFilter === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                <option value="Pending" ${this.currentFilter === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Completed" ${this.currentFilter === 'Completed' ? 'selected' : ''}>Completed</option>
                                <option value="Delayed" ${this.currentFilter === 'Delayed' ? 'selected' : ''}>Delayed</option>
                            </select>
                        </div>

                        <div style="font-size: 0.85rem; color: var(--text-muted);">
                            Showing <strong>${purchaseOrders.length}</strong> purchase orders
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>PO Number</th>
                                    <th>Title & Requisition</th>
                                    <th>Vendor / Supplier</th>
                                    <th>Items</th>
                                    <th>Total Cost</th>
                                    <th>Expected Delivery</th>
                                    <th>Status</th>
                                    <th style="text-align: right;">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${purchaseOrders.length === 0 ? `
                                    <tr>
                                        <td colspan="8" style="text-align: center; padding: 36px; color: var(--text-muted);">
                                            No purchase orders found matching this criteria.
                                        </td>
                                    </tr>
                                ` : purchaseOrders.map(po => `
                                    <tr>
                                        <td style="font-weight: 700; font-family: monospace; color: var(--primary);">
                                            ${po.id}
                                        </td>
                                        <td>
                                            <div style="font-weight: 600;">${Utils.escapeHtml(po.title)}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);">Req: ${po.requisitionId || 'REQ-Auto'} • By: ${Utils.escapeHtml(po.requestedBy || 'Procurement Team')}</div>
                                        </td>
                                        <td>
                                            <div style="font-weight: 500;">${Utils.escapeHtml(po.supplierName)}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);">ID: ${po.supplierId}</div>
                                        </td>
                                        <td>
                                            <span style="font-size: 0.82rem; font-weight: 600; background: var(--bg-hover); padding: 2px 8px; border-radius: var(--radius-sm);">
                                                ${(po.items || []).length} lines
                                            </span>
                                        </td>
                                        <td style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">
                                            ${Utils.formatCurrency(po.totalAmount)}
                                        </td>
                                        <td>
                                            <div style="font-size: 0.85rem;">${po.expectedDelivery || 'TBD'}</div>
                                            <div style="font-size: 0.72rem; color: var(--text-muted);">Ordered: ${po.orderDate}</div>
                                        </td>
                                        <td>
                                            ${Utils.getStatusBadge(po.status)}
                                        </td>
                                        <td style="text-align: right;">
                                            <div style="display: inline-flex; gap: 6px;">
                                                <button class="btn btn-secondary btn-sm" onclick="ProcurementModule.viewPODetails('${po.id}')">
                                                    <i class="ri-eye-line"></i> View
                                                </button>
                                                <button class="btn btn-secondary btn-sm" onclick="ProcurementModule.quickChangeStatus('${po.id}')" title="Change Status">
                                                    <i class="ri-exchange-line"></i>
                                                </button>
                                                <button class="btn btn-secondary btn-sm" style="color: var(--status-delayed);" onclick="ProcurementModule.deletePO('${po.id}')" title="Delete">
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

            <!-- Create Purchase Order Modal -->
            <div id="createPOModal" class="modal-backdrop">
                <div class="modal-dialog" style="max-width: 720px;">
                    <div class="modal-header">
                        <h3 class="modal-title">Create Purchase Order (PO)</h3>
                        <button class="modal-close-btn" onclick="Utils.closeModal('createPOModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="createPOForm" onsubmit="ProcurementModule.handleSubmitPO(event)">
                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Order Title *</label>
                                    <input type="text" id="poFormTitle" class="form-control" required placeholder="e.g. Q4 Titanium Fastener Batch">
                                </div>
                                <div class="form-group">
                                    <label>Vendor / Supplier *</label>
                                    <select id="poFormSupplier" class="form-control" required>
                                        <option value="">Select Vendor...</option>
                                        ${suppliers.map(s => `
                                            <option value="${s.id}" data-name="${Utils.escapeHtml(s.name)}">${Utils.escapeHtml(s.name)} (${s.category})</option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Requisition ID</label>
                                    <input type="text" id="poFormReq" class="form-control" value="REQ-${Math.floor(1000 + Math.random() * 9000)}">
                                </div>
                                <div class="form-group">
                                    <label>Initial Status</label>
                                    <select id="poFormStatus" class="form-control">
                                        <option value="Planned">Planned</option>
                                        <option value="Pending" selected>Pending (Requires Approval)</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Order Date</label>
                                    <input type="date" id="poFormDate" class="form-control" value="${new Date().toISOString().slice(0, 10)}">
                                </div>
                                <div class="form-group">
                                    <label>Expected Delivery Date *</label>
                                    <input type="date" id="poFormDelivery" class="form-control" required>
                                </div>
                            </div>

                            <!-- Line items builder -->
                            <div style="margin: 16px 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <label style="font-size: 0.85rem; font-weight: 700;">Line Items</label>
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="ProcurementModule.addLineItemRow()">
                                        <i class="ri-add-line"></i> Add Item
                                    </button>
                                </div>
                                
                                <div id="poLineItemsContainer" style="display: flex; flex-direction: column; gap: 8px;">
                                    <div class="po-item-row" style="display: flex; gap: 8px; align-items: center;">
                                        <input type="text" class="form-control po-item-name" placeholder="Item Name / SKU Description" required style="flex: 2;">
                                        <input type="number" class="form-control po-item-qty" placeholder="Qty" value="100" min="1" required style="width: 90px;" oninput="ProcurementModule.calculateModalTotal()">
                                        <input type="number" class="form-control po-item-price" placeholder="Price ($)" value="25.00" step="0.01" min="0" required style="width: 110px;" oninput="ProcurementModule.calculateModalTotal()">
                                        <div class="po-item-subtotal" style="width: 100px; font-weight: 600; text-align: right; font-size: 0.88rem;">$2,500.00</div>
                                    </div>
                                </div>

                                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 14px; padding-top: 10px; border-top: 1px dashed var(--border-color);">
                                    <span style="font-size: 0.95rem; font-weight: 600;">Total Purchase Amount:</span>
                                    <span id="poCalculatedTotal" style="font-size: 1.3rem; font-weight: 800; color: var(--primary);">$2,500.00</span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Internal Procurement Notes</label>
                                <textarea id="poFormNotes" class="form-control" placeholder="Specify requirements, batch constraints, quality protocols..."></textarea>
                            </div>

                            <div class="modal-footer" style="margin: 0 -24px -24px -24px; padding: 16px 24px;">
                                <button type="button" class="btn btn-secondary" onclick="Utils.closeModal('createPOModal')">Cancel</button>
                                <button type="submit" class="btn btn-primary">Submit Purchase Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- View PO Details Modal -->
            <div id="viewPOModal" class="modal-backdrop">
                <div class="modal-dialog" style="max-width: 650px;">
                    <div class="modal-header">
                        <h3 class="modal-title" id="viewPOTitle">Purchase Order Details</h3>
                        <button class="modal-close-btn" onclick="Utils.closeModal('viewPOModal')">&times;</button>
                    </div>
                    <div class="modal-body" id="viewPOBody">
                        <!-- Populated dynamically -->
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="Utils.closeModal('viewPOModal')">Close</button>
                    </div>
                </div>
            </div>
        `;
    },

    getFilteredPOs() {
        let list = window.dataStore.getPurchaseOrders();
        if (this.currentFilter !== 'all') {
            list = list.filter(p => p.status === this.currentFilter);
        }
        if (this.currentSearch.trim()) {
            const term = this.currentSearch.toLowerCase();
            list = list.filter(p =>
                p.id.toLowerCase().includes(term) ||
                p.title.toLowerCase().includes(term) ||
                p.supplierName.toLowerCase().includes(term) ||
                (p.requisitionId && p.requisitionId.toLowerCase().includes(term))
            );
        }
        return list;
    },

    handleSearch(val) {
        this.currentSearch = val;
        window.router.refreshCurrentModule();
    },

    handleStatusFilter(status) {
        this.currentFilter = status;
        window.router.refreshCurrentModule();
    },

    openCreateModal() {
        const form = document.getElementById('createPOForm');
        if (form) form.reset();
        
        // set default expected delivery to +14 days
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 14);
        const delivInput = document.getElementById('poFormDelivery');
        if (delivInput) delivInput.value = targetDate.toISOString().slice(0, 10);

        this.calculateModalTotal();
        Utils.openModal('createPOModal');
    },

    addLineItemRow() {
        const container = document.getElementById('poLineItemsContainer');
        if (!container) return;

        const row = document.createElement('div');
        row.className = 'po-item-row';
        row.style.cssText = 'display: flex; gap: 8px; align-items: center;';
        row.innerHTML = `
            <input type="text" class="form-control po-item-name" placeholder="Item Name / SKU Description" required style="flex: 2;">
            <input type="number" class="form-control po-item-qty" placeholder="Qty" value="50" min="1" required style="width: 90px;" oninput="ProcurementModule.calculateModalTotal()">
            <input type="number" class="form-control po-item-price" placeholder="Price ($)" value="15.00" step="0.01" min="0" required style="width: 110px;" oninput="ProcurementModule.calculateModalTotal()">
            <div class="po-item-subtotal" style="width: 100px; font-weight: 600; text-align: right; font-size: 0.88rem;">$750.00</div>
            <button type="button" class="btn btn-secondary btn-sm btn-icon-only" style="color: var(--status-delayed);" onclick="this.parentElement.remove(); ProcurementModule.calculateModalTotal();">
                <i class="ri-close-line"></i>
            </button>
        `;
        container.appendChild(row);
        this.calculateModalTotal();
    },

    calculateModalTotal() {
        const rows = document.querySelectorAll('#poLineItemsContainer .po-item-row');
        let total = 0;
        rows.forEach(r => {
            const qty = parseFloat(r.querySelector('.po-item-qty').value) || 0;
            const price = parseFloat(r.querySelector('.po-item-price').value) || 0;
            const subtotal = qty * price;
            total += subtotal;
            const subtotalEl = r.querySelector('.po-item-subtotal');
            if (subtotalEl) subtotalEl.textContent = Utils.formatCurrency(subtotal);
        });

        const totalEl = document.getElementById('poCalculatedTotal');
        if (totalEl) totalEl.textContent = Utils.formatCurrency(total);
        return total;
    },

    handleSubmitPO(event) {
        event.preventDefault();
        const suppSelect = document.getElementById('poFormSupplier');
        const selectedOpt = suppSelect.options[suppSelect.selectedIndex];

        const rows = document.querySelectorAll('#poLineItemsContainer .po-item-row');
        const items = [];
        let total = 0;

        rows.forEach(r => {
            const name = r.querySelector('.po-item-name').value.trim();
            const qty = parseFloat(r.querySelector('.po-item-qty').value) || 0;
            const price = parseFloat(r.querySelector('.po-item-price').value) || 0;
            const subtotal = qty * price;
            total += subtotal;
            items.push({ name, qty, unitPrice: price, total: subtotal });
        });

        const currentUser = window.auth.getCurrentUser();

        const poData = {
            title: document.getElementById('poFormTitle').value.trim(),
            supplierId: suppSelect.value,
            supplierName: selectedOpt ? selectedOpt.getAttribute('data-name') : 'Selected Supplier',
            requisitionId: document.getElementById('poFormReq').value.trim(),
            requestedBy: currentUser ? currentUser.name : 'Procurement Officer',
            items: items,
            totalAmount: total,
            status: document.getElementById('poFormStatus').value,
            orderDate: document.getElementById('poFormDate').value,
            expectedDelivery: document.getElementById('poFormDelivery').value,
            notes: document.getElementById('poFormNotes').value.trim()
        };

        const saved = window.dataStore.savePurchaseOrder(poData);
        Utils.closeModal('createPOModal');
        window.notifications.showToast('PO Created', `Purchase Order ${saved.id} created successfully!`, 'success');
        window.router.refreshCurrentModule();
    },

    viewPODetails(id) {
        const po = window.dataStore.getPurchaseOrders().find(p => p.id === id);
        if (!po) return;

        const title = document.getElementById('viewPOTitle');
        const body = document.getElementById('viewPOBody');

        if (title) title.textContent = `Purchase Order - ${po.id}`;

        if (body) {
            body.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                    <div>
                        <h4 style="font-size: 1.15rem; font-weight: 700;">${Utils.escapeHtml(po.title)}</h4>
                        <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">
                            Requisition: <strong>${po.requisitionId || 'N/A'}</strong> • Requested by: ${po.requestedBy}
                        </div>
                    </div>
                    <div>
                        ${Utils.getStatusBadge(po.status)}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; background: var(--bg-main); padding: 16px; border-radius: var(--radius-md);">
                    <div>
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Supplier Details</div>
                        <div style="font-weight: 700; margin-top: 4px;">${Utils.escapeHtml(po.supplierName)}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">${po.supplierId}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Dates</div>
                        <div style="font-size: 0.82rem; margin-top: 4px;">Ordered: <strong>${po.orderDate}</strong></div>
                        <div style="font-size: 0.82rem;">Expected: <strong>${po.expectedDelivery}</strong></div>
                    </div>
                </div>

                <h5 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 10px;">Itemized Goods & Specifications</h5>
                <div class="table-responsive" style="margin-bottom: 16px;">
                    <table class="data-table" style="font-size: 0.82rem;">
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th style="text-align: right;">Line Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(po.items || []).map(item => `
                                <tr>
                                    <td>${Utils.escapeHtml(item.name)}</td>
                                    <td>${Utils.formatNumber(item.qty)}</td>
                                    <td>${Utils.formatCurrency(item.unitPrice)}</td>
                                    <td style="text-align: right; font-weight: 600;">${Utils.formatCurrency(item.total)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colspan="3" style="text-align: right; font-size: 0.9rem;">Total Purchase Value:</th>
                                <th style="text-align: right; font-size: 1.05rem; color: var(--primary);">${Utils.formatCurrency(po.totalAmount)}</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                ${po.notes ? `
                    <div style="font-size: 0.82rem; color: var(--text-secondary); background: var(--bg-hover); padding: 12px; border-radius: var(--radius-sm);">
                        <strong>Notes:</strong> ${Utils.escapeHtml(po.notes)}
                    </div>
                ` : ''}
            `;
        }

        Utils.openModal('viewPOModal');
    },

    quickChangeStatus(id) {
        const po = window.dataStore.getPurchaseOrders().find(p => p.id === id);
        if (!po) return;

        const nextStatuses = ['Planned', 'Pending', 'In Progress', 'Completed', 'Delayed'];
        const currentIdx = nextStatuses.indexOf(po.status);
        const nextStatus = nextStatuses[(currentIdx + 1) % nextStatuses.length];

        po.status = nextStatus;
        window.dataStore.savePurchaseOrder(po);
        window.notifications.showToast('PO Status Updated', `${po.id} transitioned to "${nextStatus}"`, 'info');
        window.router.refreshCurrentModule();
    },

    deletePO(id) {
        if (confirm(`Are you sure you want to delete purchase order ${id}?`)) {
            window.dataStore.deletePurchaseOrder(id);
            window.notifications.showToast('PO Removed', `${id} was deleted.`, 'warning');
            window.router.refreshCurrentModule();
        }
    },

    exportCSV() {
        const pos = this.getFilteredPOs();
        const headers = ['PO ID', 'Title', 'Supplier', 'Requisition ID', 'Requested By', 'Order Date', 'Expected Delivery', 'Total Amount', 'Status'];
        const rows = pos.map(p => [
            p.id,
            p.title,
            p.supplierName,
            p.requisitionId || '',
            p.requestedBy || '',
            p.orderDate,
            p.expectedDelivery,
            p.totalAmount,
            p.status
        ]);
        Utils.exportToCSV('Procurement_Purchase_Orders', rows, headers);
    }
};

window.ProcurementModule = ProcurementModule;

