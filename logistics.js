/**
 * SupplyChainPro - Logistics & Freight Shipping Module
 * Multi-Carrier Coordination, Route Milestones & Real-Time Tracking Simulator
 */

const LogisticsModule = {
    currentFilter: 'all',
    currentSearch: '',
    selectedShipmentId: null,

    render() {
        const shipments = this.getFilteredShipments();
        const allShipments = window.dataStore.getShipments();

        if (!this.selectedShipmentId && shipments.length > 0) {
            this.selectedShipmentId = shipments[0].id;
        }

        const selectedShipment = allShipments.find(s => s.id === this.selectedShipmentId) || shipments[0];

        // Metrics
        const activeTransit = allShipments.filter(s => s.status === 'In Progress').length;
        const delayedFreight = allShipments.filter(s => s.status === 'Delayed').length;
        const delivered = allShipments.filter(s => s.status === 'Completed').length;

        return `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Logistics Coordination & Freight Tracking</h1>
                    <p class="page-subtitle">Coordinate global transport carriers, monitor active waypoints, and resolve transit exceptions.</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="LogisticsModule.exportCSV()">
                        <i class="ri-download-2-line"></i> Export Freight Log (CSV)
                    </button>
                    <button class="btn btn-primary" onclick="LogisticsModule.openDispatchModal()">
                        <i class="ri-send-plane-line"></i> Dispatch New Shipment
                    </button>
                </div>
            </div>

            <!-- KPI Row -->
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div>
                        <div class="kpi-label">Active Freight In Transit</div>
                        <div class="kpi-value">${activeTransit}</div>
                        <div class="kpi-meta"><span class="kpi-trend positive"><i class="ri-radar-line"></i> Live Tracking</span></div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-truck-line"></i></div>
                </div>

                <div class="kpi-card ${delayedFreight > 0 ? 'variant-danger' : 'variant-success'}">
                    <div>
                        <div class="kpi-label">Delayed Shipments</div>
                        <div class="kpi-value">${delayedFreight}</div>
                        <div class="kpi-meta">
                            <span class="kpi-trend ${delayedFreight > 0 ? 'negative' : 'positive'}">
                                ${delayedFreight > 0 ? 'Weather / Port Delays' : 'Zero Exceptions'}
                            </span>
                        </div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-alarm-warning-line"></i></div>
                </div>

                <div class="kpi-card variant-success">
                    <div>
                        <div class="kpi-label">Delivered This Month</div>
                        <div class="kpi-value">${delivered}</div>
                        <div class="kpi-meta"><span class="kpi-trend positive"><i class="ri-check-double-line"></i> Verified POD</span></div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-checkbox-circle-line"></i></div>
                </div>

                <div class="kpi-card">
                    <div>
                        <div class="kpi-label">Contracted Carrier Partners</div>
                        <div class="kpi-value">4</div>
                        <div class="kpi-meta"><span class="kpi-trend neutral">FedEx, DHL, Maersk, UPS</span></div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-ship-line"></i></div>
                </div>
            </div>

            <!-- 2 Column Layout: Shipments List (Left) + Visual Milestone Route Tracker (Right) -->
            <div class="dashboard-grid-2">
                <!-- Left: Shipments Table -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="ri-compass-3-line" style="color: var(--primary);"></i> Consignments</h3>
                        <div class="filter-group">
                            <select class="form-control" style="font-size: 0.8rem;" onchange="LogisticsModule.handleStatusFilter(this.value)">
                                <option value="all" ${this.currentFilter === 'all' ? 'selected' : ''}>All Statuses</option>
                                <option value="In Progress" ${this.currentFilter === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                <option value="Delayed" ${this.currentFilter === 'Delayed' ? 'selected' : ''}>Delayed</option>
                                <option value="Pending" ${this.currentFilter === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Completed" ${this.currentFilter === 'Completed' ? 'selected' : ''}>Completed</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div style="padding: 12px 18px; border-bottom: 1px solid var(--border-color);">
                            <input type="text" class="form-control" placeholder="Search tracking #, route, carrier..." 
                                   value="${Utils.escapeHtml(this.currentSearch)}" oninput="LogisticsModule.handleSearch(this.value)" style="width: 100%;">
                        </div>

                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Tracking #</th>
                                        <th>Carrier & Mode</th>
                                        <th>Route</th>
                                        <th>Status</th>
                                        <th style="text-align: right;">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${shipments.length === 0 ? `
                                        <tr>
                                            <td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">
                                                No shipments match current filter.
                                            </td>
                                        </tr>
                                    ` : shipments.map(s => {
                                        const isSelected = selectedShipment && selectedShipment.id === s.id;
                                        return `
                                            <tr style="${isSelected ? 'background: var(--bg-hover); font-weight: 600;' : ''}; cursor: pointer;" onclick="LogisticsModule.selectShipment('${s.id}')">
                                                <td style="font-family: monospace; color: var(--primary); font-weight: 700;">
                                                    ${s.trackingNumber}
                                                    ${isSelected ? '<span style="font-size: 0.7rem; color: var(--primary); margin-left: 4px;">● Selected</span>' : ''}
                                                </td>
                                                <td>
                                                    <div style="font-size: 0.85rem;">${Utils.escapeHtml(s.carrier)}</div>
                                                    <div style="font-size: 0.72rem; color: var(--text-muted);">${Utils.escapeHtml(s.mode)}</div>
                                                </td>
                                                <td>
                                                    <div style="font-size: 0.82rem;">${Utils.escapeHtml(s.origin)}</div>
                                                    <div style="font-size: 0.75rem; color: var(--text-muted);">↓ ${Utils.escapeHtml(s.destination)}</div>
                                                </td>
                                                <td>${Utils.getStatusBadge(s.status)}</td>
                                                <td style="text-align: right;">
                                                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); LogisticsModule.cycleStatus('${s.id}')" title="Cycle Status">
                                                        <i class="ri-refresh-line"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Right: Visual Shipment Tracker & Route Milestones Card -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="ri-route-line" style="color: var(--primary);"></i> Live Route Visualizer</h3>
                        ${selectedShipment ? `
                            <span style="font-size: 0.78rem; font-family: monospace; font-weight: 600; color: var(--primary);">
                                ${selectedShipment.trackingNumber}
                            </span>
                        ` : ''}
                    </div>
                    <div class="card-body">
                        ${!selectedShipment ? `
                            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                                Select a consignment on the left to inspect its live transit timeline.
                            </div>
                        ` : `
                            <!-- Selected Consignment Header -->
                            <div style="background: var(--bg-main); padding: 18px; border-radius: var(--radius-md); margin-bottom: 24px; border: 1px solid var(--border-color);">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                    <div>
                                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Carrier & Order</div>
                                        <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-top: 2px;">
                                            ${Utils.escapeHtml(selectedShipment.carrier)} (${selectedShipment.mode})
                                        </div>
                                        <div style="font-size: 0.8rem; color: var(--text-muted);">Reference: ${selectedShipment.orderId || 'Direct Consignment'}</div>
                                    </div>
                                    <div style="text-align: right;">
                                        ${Utils.getStatusBadge(selectedShipment.status)}
                                        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">ETA: <strong>${selectedShipment.eta}</strong></div>
                                    </div>
                                </div>

                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                    <span style="font-size: 0.8rem; font-weight: 600;">Transit Progress</span>
                                    <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">${selectedShipment.progressPercent || 50}%</span>
                                </div>
                                <div style="width: 100%; height: 8px; background: var(--border-color); border-radius: var(--radius-full); overflow: hidden;">
                                    <div style="width: ${selectedShipment.progressPercent || 50}%; height: 100%; background: ${selectedShipment.status === 'Delayed' ? 'var(--status-delayed)' : 'var(--primary)'}; border-radius: var(--radius-full);"></div>
                                </div>

                                <div style="margin-top: 12px; font-size: 0.82rem;">
                                    <i class="ri-map-pin-user-line" style="color: var(--primary);"></i> Current Waypoint: 
                                    <strong>${Utils.escapeHtml(selectedShipment.currentLocation || 'In Transit')}</strong>
                                </div>
                            </div>

                            <!-- Milestone Stepper -->
                            <h4 style="font-size: 0.92rem; font-weight: 700; margin-bottom: 14px;">Transit Milestone Log</h4>
                            <div class="tracker-timeline">
                                ${(selectedShipment.milestones || []).map((step, idx) => `
                                    <div class="timeline-step ${step.completed ? 'completed' : (idx === 0 ? 'active' : '')}">
                                        <div class="step-marker">
                                            ${step.completed ? '<i class="ri-check-line" style="font-size: 0.75rem;"></i>' : ''}
                                        </div>
                                        <div class="step-info-title">${Utils.escapeHtml(step.title)}</div>
                                        <div class="step-info-meta">
                                            <i class="ri-map-pin-line"></i> ${Utils.escapeHtml(step.location)} • <i class="ri-time-line"></i> ${step.time}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>
            </div>

            <!-- Dispatch New Shipment Modal -->
            <div id="dispatchModal" class="modal-backdrop">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 class="modal-title">Dispatch New Cargo Shipment</h3>
                        <button class="modal-close-btn" onclick="Utils.closeModal('dispatchModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="dispatchForm" onsubmit="LogisticsModule.handleSubmitDispatch(event)">
                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Carrier Partner *</label>
                                    <select id="dispCarrier" class="form-control" required>
                                        <option value="FedEx Freight">FedEx Freight</option>
                                        <option value="DHL Express">DHL Express</option>
                                        <option value="Maersk Logistics">Maersk Logistics</option>
                                        <option value="UPS Supply Chain">UPS Supply Chain</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Transportation Mode</label>
                                    <select id="dispMode" class="form-control">
                                        <option value="Ground Express">Ground Express (Trucking)</option>
                                        <option value="Air Freight">Air Freight (Priority Cargo)</option>
                                        <option value="Maritime Cargo">Maritime Cargo (Container Ship)</option>
                                        <option value="Multimodal Rail">Multimodal Rail & Road</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Origin Hub / Terminal *</label>
                                    <input type="text" id="dispOrigin" class="form-control" required value="Chicago Central Hub, IL">
                                </div>
                                <div class="form-group">
                                    <label>Destination Port / City *</label>
                                    <input type="text" id="dispDestination" class="form-control" required placeholder="e.g. Frankfurt Cargo Hub, Germany">
                                </div>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Dispatch Date</label>
                                    <input type="date" id="dispDate" class="form-control" value="${new Date().toISOString().slice(0, 10)}">
                                </div>
                                <div class="form-group">
                                    <label>Estimated Arrival (ETA) *</label>
                                    <input type="date" id="dispEta" class="form-control" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Associated Order or PO Reference</label>
                                <input type="text" id="dispRef" class="form-control" placeholder="e.g. ORD-89210 or PO-2026-1043">
                            </div>

                            <div class="modal-footer" style="margin: 0 -24px -24px -24px; padding: 16px 24px;">
                                <button type="button" class="btn btn-secondary" onclick="Utils.closeModal('dispatchModal')">Cancel</button>
                                <button type="submit" class="btn btn-primary">Dispatch Cargo</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    getFilteredShipments() {
        let list = window.dataStore.getShipments();
        if (this.currentFilter !== 'all') {
            list = list.filter(s => s.status === this.currentFilter);
        }
        if (this.currentSearch.trim()) {
            const term = this.currentSearch.toLowerCase();
            list = list.filter(s =>
                s.trackingNumber.toLowerCase().includes(term) ||
                s.carrier.toLowerCase().includes(term) ||
                s.origin.toLowerCase().includes(term) ||
                s.destination.toLowerCase().includes(term)
            );
        }
        return list;
    },

    selectShipment(id) {
        this.selectedShipmentId = id;
        window.router.refreshCurrentModule();
    },

    handleSearch(val) {
        this.currentSearch = val;
        window.router.refreshCurrentModule();
    },

    handleStatusFilter(status) {
        this.currentFilter = status;
        window.router.refreshCurrentModule();
    },

    openDispatchModal() {
        const form = document.getElementById('dispatchForm');
        if (form) form.reset();

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 5);
        const etaInput = document.getElementById('dispEta');
        if (etaInput) etaInput.value = targetDate.toISOString().slice(0, 10);

        Utils.openModal('dispatchModal');
    },

    handleSubmitDispatch(event) {
        event.preventDefault();
        const origin = document.getElementById('dispOrigin').value.trim();
        const dest = document.getElementById('dispDestination').value.trim();
        const carrier = document.getElementById('dispCarrier').value;
        const mode = document.getElementById('dispMode').value;
        const dispatchDate = document.getElementById('dispDate').value;
        const eta = document.getElementById('dispEta').value;
        const ref = document.getElementById('dispRef').value.trim() || 'ORD-DIRECT';

        const shipmentData = {
            orderId: ref,
            carrier: carrier,
            origin: origin,
            destination: dest,
            mode: mode,
            status: 'In Progress',
            dispatchDate: dispatchDate,
            eta: eta,
            currentLocation: `${origin} (Outbound Gate)`,
            progressPercent: 25,
            milestones: [
                { title: 'Cargo Staged & Tagged', location: origin, time: `${dispatchDate} 08:30`, completed: true },
                { title: 'Carrier Inbound Handover', location: origin, time: `${dispatchDate} 12:00`, completed: true },
                { title: 'In Transit Via ' + mode, location: 'En Route', time: 'In Progress', completed: false },
                { title: 'Final Destination Arrival', location: dest, time: `Est. ${eta}`, completed: false }
            ]
        };

        const saved = window.dataStore.saveShipment(shipmentData);
        this.selectedShipmentId = saved.id;
        Utils.closeModal('dispatchModal');
        window.notifications.showToast('Cargo Dispatched', `Tracking ID ${saved.trackingNumber} dispatched via ${carrier}.`, 'success');
        window.router.refreshCurrentModule();
    },

    cycleStatus(id) {
        const shp = window.dataStore.getShipments().find(s => s.id === id);
        if (!shp) return;

        const nextStatuses = ['Planned', 'Pending', 'In Progress', 'Completed', 'Delayed'];
        const currentIdx = nextStatuses.indexOf(shp.status);
        const nextStatus = nextStatuses[(currentIdx + 1) % nextStatuses.length];

        shp.status = nextStatus;
        if (nextStatus === 'Completed') {
            shp.progressPercent = 100;
            if (shp.milestones) shp.milestones.forEach(m => m.completed = true);
        }

        window.dataStore.saveShipment(shp);
        window.notifications.showToast('Shipment Updated', `${shp.trackingNumber} status changed to "${nextStatus}"`, 'info');
        window.router.refreshCurrentModule();
    },

    exportCSV() {
        const shipments = this.getFilteredShipments();
        const headers = ['Shipment ID', 'Tracking Number', 'Order Ref', 'Carrier', 'Mode', 'Origin', 'Destination', 'Status', 'Dispatch Date', 'ETA', 'Current Waypoint'];
        const rows = shipments.map(s => [
            s.id,
            s.trackingNumber,
            s.orderId || '',
            s.carrier,
            s.mode,
            s.origin,
            s.destination,
            s.status,
            s.dispatchDate,
            s.eta,
            s.currentLocation
        ]);
        Utils.exportToCSV('Logistics_Shipments', rows, headers);
    }
};

window.LogisticsModule = LogisticsModule;

