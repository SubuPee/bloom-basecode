"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttribute = exports.updateAttributeStatus = exports.updateAttribute = exports.getAttributeById = exports.getAttributes = exports.createAttribute = void 0;
const attribute_model_1 = __importDefault(require("../../models/master/attribute.model"));
const attribute_validation_1 = require("../../validations/master/attribute.validation");
const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
// -----------------------------------------
// Create Attribute
// -----------------------------------------
const createAttribute = async (data, user) => {
    const validation = (0, attribute_validation_1.validateCreateAttribute)(data);
    if (!validation.isValid) {
        const error = new Error("Validation failed");
        error.statusCode = 400;
        error.errors = validation.errors;
        throw error;
    }
    const attributeCode = data.attributeCode.trim().toUpperCase();
    const attributeName = data.attributeName.trim();
    const existingCode = await attribute_model_1.default.findOne({
        attributeCode,
    });
    if (existingCode) {
        const error = new Error("Attribute code already exists");
        error.statusCode = 409;
        throw error;
    }
    const existingName = await attribute_model_1.default.findOne({
        attributeName: {
            $regex: `^${escapeRegex(attributeName)}$`,
            $options: "i",
        },
    });
    if (existingName) {
        const error = new Error("Attribute name already exists");
        error.statusCode = 409;
        throw error;
    }
    const values = (data.values || []).map((item) => ({
        value: item.value.trim(),
        status: item.status || "active",
    }));
    const attribute = await attribute_model_1.default.create({
        attributeCode,
        attributeName,
        displayType: (data.displayType || "dropdown"),
        values,
        status: data.status || "active",
        createdBy: user?._id || null,
    });
    return attribute;
};
exports.createAttribute = createAttribute;
// -----------------------------------------
// Get Attributes
// -----------------------------------------
const getAttributes = async (query = {}) => {
    const { page = 1, limit = 10, search, status, displayType } = query;
    const pageNumber = Math.max(parseInt(String(page), 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;
    const filter = {};
    if (search && search.trim()) {
        const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
        filter.$or = [
            { attributeCode: searchRegex },
            { attributeName: searchRegex },
            { "values.value": searchRegex },
        ];
    }
    if (status) {
        filter.status = status;
    }
    if (displayType) {
        filter.displayType = displayType;
    }
    const [attributes, total] = await Promise.all([
        attribute_model_1.default.find(filter)
            .populate("createdBy", "firstName lastName email")
            .populate("updatedBy", "firstName lastName email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber)
            .lean(),
        attribute_model_1.default.countDocuments(filter),
    ]);
    return {
        attributes,
        pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
        },
    };
};
exports.getAttributes = getAttributes;
// -----------------------------------------
// Get Attribute By ID
// -----------------------------------------
const getAttributeById = async (id) => {
    if (!(0, attribute_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid attribute ID");
        error.statusCode = 400;
        throw error;
    }
    const attribute = await attribute_model_1.default.findById(id)
        .populate("createdBy", "firstName lastName email")
        .populate("updatedBy", "firstName lastName email");
    if (!attribute) {
        const error = new Error("Attribute not found");
        error.statusCode = 404;
        throw error;
    }
    return attribute;
};
exports.getAttributeById = getAttributeById;
// -----------------------------------------
// Update Attribute
// -----------------------------------------
const updateAttribute = async (id, data, user) => {
    if (!(0, attribute_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid attribute ID");
        error.statusCode = 400;
        throw error;
    }
    const validation = (0, attribute_validation_1.validateUpdateAttribute)(data);
    if (!validation.isValid) {
        const error = new Error("Validation failed");
        error.statusCode = 400;
        error.errors = validation.errors;
        throw error;
    }
    const attribute = await attribute_model_1.default.findById(id);
    if (!attribute) {
        const error = new Error("Attribute not found");
        error.statusCode = 404;
        throw error;
    }
    if (data.attributeCode !== undefined) {
        const attributeCode = data.attributeCode.trim().toUpperCase();
        const existingCode = await attribute_model_1.default.findOne({
            attributeCode,
            _id: { $ne: id },
        });
        if (existingCode) {
            const error = new Error("Attribute code already exists");
            error.statusCode = 409;
            throw error;
        }
        attribute.attributeCode = attributeCode;
    }
    if (data.attributeName !== undefined) {
        const attributeName = data.attributeName.trim();
        const existingName = await attribute_model_1.default.findOne({
            attributeName: {
                $regex: `^${escapeRegex(attributeName)}$`,
                $options: "i",
            },
            _id: { $ne: id },
        });
        if (existingName) {
            const error = new Error("Attribute name already exists");
            error.statusCode = 409;
            throw error;
        }
        attribute.attributeName = attributeName;
    }
    if (data.displayType !== undefined) {
        attribute.displayType = data.displayType;
    }
    if (data.values !== undefined) {
        attribute.values = data.values.map((item) => ({
            value: item.value.trim(),
            status: item.status || "active",
        }));
    }
    if (data.status !== undefined) {
        attribute.status = data.status;
    }
    attribute.updatedBy = user?._id || null;
    await attribute.save();
    return attribute;
};
exports.updateAttribute = updateAttribute;
// -----------------------------------------
// Update Attribute Status
// -----------------------------------------
const updateAttributeStatus = async (id, status, user) => {
    if (!(0, attribute_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid attribute ID");
        error.statusCode = 400;
        throw error;
    }
    if (!["active", "inactive"].includes(status)) {
        const error = new Error("Status must be either active or inactive");
        error.statusCode = 400;
        throw error;
    }
    const attribute = await attribute_model_1.default.findById(id);
    if (!attribute) {
        const error = new Error("Attribute not found");
        error.statusCode = 404;
        throw error;
    }
    attribute.status = status;
    attribute.updatedBy = user?._id || null;
    await attribute.save();
    return attribute;
};
exports.updateAttributeStatus = updateAttributeStatus;
// -----------------------------------------
// Delete Attribute
// -----------------------------------------
const deleteAttribute = async (id) => {
    if (!(0, attribute_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid attribute ID");
        error.statusCode = 400;
        throw error;
    }
    const attribute = await attribute_model_1.default.findById(id);
    if (!attribute) {
        const error = new Error("Attribute not found");
        error.statusCode = 404;
        throw error;
    }
    await attribute_model_1.default.findByIdAndDelete(id);
    return true;
};
exports.deleteAttribute = deleteAttribute;
exports.default = {
    createAttribute: exports.createAttribute,
    getAttributes: exports.getAttributes,
    getAttributeById: exports.getAttributeById,
    updateAttribute: exports.updateAttribute,
    updateAttributeStatus: exports.updateAttributeStatus,
    deleteAttribute: exports.deleteAttribute,
};
//# sourceMappingURL=attribute.service.js.map