"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUnit = exports.updateUnitStatus = exports.updateUnit = exports.getUnitById = exports.getUnits = exports.createUnit = void 0;
const unit_model_1 = __importDefault(require("../../models/master/unit.model"));
const unit_validation_1 = require("../../validations/master/unit.validation");
const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
// -----------------------------------------
// Create Unit
// -----------------------------------------
const createUnit = async (data, user) => {
    const validation = (0, unit_validation_1.validateCreateUnit)(data);
    if (!validation.isValid) {
        const error = new Error("Validation failed");
        error.statusCode = 400;
        error.errors = validation.errors;
        throw error;
    }
    const unitCode = data.unitCode.trim().toUpperCase();
    const unitName = data.unitName.trim();
    const symbol = data.symbol.trim().toUpperCase();
    const unitType = String(data.unitType).trim().toLowerCase();
    // Duplicate code
    const existingCode = await unit_model_1.default.findOne({
        unitCode,
    });
    if (existingCode) {
        const error = new Error("Unit code already exists");
        error.statusCode = 409;
        throw error;
    }
    // Duplicate name
    const existingName = await unit_model_1.default.findOne({
        unitName: {
            $regex: `^${escapeRegex(unitName)}$`,
            $options: "i",
        },
    });
    if (existingName) {
        const error = new Error("Unit name already exists");
        error.statusCode = 409;
        throw error;
    }
    // Duplicate symbol
    const existingSymbol = await unit_model_1.default.findOne({
        symbol,
    });
    if (existingSymbol) {
        const error = new Error("Unit symbol already exists");
        error.statusCode = 409;
        throw error;
    }
    const unit = await unit_model_1.default.create({
        unitCode,
        unitName,
        symbol,
        unitType: unitType,
        status: data.status || "active",
        createdBy: user?._id || null,
    });
    return unit;
};
exports.createUnit = createUnit;
// -----------------------------------------
// Get Units
// -----------------------------------------
const getUnits = async (query = {}) => {
    const { page = 1, limit = 10, search, status, unitType } = query;
    const pageNumber = Math.max(parseInt(String(page), 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;
    const filter = {};
    if (search && search.trim()) {
        const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
        filter.$or = [
            { unitCode: searchRegex },
            { unitName: searchRegex },
            { symbol: searchRegex },
        ];
    }
    if (status) {
        filter.status = status;
    }
    if (unitType) {
        filter.unitType = unitType.toLowerCase();
    }
    const [units, total] = await Promise.all([
        unit_model_1.default.find(filter)
            .populate("createdBy", "firstName lastName email")
            .populate("updatedBy", "firstName lastName email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber)
            .lean(),
        unit_model_1.default.countDocuments(filter),
    ]);
    return {
        units,
        pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
        },
    };
};
exports.getUnits = getUnits;
// -----------------------------------------
// Get Unit By ID
// -----------------------------------------
const getUnitById = async (id) => {
    if (!(0, unit_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid unit ID");
        error.statusCode = 400;
        throw error;
    }
    const unit = await unit_model_1.default.findById(id)
        .populate("createdBy", "firstName lastName email")
        .populate("updatedBy", "firstName lastName email");
    if (!unit) {
        const error = new Error("Unit not found");
        error.statusCode = 404;
        throw error;
    }
    return unit;
};
exports.getUnitById = getUnitById;
// -----------------------------------------
// Update Unit
// -----------------------------------------
const updateUnit = async (id, data, user) => {
    if (!(0, unit_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid unit ID");
        error.statusCode = 400;
        throw error;
    }
    const validation = (0, unit_validation_1.validateUpdateUnit)(data);
    if (!validation.isValid) {
        const error = new Error("Validation failed");
        error.statusCode = 400;
        error.errors = validation.errors;
        throw error;
    }
    const unit = await unit_model_1.default.findById(id);
    if (!unit) {
        const error = new Error("Unit not found");
        error.statusCode = 404;
        throw error;
    }
    // Unit Code
    if (data.unitCode !== undefined) {
        const unitCode = data.unitCode.trim().toUpperCase();
        const existingCode = await unit_model_1.default.findOne({
            unitCode,
            _id: { $ne: id },
        });
        if (existingCode) {
            const error = new Error("Unit code already exists");
            error.statusCode = 409;
            throw error;
        }
        unit.unitCode = unitCode;
    }
    // Unit Name
    if (data.unitName !== undefined) {
        const unitName = data.unitName.trim();
        const existingName = await unit_model_1.default.findOne({
            unitName: {
                $regex: `^${escapeRegex(unitName)}$`,
                $options: "i",
            },
            _id: { $ne: id },
        });
        if (existingName) {
            const error = new Error("Unit name already exists");
            error.statusCode = 409;
            throw error;
        }
        unit.unitName = unitName;
    }
    // Symbol
    if (data.symbol !== undefined) {
        const symbol = data.symbol.trim().toUpperCase();
        const existingSymbol = await unit_model_1.default.findOne({
            symbol,
            _id: { $ne: id },
        });
        if (existingSymbol) {
            const error = new Error("Unit symbol already exists");
            error.statusCode = 409;
            throw error;
        }
        unit.symbol = symbol;
    }
    // Unit Type
    if (data.unitType !== undefined) {
        unit.unitType = String(data.unitType).trim().toLowerCase();
    }
    // Status
    if (data.status !== undefined) {
        unit.status = data.status;
    }
    unit.updatedBy = user?._id || null;
    await unit.save();
    return unit;
};
exports.updateUnit = updateUnit;
// -----------------------------------------
// Update Unit Status
// -----------------------------------------
const updateUnitStatus = async (id, status, user) => {
    if (!(0, unit_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid unit ID");
        error.statusCode = 400;
        throw error;
    }
    if (!["active", "inactive"].includes(status)) {
        const error = new Error("Status must be either active or inactive");
        error.statusCode = 400;
        throw error;
    }
    const unit = await unit_model_1.default.findById(id);
    if (!unit) {
        const error = new Error("Unit not found");
        error.statusCode = 404;
        throw error;
    }
    unit.status = status;
    unit.updatedBy = user?._id || null;
    await unit.save();
    return unit;
};
exports.updateUnitStatus = updateUnitStatus;
// -----------------------------------------
// Delete Unit
// -----------------------------------------
const deleteUnit = async (id) => {
    if (!(0, unit_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid unit ID");
        error.statusCode = 400;
        throw error;
    }
    const unit = await unit_model_1.default.findById(id);
    if (!unit) {
        const error = new Error("Unit not found");
        error.statusCode = 404;
        throw error;
    }
    await unit_model_1.default.findByIdAndDelete(id);
    return true;
};
exports.deleteUnit = deleteUnit;
exports.default = {
    createUnit: exports.createUnit,
    getUnits: exports.getUnits,
    getUnitById: exports.getUnitById,
    updateUnit: exports.updateUnit,
    updateUnitStatus: exports.updateUnitStatus,
    deleteUnit: exports.deleteUnit,
};
//# sourceMappingURL=unit.service.js.map