"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTax = exports.updateTaxStatus = exports.updateTax = exports.getTaxById = exports.getTaxes = exports.createTax = void 0;
const tax_model_1 = __importDefault(require("../../models/master/tax.model"));
const tax_validation_1 = require("../../validations/master/tax.validation");
const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
// -----------------------------------------
// Create Tax
// -----------------------------------------
const createTax = async (data, user) => {
    const validation = (0, tax_validation_1.validateCreateTax)(data);
    if (!validation.isValid) {
        const error = new Error("Validation failed");
        error.statusCode = 400;
        error.errors = validation.errors;
        throw error;
    }
    const taxCode = data.taxCode.trim().toUpperCase();
    const taxName = data.taxName.trim();
    const taxType = String(data.taxType).trim().toLowerCase();
    const taxRate = Number(data.taxRate);
    const description = data.description?.trim() || "";
    // Duplicate code
    const existingCode = await tax_model_1.default.findOne({
        taxCode,
    });
    if (existingCode) {
        const error = new Error("Tax code already exists");
        error.statusCode = 409;
        throw error;
    }
    // Duplicate name
    const existingName = await tax_model_1.default.findOne({
        taxName: {
            $regex: `^${escapeRegex(taxName)}$`,
            $options: "i",
        },
    });
    if (existingName) {
        const error = new Error("Tax name already exists");
        error.statusCode = 409;
        throw error;
    }
    const tax = await tax_model_1.default.create({
        taxCode,
        taxName,
        taxRate,
        taxType: taxType,
        description,
        status: data.status || "active",
        createdBy: user?._id || null,
    });
    return tax;
};
exports.createTax = createTax;
// -----------------------------------------
// Get Taxes
// -----------------------------------------
const getTaxes = async (query = {}) => {
    const { page = 1, limit = 10, search, status, taxType } = query;
    const pageNumber = Math.max(parseInt(String(page), 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;
    const filter = {};
    if (search && search.trim()) {
        const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
        filter.$or = [
            { taxCode: searchRegex },
            { taxName: searchRegex },
            { description: searchRegex },
        ];
    }
    if (status) {
        filter.status = status;
    }
    if (taxType) {
        filter.taxType = taxType.toLowerCase();
    }
    const [taxes, total] = await Promise.all([
        tax_model_1.default.find(filter)
            .populate("createdBy", "firstName lastName email")
            .populate("updatedBy", "firstName lastName email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber)
            .lean(),
        tax_model_1.default.countDocuments(filter),
    ]);
    return {
        taxes,
        pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
        },
    };
};
exports.getTaxes = getTaxes;
// -----------------------------------------
// Get Tax By ID
// -----------------------------------------
const getTaxById = async (id) => {
    if (!(0, tax_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid tax ID");
        error.statusCode = 400;
        throw error;
    }
    const tax = await tax_model_1.default.findById(id)
        .populate("createdBy", "firstName lastName email")
        .populate("updatedBy", "firstName lastName email");
    if (!tax) {
        const error = new Error("Tax not found");
        error.statusCode = 404;
        throw error;
    }
    return tax;
};
exports.getTaxById = getTaxById;
// -----------------------------------------
// Update Tax
// -----------------------------------------
const updateTax = async (id, data, user) => {
    if (!(0, tax_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid tax ID");
        error.statusCode = 400;
        throw error;
    }
    const validation = (0, tax_validation_1.validateUpdateTax)(data);
    if (!validation.isValid) {
        const error = new Error("Validation failed");
        error.statusCode = 400;
        error.errors = validation.errors;
        throw error;
    }
    const tax = await tax_model_1.default.findById(id);
    if (!tax) {
        const error = new Error("Tax not found");
        error.statusCode = 404;
        throw error;
    }
    const finalTaxType = data.taxType !== undefined
        ? String(data.taxType).trim().toLowerCase()
        : tax.taxType;
    const finalTaxRate = data.taxRate !== undefined ? Number(data.taxRate) : tax.taxRate;
    if (finalTaxType === "percentage" && finalTaxRate > 100) {
        const error = new Error("Percentage tax rate cannot exceed 100");
        error.statusCode = 400;
        throw error;
    }
    if (data.taxCode !== undefined) {
        const taxCode = data.taxCode.trim().toUpperCase();
        const existingCode = await tax_model_1.default.findOne({
            taxCode,
            _id: { $ne: id },
        });
        if (existingCode) {
            const error = new Error("Tax code already exists");
            error.statusCode = 409;
            throw error;
        }
        tax.taxCode = taxCode;
    }
    if (data.taxName !== undefined) {
        const taxName = data.taxName.trim();
        const existingName = await tax_model_1.default.findOne({
            taxName: {
                $regex: `^${escapeRegex(taxName)}$`,
                $options: "i",
            },
            _id: { $ne: id },
        });
        if (existingName) {
            const error = new Error("Tax name already exists");
            error.statusCode = 409;
            throw error;
        }
        tax.taxName = taxName;
    }
    if (data.taxRate !== undefined) {
        tax.taxRate = finalTaxRate;
    }
    if (data.taxType !== undefined) {
        tax.taxType = finalTaxType;
    }
    if (data.description !== undefined) {
        tax.description = data.description.trim();
    }
    if (data.status !== undefined) {
        tax.status = data.status;
    }
    tax.updatedBy = user?._id || null;
    await tax.save();
    return tax;
};
exports.updateTax = updateTax;
// -----------------------------------------
// Update Tax Status
// -----------------------------------------
const updateTaxStatus = async (id, status, user) => {
    if (!(0, tax_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid tax ID");
        error.statusCode = 400;
        throw error;
    }
    if (!["active", "inactive"].includes(status)) {
        const error = new Error("Status must be either active or inactive");
        error.statusCode = 400;
        throw error;
    }
    const tax = await tax_model_1.default.findById(id);
    if (!tax) {
        const error = new Error("Tax not found");
        error.statusCode = 404;
        throw error;
    }
    tax.status = status;
    tax.updatedBy = user?._id || null;
    await tax.save();
    return tax;
};
exports.updateTaxStatus = updateTaxStatus;
// -----------------------------------------
// Delete Tax
// -----------------------------------------
const deleteTax = async (id) => {
    if (!(0, tax_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid tax ID");
        error.statusCode = 400;
        throw error;
    }
    const tax = await tax_model_1.default.findById(id);
    if (!tax) {
        const error = new Error("Tax not found");
        error.statusCode = 404;
        throw error;
    }
    await tax_model_1.default.findByIdAndDelete(id);
    return true;
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
//# sourceMappingURL=tax.service.js.map