"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubCategory = exports.updateSubCategoryStatus = exports.updateSubCategory = exports.getSubCategoryById = exports.getSubCategories = exports.createSubCategory = void 0;
const subCategory_service_1 = __importDefault(require("../../services/master/subCategory.service"));
const subCategory_validation_1 = require("../../validations/master/subCategory.validation");
const logger_1 = __importDefault(require("../../utils/logger"));
// ---------------------------------------
// Create Sub Category
// ---------------------------------------
const createSubCategory = async (req, res) => {
    try {
        const errors = (0, subCategory_validation_1.validateCreateSubCategory)(req.body);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }
        const subCategory = await subCategory_service_1.default.createSubCategory(req.body, req.user?._id?.toString());
        return res.status(201).json({
            success: true,
            message: "Sub category created successfully",
            data: subCategory,
        });
    }
    catch (error) {
        logger_1.default.error("Create sub category error: " + (error?.message || error));
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.createSubCategory = createSubCategory;
// ---------------------------------------
// Get all Sub Categories
// ---------------------------------------
const getSubCategories = async (req, res) => {
    try {
        const result = await subCategory_service_1.default.getSubCategories({
            page: req.query.page,
            limit: req.query.limit,
            search: req.query.search || "",
            status: req.query.status,
            category: req.query.category,
        });
        return res.status(200).json({
            success: true,
            data: result.subCategories,
            pagination: result.pagination,
        });
    }
    catch (error) {
        logger_1.default.error("Get sub categories error: " + (error?.message || error));
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getSubCategories = getSubCategories;
// ---------------------------------------
// Get by ID
// ---------------------------------------
const getSubCategoryById = async (req, res) => {
    try {
        const subCategory = await subCategory_service_1.default.getSubCategoryById(req.params.id);
        return res.status(200).json({
            success: true,
            data: subCategory,
        });
    }
    catch (error) {
        logger_1.default.error("Get sub category error: " + (error?.message || error));
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getSubCategoryById = getSubCategoryById;
// ---------------------------------------
// Update
// ---------------------------------------
const updateSubCategory = async (req, res) => {
    try {
        const errors = (0, subCategory_validation_1.validateUpdateSubCategory)(req.body);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }
        const subCategory = await subCategory_service_1.default.updateSubCategory(req.params.id, req.body, req.user?._id?.toString());
        return res.status(200).json({
            success: true,
            message: "Sub category updated successfully",
            data: subCategory,
        });
    }
    catch (error) {
        logger_1.default.error("Update sub category error: " + (error?.message || error));
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.updateSubCategory = updateSubCategory;
// ---------------------------------------
// Update Status
// ---------------------------------------
const updateSubCategoryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const subCategory = await subCategory_service_1.default.updateSubCategoryStatus(req.params.id, status, req.user?._id?.toString());
        return res.status(200).json({
            success: true,
            message: "Sub category status updated successfully",
            data: subCategory,
        });
    }
    catch (error) {
        logger_1.default.error("Update sub category status error: " + (error?.message || error));
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.updateSubCategoryStatus = updateSubCategoryStatus;
// ---------------------------------------
// Delete
// ---------------------------------------
const deleteSubCategory = async (req, res) => {
    try {
        await subCategory_service_1.default.deleteSubCategory(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Sub category deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Delete sub category error: " + (error?.message || error));
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.deleteSubCategory = deleteSubCategory;
exports.default = {
    createSubCategory: exports.createSubCategory,
    getSubCategories: exports.getSubCategories,
    getSubCategoryById: exports.getSubCategoryById,
    updateSubCategory: exports.updateSubCategory,
    updateSubCategoryStatus: exports.updateSubCategoryStatus,
    deleteSubCategory: exports.deleteSubCategory,
};
//# sourceMappingURL=subCategory.controller.js.map