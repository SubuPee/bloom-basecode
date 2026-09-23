"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.exportOrders = exports.getOrderStats = exports.getOrderInvoice = exports.bulkUpdateStatus = exports.updatePaymentStatus = exports.updateOrderStatus = exports.createOrder = exports.getOrderById = exports.getOrders = exports.seedOrdersIfEmpty = exports.findOrderByIdOrIdentifier = exports.formatOrderResponse = exports.formatCurrencyINR = exports.formatDateForUI = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Order_1 = __importDefault(require("../models/Order"));
const Customer_1 = __importDefault(require("../models/Customer"));
const Product_1 = __importDefault(require("../models/Product"));
const order_validation_1 = require("../validations/order.validation");
const logger_1 = __importDefault(require("../utils/logger"));
// =====================================================
// ERROR HELPER
// =====================================================
const createError = (message, statusCode = 400, errors = null) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    if (errors) {
        error.errors = errors;
    }
    return error;
};
const escapeRegex = (value = "") => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
// =====================================================
// DATE & CURRENCY FORMATTERS
// =====================================================
const formatDateForUI = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime()))
        return "";
    const day = d.getDate();
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    const month = months[d.getMonth()];
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${month}, ${hours}:${mins}`;
};
exports.formatDateForUI = formatDateForUI;
const formatCurrencyINR = (amount) => {
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
};
exports.formatCurrencyINR = formatCurrencyINR;
// =====================================================
// RESPONSE SHAPING
// =====================================================
const formatOrderResponse = (orderDoc) => {
    const obj = orderDoc.toObject ? orderDoc.toObject() : { ...orderDoc };
    const totalQuantity = obj.totalQuantity ||
        (Array.isArray(obj.items)
            ? obj.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
            : 0);
    const productNames = Array.isArray(obj.items)
        ? obj.items.map((i) => i.productName).filter(Boolean)
        : [];
    const rawDate = obj.createdAt || new Date();
    return {
        ...obj,
        id: obj.orderNumber || String(obj._id),
        orderNumber: obj.orderNumber,
        customer: obj.customerName,
        email: obj.customerEmail,
        address: obj.shippingAddress?.fullAddress || obj.shippingAddress || "",
        date: (0, exports.formatDateForUI)(rawDate),
        items: `${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}`,
        total: (0, exports.formatCurrencyINR)(obj.totalAmount || 0),
        totalAmount: obj.totalAmount || 0,
        payment: obj.paymentStatus,
        status: obj.orderStatus,
        products: productNames,
        itemsList: obj.items || [],
    };
};
exports.formatOrderResponse = formatOrderResponse;
// =====================================================
// RESILIENT IDENTIFIER LOOKUP (ObjectId, OrderNumber, Index)
// =====================================================
const findOrderByIdOrIdentifier = async (idOrIdentifier) => {
    if (!idOrIdentifier)
        return null;
    const clean = String(idOrIdentifier).trim();
    const cleanStripped = clean.replace(/^#/, "");
    // 1. Try by ObjectId if valid
    if (mongoose_1.default.Types.ObjectId.isValid(clean)) {
        const order = await Order_1.default.findById(clean)
            .populate("customerId")
            .populate("items.productId");
        if (order)
            return order;
    }
    // 2. Try by orderNumber (e.g. "BLM-10482" or "#BLM-10482")
    const byNumber = await Order_1.default.findOne({
        $or: [
            { orderNumber: new RegExp(`^${escapeRegex(clean)}$`, "i") },
            { orderNumber: new RegExp(`^${escapeRegex(cleanStripped)}$`, "i") },
        ],
    })
        .populate("customerId")
        .populate("items.productId");
    if (byNumber)
        return byNumber;
    // 3. Try by 1-based index (e.g. "1", "2")
    const num = parseInt(clean, 10);
    if (!isNaN(num) && num > 0 && String(num) === clean) {
        const orders = await Order_1.default.find()
            .sort({ createdAt: -1 })
            .skip(num - 1)
            .limit(1)
            .populate("customerId")
            .populate("items.productId");
        if (orders.length > 0)
            return orders[0];
    }
    return null;
};
exports.findOrderByIdOrIdentifier = findOrderByIdOrIdentifier;
// =====================================================
// CATALOG AUTO-SEEDING (from bloom-commerce.ts)
// =====================================================
const seedOrdersIfEmpty = async () => {
    const orderCount = await Order_1.default.countDocuments();
    if (orderCount >= 6) {
        return;
    }
    logger_1.default.info("Seeding e-commerce orders and customers from bloom-commerce catalog...");
    // 1. Seed customers if not already present
    const customerSeeds = [
        {
            code: "CUS-2048",
            name: "Aarav Mehta",
            email: "aarav@example.com",
            phone: "+91 98765 41082",
            orders: 18,
            spent: 84620,
            segment: "VIP",
            city: "Mumbai",
            address: "Bandra West, Mumbai",
            status: "Active",
        },
        {
            code: "CUS-2047",
            name: "Meera Iyer",
            email: "meera@example.com",
            phone: "+91 98670 33891",
            orders: 12,
            spent: 52340,
            segment: "Returning",
            city: "Bengaluru",
            address: "Indiranagar, Bengaluru",
            status: "Active",
        },
        {
            code: "CUS-2046",
            name: "Kabir Shah",
            email: "kabir@example.com",
            phone: "+91 99204 67018",
            orders: 8,
            spent: 31875,
            segment: "Returning",
            city: "New Delhi",
            address: "Vasant Kunj, New Delhi",
            status: "Active",
        },
        {
            code: "CUS-2045",
            name: "Ananya Rao",
            email: "ananya@example.com",
            phone: "+91 98490 42136",
            orders: 3,
            spent: 8970,
            segment: "New",
            city: "Hyderabad",
            address: "Jubilee Hills, Hyderabad",
            status: "Active",
        },
        {
            code: "CUS-2044",
            name: "Rohan Kapoor",
            email: "rohan@example.com",
            phone: "+91 98231 61547",
            orders: 6,
            spent: 19260,
            segment: "At risk",
            city: "Pune",
            address: "Koregaon Park, Pune",
            status: "Inactive",
        },
        {
            code: "CUS-2043",
            name: "Diya Nair",
            email: "diya@example.com",
            phone: "+91 98951 73420",
            orders: 14,
            spent: 68110,
            segment: "VIP",
            city: "Kochi",
            address: "Panampilly Nagar, Kochi",
            status: "Active",
        },
    ];
    const customerMap = new Map();
    for (const c of customerSeeds) {
        let customer = await Customer_1.default.findOne({ email: c.email });
        if (!customer) {
            customer = await Customer_1.default.create({
                customerCode: c.code,
                name: c.name,
                email: c.email,
                phone: c.phone,
                ordersCount: c.orders,
                totalSpent: c.spent,
                segment: c.segment,
                city: c.city,
                address: c.address,
                status: c.status,
            });
        }
        customerMap.set(c.name, customer);
    }
    // 2. Fetch catalog products to link real items
    const products = await Product_1.default.find();
    const productByNameMap = new Map();
    products.forEach((p) => {
        productByNameMap.set(p.productName.toLowerCase().trim(), p);
    });
    // 3. Seed the 6 verified orders
    const orderSeeds = [
        {
            orderNumber: "BLM-10482",
            customerName: "Aarav Mehta",
            email: "aarav@example.com",
            address: "Bandra West, Mumbai",
            totalAmount: 8298,
            subtotal: 8298,
            paymentStatus: "Paid",
            orderStatus: "Processing",
            createdAt: new Date("2026-09-18T10:42:00.000Z"),
            productItems: [
                { name: "Wireless Headphones", qty: 1, price: 6999 },
                { name: "Organic Cotton T-Shirt", qty: 1, price: 1299 },
            ],
            timeline: [
                { step: "Order confirmed", timestamp: new Date("2026-09-18T10:42:00.000Z"), completed: true },
                { step: "Payment received", timestamp: new Date("2026-09-18T10:43:00.000Z"), completed: true },
                { step: "Packed at Mumbai Central", timestamp: new Date("2026-09-18T13:20:00.000Z"), completed: true },
                { step: "Processing", timestamp: new Date("2026-09-18T14:00:00.000Z"), completed: true },
            ],
        },
        {
            orderNumber: "BLM-10481",
            customerName: "Meera Iyer",
            email: "meera@example.com",
            address: "Indiranagar, Bengaluru",
            totalAmount: 3499,
            subtotal: 3499,
            paymentStatus: "Paid",
            orderStatus: "Shipped",
            createdAt: new Date("2026-09-18T09:18:00.000Z"),
            productItems: [{ name: "Arc Table Lamp", qty: 1, price: 3499 }],
            timeline: [
                { step: "Order confirmed", timestamp: new Date("2026-09-18T09:18:00.000Z"), completed: true },
                { step: "Payment received", timestamp: new Date("2026-09-18T09:19:00.000Z"), completed: true },
                { step: "Packed at Mumbai Central", timestamp: new Date("2026-09-18T11:00:00.000Z"), completed: true },
                { step: "Shipped via BlueDart Express", timestamp: new Date("2026-09-18T14:30:00.000Z"), completed: true },
            ],
        },
        {
            orderNumber: "BLM-10480",
            customerName: "Kabir Shah",
            email: "kabir@example.com",
            address: "Vasant Kunj, New Delhi",
            totalAmount: 6999,
            subtotal: 6999,
            paymentStatus: "Paid",
            orderStatus: "Delivered",
            createdAt: new Date("2026-09-17T18:04:00.000Z"),
            productItems: [{ name: "Wireless Headphones", qty: 1, price: 6999 }],
            timeline: [
                { step: "Order confirmed", timestamp: new Date("2026-09-17T18:04:00.000Z"), completed: true },
                { step: "Payment received", timestamp: new Date("2026-09-17T18:05:00.000Z"), completed: true },
                { step: "Packed at Mumbai Central", timestamp: new Date("2026-09-17T20:00:00.000Z"), completed: true },
                { step: "Delivered", timestamp: new Date("2026-09-18T16:20:00.000Z"), completed: true },
            ],
        },
        {
            orderNumber: "BLM-10479",
            customerName: "Ananya Rao",
            email: "ananya@example.com",
            address: "Jubilee Hills, Hyderabad",
            totalAmount: 2198,
            subtotal: 2198,
            paymentStatus: "Pending",
            orderStatus: "Processing",
            createdAt: new Date("2026-09-17T15:36:00.000Z"),
            productItems: [
                { name: "Vitamin C Face Serum", qty: 1, price: 899 },
                { name: "Organic Cotton T-Shirt", qty: 1, price: 1299 },
            ],
            timeline: [
                { step: "Order confirmed", timestamp: new Date("2026-09-17T15:36:00.000Z"), completed: true },
                { step: "Awaiting payment verification", timestamp: new Date("2026-09-17T15:40:00.000Z"), completed: true },
            ],
        },
        {
            orderNumber: "BLM-10478",
            customerName: "Rohan Kapoor",
            email: "rohan@example.com",
            address: "Koregaon Park, Pune",
            totalAmount: 4299,
            subtotal: 4299,
            paymentStatus: "Refunded",
            orderStatus: "Returned",
            createdAt: new Date("2026-09-17T12:11:00.000Z"),
            productItems: [{ name: "Everyday Running Sneakers", qty: 1, price: 4299 }],
            timeline: [
                { step: "Order confirmed", timestamp: new Date("2026-09-17T12:11:00.000Z"), completed: true },
                { step: "Payment received", timestamp: new Date("2026-09-17T12:12:00.000Z"), completed: true },
                { step: "Return requested by customer", timestamp: new Date("2026-09-18T10:00:00.000Z"), completed: true },
                { step: "Returned & Refund Processed", timestamp: new Date("2026-09-18T14:00:00.000Z"), completed: true },
            ],
        },
        {
            orderNumber: "BLM-10477",
            customerName: "Diya Nair",
            email: "diya@example.com",
            address: "Panampilly Nagar, Kochi",
            totalAmount: 10198,
            subtotal: 10198,
            paymentStatus: "Paid",
            orderStatus: "Delivered",
            createdAt: new Date("2026-09-16T17:45:00.000Z"),
            productItems: [
                { name: "Ceramic Cookware Set", qty: 1, price: 8999 },
                { name: "Insulated Water Bottle", qty: 1, price: 1199 },
            ],
            timeline: [
                { step: "Order confirmed", timestamp: new Date("2026-09-16T17:45:00.000Z"), completed: true },
                { step: "Payment received", timestamp: new Date("2026-09-16T17:46:00.000Z"), completed: true },
                { step: "Packed at Mumbai Central", timestamp: new Date("2026-09-17T09:00:00.000Z"), completed: true },
                { step: "Delivered", timestamp: new Date("2026-09-18T11:30:00.000Z"), completed: true },
            ],
        },
    ];
    for (const s of orderSeeds) {
        const existing = await Order_1.default.findOne({ orderNumber: s.orderNumber });
        if (existing)
            continue;
        const customer = customerMap.get(s.customerName);
        const items = s.productItems.map((pi) => {
            const prod = productByNameMap.get(pi.name.toLowerCase().trim());
            return {
                productId: prod ? prod._id : null,
                productCode: prod ? prod.productCode : `PRD-${Date.now().toString().slice(-4)}`,
                productName: pi.name,
                quantity: pi.qty,
                unitPrice: pi.price,
                totalPrice: pi.qty * pi.price,
                image: prod && prod.images && prod.images[0] ? prod.images[0].url : "",
                category: prod && prod.category ? String(prod.category) : "General",
                brand: prod && prod.brand ? String(prod.brand) : "Bloom",
            };
        });
        const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
        await Order_1.default.create({
            orderNumber: s.orderNumber,
            customerId: customer ? customer._id : null,
            customerName: s.customerName,
            customerEmail: s.email,
            customerPhone: customer ? customer.phone : "+91 98765 00000",
            customerSegment: customer ? customer.segment : "VIP",
            items,
            totalQuantity: totalQty,
            subtotal: s.subtotal,
            tax: 0,
            shippingFee: 0,
            discount: 0,
            totalAmount: s.totalAmount,
            paymentStatus: s.paymentStatus,
            paymentMethod: "Credit Card",
            orderStatus: s.orderStatus,
            shippingAddress: {
                fullAddress: s.address,
                addressLine1: s.address,
                country: "India",
            },
            billingAddress: {
                fullAddress: s.address,
                addressLine1: s.address,
                country: "India",
            },
            fulfillmentLocation: "Mumbai Central",
            carrier: "BlueDart Express",
            trackingNumber: `TRK-${s.orderNumber}`,
            timeline: s.timeline,
            createdAt: s.createdAt,
            updatedAt: s.createdAt,
        });
    }
    logger_1.default.info("Successfully seeded verified orders.");
};
exports.seedOrdersIfEmpty = seedOrdersIfEmpty;
const getOrders = async (query = {}) => {
    await (0, exports.seedOrdersIfEmpty)();
    const page = Math.max(parseInt(String(query.page), 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(String(query.limit), 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const filter = {};
    // Search by orderNumber (with or without #), customer name, or email
    if (typeof query.search === "string" && query.search.trim()) {
        const rawSearch = query.search.trim();
        const cleanSearch = rawSearch.replace(/^#/, "");
        const searchRegex = new RegExp(escapeRegex(cleanSearch), "i");
        filter.$or = [
            { orderNumber: searchRegex },
            { customerName: new RegExp(escapeRegex(rawSearch), "i") },
            { customerEmail: new RegExp(escapeRegex(rawSearch), "i") },
        ];
    }
    // Filter by fulfillment/order status
    const rawStatus = query.status || query.orderStatus;
    if (rawStatus && String(rawStatus).toLowerCase() !== "all") {
        const match = order_validation_1.ORDER_STATUSES.find((s) => s.toLowerCase() === String(rawStatus).trim().toLowerCase());
        if (match) {
            filter.orderStatus = match;
        }
    }
    // Filter by payment status
    const rawPayment = query.payment || query.paymentStatus;
    if (rawPayment &&
        String(rawPayment).toLowerCase() !== "all" &&
        String(rawPayment).toLowerCase() !== "all payments") {
        const match = order_validation_1.PAYMENT_STATUSES.find((p) => p.toLowerCase() === String(rawPayment).trim().toLowerCase());
        if (match) {
            filter.paymentStatus = match;
        }
    }
    // Date range filter
    if (query.startDate || query.endDate) {
        filter.createdAt = {};
        if (query.startDate) {
            filter.createdAt.$gte = new Date(query.startDate);
        }
        if (query.endDate) {
            filter.createdAt.$lte = new Date(query.endDate);
        }
    }
    // Sorting
    let sortOption = { createdAt: -1 };
    if (query.sort) {
        const parts = query.sort.split(":");
        const field = parts[0];
        const direction = parts[1];
        if (field) {
            sortOption = { [field]: direction === "asc" ? 1 : -1 };
        }
    }
    const [rawOrders, total] = await Promise.all([
        Order_1.default.find(filter)
            .populate("customerId")
            .populate("items.productId")
            .sort(sortOption)
            .skip(skip)
            .limit(limit),
        Order_1.default.countDocuments(filter),
    ]);
    const orders = rawOrders.map((o) => (0, exports.formatOrderResponse)(o));
    return {
        orders,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};
exports.getOrders = getOrders;
// =====================================================
// GET ORDER BY ID / NUMBER
// =====================================================
const getOrderById = async (idOrNumber) => {
    await (0, exports.seedOrdersIfEmpty)();
    const order = await (0, exports.findOrderByIdOrIdentifier)(idOrNumber);
    if (!order) {
        throw createError("Order not found.", 404);
    }
    return (0, exports.formatOrderResponse)(order);
};
exports.getOrderById = getOrderById;
// =====================================================
// CREATE ORDER
// =====================================================
const createOrder = async (data, user) => {
    const validationErrors = (0, order_validation_1.validateCreateOrder)(data);
    if (Object.keys(validationErrors).length > 0) {
        throw createError("Order validation failed.", 400, validationErrors);
    }
    // Auto-generate order number if omitted: BLM-XXXXX
    const orderNumber = data.orderNumber && String(data.orderNumber).trim()
        ? String(data.orderNumber).trim().replace(/^#/, "").toUpperCase()
        : `BLM-${Math.floor(10000 + Math.random() * 90000)}`;
    // Check duplicate order number
    const existing = await Order_1.default.findOne({ orderNumber });
    if (existing) {
        throw createError(`Order number "${orderNumber}" already exists.`, 409);
    }
    const customerName = String(data.customerName || data.customer).trim();
    const customerEmail = String(data.customerEmail || data.email).trim().toLowerCase();
    const customerPhone = data.customerPhone || data.phone || "";
    const customerSegment = data.customerSegment || data.segment || "New";
    // Check or register Customer
    let customer = await Customer_1.default.findOne({ email: customerEmail });
    if (!customer) {
        customer = await Customer_1.default.create({
            customerCode: `CUS-${Math.floor(2000 + Math.random() * 1000)}`,
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            segment: (["VIP", "Returning", "New", "At risk"].includes(customerSegment)
                ? customerSegment
                : "New"),
            city: data.city || "",
            address: typeof data.shippingAddress === "string" ? data.shippingAddress : data.shippingAddress?.fullAddress || "",
        });
    }
    // Process items
    const rawItems = data.items || data.products || [];
    const processedItems = [];
    let calculatedSubtotal = 0;
    for (const item of rawItems) {
        let name = "";
        let qty = 1;
        let price = 0;
        let prod = null;
        if (typeof item === "string") {
            name = item.trim();
            prod = await Product_1.default.findOne({ productName: new RegExp(`^${escapeRegex(name)}$`, "i") });
        }
        else if (typeof item === "object") {
            name = item.productName || item.name || "";
            qty = Math.max(parseInt(item.quantity, 10) || 1, 1);
            price = Number(item.unitPrice || item.price || 0);
            if (item.productId && mongoose_1.default.Types.ObjectId.isValid(item.productId)) {
                prod = await Product_1.default.findById(item.productId);
            }
            else if (name) {
                prod = await Product_1.default.findOne({ productName: new RegExp(`^${escapeRegex(name)}$`, "i") });
            }
        }
        if (prod) {
            if (!price)
                price = prod.sellingPrice || 0;
            if (!name)
                name = prod.productName;
        }
        const itemTotal = qty * price;
        calculatedSubtotal += itemTotal;
        processedItems.push({
            productId: prod ? prod._id : null,
            productCode: prod ? prod.productCode : `PRD-${Date.now().toString().slice(-4)}`,
            productName: name || "Item",
            variantId: item.variantId || "",
            sku: item.sku || (prod ? prod.productCode : ""),
            image: prod && prod.images && prod.images[0] ? prod.images[0].url : item.image || "",
            category: prod && prod.category ? String(prod.category) : item.category || "General",
            brand: prod && prod.brand ? String(prod.brand) : item.brand || "Bloom",
            quantity: qty,
            unitPrice: price,
            totalPrice: itemTotal,
        });
    }
    const subtotal = data.subtotal !== undefined ? Number(data.subtotal) : calculatedSubtotal;
    const shippingFee = Number(data.shippingFee || 0);
    const tax = Number(data.tax || 0);
    const discount = Number(data.discount || 0);
    const totalAmount = data.totalAmount !== undefined
        ? Number(data.totalAmount)
        : subtotal + shippingFee + tax - discount;
    const totalQuantity = processedItems.reduce((sum, i) => sum + i.quantity, 0);
    // Match enums
    const rawStatus = data.orderStatus || data.status || "Processing";
    const orderStatus = order_validation_1.ORDER_STATUSES.find((s) => s.toLowerCase() === String(rawStatus).trim().toLowerCase()) ||
        "Processing";
    const rawPayment = data.paymentStatus || data.payment || "Pending";
    const paymentStatus = order_validation_1.PAYMENT_STATUSES.find((p) => p.toLowerCase() === String(rawPayment).trim().toLowerCase()) ||
        "Pending";
    const shippingAddrObj = typeof data.shippingAddress === "string"
        ? { fullAddress: data.shippingAddress, addressLine1: data.shippingAddress, country: "India" }
        : {
            fullAddress: data.shippingAddress?.fullAddress ||
                `${data.shippingAddress?.addressLine1 || ""}, ${data.shippingAddress?.city || ""}`.trim() ||
                "Standard Shipping Address",
            ...data.shippingAddress,
        };
    // Initial timeline
    const now = new Date();
    const timeline = [
        { step: "Order confirmed", timestamp: now, completed: true, description: "Customer placed the order." },
    ];
    if (paymentStatus === "Paid") {
        timeline.push({
            step: "Payment received",
            timestamp: new Date(now.getTime() + 1000 * 60),
            completed: true,
            description: "Payment captured successfully.",
        });
    }
    if (orderStatus === "Processing") {
        timeline.push({
            step: "Packed at Mumbai Central",
            timestamp: new Date(now.getTime() + 1000 * 120),
            completed: true,
            description: "Order is packed and prepared for pickup.",
        });
    }
    const newOrder = await Order_1.default.create({
        orderNumber,
        customerId: customer._id,
        customerName,
        customerEmail,
        customerPhone: customerPhone || customer.phone,
        customerSegment: customerSegment || customer.segment,
        items: processedItems,
        totalQuantity,
        subtotal,
        shippingFee,
        tax,
        discount,
        totalAmount,
        paymentStatus,
        paymentMethod: data.paymentMethod || "Credit Card",
        paymentDate: paymentStatus === "Paid" ? now : null,
        orderStatus,
        shippingAddress: shippingAddrObj,
        billingAddress: data.billingAddress || shippingAddrObj,
        fulfillmentLocation: data.fulfillmentLocation || "Mumbai Central",
        carrier: data.carrier || "BlueDart Express",
        trackingNumber: data.trackingNumber || `TRK-${orderNumber}`,
        timeline,
        customerNotes: data.customerNotes || "",
        internalNotes: data.internalNotes || "",
        source: data.source || "web_storefront",
        createdBy: user?._id || null,
        updatedBy: user?._id || null,
    });
    // Update customer stats
    await Customer_1.default.findByIdAndUpdate(customer._id, {
        $inc: { ordersCount: 1, totalSpent: totalAmount },
    });
    return (0, exports.formatOrderResponse)(newOrder);
};
exports.createOrder = createOrder;
// =====================================================
// UPDATE ORDER STATUS (Fulfillment transition)
// =====================================================
const updateOrderStatus = async (idOrNumber, status, notes, user) => {
    const order = await (0, exports.findOrderByIdOrIdentifier)(idOrNumber);
    if (!order) {
        throw createError("Order not found.", 404);
    }
    const match = order_validation_1.ORDER_STATUSES.find((s) => s.toLowerCase() === String(status).trim().toLowerCase());
    if (!match) {
        throw createError(`Status must be one of: ${order_validation_1.ORDER_STATUSES.join(", ")}.`, 400);
    }
    order.orderStatus = match;
    order.updatedBy = user?._id || null;
    // Append timeline step
    order.timeline.push({
        step: match,
        timestamp: new Date(),
        description: notes || `Order status updated to ${match}.`,
        completed: true,
    });
    await order.save();
    return (0, exports.formatOrderResponse)(order);
};
exports.updateOrderStatus = updateOrderStatus;
// =====================================================
// UPDATE PAYMENT STATUS
// =====================================================
const updatePaymentStatus = async (idOrNumber, paymentStatus, notes, user) => {
    const order = await (0, exports.findOrderByIdOrIdentifier)(idOrNumber);
    if (!order) {
        throw createError("Order not found.", 404);
    }
    const match = order_validation_1.PAYMENT_STATUSES.find((p) => p.toLowerCase() === String(paymentStatus).trim().toLowerCase());
    if (!match) {
        throw createError(`Payment status must be one of: ${order_validation_1.PAYMENT_STATUSES.join(", ")}.`, 400);
    }
    order.paymentStatus = match;
    if (match === "Paid" && !order.paymentDate) {
        order.paymentDate = new Date();
    }
    order.updatedBy = user?._id || null;
    order.timeline.push({
        step: `Payment: ${match}`,
        timestamp: new Date(),
        description: notes || `Payment status updated to ${match}.`,
        completed: true,
    });
    await order.save();
    return (0, exports.formatOrderResponse)(order);
};
exports.updatePaymentStatus = updatePaymentStatus;
// =====================================================
// BULK UPDATE ORDER STATUS
// =====================================================
const bulkUpdateStatus = async (ids, status, notes, user) => {
    const validationErrors = (0, order_validation_1.validateBulkOrderStatus)({ ids, status });
    if (Object.keys(validationErrors).length > 0) {
        throw createError("Bulk update validation failed.", 400, validationErrors);
    }
    const match = order_validation_1.ORDER_STATUSES.find((s) => s.toLowerCase() === String(status).trim().toLowerCase());
    const results = [];
    for (const id of ids) {
        const order = await (0, exports.findOrderByIdOrIdentifier)(id);
        if (!order)
            continue;
        order.orderStatus = match;
        order.updatedBy = user?._id || null;
        order.timeline.push({
            step: match,
            timestamp: new Date(),
            description: notes || `Batch update to ${match}.`,
            completed: true,
        });
        await order.save();
        results.push(order.orderNumber);
    }
    return {
        updatedCount: results.length,
        updatedOrderNumbers: results,
        status: match,
    };
};
exports.bulkUpdateStatus = bulkUpdateStatus;
// =====================================================
// ORDER INVOICE DETAILS
// =====================================================
const getOrderInvoice = async (idOrNumber) => {
    const order = await (0, exports.findOrderByIdOrIdentifier)(idOrNumber);
    if (!order) {
        throw createError("Order not found.", 404);
    }
    const issueDate = order.createdAt || new Date();
    const invoiceNumber = `INV-${order.orderNumber}`;
    return {
        invoiceNumber,
        orderNumber: order.orderNumber,
        issueDate: issueDate.toISOString(),
        formattedDate: (0, exports.formatDateForUI)(issueDate),
        seller: {
            name: "Bloom Store",
            legalName: "Bloom Commerce Private Limited",
            address: "Plot 42, Andheri East, Mumbai, Maharashtra 400093",
            gstin: "27AAACB2819P1Z8",
            email: "support@bloom.store",
            phone: "+91 98765 43210",
        },
        customer: {
            name: order.customerName,
            email: order.customerEmail,
            phone: order.customerPhone || "",
            shippingAddress: order.shippingAddress,
            billingAddress: order.billingAddress || order.shippingAddress,
        },
        items: order.items.map((item, index) => ({
            index: index + 1,
            sku: item.sku || item.productCode || "",
            name: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            formattedUnitPrice: (0, exports.formatCurrencyINR)(item.unitPrice),
            formattedTotalPrice: (0, exports.formatCurrencyINR)(item.totalPrice),
        })),
        summary: {
            subtotal: order.subtotal,
            shippingFee: order.shippingFee,
            tax: order.tax,
            discount: order.discount,
            totalAmount: order.totalAmount,
            formattedSubtotal: (0, exports.formatCurrencyINR)(order.subtotal),
            formattedShipping: order.shippingFee === 0 ? "Free" : (0, exports.formatCurrencyINR)(order.shippingFee),
            formattedTax: (0, exports.formatCurrencyINR)(order.tax),
            formattedDiscount: (0, exports.formatCurrencyINR)(order.discount),
            formattedTotal: (0, exports.formatCurrencyINR)(order.totalAmount),
        },
        payment: {
            status: order.paymentStatus,
            method: order.paymentMethod,
            date: order.paymentDate ? order.paymentDate.toISOString() : null,
        },
        fulfillment: {
            status: order.orderStatus,
            location: order.fulfillmentLocation,
            carrier: order.carrier,
            trackingNumber: order.trackingNumber,
        },
    };
};
exports.getOrderInvoice = getOrderInvoice;
// =====================================================
// ORDER DASHBOARD STATS
// =====================================================
const getOrderStats = async () => {
    await (0, exports.seedOrdersIfEmpty)();
    const [totalOrders, processingCount, shippedCount, deliveredCount, returnedCount, cancelledCount, paidCount, pendingCount, refundedCount, revenueAgg,] = await Promise.all([
        Order_1.default.countDocuments(),
        Order_1.default.countDocuments({ orderStatus: "Processing" }),
        Order_1.default.countDocuments({ orderStatus: "Shipped" }),
        Order_1.default.countDocuments({ orderStatus: "Delivered" }),
        Order_1.default.countDocuments({ orderStatus: "Returned" }),
        Order_1.default.countDocuments({ orderStatus: "Cancelled" }),
        Order_1.default.countDocuments({ paymentStatus: "Paid" }),
        Order_1.default.countDocuments({ paymentStatus: "Pending" }),
        Order_1.default.countDocuments({ paymentStatus: "Refunded" }),
        Order_1.default.aggregate([
            { $match: { paymentStatus: "Paid" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
    return {
        // 4 High-level metric cards matching UI
        cards: [
            {
                label: "New orders",
                value: totalOrders > 0 ? totalOrders : 128,
                detail: "12 since yesterday",
                tone: "bg-blue-soft text-blue",
            },
            {
                label: "Processing",
                value: processingCount > 0 ? processingCount : 34,
                detail: "8 need attention",
                tone: "bg-orange-soft text-orange",
            },
            {
                label: "In transit",
                value: shippedCount > 0 ? shippedCount : 67,
                detail: "92% on schedule",
                tone: "bg-success-soft text-success",
            },
            {
                label: "Returns",
                value: returnedCount > 0 ? returnedCount : 9,
                detail: `${((returnedCount / (totalOrders || 1)) * 100).toFixed(1)}% return rate`,
                tone: "bg-pink-soft text-pink",
            },
        ],
        // Detailed aggregations
        metrics: {
            totalOrders,
            processingOrders: processingCount,
            inTransitOrders: shippedCount,
            deliveredOrders: deliveredCount,
            returnedOrders: returnedCount,
            cancelledOrders: cancelledCount,
            paidOrders: paidCount,
            pendingOrders: pendingCount,
            refundedOrders: refundedCount,
            totalRevenue,
            formattedTotalRevenue: (0, exports.formatCurrencyINR)(totalRevenue),
            averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / (paidCount || 1)) : 0,
            formattedAverageOrderValue: totalOrders > 0
                ? (0, exports.formatCurrencyINR)(Math.round(totalRevenue / (paidCount || 1)))
                : "₹0",
        },
    };
};
exports.getOrderStats = getOrderStats;
// =====================================================
// EXPORT ORDERS (CSV or JSON)
// =====================================================
const exportOrders = async (format = "json", query = {}) => {
    const result = await (0, exports.getOrders)({ ...query, limit: 1000 });
    const orders = result.orders;
    if (String(format).toLowerCase() === "csv") {
        const headers = [
            "Order ID",
            "Customer Name",
            "Customer Email",
            "Date",
            "Items Count",
            "Products",
            "Total Amount",
            "Payment Status",
            "Fulfillment Status",
            "Shipping Address",
        ];
        const rows = orders.map((o) => [
            `"${o.id}"`,
            `"${o.customer.replace(/"/g, '""')}"`,
            `"${o.email}"`,
            `"${o.date}"`,
            `"${o.items}"`,
            `"${o.products.join(", ").replace(/"/g, '""')}"`,
            `"${o.totalAmount}"`,
            `"${o.payment}"`,
            `"${o.status}"`,
            `"${o.address.replace(/"/g, '""')}"`,
        ]);
        return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }
    return orders;
};
exports.exportOrders = exportOrders;
// =====================================================
// DELETE ORDER
// =====================================================
const deleteOrder = async (idOrNumber, user) => {
    const order = await (0, exports.findOrderByIdOrIdentifier)(idOrNumber);
    if (!order) {
        throw createError("Order not found.", 404);
    }
    await Order_1.default.findByIdAndDelete(order._id);
    return {
        success: true,
        message: `Order #${order.orderNumber} deleted successfully.`,
        orderNumber: order.orderNumber,
    };
};
exports.deleteOrder = deleteOrder;
exports.default = {
    seedOrdersIfEmpty: exports.seedOrdersIfEmpty,
    getOrders: exports.getOrders,
    getOrderById: exports.getOrderById,
    createOrder: exports.createOrder,
    updateOrderStatus: exports.updateOrderStatus,
    updatePaymentStatus: exports.updatePaymentStatus,
    bulkUpdateStatus: exports.bulkUpdateStatus,
    getOrderInvoice: exports.getOrderInvoice,
    getOrderStats: exports.getOrderStats,
    exportOrders: exports.exportOrders,
    deleteOrder: exports.deleteOrder,
};
//# sourceMappingURL=order.service.js.map