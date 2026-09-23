"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTax = exports.updateTaxStatus = exports.updateTax = exports.getTaxById = exports.getTaxes = exports.createTax = void 0;
const tax_service_1 = __importDefault(require("../../services/master/tax.service"));
const logger_1 = __importDefault(require("../../utils/logger"));
// -----------------------------------------
// Create Tax
// -----------------------------------------
const createTax = async (req, res) => {
    try {
        const tax = await tax_service_1.default.createTax(req.body, req.user);
        return res.status(201).json({
            success: true,
            message: "Tax created successfully",
            data: tax,
        });
    }
    catch (error) {
        logger_1.default.error("Create tax error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to create tax",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.createTax = createTax;
// -----------------------------------------
// Get Taxes
// -----------------------------------------
const getTaxes = async (req, res) => {
    try {
        const result = await tax_service_1.default.getTaxes(req.query);
        return res.status(200).json({
            success: true,
            message: "Taxes retrieved successfully",
            data: result.taxes,
            pagination: result.pagination,
        });
    }
    catch (error) {
        logger_1.default.error("Get taxes error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to get taxes",
        });
    }
};
exports.getTaxes = getTaxes;
// -----------------------------------------
// Get Tax By ID
// -----------------------------------------
const getTaxById = async (req, res) => {
    try {
        const tax = await tax_service_1.default.getTaxById(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Tax retrieved successfully",
            data: tax,
        });
    }
    catch (error) {
        logger_1.default.error("Get tax by ID error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to get tax",
        });
    }
};
exports.getTaxById = getTaxById;
// -----------------------------------------
// Update Tax
// -----------------------------------------
const updateTax = async (req, res) => {
    try {
        const tax = await tax_service_1.default.updateTax(req.params.id, req.body, req.user);
        return res.status(200).json({
            success: true,
            message: "Tax updated successfully",
            data: tax,
        });
    }
    catch (error) {
        logger_1.default.error("Update tax error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to update tax",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.updateTax = updateTax;
// -----------------------------------------
// Update Tax Status
// -----------------------------------------
const updateTaxStatus = async (req, res) => {
    try {
        const tax = await tax_service_1.default.updateTaxStatus(req.params.id, req.body.status, req.user);
        return res.status(200).json({
            success: true,
            message: "Tax status updated successfully",
            data: tax,
        });
    }
    catch (error) {
        logger_1.default.error("Update tax status error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to update tax status",
        });
    }
};
exports.updateTaxStatus = updateTaxStatus;
// -----------------------------------------
// Delete Tax
// -----------------------------------------
const deleteTax = async (req, res) => {
    try {
        await tax_service_1.default.deleteTax(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Tax deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Delete tax error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to delete tax",
        });
    }
};
exports.deleteTax = deleteTax;
exports.default = {
    createTax: exports.createTax,
    getTaxes: exports.getTaxes,
    getTaxById: exports.getTaxById,
    updateTax: exports.updateTax,
    updateTaxStatus: exports.updateTaxStatus,
    deleteTax: exports.deleteTax,
};
//# sourceMappingURL=tax.controller.js.map