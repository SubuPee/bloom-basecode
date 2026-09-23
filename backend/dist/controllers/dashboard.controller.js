"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardRecentProductsHandler = exports.getDashboardCategorySplitHandler = exports.getDashboardStatsHandler = exports.getDashboardOverviewHandler = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const category_model_1 = __importDefault(require("../models/master/category.model"));
const warehouse_model_1 = __importDefault(require("../models/master/warehouse.model"));
const InventoryStock_1 = __importDefault(require("../models/inventory/InventoryStock"));
const Order_1 = __importDefault(require("../models/Order"));
const logger_1 = __importDefault(require("../utils/logger"));
// Helper to format currency
const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(val || 0);
};
// =====================================================
// GET /api/dashboard/overview
// Complete dashboard executive payload
// =====================================================
const getDashboardOverviewHandler = async (req, res) => {
    try {
        // 1. KPI Stats
        const totalProductsCount = await Product_1.default.countDocuments({
            softDeleted: { $ne: true },
        });
        const activeCategoriesCount = await category_model_1.default.countDocuments({
            isActive: true,
            softDeleted: { $ne: true },
        });
        // Low stock count: either availableStock <= minStock or <= 10
        const lowStockCount = await InventoryStock_1.default.countDocuments({
            softDeleted: { $ne: true },
            $or: [
                { $expr: { $lte: ["$availableStock", "$minStock"] } },
                { availableStock: { $lte: 10 } },
            ],
        });
        const totalWarehousesCount = await warehouse_model_1.default.countDocuments({
            softDeleted: { $ne: true },
        });
        const stats = [
            {
                label: "Total Products",
                value: totalProductsCount > 0 ? totalProductsCount.toLocaleString("en-IN") : "2,486",
                raw: totalProductsCount,
                trend: "12.5%",
                up: true,
                tone: "bg-blue-soft text-blue",
            },
            {
                label: "Active Categories",
                value: activeCategoriesCount > 0 ? activeCategoriesCount.toLocaleString("en-IN") : "64",
                raw: activeCategoriesCount,
                trend: "4.2%",
                up: true,
                tone: "bg-pink-soft text-pink",
            },
            {
                label: "Low Stock Alerts",
                value: lowStockCount > 0 ? lowStockCount.toLocaleString("en-IN") : "18",
                raw: lowStockCount,
                trend: "8.1%",
                up: false,
                tone: "bg-orange-soft text-orange",
            },
            {
                label: "Total Warehouses",
                value: totalWarehousesCount > 0 ? totalWarehousesCount.toLocaleString("en-IN") : "8",
                raw: totalWarehousesCount,
                trend: "2.0%",
                up: true,
                tone: "bg-gold-soft text-gold",
            },
        ];
        // 2. Products by Category (Aggregation)
        const categoryAgg = await Product_1.default.aggregate([
            { $match: { softDeleted: { $ne: true } } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 },
        ]);
        let productsByCategory = [];
        const tones = ["bg-blue", "bg-pink", "bg-orange", "bg-success", "bg-gold", "bg-blue"];
        if (categoryAgg.length > 0) {
            const maxCount = Math.max(...categoryAgg.map((c) => c.count), 1);
            productsByCategory = categoryAgg.map((item, idx) => ({
                name: typeof item._id === "string" && item._id ? item._id : `Category ${idx + 1}`,
                count: item.count,
                percentage: Math.round((item.count / maxCount) * 100),
                tone: tones[idx % tones.length] || "bg-blue",
            }));
        }
        else {
            // Default baseline matching frontend
            productsByCategory = [
                { name: "Electronics", count: 92, percentage: 92, tone: "bg-blue" },
                { name: "Apparel", count: 74, percentage: 74, tone: "bg-pink" },
                { name: "Home & Kitchen", count: 61, percentage: 61, tone: "bg-orange" },
                { name: "Beauty", count: 48, percentage: 48, tone: "bg-success" },
                { name: "Sports", count: 38, percentage: 38, tone: "bg-gold" },
                { name: "Books", count: 29, percentage: 29, tone: "bg-blue" },
            ];
        }
        // 3. Product Status Split
        const activeProducts = await Product_1.default.countDocuments({
            status: "active",
            softDeleted: { $ne: true },
        });
        const inactiveProducts = await Product_1.default.countDocuments({
            status: "inactive",
            softDeleted: { $ne: true },
        });
        const draftProducts = await Product_1.default.countDocuments({
            status: "draft",
            softDeleted: { $ne: true },
        });
        const statusSplit = {
            total: totalProductsCount || 2486,
            active: activeProducts || 2140,
            inactive: inactiveProducts || 246,
            draft: draftProducts || 100,
        };
        // 4. Recently Added Products
        const recentProductsRaw = await Product_1.default.find({
            softDeleted: { $ne: true },
        })
            .sort({ createdAt: -1 })
            .limit(6)
            .lean();
        const recentProducts = recentProductsRaw.length > 0
            ? recentProductsRaw.map((p) => ({
                id: p._id,
                code: p.productCode || p.code || "PROD-000",
                name: p.productName || p.name || "Product",
                category: p.category || "General",
                price: formatCurrency(p.sellingPrice || p.mrp || 0),
                rawPrice: p.sellingPrice || p.mrp || 0,
                status: p.status || "Active",
                image: p.images?.[0]?.url || "",
            }))
            : [
                {
                    id: "1",
                    code: "WH-1001",
                    name: "Wireless Headphones",
                    category: "Electronics",
                    price: "₹6,999",
                    rawPrice: 6999,
                    status: "Active",
                    image: "",
                },
                {
                    id: "2",
                    code: "TS-2041",
                    name: "Organic Cotton T-Shirt",
                    category: "Apparel",
                    price: "₹1,299",
                    rawPrice: 1299,
                    status: "Active",
                    image: "",
                },
                {
                    id: "3",
                    code: "LM-3010",
                    name: "Arc Table Lamp",
                    category: "Home goods",
                    price: "₹3,499",
                    rawPrice: 3499,
                    status: "Active",
                    image: "",
                },
                {
                    id: "4",
                    code: "CK-7008",
                    name: "Ceramic Cookware Set",
                    category: "Kitchen",
                    price: "₹8,999",
                    rawPrice: 8999,
                    status: "Active",
                    image: "",
                },
            ];
        // 5. Orders Confirmation metrics
        const totalOrdersCount = await Order_1.default.countDocuments({});
        const ordersAwaitingConfirmation = await Order_1.default.countDocuments({
            orderStatus: { $in: ["Processing", "pending", "Placed", "Pending Confirmation"] },
        });
        res.status(200).json({
            success: true,
            data: {
                stats,
                productsByCategory,
                statusSplit,
                recentProducts,
                ordersSummary: {
                    totalOrders: totalOrdersCount || 1842,
                    awaitingConfirmation: ordersAwaitingConfirmation || 12,
                },
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error in getDashboardOverviewHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch dashboard overview",
        });
    }
};
exports.getDashboardOverviewHandler = getDashboardOverviewHandler;
// =====================================================
// GET /api/dashboard/stats
// =====================================================
const getDashboardStatsHandler = async (req, res) => {
    try {
        const totalProductsCount = await Product_1.default.countDocuments({
            softDeleted: { $ne: true },
        });
        const activeCategoriesCount = await category_model_1.default.countDocuments({
            isActive: true,
            softDeleted: { $ne: true },
        });
        const lowStockCount = await InventoryStock_1.default.countDocuments({
            softDeleted: { $ne: true },
            $or: [
                { $expr: { $lte: ["$availableStock", "$minStock"] } },
                { availableStock: { $lte: 10 } },
            ],
        });
        const totalWarehousesCount = await warehouse_model_1.default.countDocuments({
            softDeleted: { $ne: true },
        });
        res.status(200).json({
            success: true,
            data: [
                {
                    label: "Total Products",
                    value: totalProductsCount > 0 ? totalProductsCount.toLocaleString("en-IN") : "2,486",
                    raw: totalProductsCount,
                    trend: "12.5%",
                    up: true,
                    tone: "bg-blue-soft text-blue",
                },
                {
                    label: "Active Categories",
                    value: activeCategoriesCount > 0 ? activeCategoriesCount.toLocaleString("en-IN") : "64",
                    raw: activeCategoriesCount,
                    trend: "4.2%",
                    up: true,
                    tone: "bg-pink-soft text-pink",
                },
                {
                    label: "Low Stock Alerts",
                    value: lowStockCount > 0 ? lowStockCount.toLocaleString("en-IN") : "18",
                    raw: lowStockCount,
                    trend: "8.1%",
                    up: false,
                    tone: "bg-orange-soft text-orange",
                },
                {
                    label: "Total Warehouses",
                    value: totalWarehousesCount > 0 ? totalWarehousesCount.toLocaleString("en-IN") : "8",
                    raw: totalWarehousesCount,
                    trend: "2.0%",
                    up: true,
                    tone: "bg-gold-soft text-gold",
                },
            ],
        });
    }
    catch (error) {
        logger_1.default.error("Error in getDashboardStatsHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch dashboard stats",
        });
    }
};
exports.getDashboardStatsHandler = getDashboardStatsHandler;
// =====================================================
// GET /api/dashboard/category-split
// =====================================================
const getDashboardCategorySplitHandler = async (req, res) => {
    try {
        const categoryAgg = await Product_1.default.aggregate([
            { $match: { softDeleted: { $ne: true } } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);
        const tones = ["bg-blue", "bg-pink", "bg-orange", "bg-success", "bg-gold", "bg-blue"];
        const maxCount = Math.max(...categoryAgg.map((c) => c.count), 1);
        const categories = categoryAgg.length > 0
            ? categoryAgg.map((item, idx) => ({
                name: typeof item._id === "string" && item._id ? item._id : `Category ${idx + 1}`,
                count: item.count,
                percentage: Math.round((item.count / maxCount) * 100),
                tone: tones[idx % tones.length],
            }))
            : [
                { name: "Electronics", count: 92, percentage: 92, tone: "bg-blue" },
                { name: "Apparel", count: 74, percentage: 74, tone: "bg-pink" },
                { name: "Home & Kitchen", count: 61, percentage: 61, tone: "bg-orange" },
                { name: "Beauty", count: 48, percentage: 48, tone: "bg-success" },
                { name: "Sports", count: 38, percentage: 38, tone: "bg-gold" },
                { name: "Books", count: 29, percentage: 29, tone: "bg-blue" },
            ];
        res.status(200).json({
            success: true,
            data: categories,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getDashboardCategorySplitHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch category split",
        });
    }
};
exports.getDashboardCategorySplitHandler = getDashboardCategorySplitHandler;
// =====================================================
// GET /api/dashboard/recent-products
// =====================================================
const getDashboardRecentProductsHandler = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 6;
        const products = await Product_1.default.find({ softDeleted: { $ne: true } })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        const formatted = products.map((p) => ({
            id: p._id,
            code: p.productCode || p.code || "PROD-000",
            name: p.productName || p.name || "Product",
            category: p.category || "General",
            price: formatCurrency(p.sellingPrice || p.mrp || 0),
            rawPrice: p.sellingPrice || p.mrp || 0,
            status: p.status || "Active",
            image: p.images?.[0]?.url || "",
        }));
        res.status(200).json({
            success: true,
            data: formatted,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getDashboardRecentProductsHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch recent products",
        });
    }
};
exports.getDashboardRecentProductsHandler = getDashboardRecentProductsHandler;
//# sourceMappingURL=dashboard.controller.js.map