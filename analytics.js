/**
 * SupplyChainPro - Analytics & Reports Module
 * High-Precision Supply Chain Analytics Charts, Cost Analysis & Lead Time Tracking
 */

const AnalyticsModule = {
    chartInstances: {},

    render() {
        const suppliers = window.dataStore.getSuppliers();
        const purchaseOrders = window.dataStore.getPurchaseOrders();
        const orders = window.dataStore.getOrders();
        const inventory = window.dataStore.getInventory();

        const totalProcurementSpend = purchaseOrders.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        const totalSalesRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const avgLeadTime = suppliers.length ? (suppliers.reduce((s, x) => s + (x.leadTimeDays || 7), 0) / suppliers.length).toFixed(1) : 7.0;

        return `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Supply Chain Intelligence & Performance Analytics</h1>
                    <p class="page-subtitle">Real-time spend analytics, vendor SLA scorecards, inventory turnover, and lead time distribution.</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="AnalyticsModule.exportSummaryCSV()">
                        <i class="ri-download-2-line"></i> Export Analytics (CSV)
                    </button>
                    <button class="btn btn-primary" onclick="Utils.printReport()">
                        <i class="ri-file-pdf-line"></i> Generate Executive PDF Report
                    </button>
                </div>
            </div>

            <!-- KPI Row -->
            <div class="kpi-grid">
                <div class="kpi-card variant-success">
                    <div>
                        <div class="kpi-label">Perfect Order Fulfillment Rate</div>
                        <div class="kpi-value">96.4%</div>
                        <div class="kpi-meta"><span class="kpi-trend positive"><i class="ri-arrow-up-line"></i> +1.8%</span> vs industry avg</div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-checkbox-circle-line"></i></div>
                </div>

                <div class="kpi-card">
                    <div>
                        <div class="kpi-label">Average Supplier Lead Time</div>
                        <div class="kpi-value">${avgLeadTime} <span style="font-size: 1rem; font-weight: normal; color: var(--text-muted);">Days</span></div>
                        <div class="kpi-meta"><span class="kpi-trend positive"><i class="ri-arrow-down-line"></i> -1.2 days</span> faster lead times</div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-timer-line"></i></div>
                </div>

                <div class="kpi-card">
                    <div>
                        <div class="kpi-label">Active Procurement Spend</div>
                        <div class="kpi-value">${Utils.formatCurrency(totalProcurementSpend)}</div>
                        <div class="kpi-meta"><span class="kpi-trend neutral">Committed to purchase</span></div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-exchange-dollar-line"></i></div>
                </div>

                <div class="kpi-card variant-success">
                    <div>
                        <div class="kpi-label">Customer Revenue Realized</div>
                        <div class="kpi-value">${Utils.formatCurrency(totalSalesRevenue)}</div>
                        <div class="kpi-meta"><span class="kpi-trend positive"><i class="ri-arrow-up-line"></i> +14.8%</span> gross margins</div>
                    </div>
                    <div class="kpi-icon-wrap"><i class="ri-funds-line"></i></div>
                </div>
            </div>

            <!-- Chart Row 1: Cost Analysis & Spend By Category -->
            <div class="dashboard-grid-equal">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="ri-pie-chart-2-line" style="color: var(--primary);"></i> Procurement Spend by Category</h3>
                        <span style="font-size: 0.78rem; color: var(--text-muted);">Cost Breakdown</span>
                    </div>
                    <div class="card-body">
                        <div style="position: relative; height: 280px;">
                            <canvas id="categorySpendChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="ri-bar-chart-grouped-line" style="color: var(--primary);"></i> Monthly Spend vs. Order Outflow</h3>
                        <span style="font-size: 0.78rem; color: var(--text-muted);">2026 Trend ($k)</span>
                    </div>
                    <div class="card-body">
                        <div style="position: relative; height: 280px;">
                            <canvas id="spendTrendChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chart Row 2: Supplier Scorecard & Lead Times -->
            <div class="dashboard-grid-equal">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="ri-award-line" style="color: var(--primary);"></i> Supplier Quality vs. On-Time Delivery</h3>
                        <span style="font-size: 0.78rem; color: var(--text-muted);">Vendor SLA Matrix (%)</span>
                    </div>
                    <div class="card-body">
                        <div style="position: relative; height: 280px;">
                            <canvas id="supplierScorecardChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="ri-time-line" style="color: var(--primary);"></i> Lead Time by Commodity Category (Days)</h3>
                        <span style="font-size: 0.78rem; color: var(--text-muted);">Fulfillment Velocity</span>
                    </div>
                    <div class="card-body">
                        <div style="position: relative; height: 280px;">
                            <canvas id="leadTimeChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Detailed Cost & Performance Data Table -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="ri-file-list-2-line" style="color: var(--primary);"></i> Key Vendor Performance & Spend Ledger</h3>
                    <button class="btn btn-outline-primary btn-sm" onclick="AnalyticsModule.exportSummaryCSV()">
                        <i class="ri-download-line"></i> Download Ledger
                    </button>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Supplier Name</th>
                                    <th>Commodity</th>
                                    <th>Rating</th>
                                    <th>Quality Score</th>
                                    <th>On-Time Rate</th>
                                    <th>Lead Time</th>
                                    <th>Contracts</th>
                                    <th>YTD Spend</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${suppliers.map(s => `
                                    <tr>
                                        <td style="font-weight: 600;">${Utils.escapeHtml(s.name)}</td>
                                        <td><span style="background: var(--bg-hover); padding: 2px 8px; border-radius: var(--radius-sm); font-size: 0.8rem;">${s.category}</span></td>
                                        <td>${Utils.getRatingStars(s.rating)}</td>
                                        <td style="font-weight: 600; color: var(--status-completed);">${s.qualityScore || 95}%</td>
                                        <td style="font-weight: 600; color: ${(s.onTimeRate || 90) >= 90 ? 'var(--status-completed)' : 'var(--status-pending)'};">${s.onTimeRate || 92}%</td>
                                        <td><strong>${s.leadTimeDays || 7}</strong> days</td>
                                        <td>${s.activeContracts || 2} active</td>
                                        <td style="font-weight: 700; color: var(--text-primary); font-size: 0.92rem;">${Utils.formatCurrency(s.spend || 0)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    initCharts() {
        // Destroy existing chart instances
        Object.values(this.chartInstances).forEach(c => {
            if (c && typeof c.destroy === 'function') c.destroy();
        });
        this.chartInstances = {};

        const suppliers = window.dataStore.getSuppliers();
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#94A3B8' : '#475569';
        const gridColor = isDark ? '#243044' : '#E2E8F0';

        // 1. Category Spend Chart (Doughnut)
        const catCanvas = document.getElementById('categorySpendChart');
        if (catCanvas && window.Chart) {
            const categories = {};
            suppliers.forEach(s => {
                categories[s.category] = (categories[s.category] || 0) + (s.spend || 50000);
            });

            this.chartInstances.category = new Chart(catCanvas, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(categories),
                    datasets: [{
                        data: Object.values(categories),
                        backgroundColor: [
                            '#0EA5E9',
                            '#38BDF8',
                            '#0284C7',
                            '#6366F1',
                            '#10B981',
                            '#F59E0B'
                        ],
                        borderWidth: 2,
                        borderColor: isDark ? '#151D2A' : '#FFFFFF'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: textColor, font: { family: 'Inter', size: 12 } }
                        }
                    }
                }
            });
        }

        // 2. Monthly Spend vs Revenue (Bar + Line)
        const trendCanvas = document.getElementById('spendTrendChart');
        if (trendCanvas && window.Chart) {
            this.chartInstances.trend = new Chart(trendCanvas, {
                type: 'bar',
                data: {
                    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                    datasets: [
                        {
                            label: 'Procurement Spend ($)',
                            data: [42000, 58000, 61000, 79000, 84000, 95000],
                            backgroundColor: '#0EA5E9',
                            borderRadius: 6
                        },
                        {
                            label: 'Order Inflow ($)',
                            data: [56000, 72000, 81000, 99000, 112000, 128000],
                            backgroundColor: '#10B981',
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: textColor, font: { family: 'Inter', size: 12 } }
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { color: textColor }
                        },
                        y: {
                            grid: { color: gridColor },
                            ticks: {
                                color: textColor,
                                callback: val => '$' + (val / 1000) + 'k'
                            }
                        }
                    }
                }
            });
        }

        // 3. Supplier Scorecard Comparison (Horizontal Bar)
        const scorecardCanvas = document.getElementById('supplierScorecardChart');
        if (scorecardCanvas && window.Chart) {
            const names = suppliers.map(s => s.name.split(' ')[0]);
            const qualities = suppliers.map(s => s.qualityScore || 90);
            const onTimes = suppliers.map(s => s.onTimeRate || 92);

            this.chartInstances.scorecard = new Chart(scorecardCanvas, {
                type: 'bar',
                data: {
                    labels: names,
                    datasets: [
                        {
                            label: 'Quality Score (%)',
                            data: qualities,
                            backgroundColor: '#0EA5E9',
                            borderRadius: 4
                        },
                        {
                            label: 'On-Time Rate (%)',
                            data: onTimes,
                            backgroundColor: '#10B981',
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: textColor, font: { family: 'Inter', size: 12 } }
                        }
                    },
                    scales: {
                        x: {
                            min: 60,
                            max: 100,
                            grid: { color: gridColor },
                            ticks: { color: textColor }
                        },
                        y: {
                            grid: { display: false },
                            ticks: { color: textColor }
                        }
                    }
                }
            });
        }

        // 4. Lead Times by Category (Bar)
        const leadCanvas = document.getElementById('leadTimeChart');
        if (leadCanvas && window.Chart) {
            const leadTimesByCat = {};
            const countByCat = {};
            suppliers.forEach(s => {
                leadTimesByCat[s.category] = (leadTimesByCat[s.category] || 0) + (s.leadTimeDays || 7);
                countByCat[s.category] = (countByCat[s.category] || 0) + 1;
            });

            const categories = Object.keys(leadTimesByCat);
            const avgLeads = categories.map(c => Math.round(leadTimesByCat[c] / countByCat[c]));

            this.chartInstances.lead = new Chart(leadCanvas, {
                type: 'bar',
                data: {
                    labels: categories,
                    datasets: [{
                        label: 'Avg Lead Time (Days)',
                        data: avgLeads,
                        backgroundColor: '#6366F1',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: textColor, font: { family: 'Inter', size: 12 } }
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { color: textColor }
                        },
                        y: {
                            beginAtZero: true,
                            grid: { color: gridColor },
                            ticks: {
                                color: textColor,
                                callback: val => val + ' d'
                            }
                        }
                    }
                }
            });
        }
    },

    exportSummaryCSV() {
        const suppliers = window.dataStore.getSuppliers();
        const headers = ['Supplier Name', 'Category', 'Rating', 'Quality Score %', 'On-Time SLA %', 'Lead Time Days', 'Contracts', 'Spend'];
        const rows = suppliers.map(s => [
            s.name,
            s.category,
            s.rating,
            s.qualityScore,
            s.onTimeRate,
            s.leadTimeDays,
            s.activeContracts,
            s.spend
        ]);
        Utils.exportToCSV('Supply_Chain_Analytics_Report', rows, headers);
    }
};

window.AnalyticsModule = AnalyticsModule;

