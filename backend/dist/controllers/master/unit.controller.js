"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUnit = exports.updateUnitStatus = exports.updateUnit = exports.getUnitById = exports.getUnits = exports.createUnit = void 0;
const unit_service_1 = __importDefault(require("../../services/master/unit.service"));
const logger_1 = __importDefault(require("../../utils/logger"));
// -----------------------------------------
// Create Unit
// -----------------------------------------
const createUnit = async (req, res) => {
    try {
        const unit = await unit_service_1.default.createUnit(req.body, req.user);
        return res.status(201).json({
            success: true,
            message: "Unit created successfully",
            data: unit,
        });
    }
    catch (error) {
        logger_1.default.error("Create unit error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to create unit",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.createUnit = createUnit;
// -----------------------------------------
// Get Units
// -----------------------------------------
const getUnits = async (req, res) => {
    try {
        const result = await unit_service_1.default.getUnits(req.query);
        return res.status(200).json({
            success: true,
            message: "Units retrieved successfully",
            data: result.units,
            pagination: result.pagination,
        });
    }
    catch (error) {
        logger_1.default.error("Get units error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to get units",
        });
    }
};
exports.getUnits = getUnits;
// -----------------------------------------
// Get Unit By ID
// -----------------------------------------
const getUnitById = async (req, res) => {
    try {
        const unit = await unit_service_1.default.getUnitById(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Unit retrieved successfully",
            data: unit,
        });
    }
    catch (error) {
        logger_1.default.error("Get unit by ID error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to get unit",
        });
    }
};
exports.getUnitById = getUnitById;
// -----------------------------------------
// Update Unit
// -----------------------------------------
const updateUnit = async (req, res) => {
    try {
        const unit = await unit_service_1.default.updateUnit(req.params.id, req.body, req.user);
        return res.status(200).json({
            success: true,
            message: "Unit updated successfully",
            data: unit,
        });
    }
    catch (error) {
        logger_1.default.error("Update unit error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to update unit",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.updateUnit = updateUnit;
// -----------------------------------------
// Update Unit Status
// -----------------------------------------
const updateUnitStatus = async (req, res) => {
    try {
        const unit = await unit_service_1.default.updateUnitStatus(req.params.id, req.body.status, req.user);
        return res.status(200).json({
            success: true,
            message: "Unit status updated successfully",
            data: unit,
        });
    }
    catch (error) {
        logger_1.default.error("Update unit status error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to update unit status",
        });
    }
};
exports.updateUnitStatus = updateUnitStatus;
// -----------------------------------------
// Delete Unit
// -----------------------------------------
const deleteUnit = async (req, res) => {
    try {
        await unit_service_1.default.deleteUnit(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Unit deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Delete unit error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to delete unit",
        });
    }
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
//# sourceMappingURL=unit.controller.js.map