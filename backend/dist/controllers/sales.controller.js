"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportSalesReport = exports.getSalesTransactions = exports.getCustomerMix = exports.getTopProducts = exports.getSalesChannels = exports.getSalesChart = exports.getSalesMetrics = exports.getSalesOverview = void 0;
const sales_service_1 = __importDefault(require("../services/sales.service"));
const logger_1 = __importDefault(require("../utils/logger"));
// =====================================================
// GET SALES OVERVIEW (Complete Dashboard)
// =====================================================
const getSalesOverview = async (req, res) => {
    try {
        const data = await sales_service_1.default.getSalesOverview(req.query);
        return res.status(200).json({
            success: true,
            message: "Sales overview fetched successfully.",
            data,
        });
    }
    catch (error) {
        logger_1.default.error("Get Sales Overview Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch sales overview.",
        });
    }
};
exports.getSalesOverview = getSalesOverview;
// =====================================================
// GET SALES METRICS (KPI Cards)
// =====================================================
const getSalesMetrics = async (req, res) => {
    try {
        const data = await sales_service_1.default.getSalesMetrics(req.query);
        return res.status(200).json({
            success: true,
            message: "Sales metrics fetched successfully.",
            data,
        });
    }
    catch (error) {
        logger_1.default.error("Get Sales Metrics Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch sales metrics.",
        });
    }
};
exports.getSalesMetrics = getSalesMetrics;
// =====================================================
// GET SALES CHART DATA
// =====================================================
const getSalesChart = async (req, res) => {
    try {
        const data = await sales_service_1.default.getSalesChart(req.query);
        return res.status(200).json({
            success: true,
            message: "Sales chart data fetched successfully.",
            data,
        });
    }
    catch (error) {
        logger_1.default.error("Get Sales Chart Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch sales chart data.",
        });
    }
};
exports.getSalesChart = getSalesChart;
// =====================================================
// GET SALES BY CHANNEL
// =====================================================
const getSalesChannels = async (req, res) => {
    try {
        const data = await sales_service_1.default.getSalesChannels(req.query);
        return res.status(200).json({
            success: true,
            message: "Sales channels fetched successfully.",
            data,
        });
    }
    catch (error) {
        logger_1.default.error("Get Sales Channels Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch sales channels.",
        });
    }
};
exports.getSalesChannels = getSalesChannels;
// =====================================================
// GET TOP PRODUCTS
// =====================================================
const getTopProducts = async (req, res) => {
    try {
        const data = await sales_service_1.default.getTopProducts(req.query);
        return res.status(200).json({
            success: true,
            message: "Top products fetched successfully.",
            data,
        });
    }
    catch (error) {
        logger_1.default.error("Get Top Products Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch top products.",
        });
    }
};
exports.getTopProducts = getTopProducts;
// =====================================================
// GET CUSTOMER MIX
// =====================================================
const getCustomerMix = async (req, res) => {
    try {
        const data = await sales_service_1.default.getCustomerMix(req.query);
        return res.status(200).json({
            success: true,
            message: "Customer mix fetched successfully.",
            data,
        });
    }
    catch (error) {
        logger_1.default.error("Get Customer Mix Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch customer mix.",
        });
    }
};
exports.getCustomerMix = getCustomerMix;
// =====================================================
// GET SALES TRANSACTIONS
// =====================================================
const getSalesTransactions = async (req, res) => {
    try {
        const data = await sales_service_1.default.getSalesTransactions(req.query);
        return res.status(200).json({
            success: true,
            message: "Sales transactions fetched successfully.",
            data: data.transactions,
            pagination: data.pagination,
        });
    }
    catch (error) {
        logger_1.default.error("Get Sales Transactions Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch sales transactions.",
        });
    }
};
exports.getSalesTransactions = getSalesTransactions;
// =====================================================
// EXPORT SALES REPORT (CSV / JSON)
// =====================================================
const exportSalesReport = async (req, res) => {
    try {
        const format = req.query.format || "json";
        const data = await sales_service_1.default.exportSalesReport(format, req.query);
        if (String(format).toLowerCase() === "csv") {
            res.header("Content-Type", "text/csv");
            res.attachment(`bloom-sales-report-${Date.now()}.csv`);
            return res.send(data);
        }
        return res.status(200).json({
            success: true,
            message: "Sales report exported successfully.",
            data,
        });
    }
    catch (error) {
        logger_1.default.error("Export Sales Report Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to export sales report.",
        });
    }
};
exports.exportSalesReport = exportSalesReport;
exports.default = {
    getSalesOverview: exports.getSalesOverview,
    getSalesMetrics: exports.getSalesMetrics,
    getSalesChart: exports.getSalesChart,
    getSalesChannels: exports.getSalesChannels,
    getTopProducts: exports.getTopProducts,
    getCustomerMix: exports.getCustomerMix,
    getSalesTransactions: exports.getSalesTransactions,
    exportSalesReport: exports.exportSalesReport,
};
//# sourceMappingURL=sales.controller.js.map