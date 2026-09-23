"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCustomersHandler = exports.deleteCustomerHandler = exports.updateCustomerHandler = exports.createCustomerHandler = exports.getCustomerOrdersHandler = exports.getCustomerByIdHandler = exports.getCustomersHandler = exports.getCustomerStatsHandler = void 0;
const customer_service_1 = __importDefault(require("../services/customer.service"));
const customer_validation_1 = require("../validations/customer.validation");
const logger_1 = __importDefault(require("../utils/logger"));
// =====================================================
// 1. GET CUSTOMER STATS
// =====================================================
const getCustomerStatsHandler = async (req, res) => {
    try {
        const stats = await customer_service_1.default.getCustomerStats();
        res.status(200).json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getCustomerStatsHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch customer statistics",
        });
    }
};
exports.getCustomerStatsHandler = getCustomerStatsHandler;
// =====================================================
// 2. GET CUSTOMERS LIST
// =====================================================
const getCustomersHandler = async (req, res) => {
    try {
        const result = await customer_service_1.default.getCustomers(req.query);
        res.status(200).json({
            success: true,
            data: result.items,
            pagination: result.pagination,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getCustomersHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch customers",
        });
    }
};
exports.getCustomersHandler = getCustomersHandler;
// =====================================================
// 3. GET CUSTOMER BY ID OR CODE
// =====================================================
const getCustomerByIdHandler = async (req, res) => {
    try {
        const customerId = String(req.params.id);
        const customer = await customer_service_1.default.getCustomerById(customerId);
        if (!customer) {
            res.status(404).json({
                success: false,
                message: `Customer with identifier '${customerId}' not found`,
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: customer,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getCustomerByIdHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch customer details",
        });
    }
};
exports.getCustomerByIdHandler = getCustomerByIdHandler;
// =====================================================
// 4. GET CUSTOMER ORDERS
// =====================================================
const getCustomerOrdersHandler = async (req, res) => {
    try {
        const customerId = String(req.params.id);
        const result = await customer_service_1.default.getCustomerOrders(customerId, req.query);
        if (!result) {
            res.status(404).json({
                success: false,
                message: `Customer with identifier '${customerId}' not found`,
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: result.items,
            customer: result.customer,
            pagination: result.pagination,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getCustomerOrdersHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch customer orders",
        });
    }
};
exports.getCustomerOrdersHandler = getCustomerOrdersHandler;
// =====================================================
// 5. CREATE CUSTOMER
// =====================================================
const createCustomerHandler = async (req, res) => {
    try {
        const validationErrors = (0, customer_validation_1.validateCreateCustomer)(req.body);
        if (Object.keys(validationErrors).length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors,
            });
            return;
        }
        const userId = req.user?.id || req.user?._id;
        const customer = await customer_service_1.default.createCustomer(req.body, userId);
        res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: customer,
        });
    }
    catch (error) {
        logger_1.default.error("Error in createCustomerHandler:", error);
        const status = error.message?.includes("already exists") ? 409 : 500;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to create customer",
        });
    }
};
exports.createCustomerHandler = createCustomerHandler;
// =====================================================
// 6. UPDATE CUSTOMER
// =====================================================
const updateCustomerHandler = async (req, res) => {
    try {
        const validationErrors = (0, customer_validation_1.validateUpdateCustomer)(req.body);
        if (Object.keys(validationErrors).length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors,
            });
            return;
        }
        const customerId = String(req.params.id);
        const userId = req.user?.id || req.user?._id;
        const customer = await customer_service_1.default.updateCustomer(customerId, req.body, userId);
        if (!customer) {
            res.status(404).json({
                success: false,
                message: `Customer with identifier '${customerId}' not found`,
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: customer,
        });
    }
    catch (error) {
        logger_1.default.error("Error in updateCustomerHandler:", error);
        const status = error.message?.includes("already exists") ? 409 : 500;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to update customer",
        });
    }
};
exports.updateCustomerHandler = updateCustomerHandler;
// =====================================================
// 7. DELETE CUSTOMER
// =====================================================
const deleteCustomerHandler = async (req, res) => {
    try {
        const customerId = String(req.params.id);
        const result = await customer_service_1.default.deleteCustomer(customerId);
        if (!result) {
            res.status(404).json({
                success: false,
                message: `Customer with identifier '${customerId}' not found`,
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Customer deleted successfully",
            data: result,
        });
    }
    catch (error) {
        logger_1.default.error("Error in deleteCustomerHandler:", error);
        const status = error.message?.includes("Cannot delete") ? 400 : 500;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to delete customer",
        });
    }
};
exports.deleteCustomerHandler = deleteCustomerHandler;
// =====================================================
// 8. EXPORT CUSTOMERS
// =====================================================
const exportCustomersHandler = async (req, res) => {
    try {
        const format = req.query.format === "csv" ? "csv" : "json";
        const result = await customer_service_1.default.exportCustomers(req.query, format);
        if (format === "csv") {
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename="bloom_customers_${Date.now()}.csv"`);
            res.status(200).send(result);
        }
        else {
            res.status(200).json({
                success: true,
                data: result,
            });
        }
    }
    catch (error) {
        logger_1.default.error("Error in exportCustomersHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to export customers",
        });
    }
};
exports.exportCustomersHandler = exportCustomersHandler;
exports.default = {
    getCustomerStatsHandler: exports.getCustomerStatsHandler,
    getCustomersHandler: exports.getCustomersHandler,
    getCustomerByIdHandler: exports.getCustomerByIdHandler,
    getCustomerOrdersHandler: exports.getCustomerOrdersHandler,
    createCustomerHandler: exports.createCustomerHandler,
    updateCustomerHandler: exports.updateCustomerHandler,
    deleteCustomerHandler: exports.deleteCustomerHandler,
    exportCustomersHandler: exports.exportCustomersHandler,
};
//# sourceMappingURL=customer.controller.js.map