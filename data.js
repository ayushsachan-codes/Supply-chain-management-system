/**
 * SupplyChainPro - Central Data Store & LocalStorage Persistence
 * Built for Web Development Internship Project
 */

const STORAGE_KEYS = {
    SUPPLIERS: 'scp_suppliers',
    PURCHASE_ORDERS: 'scp_purchase_orders',
    INVENTORY: 'scp_inventory',
    MOVEMENTS: 'scp_movements',
    ORDERS: 'scp_orders',
    SHIPMENTS: 'scp_shipments',
    NOTIFICATIONS: 'scp_notifications',
    USERS: 'scp_users',
    CURRENT_USER: 'scp_current_user',
    THEME: 'scp_theme'
};

// Initial Mock Data
const INITIAL_DATA = {
    suppliers: [
        {
            id: 'SUP-001',
            name: 'Apex Global Logistics & Materials',
            category: 'Raw Materials',
            contactName: 'Sarah Jenkins',
            email: 's.jenkins@apexmaterials.com',
            phone: '+1 (555) 234-8901',
            location: 'Chicago, IL, USA',
            rating: 4.9,
            qualityScore: 98,
            onTimeRate: 99,
            leadTimeDays: 5,
            status: 'Active',
            activeContracts: 4,
            spend: 420000
        },
        {
            id: 'SUP-002',
            name: 'Nexura Silicon & Components',
            category: 'Electronics',
            contactName: 'Kenji Takahashi',
            email: 'kenji.t@nexurasilicon.jp',
            phone: '+81 3 5555 0192',
            location: 'Tokyo / San Jose',
            rating: 4.7,
            qualityScore: 95,
            onTimeRate: 94,
            leadTimeDays: 12,
            status: 'Active',
            activeContracts: 6,
            spend: 680000
        },
        {
            id: 'SUP-003',
            name: 'EcoPack Circular Solutions',
            category: 'Packaging',
            contactName: 'Clara Dupont',
            email: 'clara@ecopack-solutions.eu',
            phone: '+33 1 40 22 88 11',
            location: 'Lyon, France',
            rating: 4.5,
            qualityScore: 92,
            onTimeRate: 91,
            leadTimeDays: 7,
            status: 'Active',
            activeContracts: 2,
            spend: 115000
        },
        {
            id: 'SUP-004',
            name: 'Vanguard Industrial Polymers',
            category: 'Chemicals',
            contactName: 'Robert Vance',
            email: 'rvance@vanguardchem.com',
            phone: '+1 (555) 438-9922',
            location: 'Houston, TX, USA',
            rating: 3.8,
            qualityScore: 84,
            onTimeRate: 78,
            leadTimeDays: 16,
            status: 'Pending Review',
            activeContracts: 1,
            spend: 89000
        },
        {
            id: 'SUP-005',
            name: 'AeroTrans Global Freight',
            category: 'Logistics',
            contactName: 'Marcus Lindholm',
            email: 'orders@aerotrans-freight.com',
            phone: '+49 40 822 4110',
            location: 'Hamburg, Germany',
            rating: 4.8,
            qualityScore: 97,
            onTimeRate: 96,
            leadTimeDays: 4,
            status: 'Active',
            activeContracts: 3,
            spend: 295000
        },
        {
            id: 'SUP-006',
            name: 'Nordic Precision Metalworks',
            category: 'Raw Materials',
            contactName: 'Astrid Olsen',
            email: 'astrid@nordicmetal.no',
            phone: '+47 22 34 56 78',
            location: 'Oslo, Norway',
            rating: 4.6,
            qualityScore: 94,
            onTimeRate: 92,
            leadTimeDays: 9,
            status: 'Active',
            activeContracts: 2,
            spend: 178000
        }
    ],

    purchaseOrders: [
        {
            id: 'PO-2026-1041',
            title: 'Q4 Microcontroller Batch & Substrates',
            supplierId: 'SUP-002',
            supplierName: 'Nexura Silicon & Components',
            requisitionId: 'REQ-9102',
            requestedBy: 'Elena Rostova',
            items: [
                { name: 'ARM Cortex Microcontroller Chip', qty: 2000, unitPrice: 12.50, total: 25000 },
                { name: 'Substrate Thermal Boards', qty: 1000, unitPrice: 8.00, total: 8000 }
            ],
            totalAmount: 33000,
            status: 'In Progress',
            orderDate: '2026-10-18',
            expectedDelivery: '2026-11-06',
            notes: 'Production run for smart IoT sensor batches'
        },
        {
            id: 'PO-2026-1042',
            title: 'Recycled Corrugated Packaging Bulk',
            supplierId: 'SUP-003',
            supplierName: 'EcoPack Circular Solutions',
            requisitionId: 'REQ-9108',
            requestedBy: 'David Miller',
            items: [
                { name: 'Eco-Shock Absorbing Inserts', qty: 5000, unitPrice: 1.20, total: 6000 },
                { name: 'Reinforced Shipping Cartons', qty: 3000, unitPrice: 2.10, total: 6300 }
            ],
            totalAmount: 12300,
            status: 'Completed',
            orderDate: '2026-10-10',
            expectedDelivery: '2026-10-24',
            notes: 'Delivered and verified at Central Hub'
        },
        {
            id: 'PO-2026-1043',
            title: 'High-Tensile Aerospace Alloy Bars',
            supplierId: 'SUP-001',
            supplierName: 'Apex Global Logistics & Materials',
            requisitionId: 'REQ-9115',
            requestedBy: 'Marcus Vance',
            items: [
                { name: 'Grade 5 Titanium Bar Rods', qty: 150, unitPrice: 120.00, total: 18000 },
                { name: 'Extruded Aluminum Profiles', qty: 400, unitPrice: 45.00, total: 18000 }
            ],
            totalAmount: 36000,
            status: 'Pending',
            orderDate: '2026-10-28',
            expectedDelivery: '2026-11-12',
            notes: 'Awaiting executive approval sign-off'
        },
        {
            id: 'PO-2026-1044',
            title: 'Industrial Solvent & Resin Reagents',
            supplierId: 'SUP-004',
            supplierName: 'Vanguard Industrial Polymers',
            requisitionId: 'REQ-9120',
            requestedBy: 'Samantha Cruz',
            items: [
                { name: 'Polyurethane Coating Resin 50L', qty: 25, unitPrice: 380.00, total: 9500 },
                { name: 'Degreaser Organic Agent 20L', qty: 30, unitPrice: 110.00, total: 3300 }
            ],
            totalAmount: 12800,
            status: 'Delayed',
            orderDate: '2026-10-05',
            expectedDelivery: '2026-10-22',
            notes: 'Delayed due to regional port congestion in Houston'
        },
        {
            id: 'PO-2026-1045',
            title: 'Cold-Chain Specialized Insulated Liners',
            supplierId: 'SUP-005',
            supplierName: 'AeroTrans Global Freight',
            requisitionId: 'REQ-9124',
            requestedBy: 'Elena Rostova',
            items: [
                { name: 'Thermal Insulation Blanket Kits', qty: 80, unitPrice: 195.00, total: 15600 }
            ],
            totalAmount: 15600,
            status: 'Planned',
            orderDate: '2026-10-30',
            expectedDelivery: '2026-11-18',
            notes: 'Scheduled for December peak seasonal buffer'
        }
    ],

    inventory: [
        {
            id: 'SKU-1001',
            name: 'ARM Cortex-M4 Microcontroller',
            category: 'Electronics',
            warehouse: 'Central Distribution Hub (Chicago)',
            stockLevel: 1450,
            minStock: 500,
            maxStock: 3000,
            unitCost: 12.50,
            unit: 'Units',
            status: 'In Stock',
            lastRestocked: '2026-10-24'
        },
        {
            id: 'SKU-1002',
            name: 'Lithium Polymer Battery 5000mAh',
            category: 'Energy',
            warehouse: 'West Coast Terminal (Los Angeles)',
            stockLevel: 180,
            minStock: 350,
            maxStock: 2000,
            unitCost: 18.20,
            unit: 'Units',
            status: 'Low Stock',
            lastRestocked: '2026-09-18'
        },
        {
            id: 'SKU-1003',
            name: 'Grade 5 Titanium Bar Rod (1m)',
            category: 'Raw Materials',
            warehouse: 'Central Distribution Hub (Chicago)',
            stockLevel: 420,
            minStock: 150,
            maxStock: 800,
            unitCost: 120.00,
            unit: 'Rods',
            status: 'In Stock',
            lastRestocked: '2026-10-20'
        },
        {
            id: 'SKU-1004',
            name: 'Reinforced Shipping Carton X-Large',
            category: 'Packaging',
            warehouse: 'Euro Transit Hub (Rotterdam)',
            stockLevel: 3200,
            minStock: 800,
            maxStock: 5000,
            unitCost: 2.10,
            unit: 'Boxes',
            status: 'In Stock',
            lastRestocked: '2026-10-25'
        },
        {
            id: 'SKU-1005',
            name: 'Precision Optical Sensor 4K',
            category: 'Electronics',
            warehouse: 'West Coast Terminal (Los Angeles)',
            stockLevel: 45,
            minStock: 200,
            maxStock: 1200,
            unitCost: 48.00,
            unit: 'Units',
            status: 'Critical',
            lastRestocked: '2026-09-04'
        },
        {
            id: 'SKU-1006',
            name: 'Industrial Polyurethane Resin 50L',
            category: 'Chemicals',
            warehouse: 'Central Distribution Hub (Chicago)',
            stockLevel: 62,
            minStock: 30,
            maxStock: 150,
            unitCost: 380.00,
            unit: 'Drums',
            status: 'In Stock',
            lastRestocked: '2026-10-15'
        },
        {
            id: 'SKU-1007',
            name: 'Aluminum Extrusion Beams 40x40',
            category: 'Raw Materials',
            warehouse: 'Euro Transit Hub (Rotterdam)',
            stockLevel: 890,
            minStock: 250,
            maxStock: 2000,
            unitCost: 45.00,
            unit: 'Beams',
            status: 'In Stock',
            lastRestocked: '2026-10-22'
        }
    ],

    movements: [
        {
            id: 'MOV-4011',
            sku: 'SKU-1001',
            productName: 'ARM Cortex-M4 Microcontroller',
            type: 'Inbound Receipt',
            quantity: 1000,
            fromLocation: 'Supplier (Nexura Silicon)',
            toLocation: 'Central Distribution Hub (Chicago)',
            timestamp: '2026-10-24 14:30',
            performedBy: 'Elena Rostova',
            reference: 'PO-2026-1041'
        },
        {
            id: 'MOV-4012',
            sku: 'SKU-1002',
            productName: 'Lithium Polymer Battery 5000mAh',
            type: 'Outbound Fulfillment',
            quantity: 220,
            fromLocation: 'West Coast Terminal (Los Angeles)',
            toLocation: 'Customer (Tesla Partner Lab)',
            timestamp: '2026-10-26 11:15',
            performedBy: 'David Miller',
            reference: 'ORD-89211'
        },
        {
            id: 'MOV-4013',
            sku: 'SKU-1004',
            productName: 'Reinforced Shipping Carton X-Large',
            type: 'Warehouse Transfer',
            quantity: 500,
            fromLocation: 'Euro Transit Hub (Rotterdam)',
            toLocation: 'Central Distribution Hub (Chicago)',
            timestamp: '2026-10-27 16:45',
            performedBy: 'Marcus Vance',
            reference: 'TRF-5502'
        },
        {
            id: 'MOV-4014',
            sku: 'SKU-1005',
            productName: 'Precision Optical Sensor 4K',
            type: 'Stock Adjustment',
            quantity: -5,
            fromLocation: 'West Coast Terminal (Los Angeles)',
            toLocation: 'Damaged Goods Quarantine',
            timestamp: '2026-10-29 09:20',
            performedBy: 'Samantha Cruz',
            reference: 'ADJ-108'
        }
    ],

    orders: [
        {
            id: 'ORD-89210',
            customerName: 'OmniRobotics Corp.',
            customerEmail: 'procure@omnirobotics.io',
            shippingAddress: '742 Silicon Boulevard, San Jose, CA',
            items: [
                { sku: 'SKU-1001', name: 'ARM Cortex-M4 Microcontroller', qty: 200, price: 18.00 },
                { sku: 'SKU-1003', name: 'Grade 5 Titanium Bar Rod (1m)', qty: 40, price: 160.00 }
            ],
            totalAmount: 10000,
            paymentStatus: 'Paid',
            status: 'In Progress',
            orderDate: '2026-10-25',
            estimatedDelivery: '2026-11-03',
            carrier: 'FedEx Freight',
            priority: 'High'
        },
        {
            id: 'ORD-89211',
            customerName: 'Tesla Partner Dynamics',
            customerEmail: 'logistics@teslapartner.net',
            shippingAddress: '1000 Gigafactory Way, Austin, TX',
            items: [
                { sku: 'SKU-1002', name: 'Lithium Polymer Battery 5000mAh', qty: 220, price: 26.50 }
            ],
            totalAmount: 5830,
            paymentStatus: 'Paid',
            status: 'Completed',
            orderDate: '2026-10-22',
            estimatedDelivery: '2026-10-28',
            carrier: 'DHL Express',
            priority: 'Urgent'
        },
        {
            id: 'ORD-89212',
            customerName: 'BioHealth Diagnostic Labs',
            customerEmail: 'supply@biohealthlabs.org',
            shippingAddress: '45 Kendall Square, Cambridge, MA',
            items: [
                { sku: 'SKU-1005', name: 'Precision Optical Sensor 4K', qty: 50, price: 68.00 }
            ],
            totalAmount: 3400,
            paymentStatus: 'Pending',
            status: 'Pending',
            orderDate: '2026-10-28',
            estimatedDelivery: '2026-11-08',
            carrier: 'UPS Supply Chain',
            priority: 'Standard'
        },
        {
            id: 'ORD-89213',
            customerName: 'Nordic Automation AS',
            customerEmail: 'contact@nordicauto.se',
            shippingAddress: 'Kungsportsavenyen 10, Gothenburg, Sweden',
            items: [
                { sku: 'SKU-1007', name: 'Aluminum Extrusion Beams 40x40', qty: 150, price: 65.00 }
            ],
            totalAmount: 9750,
            paymentStatus: 'Paid',
            status: 'Delayed',
            orderDate: '2026-10-18',
            estimatedDelivery: '2026-10-29',
            carrier: 'Maersk Logistics',
            priority: 'High'
        },
        {
            id: 'ORD-89214',
            customerName: 'AeroSpace Horizon Ltd.',
            customerEmail: 'fleet@aerospacehorizon.co.uk',
            shippingAddress: 'Aerospace Campus, Bristol, UK',
            items: [
                { sku: 'SKU-1003', name: 'Grade 5 Titanium Bar Rod (1m)', qty: 60, price: 160.00 },
                { sku: 'SKU-1006', name: 'Industrial Polyurethane Resin 50L', qty: 5, price: 490.00 }
            ],
            totalAmount: 12050,
            paymentStatus: 'Pending',
            status: 'Planned',
            orderDate: '2026-10-30',
            estimatedDelivery: '2026-11-15',
            carrier: 'DHL Express',
            priority: 'Standard'
        }
    ],

    shipments: [
        {
            id: 'SHP-77401',
            trackingNumber: 'TRK-9832-US',
            orderId: 'ORD-89210',
            carrier: 'FedEx Freight',
            origin: 'Chicago Hub, IL',
            destination: 'Silicon Valley, CA',
            mode: 'Ground Express',
            status: 'In Progress',
            dispatchDate: '2026-10-26',
            eta: '2026-11-03',
            currentLocation: 'Denver Regional Hub, CO',
            progressPercent: 65,
            milestones: [
                { title: 'Cargo Booked & Staged', location: 'Chicago Central Hub', time: '2026-10-26 09:30', completed: true },
                { title: 'Departed Facility', location: 'Chicago, IL', time: '2026-10-26 18:40', completed: true },
                { title: 'In Transit Crossing Midwest', location: 'Omaha Sort Center, NE', time: '2026-10-28 14:10', completed: true },
                { title: 'Sorting & Inspection', location: 'Denver Regional Hub, CO', time: '2026-10-30 08:15', completed: true },
                { title: 'Final Destination Delivery', location: 'San Jose, CA', time: 'Est. Nov 03 14:00', completed: false }
            ]
        },
        {
            id: 'SHP-77402',
            trackingNumber: 'TRK-4421-EU',
            orderId: 'ORD-89213',
            carrier: 'Maersk Logistics',
            origin: 'Rotterdam Port, Netherlands',
            destination: 'Gothenburg Port, Sweden',
            mode: 'Maritime Cargo',
            status: 'Delayed',
            dispatchDate: '2026-10-20',
            eta: '2026-11-02 (Delayed)',
            currentLocation: 'North Sea Coastal Route (Weather Hold)',
            progressPercent: 40,
            milestones: [
                { title: 'Container Sealed', location: 'Rotterdam Port', time: '2026-10-20 10:00', completed: true },
                { title: 'Vessel Departed', location: 'Rotterdam Pier 4', time: '2026-10-22 04:30', completed: true },
                { title: 'Weather Hold Advisory', location: 'North Sea Maritime Zone', time: '2026-10-28 22:00', completed: true },
                { title: 'Estimated Berth Arrival', location: 'Gothenburg Dock 2', time: 'Est. Nov 02', completed: false }
            ]
        },
        {
            id: 'SHP-77403',
            trackingNumber: 'TRK-1099-TX',
            orderId: 'ORD-89211',
            carrier: 'DHL Express',
            origin: 'Los Angeles Terminal, CA',
            destination: 'Austin Gigafactory, TX',
            mode: 'Air Freight',
            status: 'Completed',
            dispatchDate: '2026-10-23',
            eta: '2026-10-28',
            currentLocation: 'Austin Gigafactory Dock 4 (Delivered)',
            progressPercent: 100,
            milestones: [
                { title: 'Package Received', location: 'LAX Air Cargo', time: '2026-10-23 11:00', completed: true },
                { title: 'Air Flight Arrived', location: 'Austin Bergstrom Airport', time: '2026-10-24 07:15', completed: true },
                { title: 'Out for Priority Delivery', location: 'Austin, TX', time: '2026-10-25 08:30', completed: true },
                { title: 'Delivered & Signed', location: 'Austin Gigafactory', time: '2026-10-26 13:45', completed: true }
            ]
        },
        {
            id: 'SHP-77404',
            trackingNumber: 'TRK-6612-UK',
            orderId: 'PO-2026-1043',
            carrier: 'UPS Supply Chain',
            origin: 'Oslo Depot, Norway',
            destination: 'Chicago Central Hub, IL',
            mode: 'Ocean & Rail',
            status: 'Pending',
            dispatchDate: '2026-11-04',
            eta: '2026-11-20',
            currentLocation: 'Awaiting Customs Documents',
            progressPercent: 10,
            milestones: [
                { title: 'Consignment Created', location: 'Oslo Warehouse', time: '2026-10-29 17:00', completed: true },
                { title: 'Export Clearance', location: 'Oslo Customs', time: 'Pending Sign-off', completed: false },
                { title: 'Transatlantic Flight', location: 'In Flight', time: 'Upcoming', completed: false }
            ]
        }
    ],

    notifications: [
        {
            id: 'NOTIF-1',
            title: 'Critical Stock Alert',
            message: 'Precision Optical Sensor 4K (SKU-1005) is down to 45 units (Min: 200).',
            time: '10m ago',
            type: 'danger',
            read: false,
            linkModule: 'inventory'
        },
        {
            id: 'NOTIF-2',
            title: 'Shipment Delayed Alert',
            message: 'Shipment TRK-4421-EU to Gothenburg encountered weather delay in North Sea.',
            time: '1h ago',
            type: 'warning',
            read: false,
            linkModule: 'logistics'
        },
        {
            id: 'NOTIF-3',
            title: 'Purchase Order Approval Needed',
            message: 'PO-2026-1043 ($36,000) from Apex Global is awaiting executive sign-off.',
            time: '3h ago',
            type: 'info',
            read: false,
            linkModule: 'procurement'
        },
        {
            id: 'NOTIF-4',
            title: 'Order Completed Successfully',
            message: 'ORD-89211 has been delivered to Tesla Partner Dynamics.',
            time: '1d ago',
            type: 'success',
            read: true,
            linkModule: 'orders'
        }
    ],

    users: [
        {
            id: 'USR-01',
            name: 'Alexander Vance',
            email: 'admin@supplychainpro.com',
            password: 'admin',
            role: 'Supply Chain Director',
            department: 'Global Operations',
            avatar: 'AV'
        },
        {
            id: 'USR-02',
            name: 'Elena Rostova',
            email: 'elena@supplychainpro.com',
            password: 'user123',
            role: 'Procurement & Logistics Lead',
            department: 'Procurement',
            avatar: 'ER'
        }
    ]
};

// Data Store Controller with automatic LocalStorage sync
class DataStore {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
            this.resetToDefaults();
        }
    }

    resetToDefaults() {
        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(INITIAL_DATA.suppliers));
        localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(INITIAL_DATA.purchaseOrders));
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_DATA.inventory));
        localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_DATA.movements));
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_DATA.orders));
        localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(INITIAL_DATA.shipments));
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_DATA.notifications));
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_DATA.users));
        if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_DATA.users[0]));
        }
    }

    _get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading localStorage for key', key, e);
            return [];
        }
    }

    _set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to localStorage for key', key, e);
            return false;
        }
    }

    // Suppliers CRUD
    getSuppliers() { return this._get(STORAGE_KEYS.SUPPLIERS); }
    getSupplierById(id) { return this.getSuppliers().find(s => s.id === id); }
    saveSupplier(supplier) {
        const list = this.getSuppliers();
        const index = list.findIndex(s => s.id === supplier.id);
        if (index >= 0) {
            list[index] = { ...list[index], ...supplier };
        } else {
            if (!supplier.id) {
                supplier.id = 'SUP-' + String(list.length + 1).padStart(3, '0');
            }
            list.unshift(supplier);
        }
        this._set(STORAGE_KEYS.SUPPLIERS, list);
        return supplier;
    }
    deleteSupplier(id) {
        const list = this.getSuppliers().filter(s => s.id !== id);
        this._set(STORAGE_KEYS.SUPPLIERS, list);
    }

    // Purchase Orders CRUD
    getPurchaseOrders() { return this._get(STORAGE_KEYS.PURCHASE_ORDERS); }
    savePurchaseOrder(po) {
        const list = this.getPurchaseOrders();
        const index = list.findIndex(p => p.id === po.id);
        if (index >= 0) {
            list[index] = { ...list[index], ...po };
        } else {
            if (!po.id) {
                po.id = 'PO-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
            }
            list.unshift(po);
        }
        this._set(STORAGE_KEYS.PURCHASE_ORDERS, list);
        return po;
    }
    deletePurchaseOrder(id) {
        const list = this.getPurchaseOrders().filter(p => p.id !== id);
        this._set(STORAGE_KEYS.PURCHASE_ORDERS, list);
    }

    // Inventory CRUD
    getInventory() { return this._get(STORAGE_KEYS.INVENTORY); }
    saveInventoryItem(item) {
        const list = this.getInventory();
        const index = list.findIndex(i => i.id === item.id);
        if (index >= 0) {
            list[index] = { ...list[index], ...item };
        } else {
            if (!item.id) {
                item.id = 'SKU-' + Math.floor(1000 + Math.random() * 9000);
            }
            list.unshift(item);
        }
        this._set(STORAGE_KEYS.INVENTORY, list);
        return item;
    }
    deleteInventoryItem(id) {
        const list = this.getInventory().filter(i => i.id !== id);
        this._set(STORAGE_KEYS.INVENTORY, list);
    }

    // Movements
    getMovements() { return this._get(STORAGE_KEYS.MOVEMENTS); }
    addMovement(movement) {
        const list = this.getMovements();
        if (!movement.id) {
            movement.id = 'MOV-' + Math.floor(1000 + Math.random() * 9000);
        }
        if (!movement.timestamp) {
            const now = new Date();
            movement.timestamp = now.toISOString().replace('T', ' ').substring(0, 16);
        }
        list.unshift(movement);
        this._set(STORAGE_KEYS.MOVEMENTS, list);
        return movement;
    }

    // Customer Orders CRUD
    getOrders() { return this._get(STORAGE_KEYS.ORDERS); }
    saveOrder(order) {
        const list = this.getOrders();
        const index = list.findIndex(o => o.id === order.id);
        if (index >= 0) {
            list[index] = { ...list[index], ...order };
        } else {
            if (!order.id) {
                order.id = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
            }
            list.unshift(order);
        }
        this._set(STORAGE_KEYS.ORDERS, list);
        return order;
    }
    deleteOrder(id) {
        const list = this.getOrders().filter(o => o.id !== id);
        this._set(STORAGE_KEYS.ORDERS, list);
    }

    // Shipments CRUD
    getShipments() { return this._get(STORAGE_KEYS.SHIPMENTS); }
    saveShipment(shipment) {
        const list = this.getShipments();
        const index = list.findIndex(s => s.id === shipment.id);
        if (index >= 0) {
            list[index] = { ...list[index], ...shipment };
        } else {
            if (!shipment.id) {
                shipment.id = 'SHP-' + Math.floor(10000 + Math.random() * 90000);
            }
            if (!shipment.trackingNumber) {
                shipment.trackingNumber = 'TRK-' + Math.floor(1000 + Math.random() * 9000) + '-GL';
            }
            list.unshift(shipment);
        }
        this._set(STORAGE_KEYS.SHIPMENTS, list);
        return shipment;
    }
    deleteShipment(id) {
        const list = this.getShipments().filter(s => s.id !== id);
        this._set(STORAGE_KEYS.SHIPMENTS, list);
    }

    // Notifications
    getNotifications() { return this._get(STORAGE_KEYS.NOTIFICATIONS); }
    addNotification(notif) {
        const list = this.getNotifications();
        if (!notif.id) notif.id = 'NOTIF-' + Date.now();
        if (!notif.time) notif.time = 'Just now';
        notif.read = false;
        list.unshift(notif);
        this._set(STORAGE_KEYS.NOTIFICATIONS, list);
        return notif;
    }
    markNotificationsAsRead() {
        const list = this.getNotifications().map(n => ({ ...n, read: true }));
        this._set(STORAGE_KEYS.NOTIFICATIONS, list);
    }
    clearNotifications() {
        this._set(STORAGE_KEYS.NOTIFICATIONS, []);
    }

    // Users & Auth
    getUsers() { return this._get(STORAGE_KEYS.USERS); }
    addUser(user) {
        const list = this.getUsers();
        if (!user.id) user.id = 'USR-' + String(list.length + 1).padStart(2, '0');
        list.push(user);
        this._set(STORAGE_KEYS.USERS, list);
        return user;
    }
    getCurrentUser() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            return data ? JSON.parse(data) : null;
        } catch(e) {
            return null;
        }
    }
    setCurrentUser(user) {
        if (!user) {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        } else {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        }
    }

    // Theme (Light / Dark)
    getTheme() {
        return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    }
    setTheme(theme) {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }
}

// Global singleton instance
window.dataStore = new DataStore();

