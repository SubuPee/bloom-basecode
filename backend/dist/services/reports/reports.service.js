"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReportData = exports.getReturnsReport = exports.getSettlementsReport = exports.getTransactionsReport = exports.getProductionReport = exports.getInventoryReport = exports.getOrdersReport = exports.getSalesReport = exports.getReportsOverview = exports.ensureDefaultReportsData = void 0;
const VendorRelated_1 = require("../../models/VendorRelated");
const Product_1 = __importDefault(require("../../models/Product"));
const InventoryStock_1 = require("../../models/inventory/InventoryStock");
const ProductionOrder_1 = require("../../models/production/ProductionOrder");
// =====================================================
// DEFAULT SEED DATA FOR AUDIT TRAIL REPORTS
// =====================================================
const SEED_VENDOR_ORDERS = [
    {
        orderNumber: "BLM-10482",
        customerId: "CUS-2048",
        customerName: "Aarav Mehta",
        customerEmail: "aarav@example.com",
        customerPhone: "+91 98765 41082",
        shippingAddress: "Bandra West, Mumbai 400050",
        billingAddress: "Bandra West, Mumbai 400050",
        vendorId: "VEN-1001",
        vendorName: "Auralink Audio Labs",
        items: [
            {
                productId: "VP-01",
                productName: "Wireless Headphones Studio Pro",
                variantId: "VAR-01-BLK",
                variantName: "Matte Black · Standard",
                sku: "WH-1001-BLK",
                quantity: 1,
                unitPrice: 8999,
                totalPrice: 8999,
                vendorId: "VEN-1001",
            },
        ],
        totalQuantity: 1,
        grossAmount: 8999,
        discount: 500,
        tax: 1529,
        shippingFee: 0,
        netAmount: 8499,
        vendorGross: 8499,
        commissionAmount: 679.92,
        vendorEarnings: 7819.08,
        paymentStatus: "Paid",
        orderStatus: "Processing",
        date: "18 Sep 2026, 10:42",
        timeline: [
            { status: "New", date: "18 Sep, 10:42", description: "Order received via Bloom Storefront" },
            { status: "Confirmed", date: "18 Sep, 10:45", description: "Payment verified by Razorpay" },
            { status: "Processing", date: "18 Sep, 11:00", description: "Allocated to Mumbai Central warehouse" },
        ],
    },
    {
        orderNumber: "BLM-10481",
        customerId: "CUS-2047",
        customerName: "Meera Iyer",
        customerEmail: "meera@example.com",
        customerPhone: "+91 98670 33891",
        shippingAddress: "Indiranagar, Bengaluru 560038",
        billingAddress: "Indiranagar, Bengaluru 560038",
        vendorId: "VEN-1004",
        vendorName: "Luma Home & Living",
        items: [
            {
                productId: "VP-04",
                productName: "Arc Sculptural Table Lamp",
                variantId: "VAR-04-STD",
                variantName: "Brushed Brass · Warm LED",
                sku: "LM-3010-BRS",
                quantity: 1,
                unitPrice: 4499,
                totalPrice: 4499,
                vendorId: "VEN-1004",
            },
        ],
        totalQuantity: 1,
        grossAmount: 4499,
        discount: 0,
        tax: 809,
        shippingFee: 0,
        netAmount: 4499,
        vendorGross: 4499,
        commissionAmount: 449.9,
        vendorEarnings: 4049.1,
        paymentStatus: "Paid",
        orderStatus: "Shipped",
        date: "18 Sep 2026, 09:18",
        timeline: [
            { status: "New", date: "18 Sep, 09:18", description: "Order placed" },
            { status: "Processing", date: "18 Sep, 10:00", description: "Packed at Mumbai Central" },
            { status: "Shipped", date: "18 Sep, 12:30", description: "In transit with Blue Dart AWB #88921" },
        ],
    },
    {
        orderNumber: "BLM-10478",
        customerId: "CUS-2044",
        customerName: "Rohan Kapoor",
        customerEmail: "rohan@example.com",
        customerPhone: "+91 98231 61547",
        shippingAddress: "Koregaon Park, Pune 411001",
        billingAddress: "Koregaon Park, Pune 411001",
        vendorId: "VEN-1006",
        vendorName: "Kanso Ceramics Studio",
        items: [
            {
                productId: "VP-06",
                productName: "Handcrafted Ceramic Cookware Set",
                variantId: "VAR-06-3PC",
                variantName: "3-Piece Earth Stoneware Set",
                sku: "CK-7008-3PC",
                quantity: 1,
                unitPrice: 10999,
                totalPrice: 10999,
                vendorId: "VEN-1006",
            },
        ],
        totalQuantity: 1,
        grossAmount: 10999,
        discount: 1000,
        tax: 1800,
        shippingFee: 0,
        netAmount: 9999,
        vendorGross: 9999,
        commissionAmount: 1499.85,
        vendorEarnings: 8499.15,
        paymentStatus: "Refunded",
        orderStatus: "Returned",
        date: "17 Sep 2026, 12:11",
        timeline: [
            { status: "Delivered", date: "15 Sep", description: "Customer received shipment" },
            { status: "Returned", date: "17 Sep", description: "Return requested due to chipped lid" },
            { status: "Refunded", date: "17 Sep, 16:30", description: "Refund issued to customer" },
        ],
    },
    {
        orderNumber: "BLM-10475",
        customerId: "CUS-2041",
        customerName: "Ananya Sharma",
        customerEmail: "ananya@example.com",
        customerPhone: "+91 98111 22334",
        shippingAddress: "Connaught Place, New Delhi 110001",
        billingAddress: "Connaught Place, New Delhi 110001",
        vendorId: "VEN-1002",
        vendorName: "Common Good Textiles",
        items: [
            {
                productId: "VP-02",
                productName: "Organic Cotton Relaxed T-Shirt",
                variantId: "VAR-02-L",
                variantName: "Navy Blue · Large",
                sku: "CT-2001-NVY-L",
                quantity: 2,
                unitPrice: 1299,
                totalPrice: 2598,
                vendorId: "VEN-1002",
            },
        ],
        totalQuantity: 2,
        grossAmount: 2598,
        discount: 200,
        tax: 431,
        shippingFee: 50,
        netAmount: 2448,
        vendorGross: 2448,
        commissionAmount: 244.8,
        vendorEarnings: 2203.2,
        paymentStatus: "Paid",
        orderStatus: "Delivered",
        date: "16 Sep 2026, 15:30",
        timeline: [
            { status: "New", date: "16 Sep", description: "Order placed" },
            { status: "Delivered", date: "18 Sep", description: "Delivered successfully" },
        ],
    },
];
const SEED_TRANSACTIONS = [
    {
        transactionId: "VTX-8801",
        vendorId: "VEN-1001",
        vendorName: "Auralink Audio Labs",
        orderNumber: "BLM-10482",
        type: "Order Sale",
        amount: 8499,
        currency: "INR",
        status: "Completed",
        referenceId: "RAZOR-991204",
        description: "Credit for order sale #BLM-10482",
        createdDate: "18 Sep 2026, 10:42",
    },
    {
        transactionId: "VTX-8802",
        vendorId: "VEN-1001",
        vendorName: "Auralink Audio Labs",
        orderNumber: "BLM-10482",
        type: "Commission",
        amount: -679.92,
        currency: "INR",
        status: "Completed",
        referenceId: "COMM-8801",
        description: "Bloom 8% platform commission deduction",
        createdDate: "18 Sep 2026, 10:42",
    },
    {
        transactionId: "VTX-8803",
        vendorId: "VEN-1001",
        vendorName: "Auralink Audio Labs",
        type: "Vendor Settlement",
        amount: -124500,
        currency: "INR",
        status: "Completed",
        referenceId: "STL-2026-37",
        description: "Payout for settlement period 04 – 10 Sep 2026",
        createdDate: "12 Sep 2026, 11:00",
    },
    {
        transactionId: "VTX-8804",
        vendorId: "VEN-1006",
        vendorName: "Kanso Ceramics Studio",
        orderNumber: "BLM-10478",
        type: "Refund",
        amount: -8499.15,
        currency: "INR",
        status: "Completed",
        referenceId: "RET-501",
        description: "Return deduction for chipped cookware set #BLM-10478",
        createdDate: "17 Sep 2026, 16:30",
    },
];
const SEED_SETTLEMENTS = [
    {
        settlementId: "STL-2026-38",
        vendorId: "VEN-1001",
        vendorName: "Auralink Audio Labs",
        settlementPeriod: "11 – 17 Sep 2026",
        totalSales: 168400,
        commission: 13472,
        refunds: 0,
        adjustments: 0,
        taxes: 2424,
        otherCharges: 500,
        netPayable: 152004,
        paymentStatus: "Approved",
        settlementDate: "18 Sep 2026",
        notes: "Regular weekly settlement.",
    },
    {
        settlementId: "STL-2026-37",
        vendorId: "VEN-1001",
        vendorName: "Auralink Audio Labs",
        settlementPeriod: "04 – 10 Sep 2026",
        totalSales: 142000,
        commission: 11360,
        refunds: 4200,
        adjustments: 0,
        taxes: 1940,
        otherCharges: 0,
        netPayable: 124500,
        paymentStatus: "Paid",
        settlementDate: "11 Sep 2026",
        paidDate: "12 Sep 2026",
        referenceNumber: "UTR/HDFC/99248102",
    },
    {
        settlementId: "STL-2026-39",
        vendorId: "VEN-1002",
        vendorName: "Common Good Textiles",
        settlementPeriod: "11 – 17 Sep 2026",
        totalSales: 86400,
        commission: 8640,
        refunds: 2598,
        adjustments: 0,
        taxes: 1240,
        otherCharges: 0,
        netPayable: 73922,
        paymentStatus: "Pending",
        settlementDate: "18 Sep 2026",
    },
];
const SEED_RETURNS = [
    {
        returnId: "RET-501",
        orderNumber: "BLM-10478",
        vendorId: "VEN-1006",
        vendorName: "Kanso Ceramics Studio",
        productId: "VP-06",
        productName: "Handcrafted Ceramic Cookware Set",
        variantId: "VAR-06-3PC",
        variantName: "3-Piece Earth Stoneware Set",
        quantity: 1,
        reason: "Damaged in transit",
        customerReason: "The casserole pot lid arrived with a crack on the edge.",
        inspectionResult: "Damaged",
        dispositionAction: "Scrap",
        refundAmount: 9999,
        status: "Refunded",
        date: "17 Sep 2026",
        inspectedBy: "Alex Morgan",
        inspectionNotes: "Confirmed crack along rim. Unsuitable for resale. Scrapped and recorded.",
    },
    {
        returnId: "RET-502",
        orderNumber: "BLM-10465",
        vendorId: "VEN-1002",
        vendorName: "Common Good Textiles",
        productId: "VP-02",
        productName: "Organic Cotton Relaxed T-Shirt",
        variantId: "VAR-02-L",
        variantName: "Navy Blue · Large",
        quantity: 1,
        reason: "Wrong size fit",
        customerReason: "Too loose, exchanged for Medium.",
        inspectionResult: "Good",
        dispositionAction: "Restock",
        refundAmount: 1299,
        status: "Approved for Refund",
        date: "16 Sep 2026",
        inspectedBy: "Alex Morgan",
        inspectionNotes: "Tag attached, original packaging intact. Approved for restock.",
    },
];
// Helper to seed collections if empty
const ensureDefaultReportsData = async () => {
    const [ordersCount, settlementsCount, txnCount, returnsCount] = await Promise.all([
        VendorRelated_1.VendorOrder.countDocuments(),
        VendorRelated_1.VendorSettlement.countDocuments(),
        VendorRelated_1.VendorTransaction.countDocuments(),
        VendorRelated_1.VendorReturn.countDocuments(),
    ]);
    if (ordersCount === 0) {
        await VendorRelated_1.VendorOrder.insertMany(SEED_VENDOR_ORDERS);
    }
    if (settlementsCount === 0) {
        await VendorRelated_1.VendorSettlement.insertMany(SEED_SETTLEMENTS);
    }
    if (txnCount === 0) {
        await VendorRelated_1.VendorTransaction.insertMany(SEED_TRANSACTIONS);
    }
    if (returnsCount === 0) {
        await VendorRelated_1.VendorReturn.insertMany(SEED_RETURNS);
    }
};
exports.ensureDefaultReportsData = ensureDefaultReportsData;
// Date range threshold helper
const getDateThreshold = (range) => {
    if (!range || range === "all")
        return null;
    const now = new Date();
    if (range === "7d")
        now.setDate(now.getDate() - 7);
    else if (range === "30d")
        now.setDate(now.getDate() - 30);
    else if (range === "90d")
        now.setDate(now.getDate() - 90);
    return now;
};
// =====================================================
// 1. EXECUTIVE REPORTS OVERVIEW (KPIs)
// =====================================================
const getReportsOverview = async (filters) => {
    await (0, exports.ensureDefaultReportsData)();
    const { vendorId, dateRange } = filters;
    const orderFilter = {};
    const dateThreshold = getDateThreshold(dateRange);
    if (vendorId && vendorId !== "All") {
        orderFilter.vendorId = vendorId;
    }
    if (dateThreshold) {
        orderFilter.createdAt = { $gte: dateThreshold };
    }
    // Calculate gross sales & commission
    const orders = await VendorRelated_1.VendorOrder.find(orderFilter).lean();
    const totalSales = orders.reduce((sum, o) => sum + (o.vendorGross || 0), 0);
    const totalCommission = orders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
    const totalOrdersCount = orders.length;
    // Calculate active sellable stock across InventoryStock and Product variants
    const inventoryStocks = await InventoryStock_1.InventoryStock.find().lean();
    let totalInventoryUnits = inventoryStocks.reduce((sum, s) => sum + (s.availableStock || 0), 0);
    if (totalInventoryUnits === 0) {
        const products = await Product_1.default.find().lean();
        totalInventoryUnits = products.reduce((sum, p) => sum + (p.variants || []).reduce((vSum, v) => vSum + (v.availableStock || 0), 0), 0);
    }
    // Calculate produced units
    const productions = await ProductionOrder_1.ProductionOrder.find().lean();
    const totalProducedUnits = productions.reduce((sum, pr) => sum + (pr.goodQuantity || 0), 0);
    // Calculate disbursed payouts
    const settlementFilter = { paymentStatus: "Paid" };
    if (vendorId && vendorId !== "All")
        settlementFilter.vendorId = vendorId;
    const settlements = await VendorRelated_1.VendorSettlement.find(settlementFilter).lean();
    const totalSettledAmount = settlements.reduce((sum, s) => sum + (s.netPayable || 0), 0);
    // Calculate refunds
    const returns = await VendorRelated_1.VendorReturn.find().lean();
    const totalRefundAmount = returns.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
    return {
        kpis: {
            totalSales,
            totalCommission,
            totalOrdersCount,
            totalInventoryUnits,
            totalProducedUnits,
            totalSettledAmount,
            totalRefundAmount,
        },
        ordersCount: totalOrdersCount,
        settlementsCount: settlements.length,
        productionsCount: productions.length,
    };
};
exports.getReportsOverview = getReportsOverview;
// =====================================================
// 2. VENDOR SALES & REVENUE REPORT
// =====================================================
const getSalesReport = async (filters) => {
    await (0, exports.ensureDefaultReportsData)();
    const { search, vendorId, dateRange, page = 1, limit = 20 } = filters;
    const query = {};
    if (vendorId && vendorId !== "All")
        query.vendorId = vendorId;
    const dateThreshold = getDateThreshold(dateRange);
    if (dateThreshold)
        query.createdAt = { $gte: dateThreshold };
    if (search) {
        query.$or = [
            { orderNumber: { $regex: search, $options: "i" } },
            { customerName: { $regex: search, $options: "i" } },
            { vendorName: { $regex: search, $options: "i" } },
        ];
    }
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        VendorRelated_1.VendorOrder.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        VendorRelated_1.VendorOrder.countDocuments(query),
    ]);
    return {
        data: data.map((o) => ({
            id: o._id.toString(),
            orderNumber: o.orderNumber,
            date: o.date,
            vendorName: o.vendorName,
            vendorId: o.vendorId,
            customerName: o.customerName,
            vendorGross: o.vendorGross,
            commissionAmount: o.commissionAmount,
            vendorEarnings: o.vendorEarnings,
            orderStatus: o.orderStatus,
            paymentStatus: o.paymentStatus,
        })),
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
};
exports.getSalesReport = getSalesReport;
// =====================================================
// 3. VENDOR ORDERS & FULFILLMENT REPORT
// =====================================================
const getOrdersReport = async (filters) => {
    await (0, exports.ensureDefaultReportsData)();
    const { search, vendorId, dateRange, page = 1, limit = 20 } = filters;
    const query = {};
    if (vendorId && vendorId !== "All")
        query.vendorId = vendorId;
    const dateThreshold = getDateThreshold(dateRange);
    if (dateThreshold)
        query.createdAt = { $gte: dateThreshold };
    if (search) {
        query.$or = [
            { orderNumber: { $regex: search, $options: "i" } },
            { customerName: { $regex: search, $options: "i" } },
            { vendorName: { $regex: search, $options: "i" } },
        ];
    }
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        VendorRelated_1.VendorOrder.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        VendorRelated_1.VendorOrder.countDocuments(query),
    ]);
    return {
        data: data.map((o) => ({
            id: o._id.toString(),
            orderNumber: o.orderNumber,
            date: o.date,
            vendorName: o.vendorName,
            itemsCount: (o.items || []).length,
            vendorGross: o.vendorGross,
            orderStatus: o.orderStatus,
            paymentStatus: o.paymentStatus,
            items: o.items || [],
        })),
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
};
exports.getOrdersReport = getOrdersReport;
// =====================================================
// 4. INVENTORY STOCK LEDGER REPORT
// =====================================================
const getInventoryReport = async (filters) => {
    const { search, vendorId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    // Retrieve inventory stock joined with products
    const stockQuery = {};
    if (vendorId && vendorId !== "All")
        stockQuery.vendorId = vendorId;
    const stocks = await InventoryStock_1.InventoryStock.find(stockQuery)
        .populate("productId", "name sku price")
        .populate("vendorId", "businessName")
        .populate("warehouseId", "warehouseName")
        .skip(skip)
        .limit(limit)
        .lean();
    const total = await InventoryStock_1.InventoryStock.countDocuments(stockQuery);
    let formatted = stocks.map((s) => ({
        id: s._id.toString(),
        productName: s.productId?.name || "Product",
        variantName: s.sku,
        sku: s.sku,
        vendorName: s.vendorId?.businessName || "Direct",
        warehouseName: s.warehouseId?.warehouseName || "Main Warehouse",
        availableStock: s.availableStock || 0,
        reservedStock: s.reservedStock || 0,
        damagedStock: s.damagedStock || 0,
        minStock: 10,
        unitCode: s.unitCode || "PCS",
        price: s.productId?.price || 0,
    }));
    // If no inventory stock records yet, derive from Products collection
    if (formatted.length === 0) {
        const pQuery = {};
        if (search)
            pQuery.name = { $regex: search, $options: "i" };
        const products = await Product_1.default.find(pQuery).limit(limit).lean();
        formatted = products.flatMap((p) => (p.variants || [{ sku: p.sku || "SKU-01", name: "Standard", price: p.price || 0 }]).map((v) => ({
            id: `${p._id}-${v.sku}`,
            productName: p.name,
            variantName: v.title || v.name || "Standard",
            sku: v.sku,
            vendorName: "Bloom Marketplace",
            warehouseName: "Mumbai Central",
            availableStock: v.availableStock || 25,
            reservedStock: v.reservedStock || 4,
            damagedStock: v.damagedStock || 0,
            minStock: 10,
            unitCode: "PCS",
            price: v.price || p.price || 999,
        })));
    }
    return {
        data: formatted,
        pagination: { total: total || formatted.length, page, limit, pages: Math.ceil((total || formatted.length) / limit) },
    };
};
exports.getInventoryReport = getInventoryReport;
// =====================================================
// 5. PRODUCTION OUTPUT & QA REPORT
// =====================================================
const getProductionReport = async (filters) => {
    const { search, vendorId, dateRange, page = 1, limit = 20 } = filters;
    const query = {};
    if (vendorId && vendorId !== "All")
        query.vendorId = vendorId;
    const dateThreshold = getDateThreshold(dateRange);
    if (dateThreshold)
        query.createdAt = { $gte: dateThreshold };
    if (search) {
        query.$or = [
            { orderId: { $regex: search, $options: "i" } },
            { batchNumber: { $regex: search, $options: "i" } },
        ];
    }
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        ProductionOrder_1.ProductionOrder.find(query)
            .populate("productId", "name")
            .populate("vendorId", "businessName")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        ProductionOrder_1.ProductionOrder.countDocuments(query),
    ]);
    return {
        data: data.map((pr) => ({
            id: pr.orderId,
            batchNumber: pr.batchNumber,
            productName: pr.productId?.name || "Finished Goods",
            variantName: pr.variantId || "Standard",
            vendorName: pr.vendorId?.businessName || "In-House Mfg",
            plannedQuantity: pr.plannedQuantity,
            goodQuantity: pr.goodQuantity || 0,
            rejectedQuantity: pr.rejectedQuantity || 0,
            unit: pr.unit,
            status: pr.status,
            expectedCompletion: pr.expectedCompletion,
            completedAt: pr.completedAt,
        })),
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
};
exports.getProductionReport = getProductionReport;
// =====================================================
// 6. FINANCIAL TRANSACTIONS REPORT
// =====================================================
const getTransactionsReport = async (filters) => {
    await (0, exports.ensureDefaultReportsData)();
    const { search, vendorId, dateRange, page = 1, limit = 20 } = filters;
    const query = {};
    if (vendorId && vendorId !== "All")
        query.vendorId = vendorId;
    const dateThreshold = getDateThreshold(dateRange);
    if (dateThreshold)
        query.createdAt = { $gte: dateThreshold };
    if (search) {
        query.$or = [
            { transactionId: { $regex: search, $options: "i" } },
            { vendorName: { $regex: search, $options: "i" } },
            { referenceId: { $regex: search, $options: "i" } },
            { type: { $regex: search, $options: "i" } },
        ];
    }
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        VendorRelated_1.VendorTransaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        VendorRelated_1.VendorTransaction.countDocuments(query),
    ]);
    return {
        data: data.map((tx) => ({
            id: tx.transactionId,
            createdDate: tx.createdDate,
            vendorName: tx.vendorName,
            type: tx.type,
            amount: tx.amount,
            referenceId: tx.referenceId || "—",
            status: tx.status,
            description: tx.description,
        })),
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
};
exports.getTransactionsReport = getTransactionsReport;
// =====================================================
// 7. VENDOR SETTLEMENTS & PAYOUTS REPORT
// =====================================================
const getSettlementsReport = async (filters) => {
    await (0, exports.ensureDefaultReportsData)();
    const { search, vendorId, page = 1, limit = 20 } = filters;
    const query = {};
    if (vendorId && vendorId !== "All")
        query.vendorId = vendorId;
    if (search) {
        query.$or = [
            { settlementId: { $regex: search, $options: "i" } },
            { vendorName: { $regex: search, $options: "i" } },
            { settlementPeriod: { $regex: search, $options: "i" } },
        ];
    }
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        VendorRelated_1.VendorSettlement.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        VendorRelated_1.VendorSettlement.countDocuments(query),
    ]);
    return {
        data: data.map((st) => ({
            id: st.settlementId,
            settlementPeriod: st.settlementPeriod,
            vendorName: st.vendorName,
            totalSales: st.totalSales,
            commission: st.commission,
            netPayable: st.netPayable,
            paymentStatus: st.paymentStatus,
            paidDate: st.paidDate,
            referenceNumber: st.referenceNumber,
        })),
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
};
exports.getSettlementsReport = getSettlementsReport;
// =====================================================
// 8. CUSTOMER RETURNS REPORT
// =====================================================
const getReturnsReport = async (filters) => {
    await (0, exports.ensureDefaultReportsData)();
    const { search, vendorId, page = 1, limit = 20 } = filters;
    const query = {};
    if (vendorId && vendorId !== "All")
        query.vendorId = vendorId;
    if (search) {
        query.$or = [
            { returnId: { $regex: search, $options: "i" } },
            { orderNumber: { $regex: search, $options: "i" } },
            { productName: { $regex: search, $options: "i" } },
            { vendorName: { $regex: search, $options: "i" } },
            { reason: { $regex: search, $options: "i" } },
        ];
    }
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        VendorRelated_1.VendorReturn.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        VendorRelated_1.VendorReturn.countDocuments(query),
    ]);
    return {
        data: data.map((ret) => ({
            id: ret.returnId,
            orderNumber: ret.orderNumber,
            productName: ret.productName,
            vendorName: ret.vendorName,
            reason: ret.reason,
            inspectionResult: ret.inspectionResult,
            refundAmount: ret.refundAmount,
            status: ret.status,
            date: ret.date,
        })),
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
};
exports.getReturnsReport = getReturnsReport;
// =====================================================
// 9. DYNAMIC EXPORT (CSV & Structured JSON)
// =====================================================
const exportReportData = async (category, filters, format = "csv") => {
    await (0, exports.ensureDefaultReportsData)();
    let headers = [];
    let rows = [];
    const filename = `bloom_report_${category}_${new Date().toISOString().slice(0, 10)}.csv`;
    if (category === "sales" || category === "overview") {
        headers = ["Order Number", "Date", "Vendor", "Customer", "Gross (₹)", "Commission (₹)", "Vendor Net (₹)", "Status"];
        const result = await (0, exports.getSalesReport)({ ...filters, limit: 1000 });
        rows = result.data.map((o) => [
            o.orderNumber,
            o.date,
            `"${o.vendorName}"`,
            `"${o.customerName}"`,
            o.vendorGross,
            o.commissionAmount,
            o.vendorEarnings,
            o.orderStatus,
        ]);
    }
    else if (category === "orders") {
        headers = ["Order #", "Date", "Vendor", "Items Count", "Gross Value", "Fulfillment Status", "Payment"];
        const result = await (0, exports.getOrdersReport)({ ...filters, limit: 1000 });
        rows = result.data.map((o) => [
            o.orderNumber,
            o.date,
            `"${o.vendorName}"`,
            o.itemsCount,
            `₹${o.vendorGross}`,
            o.orderStatus,
            o.paymentStatus,
        ]);
    }
    else if (category === "inventory") {
        headers = ["Product", "SKU", "Vendor", "Available Stock", "Reserved", "Damaged", "Min Level"];
        const result = await (0, exports.getInventoryReport)({ ...filters, limit: 1000 });
        rows = result.data.map((i) => [
            `"${i.productName} - ${i.variantName}"`,
            i.sku,
            `"${i.vendorName}"`,
            i.availableStock,
            i.reservedStock,
            i.damagedStock,
            i.minStock,
        ]);
    }
    else if (category === "production") {
        headers = ["Work Order", "Batch #", "Product", "Vendor", "Planned", "Good Inwarded", "Rejected", "Status"];
        const result = await (0, exports.getProductionReport)({ ...filters, limit: 1000 });
        rows = result.data.map((p) => [
            p.id,
            p.batchNumber,
            `"${p.productName} - ${p.variantName}"`,
            `"${p.vendorName}"`,
            p.plannedQuantity,
            p.goodQuantity,
            p.rejectedQuantity,
            p.status,
        ]);
    }
    else if (category === "transactions") {
        headers = ["Txn ID", "Date", "Vendor", "Type", "Amount (₹)", "Reference", "Status"];
        const result = await (0, exports.getTransactionsReport)({ ...filters, limit: 1000 });
        rows = result.data.map((t) => [
            t.id,
            `"${t.createdDate}"`,
            `"${t.vendorName}"`,
            t.type,
            t.amount,
            t.referenceId || "N/A",
            t.status,
        ]);
    }
    else if (category === "settlements") {
        headers = ["Settlement ID", "Period", "Vendor", "Gross Sales", "Commission", "Net Payable", "Status"];
        const result = await (0, exports.getSettlementsReport)({ ...filters, limit: 1000 });
        rows = result.data.map((s) => [
            s.id,
            s.settlementPeriod,
            `"${s.vendorName}"`,
            s.totalSales,
            s.commission,
            s.netPayable,
            s.paymentStatus,
        ]);
    }
    else if (category === "returns") {
        headers = ["Return ID", "Order #", "Product", "Vendor", "Reason", "Inspection Result", "Refund (₹)", "Status"];
        const result = await (0, exports.getReturnsReport)({ ...filters, limit: 1000 });
        rows = result.data.map((r) => [
            r.id,
            r.orderNumber,
            `"${r.productName}"`,
            `"${r.vendorName}"`,
            `"${r.reason}"`,
            r.inspectionResult,
            r.refundAmount,
            r.status,
        ]);
    }
    if (format === "csv") {
        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        return { filename, csvContent };
    }
    return { filename, headers, rows };
};
exports.exportReportData = exportReportData;
//# sourceMappingURL=reports.service.js.map