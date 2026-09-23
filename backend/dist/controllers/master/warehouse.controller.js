"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWarehouse = exports.updateWarehouseStatus = exports.updateWarehouse = exports.getWarehouseById = exports.getWarehouses = exports.createWarehouse = void 0;
const warehouse_service_1 = __importDefault(require("../../services/master/warehouse.service"));
const logger_1 = __importDefault(require("../../utils/logger"));
// -----------------------------------------
// Create Warehouse
// -----------------------------------------
const createWarehouse = async (req, res) => {
    try {
        const warehouse = await warehouse_service_1.default.createWarehouse(req.body, req.user);
        return res.status(201).json({
            success: true,
            message: "Warehouse created successfully",
            data: warehouse,
        });
    }
    catch (error) {
        logger_1.default.error("Create Warehouse Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to create warehouse",
            ...(error.errors && { errors: error.errors }),
        });
    }
};
exports.createWarehouse = createWarehouse;
// -----------------------------------------
// Get All Warehouses
// -----------------------------------------
const getWarehouses = async (req, res) => {
    try {
        const result = await warehouse_service_1.default.getWarehouses(req.query);
        return res.status(200).json({
            success: true,
            message: "Warehouses fetched successfully",
            data: result.warehouses,
            pagination: result.pagination,
        });
    }
    catch (error) {
        logger_1.default.error("Get Warehouses Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch warehouses",
        });
    }
};
exports.getWarehouses = getWarehouses;
// -----------------------------------------
// Get Warehouse By ID
// -----------------------------------------
const getWarehouseById = async (req, res) => {
    try {
        const warehouse = await warehouse_service_1.default.getWarehouseById(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Warehouse fetched successfully",
            data: warehouse,
        });
    }
    catch (error) {
        logger_1.default.error("Get Warehouse Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch warehouse",
        });
    }
};
exports.getWarehouseById = getWarehouseById;
// -----------------------------------------
// Update Warehouse
// -----------------------------------------
const updateWarehouse = async (req, res) => {
    try {
        const warehouse = await warehouse_service_1.default.updateWarehouse(req.params.id, req.body, req.user);
        return res.status(200).json({
            success: true,
            message: "Warehouse updated successfully",
            data: warehouse,
        });
    }
    catch (error) {
        logger_1.default.error("Update Warehouse Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update warehouse",
            ...(error.errors && { errors: error.errors }),
        });
    }
};
exports.updateWarehouse = updateWarehouse;
// -----------------------------------------
// Update Warehouse Status
// -----------------------------------------
const updateWarehouseStatus = async (req, res) => {
    try {
        const warehouse = await warehouse_service_1.default.updateWarehouseStatus(req.params.id, req.body.status, req.user);
        return res.status(200).json({
            success: true,
            message: "Warehouse status updated successfully",
            data: warehouse,
        });
    }
    catch (error) {
        logger_1.default.error("Update Warehouse Status Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update warehouse status",
        });
    }
};
exports.updateWarehouseStatus = updateWarehouseStatus;
// -----------------------------------------
// Delete Warehouse
// -----------------------------------------
const deleteWarehouse = async (req, res) => {
    try {
        await warehouse_service_1.default.deleteWarehouse(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Warehouse deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Delete Warehouse Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to delete warehouse",
        });
    }
};
exports.deleteWarehouse = deleteWarehouse;
exports.default = {
    createWarehouse: exports.createWarehouse,
    getWarehouses: exports.getWarehouses,
    getWarehouseById: exports.getWarehouseById,
    updateWarehouse: exports.updateWarehouse,
    updateWarehouseStatus: exports.updateWarehouseStatus,
    deleteWarehouse: exports.deleteWarehouse,
};
//# sourceMappingURL=warehouse.controller.js.map