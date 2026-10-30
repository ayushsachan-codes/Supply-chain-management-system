# SupplyChainPro - End-to-End Supply Chain Management System

[![Frontend-Only](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20JavaScript-0EA5E9)](#)
[![Status](https://img.shields.io/badge/Status-Completed-10B981)](#)
[![Theme](https://img.shields.io/badge/Theme-Light%20%2F%20Dark-0F172A)](#)

SupplyChainPro is a modern, enterprise-grade, frontend-only supply chain management application designed to provide end-to-end visibility and operational control across the entire global supply network.

---

## 🌟 Key Capabilities & Modules

### 1. Dashboard
- **Executive KPIs**: Real-time counters for active suppliers, open purchase orders, inventory health %, in-transit consignments, and order revenue pipeline.
- **Status Pipeline Summary Bar**: Unified distribution across **Planned**, **In Progress**, **Pending**, **Completed**, and **Delayed**.
- **Critical Stock Radar**: Instant alerts for inventory dipping below reorder points.
- **Recent POs & Active Waypoint Tracking**: Quick links to purchase orders and freight in transit.

### 2. Supplier Management (Full CRUD)
- **Vendor Directory**: Categorized across *Raw Materials*, *Electronics*, *Packaging*, *Chemicals*, and *Logistics*.
- **Performance Rating Scorecard**: 5-star scoring system, on-time SLA delivery percentage, defect quality scores, and lead time metrics.
- **Actions**: Add new suppliers, edit vendor details, delete with safety confirmation, search, category filter, and one-click CSV export.

### 3. Procurement & Purchase Orders (POs)
- **PO Management Wizard**: Dynamic item builder calculating quantities, unit prices, and line subtotals automatically.
- **Requisition Tracking**: Link requisitions to vendors, with approval lifecycle statuses (**Planned**, **Pending**, **In Progress**, **Completed**, **Delayed**).
- **Invoice & Goods Breakdown**: Interactive PO modal displaying itemized line items and procurement notes.
- **Exporting**: Instant CSV export of all purchase orders.

### 4. Warehouse & Inventory Management
- **Multi-Node Hubs**: Monitor stock distributed across *Central Distribution Hub (Chicago)*, *West Coast Terminal (Los Angeles)*, and *Euro Transit Hub (Rotterdam)*.
- **Stock Threshold Bars**: Dynamic indicators showing stock capacity, minimum safety buffer, and low/critical stock warnings.
- **Movement Audit Ledger**: Real-time logging of *Inbound Receipts*, *Outbound Fulfillment*, *Warehouse Transfers*, and *Stock Corrections*.
- **SKU Catalog**: Add and edit SKUs, unit costs, and warehouse allocations.

### 5. Customer Order Fulfillment
- **Sales & Logistics Operations**: Process client orders, select fulfillment carriers (*FedEx*, *DHL*, *Maersk*, *UPS*), and set priority levels (*Standard*, *High*, *Urgent*).
- **Automatic Shipment Generation**: Creating a customer order automatically stages a linked consignment in the Logistics module.
- **Order Lifecycle Controls**: Quick-cycle order statuses and review itemized order specs.

### 6. Logistics & Shipping Coordinator
- **Multi-Modal Transport**: Supports *Ground Express*, *Air Freight*, *Maritime Cargo*, and *Multimodal Rail*.
- **Live Route Visualizer**: Interactive transit milestone stepper detailing waypoints, timestamps, and active checkpoints.
- **Exception Management**: Track weather holds, port congestion, and delivery signatures.
- **Dispatch Cargo Modal**: Schedule new carrier consignments with tracking numbers and ETA calculations.

### 7. Intelligence & Analytics Reports
- **Dynamic Supply Chain Charts** (powered by Chart.js):
  - **Procurement Spend by Category** (Doughnut Chart)
  - **Monthly Spend vs. Order Inflow Trend** (Bar & Trend Analysis)
  - **Vendor SLA Matrix: Quality vs. On-Time Delivery** (Horizontal Bar Chart)
  - **Lead Time Distribution by Commodity** (Bar Chart)
- **Executive PDF Export**: Print-ready styling formatted specifically for paper or PDF generation.
- **Ledger Export**: Download complete vendor performance spreadsheets in CSV format.

### 8. Authentication & Session Management
- **Simulated Authentication**: Sign in and registration with instant session persistence.
- **Quick Demo Fill Buttons**:
  - **Supply Chain Director**: `admin@supplychainpro.com` / `admin`
  - **Procurement & Logistics Lead**: `elena@supplychainpro.com` / `user123`

---

## 🎨 Design System & Supply Chain Statuses

Following the official design guidelines:
- **Primary Brand**: `#0EA5E9` (Sky Blue)
- **Background**: `#F4F9FD` (Clean Light Gray)
- **Cards & Surfaces**: `#FFFFFF` (White)
- **Dark Mode**: High-contrast, executive slate dark theme (`#0B0F17` / `#151D2A`)

### Official Status Standard

| Status | Meaning | Color Code |
| :--- | :--- | :--- |
| **Planned** | Supply chain planned | `#64748B` (Slate) |
| **In Progress** | Active supply chain | `#0EA5E9` (Sky Blue) |
| **Pending** | Awaiting action / approval | `#F59E0B` (Amber) |
| **Completed** | Successfully completed | `#10B981` (Emerald) |
| **Delayed** | Delayed or on hold | `#EF4444` (Rose Red) |

---

## 🚀 How to Run the Project

Since this is a clean, dependency-free frontend build, you can run it immediately without needing Node.js or a backend server:

1. **Directly in Browser**:
   - Double-click `index.html` or open it in Google Chrome, Microsoft Edge, Firefox, or Safari.

2. **Using Local Server** (Optional for developers):
   - Using VS Code: Right-click `index.html` and click **"Open with Live Server"**.
   - Using Python:
     ```bash
     python -m http.server 8000
     ```
     Then navigate to `http://localhost:8000`.

---

## 📁 Project Structure

```text
supply chain management system/
├── index.html                   # Master application shell & navigation
├── README.md                    # Project documentation
├── css/
│   └── style.css                # Custom styling, dark mode, responsive layout, print styles
└── js/
    ├── data.js                  # Central data store, mock dataset & LocalStorage persistence
    ├── utils.js                 # Helpers: formatting, CSV export, PDF trigger, modals
    ├── notifications.js         # Real-time toast engine & notification drawer
    ├── auth.js                  # Authentication & session state controller
    ├── app.js                   # Client-side hash router, theme switcher & search
    └── modules/
        ├── dashboard.js         # KPIs, status breakdown, stock alerts
        ├── suppliers.js         # Supplier CRUD, scorecards & contracts
        ├── procurement.js       # PO creation wizard, itemized calculation
        ├── inventory.js         # Multi-warehouse tracking & movement ledger
        ├── orders.js            # Customer orders & fulfillment lifecycles
        ├── logistics.js         # Freight tracking & route milestone stepper
        ├── analytics.js         # Chart.js analytics, cost analysis & PDF reports
        └── authView.js          # Login & registration view
```

