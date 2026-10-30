/**
 * SupplyChainPro - Inventory Management Module
 * Stock Levels, Multi-Warehouse Visibility & Movements Audit
 */

const InventoryModule = {
    currentWarehouse: 'all',
    currentSearch: '',
    currentTab: 'stock', // 'stock' or 'movements'

    render() {
        const inventory = this.getFilteredInventory();
        const movements = window.dataStore.getMovements();
        const allItems = window.dataStore.getInventory();

        // Calculate metrics
        const totalItemsCount = allItems.reduce((sum, i) => sum + (i.stockLevel || 0), 0);
        const totalValuation = allItems.reduce((sum, i) => sum + ((i.stockLevel || 0) * (i.unitCost || 0)), 0);
        const lowStockCount = allItems.filter(i => i.stockLevel <= i.minStock).length;
        const warehouses = [...new Set(allItems.map(i => i.warehouse))];

        return `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Warehouse & Inventory Management</h1>
                    <p class="page-subtitle">Track stock levels across hubs, trigger replenishment, and record inventory movements.</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="InventoryModule.exportCSV()">
                        <i class="ri-download-2-line"></i> Export Inventory (CSV)
                    </button>
                    <button class="btn btn-secondary" onclick="InventoryModule.openAdjustModal()">
                        <i class="ri-exchange-box-line"></i> Record Stock Movement
                    </button>
                    <button class="btn btn-primary" onclick="InventoryModule.openItemModal()">
                        <i class="ri-add-line"></i> Add New SKU
                    </button>
                </div>
            </div>

            <!-- KPI Row -->
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div>
                        <div class="kpi-label">Total Units on Hand</div>
                        <div class="kpi-value">${Utils.formatNumber(totalItemsCount)}</div>
                        <div class="kpi-meta"><span style="color: var(--text-muted);">${allItems.length} active SKUs</span></div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-stack-line"></i></div>
                </div>

                <div class="kpi-card">
                    <div>
                        <div class="kpi-label">Total Inventory Valuation</div>
                        <div class="kpi-value">${Utils.formatCurrency(totalValuation)}</div>
                        <div class="kpi-meta"><span class="kpi-trend positive">Asset Value</span></div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-money-dollar-box-line"></i></div>
                </div>

                <div class="kpi-card ${lowStockCount > 0 ? 'variant-danger' : 'variant-success'}">
                    <div>
                        <div class="kpi-label">Reorder Alerts (Below Min)</div>
                        <div class="kpi-value">${lowStockCount}</div>
                        <div class="kpi-meta">
                            <span class="kpi-trend ${lowStockCount > 0 ? 'negative' : 'positive'}">
                                ${lowStockCount > 0 ? 'Needs Procurement' : 'Optimal'}
                            </span>
                        </div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-alert-line"></i></div>
                </div>

                <div class="kpi-card">
                    <div>
                        <div class="kpi-label">Active Warehouse Hubs</div>
                        <div class="kpi-value">${warehouses.length}</div>
                        <div class="kpi-meta"><span class="kpi-trend neutral">Multi-Node Network</span></div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-community-line"></i></div>
                </div>
            </div>

            <!-- Tab switcher & Filter Controls -->
            <div class="card">
                <div class="card-header" style="border-bottom: none; padding-bottom: 0;">
                    <div style="display: flex; gap: 8px;">
                        <button class="btn ${this.currentTab === 'stock' ? 'btn-primary' : 'btn-secondary'} btn-sm" 
                                onclick="InventoryModule.switchTab('stock')">
                            <i class="ri-archive-line"></i> Stock Levels Inventory
                        </button>
                        <button class="btn ${this.currentTab === 'movements' ? 'btn-primary' : 'btn-secondary'} btn-sm" 
                                onclick="InventoryModule.switchTab('movements')">
                            <i class="ri-history-line"></i> Movement Audit Ledger (${movements.length})
                        </button>
                    </div>
                </div>

                <div class="card-body">
                    ${this.currentTab === 'stock' ? this.renderStockTab(inventory, warehouses) : this.renderMovementsTab(movements)}
                </div>
            </div>

            <!-- Add/Edit SKU Modal -->
            <div id="skuModal" class="modal-backdrop">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 class="modal-title" id="skuModalTitle">Add New Inventory SKU</h3>
                        <button class="modal-close-btn" onclick="Utils.closeModal('skuModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="skuForm" onsubmit="InventoryModule.handleSubmitSKU(event)">
                            <input type="hidden" id="skuFormId">
                            
                            <div class="form-group">
                                <label>Product / Part Name *</label>
                                <input type="text" id="skuFormName" class="form-control" required placeholder="e.g. Lithium Polymer Battery 5000mAh">
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Category *</label>
                                    <select id="skuFormCategory" class="form-control" required>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Raw Materials">Raw Materials</option>
                                        <option value="Packaging">Packaging</option>
                                        <option value="Chemicals">Chemicals</option>
                                        <option value="Energy">Energy</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Warehouse Hub *</label>
                                    <select id="skuFormWarehouse" class="form-control" required>
                                        <option value="Central Distribution Hub (Chicago)">Central Distribution Hub (Chicago)</option>
                                        <option value="West Coast Terminal (Los Angeles)">West Coast Terminal (Los Angeles)</option>
                                        <option value="Euro Transit Hub (Rotterdam)">Euro Transit Hub (Rotterdam)</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Current Stock Quantity *</label>
                                    <input type="number" id="skuFormStock" class="form-control" min="0" required value="100">
                                </div>
                                <div class="form-group">
                                    <label>Unit of Measure</label>
                                    <input type="text" id="skuFormUnit" class="form-control" value="Units" placeholder="e.g. Units, Boxes, Drums">
                                </div>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Minimum Stock Threshold *</label>
                                    <input type="number" id="skuFormMin" class="form-control" min="0" required value="200">
                                </div>
                                <div class="form-group">
                                    <label>Maximum Stock Capacity *</label>
                                    <input type="number" id="skuFormMax" class="form-control" min="0" required value="1500">
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Unit Cost ($ USD) *</label>
                                <input type="number" id="skuFormCost" class="form-control" step="0.01" min="0" required value="25.00">
                            </div>

                            <div class="modal-footer" style="margin: 0 -24px -24px -24px; padding: 16px 24px;">
                                <button type="button" class="btn btn-secondary" onclick="Utils.closeModal('skuModal')">Cancel</button>
                                <button type="submit" class="btn btn-primary">Save SKU</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Record Stock Movement Modal -->
            <div id="adjustModal" class="modal-backdrop">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 class="modal-title">Record Stock Movement / Transfer</h3>
                        <button class="modal-close-btn" onclick="Utils.closeModal('adjustModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="adjustForm" onsubmit="InventoryModule.handleSubmitAdjustment(event)">
                            <div class="form-group">
                                <label>Select Inventory Item *</label>
                                <select id="adjItemSelect" class="form-control" required>
                                    <option value="">Select SKU...</option>
                                    ${allItems.map(i => `
                                        <option value="${i.id}">${i.id} - ${Utils.escapeHtml(i.name)} (${i.stockLevel} ${i.unit} in stock)</option>
                                    `).join('')}
                                </select>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Movement Type *</label>
                                    <select id="adjType" class="form-control" required>
                                        <option value="Inbound Receipt">Inbound Receipt (+)</option>
                                        <option value="Outbound Fulfillment">Outbound Fulfillment (-)</option>
                                        <option value="Warehouse Transfer">Warehouse Transfer</option>
                                        <option value="Stock Adjustment">Stock Correction / Adjustment</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Quantity *</label>
                                    <input type="number" id="adjQty" class="form-control" required value="50">
                                </div>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>From Origin</label>
                                    <input type="text" id="adjFrom" class="form-control" placeholder="e.g. Supplier / Central Hub" value="Central Distribution Hub">
                                </div>
                                <div class="form-group">
                                    <label>To Destination</label>
                                    <input type="text" id="adjTo" class="form-control" placeholder="e.g. West Coast Terminal" value="West Coast Terminal">
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Reference Order / PO / Ticket</label>
                                <input type="text" id="adjRef" class="form-control" placeholder="e.g. PO-2026-1041 or TRF-902">
                            </div>

                            <div class="modal-footer" style="margin: 0 -24px -24px -24px; padding: 16px 24px;">
                                <button type="button" class="btn btn-secondary" onclick="Utils.closeModal('adjustModal')">Cancel</button>
                                <button type="submit" class="btn btn-primary">Record Movement</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    renderStockTab(inventory, warehouses) {
        return `
            <div class="filter-bar">
                <div class="filter-group">
                    <div style="position: relative; width: 280px;">
                        <input type="text" class="form-control" placeholder="Search SKU, name, category..." 
                               value="${Utils.escapeHtml(this.currentSearch)}" oninput="InventoryModule.handleSearch(this.value)">
                    </div>

                    <select class="form-control" onchange="InventoryModule.handleWarehouseFilter(this.value)">
                        <option value="all" ${this.currentWarehouse === 'all' ? 'selected' : ''}>All Warehouses</option>
                        ${warehouses.map(w => `
                            <option value="${w}" ${this.currentWarehouse === w ? 'selected' : ''}>${w}</option>
                        `).join('')}
                    </select>
                </div>

                <div style="font-size: 0.85rem; color: var(--text-muted);">
                    Showing <strong>${inventory.length}</strong> SKUs
                </div>
            </div>

            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>SKU Code</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Warehouse Location</th>
                            <th>Unit Cost</th>
                            <th>Stock Level</th>
                            <th>Min / Max</th>
                            <th>Status</th>
                            <th style="text-align: right;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${inventory.length === 0 ? `
                            <tr>
                                <td colspan="9" style="text-align: center; padding: 36px; color: var(--text-muted);">
                                    No inventory items match filter.
                                </td>
                            </tr>
                        ` : inventory.map(item => {
                            const isLow = item.stockLevel <= item.minStock;
                            const isCritical = item.stockLevel <= (item.minStock * 0.4);
                            const statusLabel = isCritical ? 'Critical' : (isLow ? 'Low Stock' : 'In Stock');
                            const badgeClass = isCritical ? 'badge-delayed' : (isLow ? 'badge-pending' : 'badge-completed');
                            const stockFillPercent = Math.min(100, Math.round((item.stockLevel / (item.maxStock || 1000)) * 100));

                            return `
                                <tr>
                                    <td style="font-weight: 700; font-family: monospace; color: var(--primary);">${item.id}</td>
                                    <td>
                                        <div style="font-weight: 600;">${Utils.escapeHtml(item.name)}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted);">Last restocked: ${item.lastRestocked || 'Recent'}</div>
                                    </td>
                                    <td>
                                        <span style="display: inline-block; padding: 2px 8px; border-radius: var(--radius-sm); font-size: 0.78rem; background: var(--bg-hover);">
                                            ${Utils.escapeHtml(item.category)}
                                        </span>
                                    </td>
                                    <td>
                                        <div style="font-size: 0.82rem; font-weight: 500;">
                                            <i class="ri-building-2-line" style="color: var(--text-muted);"></i> ${item.warehouse}
                                        </div>
                                    </td>
                                    <td>${Utils.formatCurrency(item.unitCost)}</td>
                                    <td>
                                        <div style="font-weight: 700; font-size: 0.95rem;">
                                            ${Utils.formatNumber(item.stockLevel)} <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted);">${item.unit}</span>
                                        </div>
                                        <div style="width: 100px; height: 6px; background: var(--border-color); border-radius: var(--radius-full); margin-top: 4px; overflow: hidden;">
                                            <div style="width: ${stockFillPercent}%; height: 100%; background: ${isCritical ? 'var(--status-delayed)' : (isLow ? 'var(--status-pending)' : 'var(--status-completed)')}; border-radius: var(--radius-full);"></div>
                                        </div>
                                    </td>
                                    <td style="font-size: 0.8rem; color: var(--text-secondary);">
                                        ${item.minStock} / ${item.maxStock}
                                    </td>
                                    <td>
                                        <span class="status-badge ${badgeClass}">${statusLabel}</span>
                                    </td>
                                    <td style="text-align: right;">
                                        <div style="display: inline-flex; gap: 6px;">
                                            <button class="btn btn-secondary btn-sm btn-icon-only" title="Edit SKU" onclick="InventoryModule.openItemModal('${item.id}')">
                                                <i class="ri-edit-line"></i>
                                            </button>
                                            <button class="btn btn-secondary btn-sm btn-icon-only" style="color: var(--status-delayed);" title="Delete" onclick="InventoryModule.deleteSKU('${item.id}')">
                                                <i class="ri-delete-bin-line"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderMovementsTab(movements) {
        return `
            <div style="margin-bottom: 16px; font-size: 0.88rem; color: var(--text-secondary);">
                Chronological ledger of inventory receipts, customer dispatches, warehouse transfers, and adjustments.
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Movement ID</th>
                            <th>Timestamp</th>
                            <th>SKU & Product</th>
                            <th>Type</th>
                            <th>Quantity</th>
                            <th>Origin → Destination</th>
                            <th>Operator</th>
                            <th>Reference</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${movements.map(m => {
                            const isPositive = m.type.includes('Inbound') || m.quantity > 0;
                            return `
                                <tr>
                                    <td style="font-weight: 700; font-family: monospace;">${m.id}</td>
                                    <td style="font-size: 0.82rem; color: var(--text-muted);">${m.timestamp}</td>
                                    <td>
                                        <div style="font-weight: 600;">${Utils.escapeHtml(m.productName)}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">${m.sku}</div>
                                    </td>
                                    <td>
                                        <span style="font-size: 0.8rem; font-weight: 600; padding: 2px 8px; border-radius: var(--radius-sm); background: var(--bg-hover);">
                                            ${m.type}
                                        </span>
                                    </td>
                                    <td style="font-weight: 700; color: ${isPositive ? 'var(--status-completed)' : 'var(--status-delayed)'};">
                                        ${m.quantity > 0 ? '+' : ''}${m.quantity}
                                    </td>
                                    <td style="font-size: 0.82rem;">${Utils.escapeHtml(m.fromLocation)} → ${Utils.escapeHtml(m.toLocation)}</td>
                                    <td style="font-size: 0.82rem; color: var(--text-secondary);">${Utils.escapeHtml(m.performedBy)}</td>
                                    <td style="font-family: monospace; font-size: 0.82rem; color: var(--primary);">${m.reference || 'N/A'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    getFilteredInventory() {
        let list = window.dataStore.getInventory();
        if (this.currentWarehouse !== 'all') {
            list = list.filter(i => i.warehouse === this.currentWarehouse);
        }
        if (this.currentSearch.trim()) {
            const term = this.currentSearch.toLowerCase();
            list = list.filter(i =>
                i.id.toLowerCase().includes(term) ||
                i.name.toLowerCase().includes(term) ||
                i.category.toLowerCase().includes(term) ||
                i.warehouse.toLowerCase().includes(term)
            );
        }
        return list;
    },

    handleSearch(val) {
        this.currentSearch = val;
        window.router.refreshCurrentModule();
    },

    handleWarehouseFilter(w) {
        this.currentWarehouse = w;
        window.router.refreshCurrentModule();
    },

    switchTab(tab) {
        this.currentTab = tab;
        window.router.refreshCurrentModule();
    },

    openItemModal(id = null) {
        const title = document.getElementById('skuModalTitle');
        const form = document.getElementById('skuForm');
        if (form) form.reset();

        if (id) {
            const item = window.dataStore.getInventory().find(i => i.id === id);
            if (item) {
                if (title) title.textContent = `Edit SKU (${item.id})`;
                document.getElementById('skuFormId').value = item.id;
                document.getElementById('skuFormName').value = item.name;
                document.getElementById('skuFormCategory').value = item.category;
                document.getElementById('skuFormWarehouse').value = item.warehouse;
                document.getElementById('skuFormStock').value = item.stockLevel;
                document.getElementById('skuFormUnit').value = item.unit;
                document.getElementById('skuFormMin').value = item.minStock;
                document.getElementById('skuFormMax').value = item.maxStock;
                document.getElementById('skuFormCost').value = item.unitCost;
            }
        } else {
            if (title) title.textContent = 'Add New Inventory SKU';
            document.getElementById('skuFormId').value = '';
        }

        Utils.openModal('skuModal');
    },

    handleSubmitSKU(event) {
        event.preventDefault();
        const id = document.getElementById('skuFormId').value;
        const stockLevel = parseInt(document.getElementById('skuFormStock').value) || 0;
        const minStock = parseInt(document.getElementById('skuFormMin').value) || 100;
        
        let status = 'In Stock';
        if (stockLevel <= minStock * 0.4) status = 'Critical';
        else if (stockLevel <= minStock) status = 'Low Stock';

        const skuData = {
            id: id || undefined,
            name: document.getElementById('skuFormName').value.trim(),
            category: document.getElementById('skuFormCategory').value,
            warehouse: document.getElementById('skuFormWarehouse').value,
            stockLevel: stockLevel,
            unit: document.getElementById('skuFormUnit').value.trim() || 'Units',
            minStock: minStock,
            maxStock: parseInt(document.getElementById('skuFormMax').value) || 2000,
            unitCost: parseFloat(document.getElementById('skuFormCost').value) || 10.0,
            status: status,
            lastRestocked: new Date().toISOString().slice(0, 10)
        };

        const saved = window.dataStore.saveInventoryItem(skuData);
        Utils.closeModal('skuModal');
        window.notifications.showToast('SKU Saved', `${saved.name} (${saved.id}) recorded in inventory.`, 'success');
        window.router.refreshCurrentModule();
    },

    openAdjustModal() {
        const form = document.getElementById('adjustForm');
        if (form) form.reset();
        Utils.openModal('adjustModal');
    },

    handleSubmitAdjustment(event) {
        event.preventDefault();
        const skuId = document.getElementById('adjItemSelect').value;
        const type = document.getElementById('adjType').value;
        const qty = parseInt(document.getElementById('adjQty').value) || 0;
        const fromLoc = document.getElementById('adjFrom').value.trim();
        const toLoc = document.getElementById('adjTo').value.trim();
        const ref = document.getElementById('adjRef').value.trim();

        const item = window.dataStore.getInventory().find(i => i.id === skuId);
        if (!item) return;

        // update item stock level
        let delta = qty;
        if (type === 'Outbound Fulfillment') delta = -Math.abs(qty);

        item.stockLevel = Math.max(0, item.stockLevel + delta);
        if (item.stockLevel <= item.minStock * 0.4) item.status = 'Critical';
        else if (item.stockLevel <= item.minStock) item.status = 'Low Stock';
        else item.status = 'In Stock';

        window.dataStore.saveInventoryItem(item);

        const currentUser = window.auth.getCurrentUser();

        window.dataStore.addMovement({
            sku: item.id,
            productName: item.name,
            type: type,
            quantity: delta,
            fromLocation: fromLoc,
            toLocation: toLoc,
            performedBy: currentUser ? currentUser.name : 'Warehouse Operator',
            reference: ref || 'Manual-ADJ'
        });

        Utils.closeModal('adjustModal');
        window.notifications.showToast('Movement Logged', `Stock movement recorded for ${item.name}.`, 'success');
        window.router.refreshCurrentModule();
    },

    deleteSKU(id) {
        if (confirm(`Are you sure you want to delete SKU ${id}?`)) {
            window.dataStore.deleteInventoryItem(id);
            window.notifications.showToast('SKU Deleted', `${id} was removed from catalog.`, 'warning');
            window.router.refreshCurrentModule();
        }
    },

    exportCSV() {
        const items = this.getFilteredInventory();
        const headers = ['SKU Code', 'Product Name', 'Category', 'Warehouse', 'Stock Level', 'Unit', 'Unit Cost', 'Min Stock', 'Max Stock', 'Status'];
        const rows = items.map(i => [
            i.id,
            i.name,
            i.category,
            i.warehouse,
            i.stockLevel,
            i.unit,
            i.unitCost,
            i.minStock,
            i.maxStock,
            i.status
        ]);
        Utils.exportToCSV('Inventory_Stock_Levels', rows, headers);
    }
};

window.InventoryModule = InventoryModule;

