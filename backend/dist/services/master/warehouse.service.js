"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWarehouse = exports.updateWarehouseStatus = exports.updateWarehouse = exports.getWarehouseById = exports.getWarehouses = exports.createWarehouse = void 0;
const warehouse_model_1 = __importDefault(require("../../models/master/warehouse.model"));
const warehouse_validation_1 = require("../../validations/master/warehouse.validation");
const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
// -----------------------------------------
// Create Warehouse
// -----------------------------------------
const createWarehouse = async (data, user) => {
    const validation = (0, warehouse_validation_1.validateCreateWarehouse)(data);
    if (!validation.isValid) {
        const error = new Error("Validation failed");
        error.statusCode = 400;
        error.errors = validation.errors;
        throw error;
    }
    const warehouseCode = data.warehouseCode.trim().toUpperCase();
    const warehouseName = data.warehouseName.trim();
    const existingCode = await warehouse_model_1.default.findOne({
        warehouseCode,
    });
    if (existingCode) {
        const error = new Error("Warehouse code already exists");
        error.statusCode = 409;
        throw error;
    }
    const existingName = await warehouse_model_1.default.findOne({
        warehouseName: {
            $regex: `^${escapeRegex(warehouseName)}$`,
            $options: "i",
        },
    });
    if (existingName) {
        const error = new Error("Warehouse name already exists");
        error.statusCode = 409;
        throw error;
    }
    const warehouse = await warehouse_model_1.default.create({
        warehouseCode,
        warehouseName,
        addressLine1: data.addressLine1.trim(),
        addressLine2: data.addressLine2?.trim() || "",
        city: data.city.trim(),
        state: data.state.trim(),
        country: data.country.trim(),
        postalCode: data.postalCode.trim(),
        contactPerson: data.contactPerson.trim(),
        contactPhone: data.contactPhone.trim(),
        email: data.email?.trim().toLowerCase() || "",
        status: data.status || "active",
        createdBy: user?._id || null,
    });
    return warehouse;
};
exports.createWarehouse = createWarehouse;
// -----------------------------------------
// Get Warehouses
// -----------------------------------------
const getWarehouses = async (query = {}) => {
    const { page = 1, limit = 10, search, status, city, state } = query;
    const pageNumber = Math.max(parseInt(String(page), 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;
    const filter = {};
    if (search && search.trim()) {
        const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
        filter.$or = [
            { warehouseCode: searchRegex },
            { warehouseName: searchRegex },
            { city: searchRegex },
            { state: searchRegex },
            { postalCode: searchRegex },
        ];
    }
    if (status) {
        filter.status = status;
    }
    if (city) {
        filter.city = new RegExp(`^${escapeRegex(city.trim())}$`, "i");
    }
    if (state) {
        filter.state = new RegExp(`^${escapeRegex(state.trim())}$`, "i");
    }
    const [warehouses, total] = await Promise.all([
        warehouse_model_1.default.find(filter)
            .populate("createdBy", "firstName lastName email")
            .populate("updatedBy", "firstName lastName email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber)
            .lean(),
        warehouse_model_1.default.countDocuments(filter),
    ]);
    return {
        warehouses,
        pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
        },
    };
};
exports.getWarehouses = getWarehouses;
// -----------------------------------------
// Get Warehouse By ID
// -----------------------------------------
const getWarehouseById = async (id) => {
    if (!(0, warehouse_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid warehouse ID");
        error.statusCode = 400;
        throw error;
    }
    const warehouse = await warehouse_model_1.default.findById(id)
        .populate("createdBy", "firstName lastName email")
        .populate("updatedBy", "firstName lastName email");
    if (!warehouse) {
        const error = new Error("Warehouse not found");
        error.statusCode = 404;
        throw error;
    }
    return warehouse;
};
exports.getWarehouseById = getWarehouseById;
// -----------------------------------------
// Update Warehouse
// -----------------------------------------
const updateWarehouse = async (id, data, user) => {
    if (!(0, warehouse_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid warehouse ID");
        error.statusCode = 400;
        throw error;
    }
    const validation = (0, warehouse_validation_1.validateUpdateWarehouse)(data);
    if (!validation.isValid) {
        const error = new Error("Validation failed");
        error.statusCode = 400;
        error.errors = validation.errors;
        throw error;
    }
    const warehouse = await warehouse_model_1.default.findById(id);
    if (!warehouse) {
        const error = new Error("Warehouse not found");
        error.statusCode = 404;
        throw error;
    }
    if (data.warehouseCode !== undefined) {
        const warehouseCode = data.warehouseCode.trim().toUpperCase();
        const existingCode = await warehouse_model_1.default.findOne({
            warehouseCode,
            _id: { $ne: id },
        });
        if (existingCode) {
            const error = new Error("Warehouse code already exists");
            error.statusCode = 409;
            throw error;
        }
        warehouse.warehouseCode = warehouseCode;
    }
    if (data.warehouseName !== undefined) {
        const warehouseName = data.warehouseName.trim();
        const existingName = await warehouse_model_1.default.findOne({
            warehouseName: {
                $regex: `^${escapeRegex(warehouseName)}$`,
                $options: "i",
            },
            _id: { $ne: id },
        });
        if (existingName) {
            const error = new Error("Warehouse name already exists");
            error.statusCode = 409;
            throw error;
        }
        warehouse.warehouseName = warehouseName;
    }
    if (data.addressLine1 !== undefined) {
        warehouse.addressLine1 = data.addressLine1.trim();
    }
    if (data.addressLine2 !== undefined) {
        warehouse.addressLine2 = data.addressLine2.trim();
    }
    if (data.city !== undefined) {
        warehouse.city = data.city.trim();
    }
    if (data.state !== undefined) {
        warehouse.state = data.state.trim();
    }
    if (data.country !== undefined) {
        warehouse.country = data.country.trim();
    }
    if (data.postalCode !== undefined) {
        warehouse.postalCode = data.postalCode.trim();
    }
    if (data.contactPerson !== undefined) {
        warehouse.contactPerson = data.contactPerson.trim();
    }
    if (data.contactPhone !== undefined) {
        warehouse.contactPhone = data.contactPhone.trim();
    }
    if (data.email !== undefined) {
        warehouse.email = data.email.trim().toLowerCase();
    }
    if (data.status !== undefined) {
        warehouse.status = data.status;
    }
    warehouse.updatedBy = user?._id || null;
    await warehouse.save();
    return warehouse;
};
exports.updateWarehouse = updateWarehouse;
// -----------------------------------------
// Update Warehouse Status
// -----------------------------------------
const updateWarehouseStatus = async (id, status, user) => {
    if (!(0, warehouse_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid warehouse ID");
        error.statusCode = 400;
        throw error;
    }
    if (!["active", "inactive"].includes(status)) {
        const error = new Error("Status must be either active or inactive");
        error.statusCode = 400;
        throw error;
    }
    const warehouse = await warehouse_model_1.default.findById(id);
    if (!warehouse) {
        const error = new Error("Warehouse not found");
        error.statusCode = 404;
        throw error;
    }
    warehouse.status = status;
    warehouse.updatedBy = user?._id || null;
    await warehouse.save();
    return warehouse;
};
exports.updateWarehouseStatus = updateWarehouseStatus;
// -----------------------------------------
// Delete Warehouse
// -----------------------------------------
const deleteWarehouse = async (id) => {
    if (!(0, warehouse_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid warehouse ID");
        error.statusCode = 400;
        throw error;
    }
    const warehouse = await warehouse_model_1.default.findById(id);
    if (!warehouse) {
        const error = new Error("Warehouse not found");
        error.statusCode = 404;
        throw error;
    }
    await warehouse_model_1.default.findByIdAndDelete(id);
    return true;
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
//# sourceMappingURL=warehouse.service.js.map