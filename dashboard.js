/**
 * SupplyChainPro - Dashboard Module
 */

const DashboardModule = {
    render() {
        const suppliers = window.dataStore.getSuppliers();
        const purchaseOrders = window.dataStore.getPurchaseOrders();
        const inventory = window.dataStore.getInventory();
        const orders = window.dataStore.getOrders();
        const shipments = window.dataStore.getShipments();

        // Calculate KPI metrics
        const totalSuppliers = suppliers.length;
        const activePOs = purchaseOrders.filter(p => p.status === 'In Progress' || p.status === 'Pending').length;
        const activeShipments = shipments.filter(s => s.status === 'In Progress').length;
        const delayedCount = shipments.filter(s => s.status === 'Delayed').length + purchaseOrders.filter(p => p.status === 'Delayed').length;
        
        const lowStockItems = inventory.filter(i => i.stockLevel <= i.minStock);
        const stockHealthPercent = Math.round(((inventory.length - lowStockItems.length) / (inventory.length || 1)) * 100);

        const totalOrderValue = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

        // Count status across all supply chain activities
        const allItemsWithStatus = [...purchaseOrders, ...orders, ...shipments];
        const statusCounts = {
            'Planned': allItemsWithStatus.filter(x => x.status === 'Planned').length,
            'In Progress': allItemsWithStatus.filter(x => x.status === 'In Progress').length,
            'Pending': allItemsWithStatus.filter(x => x.status === 'Pending').length,
            'Completed': allItemsWithStatus.filter(x => x.status === 'Completed').length,
            'Delayed': allItemsWithStatus.filter(x => x.status === 'Delayed').length
        };

        return `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Executive Supply Chain Dashboard</h1>
                    <p class="page-subtitle">Real-time operational visibility across procurement, inventory, orders, and logistics.</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="Utils.printReport()">
                        <i class="ri-printer-line"></i> Print Brief
                    </button>
                    <button class="btn btn-primary" onclick="window.router.navigateTo('procurement', { action: 'create' })">
                        <i class="ri-add-line"></i> New Purchase Order
                    </button>
                </div>
            </div>

            <!-- KPI Cards Grid -->
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div>
                        <div class="kpi-label">Active Suppliers</div>
                        <div class="kpi-value">${totalSuppliers}</div>
                        <div class="kpi-meta">
                            <span class="kpi-trend positive"><i class="ri-arrow-up-line"></i> 100%</span>
                            <span style="color: var(--text-muted);">compliance verified</span>
                        </div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-building-line"></i></div>
                </div>

                <div class="kpi-card variant-warning">
                    <div>
                        <div class="kpi-label">Active Purchase Orders</div>
                        <div class="kpi-value">${activePOs}</div>
                        <div class="kpi-meta">
                            <span class="kpi-trend neutral"><i class="ri-time-line"></i> Q4 Cycle</span>
                            <span style="color: var(--text-muted);">${purchaseOrders.length} total orders</span>
                        </div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-file-list-3-line"></i></div>
                </div>

                <div class="kpi-card ${stockHealthPercent < 75 ? 'variant-danger' : 'variant-success'}">
                    <div>
                        <div class="kpi-label">Inventory Health</div>
                        <div class="kpi-value">${stockHealthPercent}%</div>
                        <div class="kpi-meta">
                            <span class="kpi-trend ${lowStockItems.length > 0 ? 'negative' : 'positive'}">
                                ${lowStockItems.length} alerts
                            </span>
                            <span style="color: var(--text-muted);">below safe threshold</span>
                        </div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-archive-line"></i></div>
                </div>

                <div class="kpi-card">
                    <div>
                        <div class="kpi-label">In-Transit Shipments</div>
                        <div class="kpi-value">${activeShipments}</div>
                        <div class="kpi-meta">
                            <span class="kpi-trend ${delayedCount > 0 ? 'negative' : 'positive'}">
                                ${delayedCount} delayed
                            </span>
                            <span style="color: var(--text-muted);">across global routes</span>
                        </div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-truck-line"></i></div>
                </div>

                <div class="kpi-card variant-success">
                    <div>
                        <div class="kpi-label">Total Order Pipeline</div>
                        <div class="kpi-value">${Utils.formatCurrency(totalOrderValue)}</div>
                        <div class="kpi-meta">
                            <span class="kpi-trend positive"><i class="ri-arrow-up-line"></i> +14.2%</span>
                            <span style="color: var(--text-muted);">vs. last month</span>
                        </div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-money-dollar-circle-line"></i></div>
                </div>
            </div>

            <!-- Supply Chain Status Pipeline Summary Bar -->
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header">
                    <h3 class="card-title"><i class="ri-node-tree" style="color: var(--primary);"></i> Supply Chain Status Pipeline</h3>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Aggregated POs, Orders & Freight</span>
                </div>
                <div class="card-body">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
                        <div style="background: var(--status-planned-bg); padding: 14px 18px; border-radius: var(--radius-md); border-left: 4px solid var(--status-planned);">
                            <div style="font-size: 0.8rem; font-weight: 600; color: var(--status-planned);">Planned</div>
                            <div style="font-size: 1.6rem; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${statusCounts['Planned']}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Supply chain planned</div>
                        </div>

                        <div style="background: var(--status-inprogress-bg); padding: 14px 18px; border-radius: var(--radius-md); border-left: 4px solid var(--status-inprogress);">
                            <div style="font-size: 0.8rem; font-weight: 600; color: var(--status-inprogress);">In Progress</div>
                            <div style="font-size: 1.6rem; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${statusCounts['In Progress']}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Active supply chain</div>
                        </div>

                        <div style="background: var(--status-pending-bg); padding: 14px 18px; border-radius: var(--radius-md); border-left: 4px solid var(--status-pending);">
                            <div style="font-size: 0.8rem; font-weight: 600; color: var(--status-pending);">Pending</div>
                            <div style="font-size: 1.6rem; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${statusCounts['Pending']}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Awaiting action / approval</div>
                        </div>

                        <div style="background: var(--status-completed-bg); padding: 14px 18px; border-radius: var(--radius-md); border-left: 4px solid var(--status-completed);">
                            <div style="font-size: 0.8rem; font-weight: 600; color: var(--status-completed);">Completed</div>
                            <div style="font-size: 1.6rem; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${statusCounts['Completed']}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Successfully completed</div>
                        </div>

                        <div style="background: var(--status-delayed-bg); padding: 14px 18px; border-radius: var(--radius-md); border-left: 4px solid var(--status-delayed);">
                            <div style="font-size: 0.8rem; font-weight: 600; color: var(--status-delayed);">Delayed</div>
                            <div style="font-size: 1.6rem; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${statusCounts['Delayed']}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Delayed or on hold</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dashboard 2-Column Section -->
            <div class="dashboard-grid-2">
                <!-- Left: Recent Purchase Orders -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="ri-file-transfer-line" style="color: var(--primary);"></i> Recent Purchase Orders</h3>
                        <a href="#/procurement" class="btn btn-outline-primary btn-sm">View All POs</a>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>PO Number</th>
                                        <th>Supplier</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Expected Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${purchaseOrders.slice(0, 4).map(po => `
                                        <tr>
                                            <td style="font-weight: 600;">
                                                <a href="#/procurement" style="color: var(--primary); text-decoration: none;">${po.id}</a>
                                            </td>
                                            <td>${Utils.escapeHtml(po.supplierName)}</td>
                                            <td style="font-weight: 600;">${Utils.formatCurrency(po.totalAmount)}</td>
                                            <td>${Utils.getStatusBadge(po.status)}</td>
                                            <td>${po.expectedDelivery}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Right: Critical Inventory & Alerts -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="ri-alert-line" style="color: var(--status-pending);"></i> Stock Alerts</h3>
                        <a href="#/inventory" class="btn btn-outline-primary btn-sm">Manage Inventory</a>
                    </div>
                    <div class="card-body">
                        ${lowStockItems.length === 0 ? `
                            <div style="text-align: center; padding: 24px; color: var(--text-muted);">
                                <i class="ri-shield-check-line" style="font-size: 2rem; color: var(--status-completed); display: block; margin-bottom: 6px;"></i>
                                All inventory items are within safe stock thresholds!
                            </div>
                        ` : `
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                ${lowStockItems.map(item => `
                                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--bg-main); border-radius: var(--radius-md); border-left: 3px solid ${item.status === 'Critical' ? 'var(--status-delayed)' : 'var(--status-pending)'};">
                                        <div>
                                            <div style="font-weight: 600; font-size: 0.88rem;">${Utils.escapeHtml(item.name)}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);">${item.warehouse}</div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-weight: 700; color: ${item.status === 'Critical' ? 'var(--status-delayed)' : 'var(--status-pending)'}; font-size: 0.95rem;">
                                                ${item.stockLevel} / ${item.minStock} ${item.unit}
                                            </div>
                                            <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 600;">${item.status}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>
            </div>

            <!-- Active Shipments & Tracking Quick Grid -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="ri-navigation-line" style="color: var(--primary);"></i> Active Shipments Tracking</h3>
                    <a href="#/logistics" class="btn btn-outline-primary btn-sm">Open Freight Coordinator</a>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Tracking #</th>
                                    <th>Carrier</th>
                                    <th>Route</th>
                                    <th>Transit Status</th>
                                    <th>Current Waypoint</th>
                                    <th>ETA</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${shipments.map(shp => `
                                    <tr>
                                        <td style="font-weight: 600; font-family: monospace;">${shp.trackingNumber}</td>
                                        <td>
                                            <span style="font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
                                                <i class="ri-truck-fill" style="color: var(--primary);"></i> ${Utils.escapeHtml(shp.carrier)}
                                            </span>
                                        </td>
                                        <td>${Utils.escapeHtml(shp.origin)} → ${Utils.escapeHtml(shp.destination)}</td>
                                        <td>${Utils.getStatusBadge(shp.status)}</td>
                                        <td><span style="font-size: 0.82rem; color: var(--text-secondary);">${Utils.escapeHtml(shp.currentLocation)}</span></td>
                                        <td style="font-weight: 600;">${shp.eta}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
};

window.DashboardModule = DashboardModule;

