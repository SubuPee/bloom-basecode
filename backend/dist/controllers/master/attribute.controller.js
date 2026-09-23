"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttribute = exports.updateAttributeStatus = exports.updateAttribute = exports.getAttributeById = exports.getAttributes = exports.createAttribute = void 0;
const attribute_service_1 = __importDefault(require("../../services/master/attribute.service"));
const logger_1 = __importDefault(require("../../utils/logger"));
// -----------------------------------------
// Create Attribute
// -----------------------------------------
const createAttribute = async (req, res) => {
    try {
        const attribute = await attribute_service_1.default.createAttribute(req.body, req.user);
        return res.status(201).json({
            success: true,
            message: "Attribute created successfully",
            data: attribute,
        });
    }
    catch (error) {
        logger_1.default.error("Create Attribute Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to create attribute",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.createAttribute = createAttribute;
// -----------------------------------------
// Get All Attributes
// -----------------------------------------
const getAttributes = async (req, res) => {
    try {
        const result = await attribute_service_1.default.getAttributes(req.query);
        return res.status(200).json({
            success: true,
            message: "Attributes fetched successfully",
            data: result.attributes,
            pagination: result.pagination,
        });
    }
    catch (error) {
        logger_1.default.error("Get Attributes Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch attributes",
        });
    }
};
exports.getAttributes = getAttributes;
// -----------------------------------------
// Get Attribute By ID
// -----------------------------------------
const getAttributeById = async (req, res) => {
    try {
        const attribute = await attribute_service_1.default.getAttributeById(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Attribute fetched successfully",
            data: attribute,
        });
    }
    catch (error) {
        logger_1.default.error("Get Attribute Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch attribute",
        });
    }
};
exports.getAttributeById = getAttributeById;
// -----------------------------------------
// Update Attribute
// -----------------------------------------
const updateAttribute = async (req, res) => {
    try {
        const attribute = await attribute_service_1.default.updateAttribute(req.params.id, req.body, req.user);
        return res.status(200).json({
            success: true,
            message: "Attribute updated successfully",
            data: attribute,
        });
    }
    catch (error) {
        logger_1.default.error("Update Attribute Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update attribute",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.updateAttribute = updateAttribute;
// -----------------------------------------
// Update Attribute Status
// -----------------------------------------
const updateAttributeStatus = async (req, res) => {
    try {
        const attribute = await attribute_service_1.default.updateAttributeStatus(req.params.id, req.body.status, req.user);
        return res.status(200).json({
            success: true,
            message: "Attribute status updated successfully",
            data: attribute,
        });
    }
    catch (error) {
        logger_1.default.error("Update Attribute Status Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update attribute status",
        });
    }
};
exports.updateAttributeStatus = updateAttributeStatus;
// -----------------------------------------
// Delete Attribute
// -----------------------------------------
const deleteAttribute = async (req, res) => {
    try {
        await attribute_service_1.default.deleteAttribute(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Attribute deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Delete Attribute Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to delete attribute",
        });
    }
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
//# sourceMappingURL=attribute.controller.js.map