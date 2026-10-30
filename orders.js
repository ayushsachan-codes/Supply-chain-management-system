/**
 * SupplyChainPro - Customer Order Management Module
 * Process Customer Orders, Track Fulfillment Lifecycles & Manage Allocations
 */

const OrdersModule = {
    currentFilter: 'all',
    currentSearch: '',

    render() {
        const orders = this.getFilteredOrders();
        const allOrders = window.dataStore.getOrders();

        const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const inProgress = allOrders.filter(o => o.status === 'In Progress').length;
        const pendingPayment = allOrders.filter(o => o.paymentStatus === 'Pending').length;
        const delayedOrders = allOrders.filter(o => o.status === 'Delayed').length;

        return `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Customer Order Fulfillment & Sales Logistics</h1>
                    <p class="page-subtitle">Process incoming client orders, allocate inventory, and manage order lifecycles.</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="OrdersModule.exportCSV()">
                        <i class="ri-download-2-line"></i> Export Orders (CSV)
                    </button>
                    <button class="btn btn-primary" onclick="OrdersModule.openCreateModal()">
                        <i class="ri-shopping-bag-3-line"></i> New Customer Order
                    </button>
                </div>
            </div>

            <!-- KPI Row -->
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div>
                        <div class="kpi-label">Total Order Value</div>
                        <div class="kpi-value">${Utils.formatCurrency(totalRevenue)}</div>
                        <div class="kpi-meta"><span class="kpi-trend positive"><i class="ri-arrow-up-line"></i> +18.5%</span> <span style="color: var(--text-muted);">Q4 Revenue</span></div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-funds-line"></i></div>
                </div>

                <div class="kpi-card">
                    <div>
                        <div class="kpi-label">Fulfillment In Progress</div>
                        <div class="kpi-value">${inProgress}</div>
                        <div class="kpi-meta"><span class="kpi-trend positive">Picking & Packing</span></div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-loader-4-line"></i></div>
                </div>

                <div class="kpi-card ${delayedOrders > 0 ? 'variant-danger' : 'variant-success'}">
                    <div>
                        <div class="kpi-label">Delayed Orders</div>
                        <div class="kpi-value">${delayedOrders}</div>
                        <div class="kpi-meta">
                            <span class="kpi-trend ${delayedOrders > 0 ? 'negative' : 'positive'}">
                                ${delayedOrders > 0 ? 'Action Required' : 'All On-Time'}
                            </span>
                        </div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-error-warning-line"></i></div>
                </div>

                <div class="kpi-card variant-warning">
                    <div>
                        <div class="kpi-label">Pending Invoices</div>
                        <div class="kpi-value">${pendingPayment}</div>
                        <div class="kpi-meta"><span class="kpi-trend neutral">Awaiting Payment</span></div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-bank-card-line"></i></div>
                </div>
            </div>

            <!-- Table & Filters -->
            <div class="card">
                <div class="card-body">
                    <div class="filter-bar">
                        <div class="filter-group">
                            <div style="position: relative; width: 280px;">
                                <input type="text" class="form-control" placeholder="Search Order #, customer, email..." 
                                       value="${Utils.escapeHtml(this.currentSearch)}" oninput="OrdersModule.handleSearch(this.value)">
                            </div>

                            <select class="form-control" onchange="OrdersModule.handleStatusFilter(this.value)">
                                <option value="all" ${this.currentFilter === 'all' ? 'selected' : ''}>All Order Statuses</option>
                                <option value="Planned" ${this.currentFilter === 'Planned' ? 'selected' : ''}>Planned</option>
                                <option value="In Progress" ${this.currentFilter === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                <option value="Pending" ${this.currentFilter === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Completed" ${this.currentFilter === 'Completed' ? 'selected' : ''}>Completed</option>
                                <option value="Delayed" ${this.currentFilter === 'Delayed' ? 'selected' : ''}>Delayed</option>
                            </select>
                        </div>

                        <div style="font-size: 0.85rem; color: var(--text-muted);">
                            Showing <strong>${orders.length}</strong> orders
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Client / Enterprise</th>
                                    <th>Items Ordered</th>
                                    <th>Order Total</th>
                                    <th>Carrier</th>
                                    <th>Priority</th>
                                    <th>Payment</th>
                                    <th>Fulfillment Status</th>
                                    <th style="text-align: right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orders.length === 0 ? `
                                    <tr>
                                        <td colspan="9" style="text-align: center; padding: 36px; color: var(--text-muted);">
                                            No customer orders found.
                                        </td>
                                    </tr>
                                ` : orders.map(ord => {
                                    const priorityBadge = {
                                        'Urgent': 'style="background: #FEE2E2; color: #DC2626;"',
                                        'High': 'style="background: #FEF3C7; color: #D97706;"',
                                        'Standard': 'style="background: #F1F5F9; color: #475569;"'
                                    }[ord.priority] || '';

                                    return `
                                        <tr>
                                            <td style="font-weight: 700; font-family: monospace; color: var(--primary);">${ord.id}</td>
                                            <td>
                                                <div style="font-weight: 600;">${Utils.escapeHtml(ord.customerName)}</div>
                                                <div style="font-size: 0.75rem; color: var(--text-muted);">${Utils.escapeHtml(ord.customerEmail)}</div>
                                            </td>
                                            <td>
                                                <span style="font-weight: 600; font-size: 0.82rem; background: var(--bg-hover); padding: 2px 8px; border-radius: var(--radius-sm);">
                                                    ${(ord.items || []).length} products
                                                </span>
                                            </td>
                                            <td style="font-weight: 700; font-size: 0.95rem;">
                                                ${Utils.formatCurrency(ord.totalAmount)}
                                            </td>
                                            <td>
                                                <span style="font-size: 0.82rem; font-weight: 500;">
                                                    <i class="ri-truck-line"></i> ${ord.carrier || 'Standard Freight'}
                                                </span>
                                            </td>
                                            <td>
                                                <span class="status-badge" ${priorityBadge}>${ord.priority || 'Standard'}</span>
                                            </td>
                                            <td>
                                                <span style="font-size: 0.78rem; font-weight: 600; color: ${ord.paymentStatus === 'Paid' ? 'var(--status-completed)' : 'var(--status-pending)'};">
                                                    ● ${ord.paymentStatus}
                                                </span>
                                            </td>
                                            <td>
                                                ${Utils.getStatusBadge(ord.status)}
                                            </td>
                                            <td style="text-align: right;">
                                                <div style="display: inline-flex; gap: 6px;">
                                                    <button class="btn btn-secondary btn-sm" onclick="OrdersModule.viewOrderDetails('${ord.id}')">
                                                        <i class="ri-eye-line"></i> View
                                                    </button>
                                                    <button class="btn btn-secondary btn-sm" onclick="OrdersModule.cycleStatus('${ord.id}')" title="Cycle Status">
                                                        <i class="ri-exchange-line"></i>
                                                    </button>
                                                    <button class="btn btn-secondary btn-sm" style="color: var(--status-delayed);" onclick="OrdersModule.deleteOrder('${ord.id}')" title="Delete">
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
                </div>
            </div>

            <!-- Create Order Modal -->
            <div id="createOrderModal" class="modal-backdrop">
                <div class="modal-dialog" style="max-width: 680px;">
                    <div class="modal-header">
                        <h3 class="modal-title">Create Customer Fulfillment Order</h3>
                        <button class="modal-close-btn" onclick="Utils.closeModal('createOrderModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="createOrderForm" onsubmit="OrdersModule.handleSubmitOrder(event)">
                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Customer / Enterprise Name *</label>
                                    <input type="text" id="ordFormCustomer" class="form-control" required placeholder="e.g. Lockheed Dynamics Ltd.">
                                </div>
                                <div class="form-group">
                                    <label>Customer Contact Email *</label>
                                    <input type="email" id="ordFormEmail" class="form-control" required placeholder="orders@client.com">
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Delivery Shipping Address *</label>
                                <input type="text" id="ordFormAddress" class="form-control" required placeholder="Street address, city, state, postal code">
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Carrier Coordinator</label>
                                    <select id="ordFormCarrier" class="form-control">
                                        <option value="FedEx Freight">FedEx Freight</option>
                                        <option value="DHL Express">DHL Express</option>
                                        <option value="UPS Supply Chain">UPS Supply Chain</option>
                                        <option value="Maersk Logistics">Maersk Logistics</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Fulfillment Priority</label>
                                    <select id="ordFormPriority" class="form-control">
                                        <option value="Standard">Standard</option>
                                        <option value="High">High Priority</option>
                                        <option value="Urgent">Urgent / Critical</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Order Date</label>
                                    <input type="date" id="ordFormDate" class="form-control" value="${new Date().toISOString().slice(0, 10)}">
                                </div>
                                <div class="form-group">
                                    <label>Estimated Delivery Date</label>
                                    <input type="date" id="ordFormDelivery" class="form-control" required>
                                </div>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Fulfillment Status</label>
                                    <select id="ordFormStatus" class="form-control">
                                        <option value="In Progress" selected>In Progress</option>
                                        <option value="Planned">Planned</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Delayed">Delayed</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Payment Status</label>
                                    <select id="ordFormPayment" class="form-control">
                                        <option value="Paid">Paid</option>
                                        <option value="Pending">Pending Invoice</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Line items simplified -->
                            <div class="form-group">
                                <label>Order Line Items (Select Inventory SKUs)</label>
                                <div id="orderItemsContainer" style="display: flex; flex-direction: column; gap: 8px;">
                                    <div class="order-item-row" style="display: flex; gap: 8px; align-items: center;">
                                        <input type="text" class="form-control ord-item-name" placeholder="Item Name / Part" value="ARM Cortex-M4 Microcontroller" required style="flex: 2;">
                                        <input type="number" class="form-control ord-item-qty" placeholder="Qty" value="100" min="1" required style="width: 90px;" oninput="OrdersModule.calculateOrderTotal()">
                                        <input type="number" class="form-control ord-item-price" placeholder="Unit Price ($)" value="22.50" step="0.01" min="0" required style="width: 110px;" oninput="OrdersModule.calculateOrderTotal()">
                                        <div class="ord-item-subtotal" style="width: 100px; font-weight: 600; text-align: right; font-size: 0.88rem;">$2,250.00</div>
                                    </div>
                                </div>

                                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 14px; padding-top: 10px; border-top: 1px dashed var(--border-color);">
                                    <span style="font-size: 0.95rem; font-weight: 600;">Total Invoice Amount:</span>
                                    <span id="ordCalculatedTotal" style="font-size: 1.3rem; font-weight: 800; color: var(--primary);">$2,250.00</span>
                                </div>
                            </div>

                            <div class="modal-footer" style="margin: 0 -24px -24px -24px; padding: 16px 24px;">
                                <button type="button" class="btn btn-secondary" onclick="Utils.closeModal('createOrderModal')">Cancel</button>
                                <button type="submit" class="btn btn-primary">Process Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- View Order Details Modal -->
            <div id="viewOrderModal" class="modal-backdrop">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 class="modal-title" id="viewOrderTitle">Order Details</h3>
                        <button class="modal-close-btn" onclick="Utils.closeModal('viewOrderModal')">&times;</button>
                    </div>
                    <div class="modal-body" id="viewOrderBody">
                        <!-- Populated dynamically -->
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="Utils.closeModal('viewOrderModal')">Close</button>
                    </div>
                </div>
            </div>
        `;
    },

    getFilteredOrders() {
        let list = window.dataStore.getOrders();
        if (this.currentFilter !== 'all') {
            list = list.filter(o => o.status === this.currentFilter);
        }
        if (this.currentSearch.trim()) {
            const term = this.currentSearch.toLowerCase();
            list = list.filter(o =>
                o.id.toLowerCase().includes(term) ||
                o.customerName.toLowerCase().includes(term) ||
                o.customerEmail.toLowerCase().includes(term) ||
                (o.carrier && o.carrier.toLowerCase().includes(term))
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
        const form = document.getElementById('createOrderForm');
        if (form) form.reset();

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 7);
        const delivInput = document.getElementById('ordFormDelivery');
        if (delivInput) delivInput.value = targetDate.toISOString().slice(0, 10);

        this.calculateOrderTotal();
        Utils.openModal('createOrderModal');
    },

    calculateOrderTotal() {
        const rows = document.querySelectorAll('#orderItemsContainer .order-item-row');
        let total = 0;
        rows.forEach(r => {
            const qty = parseFloat(r.querySelector('.ord-item-qty').value) || 0;
            const price = parseFloat(r.querySelector('.ord-item-price').value) || 0;
            const subtotal = qty * price;
            total += subtotal;
            const subtotalEl = r.querySelector('.ord-item-subtotal');
            if (subtotalEl) subtotalEl.textContent = Utils.formatCurrency(subtotal);
        });

        const totalEl = document.getElementById('ordCalculatedTotal');
        if (totalEl) totalEl.textContent = Utils.formatCurrency(total);
        return total;
    },

    handleSubmitOrder(event) {
        event.preventDefault();
        const rows = document.querySelectorAll('#orderItemsContainer .order-item-row');
        const items = [];
        let total = 0;

        rows.forEach(r => {
            const name = r.querySelector('.ord-item-name').value.trim();
            const qty = parseFloat(r.querySelector('.ord-item-qty').value) || 0;
            const price = parseFloat(r.querySelector('.ord-item-price').value) || 0;
            const subtotal = qty * price;
            total += subtotal;
            items.push({ name, qty, price });
        });

        const orderData = {
            customerName: document.getElementById('ordFormCustomer').value.trim(),
            customerEmail: document.getElementById('ordFormEmail').value.trim(),
            shippingAddress: document.getElementById('ordFormAddress').value.trim(),
            carrier: document.getElementById('ordFormCarrier').value,
            priority: document.getElementById('ordFormPriority').value,
            orderDate: document.getElementById('ordFormDate').value,
            estimatedDelivery: document.getElementById('ordFormDelivery').value,
            status: document.getElementById('ordFormStatus').value,
            paymentStatus: document.getElementById('ordFormPayment').value,
            items: items,
            totalAmount: total
        };

        const saved = window.dataStore.saveOrder(orderData);

        // Also automatically register a shipment in logistics
        window.dataStore.saveShipment({
            orderId: saved.id,
            carrier: orderData.carrier,
            origin: 'Central Distribution Hub (Chicago)',
            destination: orderData.shippingAddress,
            mode: 'Ground Express',
            status: orderData.status,
            dispatchDate: orderData.orderDate,
            eta: orderData.estimatedDelivery,
            currentLocation: 'Order Processing Facility',
            progressPercent: 20,
            milestones: [
                { title: 'Order Booked & Validated', location: 'Central Hub', time: `${orderData.orderDate} 10:00`, completed: true },
                { title: 'Picking & Packaging', location: 'Chicago Warehouse', time: `${orderData.orderDate} 15:30`, completed: true },
                { title: 'Handed to Carrier', location: orderData.carrier, time: 'Pending Pickup', completed: false },
                { title: 'Out for Final Delivery', location: orderData.shippingAddress, time: `Est. ${orderData.estimatedDelivery}`, completed: false }
            ]
        });

        Utils.closeModal('createOrderModal');
        window.notifications.showToast('Order Created', `Order ${saved.id} generated and shipment staged!`, 'success');
        window.router.refreshCurrentModule();
    },

    viewOrderDetails(id) {
        const ord = window.dataStore.getOrders().find(o => o.id === id);
        if (!ord) return;

        const title = document.getElementById('viewOrderTitle');
        const body = document.getElementById('viewOrderBody');

        if (title) title.textContent = `Order Details - ${ord.id}`;

        if (body) {
            body.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                    <div>
                        <h4 style="font-size: 1.15rem; font-weight: 700;">${Utils.escapeHtml(ord.customerName)}</h4>
                        <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">
                            ${Utils.escapeHtml(ord.customerEmail)} • Priority: <strong>${ord.priority}</strong>
                        </div>
                    </div>
                    <div>
                        ${Utils.getStatusBadge(ord.status)}
                    </div>
                </div>

                <div style="background: var(--bg-main); padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px;">
                    <div style="font-size: 0.82rem; margin-bottom: 6px;">
                        <span style="color: var(--text-muted);">Destination:</span> <strong>${Utils.escapeHtml(ord.shippingAddress)}</strong>
                    </div>
                    <div style="font-size: 0.82rem; margin-bottom: 6px;">
                        <span style="color: var(--text-muted);">Assigned Carrier:</span> <strong>${ord.carrier || 'Standard Freight'}</strong>
                    </div>
                    <div style="font-size: 0.82rem;">
                        <span style="color: var(--text-muted);">Order Date:</span> <strong>${ord.orderDate}</strong> | 
                        <span style="color: var(--text-muted);">ETA:</span> <strong>${ord.estimatedDelivery}</strong>
                    </div>
                </div>

                <h5 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 10px;">Ordered Goods</h5>
                <div class="table-responsive">
                    <table class="data-table" style="font-size: 0.82rem;">
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(ord.items || []).map(item => `
                                <tr>
                                    <td>${Utils.escapeHtml(item.name)}</td>
                                    <td>${Utils.formatNumber(item.qty)}</td>
                                    <td>${Utils.formatCurrency(item.price)}</td>
                                    <td style="text-align: right; font-weight: 600;">${Utils.formatCurrency((item.qty || 1) * (item.price || 0))}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colspan="3" style="text-align: right; font-size: 0.9rem;">Invoice Total:</th>
                                <th style="text-align: right; font-size: 1.05rem; color: var(--primary);">${Utils.formatCurrency(ord.totalAmount)}</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `;
        }

        Utils.openModal('viewOrderModal');
    },

    cycleStatus(id) {
        const ord = window.dataStore.getOrders().find(o => o.id === id);
        if (!ord) return;

        const nextStatuses = ['Planned', 'Pending', 'In Progress', 'Completed', 'Delayed'];
        const currentIdx = nextStatuses.indexOf(ord.status);
        const nextStatus = nextStatuses[(currentIdx + 1) % nextStatuses.length];

        ord.status = nextStatus;
        window.dataStore.saveOrder(ord);
        window.notifications.showToast('Order Status Updated', `${ord.id} changed to "${nextStatus}"`, 'info');
        window.router.refreshCurrentModule();
    },

    deleteOrder(id) {
        if (confirm(`Are you sure you want to delete order ${id}?`)) {
            window.dataStore.deleteOrder(id);
            window.notifications.showToast('Order Removed', `${id} was removed.`, 'warning');
            window.router.refreshCurrentModule();
        }
    },

    exportCSV() {
        const orders = this.getFilteredOrders();
        const headers = ['Order ID', 'Customer Name', 'Email', 'Shipping Address', 'Carrier', 'Priority', 'Payment Status', 'Status', 'Total Amount', 'Order Date', 'Estimated Delivery'];
        const rows = orders.map(o => [
            o.id,
            o.customerName,
            o.customerEmail,
            o.shippingAddress,
            o.carrier,
            o.priority,
            o.paymentStatus,
            o.status,
            o.totalAmount,
            o.orderDate,
            o.estimatedDelivery
        ]);
        Utils.exportToCSV('Customer_Orders', rows, headers);
    }
};

window.OrdersModule = OrdersModule;

