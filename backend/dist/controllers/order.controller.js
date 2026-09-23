"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.exportOrders = exports.getOrderInvoice = exports.bulkUpdateStatus = exports.updatePaymentStatus = exports.updateOrderStatus = exports.createOrder = exports.getOrderById = exports.getOrderStats = exports.getOrders = void 0;
const order_service_1 = __importDefault(require("../services/order.service"));
const logger_1 = __importDefault(require("../utils/logger"));
// =====================================================
// GET ORDERS
// =====================================================
const getOrders = async (req, res) => {
    try {
        const result = await order_service_1.default.getOrders(req.query);
        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully.",
            data: result.orders,
            pagination: result.pagination,
        });
    }
    catch (error) {
        logger_1.default.error("Get Orders Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch orders.",
            ...(error.errors && { errors: error.errors }),
        });
    }
};
exports.getOrders = getOrders;
// =====================================================
// GET ORDER STATS
// =====================================================
const getOrderStats = async (_req, res) => {
    try {
        const stats = await order_service_1.default.getOrderStats();
        return res.status(200).json({
            success: true,
            message: "Order statistics fetched successfully.",
            data: stats,
        });
    }
    catch (error) {
        logger_1.default.error("Get Order Stats Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch order statistics.",
        });
    }
};
exports.getOrderStats = getOrderStats;
// =====================================================
// GET ORDER BY ID / NUMBER
// =====================================================
const getOrderById = async (req, res) => {
    try {
        const order = await order_service_1.default.getOrderById(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Order fetched successfully.",
            data: order,
        });
    }
    catch (error) {
        logger_1.default.error("Get Order By ID Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch order.",
            ...(error.errors && { errors: error.errors }),
        });
    }
};
exports.getOrderById = getOrderById;
// =====================================================
// CREATE ORDER
// =====================================================
const createOrder = async (req, res) => {
    try {
        const order = await order_service_1.default.createOrder(req.body, req.user);
        return res.status(201).json({
            success: true,
            message: "Order created successfully.",
            data: order,
        });
    }
    catch (error) {
        logger_1.default.error("Create Order Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to create order.",
            ...(error.errors && { errors: error.errors }),
        });
    }
};
exports.createOrder = createOrder;
// =====================================================
// UPDATE ORDER STATUS
// =====================================================
const updateOrderStatus = async (req, res) => {
    try {
        const order = await order_service_1.default.updateOrderStatus(req.params.id, req.body.status || req.body.orderStatus, req.body.notes, req.user);
        return res.status(200).json({
            success: true,
            message: `Order status updated to ${order.status}.`,
            data: order,
        });
    }
    catch (error) {
        logger_1.default.error("Update Order Status Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update order status.",
            ...(error.errors && { errors: error.errors }),
        });
    }
};
exports.updateOrderStatus = updateOrderStatus;
// =====================================================
// UPDATE PAYMENT STATUS
// =====================================================
const updatePaymentStatus = async (req, res) => {
    try {
        const order = await order_service_1.default.updatePaymentStatus(req.params.id, req.body.paymentStatus || req.body.payment, req.body.notes, req.user);
        return res.status(200).json({
            success: true,
            message: `Order payment status updated to ${order.payment}.`,
            data: order,
        });
    }
    catch (error) {
        logger_1.default.error("Update Payment Status Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update payment status.",
            ...(error.errors && { errors: error.errors }),
        });
    }
};
exports.updatePaymentStatus = updatePaymentStatus;
// =====================================================
// BULK UPDATE STATUS
// =====================================================
const bulkUpdateStatus = async (req, res) => {
    try {
        const result = await order_service_1.default.bulkUpdateStatus(req.body.ids, req.body.status || req.body.orderStatus, req.body.notes, req.user);
        return res.status(200).json({
            success: true,
            message: `Successfully updated ${result.updatedCount} orders to ${result.status}.`,
            data: result,
        });
    }
    catch (error) {
        logger_1.default.error("Bulk Update Order Status Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to bulk update orders.",
            ...(error.errors && { errors: error.errors }),
        });
    }
};
exports.bulkUpdateStatus = bulkUpdateStatus;
// =====================================================
// GET ORDER INVOICE
// =====================================================
const getOrderInvoice = async (req, res) => {
    try {
        const invoice = await order_service_1.default.getOrderInvoice(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Order invoice retrieved successfully.",
            data: invoice,
        });
    }
    catch (error) {
        logger_1.default.error("Get Order Invoice Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to retrieve invoice.",
        });
    }
};
exports.getOrderInvoice = getOrderInvoice;
// =====================================================
// EXPORT ORDERS (CSV / JSON)
// =====================================================
const exportOrders = async (req, res) => {
    try {
        const format = req.query.format || "json";
        const data = await order_service_1.default.exportOrders(format, req.query);
        if (String(format).toLowerCase() === "csv") {
            res.header("Content-Type", "text/csv");
            res.attachment(`bloom-orders-${Date.now()}.csv`);
            return res.send(data);
        }
        return res.status(200).json({
            success: true,
            message: "Orders exported successfully.",
            data,
        });
    }
    catch (error) {
        logger_1.default.error("Export Orders Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to export orders.",
        });
    }
};
exports.exportOrders = exportOrders;
// =====================================================
// DELETE ORDER
// =====================================================
const deleteOrder = async (req, res) => {
    try {
        const result = await order_service_1.default.deleteOrder(req.params.id, req.user);
        return res.status(200).json(result);
    }
    catch (error) {
        logger_1.default.error("Delete Order Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to delete order.",
        });
    }
};
exports.deleteOrder = deleteOrder;
exports.default = {
    getOrders: exports.getOrders,
    getOrderStats: exports.getOrderStats,
    getOrderById: exports.getOrderById,
    createOrder: exports.createOrder,
    updateOrderStatus: exports.updateOrderStatus,
    updatePaymentStatus: exports.updatePaymentStatus,
    bulkUpdateStatus: exports.bulkUpdateStatus,
    getOrderInvoice: exports.getOrderInvoice,
    exportOrders: exports.exportOrders,
    deleteOrder: exports.deleteOrder,
};
//# sourceMappingURL=order.controller.js.map