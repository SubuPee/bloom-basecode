"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategoryStatus = exports.updateCategory = exports.getCategoryById = exports.getCategories = exports.createCategory = void 0;
const category_service_1 = __importDefault(require("../../services/master/category.service"));
const category_validation_1 = require("../../validations/master/category.validation");
const logger_1 = __importDefault(require("../../utils/logger"));
// ---------------------------------------
// Create
// ---------------------------------------
const createCategory = async (req, res) => {
    try {
        const errors = (0, category_validation_1.validateCreateCategory)(req.body);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }
        const category = await category_service_1.default.createCategory(req.body, req.user?._id?.toString());
        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    }
    catch (error) {
        logger_1.default.error("Create category error: " + (error?.message || error));
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.createCategory = createCategory;
// ---------------------------------------
// Get all
// ---------------------------------------
const getCategories = async (req, res) => {
    try {
        const result = await category_service_1.default.getCategories({
            page: req.query.page,
            limit: req.query.limit,
            search: req.query.search || "",
            status: req.query.status,
            parentCategory: req.query.parentCategory,
        });
        return res.status(200).json({
            success: true,
            data: result.categories,
            pagination: result.pagination,
        });
    }
    catch (error) {
        logger_1.default.error("Get categories error: " + (error?.message || error));
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getCategories = getCategories;
// ---------------------------------------
// Get one
// ---------------------------------------
const getCategoryById = async (req, res) => {
    try {
        const category = await category_service_1.default.getCategoryById(req.params.id);
        return res.status(200).json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        logger_1.default.error("Get category error: " + (error?.message || error));
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getCategoryById = getCategoryById;
// ---------------------------------------
// Update
// ---------------------------------------
const updateCategory = async (req, res) => {
    try {
        const errors = (0, category_validation_1.validateUpdateCategory)(req.body);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }
        const category = await category_service_1.default.updateCategory(req.params.id, req.body, req.user?._id?.toString());
        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    }
    catch (error) {
        logger_1.default.error("Update category error: " + (error?.message || error));
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.updateCategory = updateCategory;
// ---------------------------------------
// Status
// ---------------------------------------
const updateCategoryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const category = await category_service_1.default.updateCategoryStatus(req.params.id, status, req.user?._id?.toString());
        return res.status(200).json({
            success: true,
            message: "Category status updated successfully",
            data: category,
        });
    }
    catch (error) {
        logger_1.default.error("Update category status error: " + (error?.message || error));
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.updateCategoryStatus = updateCategoryStatus;
// ---------------------------------------
// Delete
// ---------------------------------------
const deleteCategory = async (req, res) => {
    try {
        await category_service_1.default.deleteCategory(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Delete category error: " + (error?.message || error));
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.deleteCategory = deleteCategory;
exports.default = {
    createCategory: exports.createCategory,
    getCategories: exports.getCategories,
    getCategoryById: exports.getCategoryById,
    updateCategory: exports.updateCategory,
    updateCategoryStatus: exports.updateCategoryStatus,
    deleteCategory: exports.deleteCategory,
};
//# sourceMappingURL=category.controller.js.map