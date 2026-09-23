"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategoryStatus = exports.updateCategory = exports.getCategoryById = exports.getCategories = exports.createCategory = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const category_model_1 = __importDefault(require("../../models/master/category.model"));
// ---------------------------------------
// Create Category
// ---------------------------------------
const createCategory = async (data, userId) => {
    const { categoryCode, categoryName, parentCategory, status } = data;
    // Check duplicate code
    const existingCode = await category_model_1.default.findOne({
        categoryCode: categoryCode.trim().toUpperCase(),
    });
    if (existingCode) {
        throw new Error("Category code already exists");
    }
    // Check duplicate name
    const existingName = await category_model_1.default.findOne({
        categoryName: categoryName.trim(),
    });
    if (existingName) {
        throw new Error("Category name already exists");
    }
    // Validate parent
    let parent = null;
    if (parentCategory) {
        parent = await category_model_1.default.findById(parentCategory);
        if (!parent) {
            throw new Error("Parent category not found");
        }
        if (parent.status !== "active") {
            throw new Error("Inactive category cannot be selected as parent");
        }
    }
    const category = await category_model_1.default.create({
        categoryCode: categoryCode.trim().toUpperCase(),
        categoryName: categoryName.trim(),
        parentCategory: parent ? parent._id : null,
        status: status || "active",
        createdBy: userId || null,
        updatedBy: userId || null,
    });
    return category_model_1.default.findById(category._id)
        .populate("parentCategory", "categoryCode categoryName")
        .populate("createdBy", "firstName lastName email");
};
exports.createCategory = createCategory;
// ---------------------------------------
// Get Categories
// ---------------------------------------
const getCategories = async ({ page = 1, limit = 10, search = "", status, parentCategory, } = {}) => {
    let pageNum = Number(page);
    let limitNum = Number(limit);
    if (pageNum < 1)
        pageNum = 1;
    if (limitNum < 1)
        limitNum = 10;
    if (limitNum > 100)
        limitNum = 100;
    const skip = (pageNum - 1) * limitNum;
    const filter = {};
    // Search
    if (search && search.trim()) {
        filter.$or = [
            { categoryCode: { $regex: search.trim(), $options: "i" } },
            { categoryName: { $regex: search.trim(), $options: "i" } },
        ];
    }
    // Status
    if (status) {
        filter.status = status;
    }
    // Parent
    if (parentCategory === "null") {
        filter.parentCategory = null;
    }
    else if (parentCategory && mongoose_1.default.Types.ObjectId.isValid(parentCategory)) {
        filter.parentCategory = parentCategory;
    }
    const [categories, total] = await Promise.all([
        category_model_1.default.find(filter)
            .populate("parentCategory", "categoryCode categoryName")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        category_model_1.default.countDocuments(filter),
    ]);
    return {
        categories,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
            hasNextPage: pageNum < Math.ceil(total / limitNum),
            hasPreviousPage: pageNum > 1,
        },
    };
};
exports.getCategories = getCategories;
// ---------------------------------------
// Get Single Category
// ---------------------------------------
const getCategoryById = async (categoryId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(categoryId)) {
        throw new Error("Invalid category ID");
    }
    const category = await category_model_1.default.findById(categoryId)
        .populate("parentCategory", "categoryCode categoryName")
        .populate("createdBy", "firstName lastName email")
        .populate("updatedBy", "firstName lastName email");
    if (!category) {
        throw new Error("Category not found");
    }
    return category;
};
exports.getCategoryById = getCategoryById;
// ---------------------------------------
// Update Category
// ---------------------------------------
const updateCategory = async (categoryId, data, userId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(categoryId)) {
        throw new Error("Invalid category ID");
    }
    const category = await category_model_1.default.findById(categoryId);
    if (!category) {
        throw new Error("Category not found");
    }
    // Category code
    if (data.categoryCode) {
        const code = data.categoryCode.trim().toUpperCase();
        const duplicateCode = await category_model_1.default.findOne({
            categoryCode: code,
            _id: { $ne: categoryId },
        });
        if (duplicateCode) {
            throw new Error("Category code already exists");
        }
        category.categoryCode = code;
    }
    // Category name
    if (data.categoryName) {
        const name = data.categoryName.trim();
        const duplicateName = await category_model_1.default.findOne({
            categoryName: name,
            _id: { $ne: categoryId },
        });
        if (duplicateName) {
            throw new Error("Category name already exists");
        }
        category.categoryName = name;
    }
    // Parent category
    if (data.parentCategory !== undefined) {
        if (data.parentCategory === null || data.parentCategory === "") {
            category.parentCategory = null;
        }
        else {
            if (!mongoose_1.default.Types.ObjectId.isValid(data.parentCategory)) {
                throw new Error("Invalid parent category ID");
            }
            if (data.parentCategory.toString() === categoryId.toString()) {
                throw new Error("Category cannot be its own parent");
            }
            const parent = await category_model_1.default.findById(data.parentCategory);
            if (!parent) {
                throw new Error("Parent category not found");
            }
            if (parent.status !== "active") {
                throw new Error("Inactive category cannot be selected as parent");
            }
            category.parentCategory = parent._id;
        }
    }
    // Status
    if (data.status) {
        category.status = data.status;
    }
    category.updatedBy = userId || null;
    await category.save();
    return category_model_1.default.findById(category._id)
        .populate("parentCategory", "categoryCode categoryName")
        .populate("updatedBy", "firstName lastName email");
};
exports.updateCategory = updateCategory;
// ---------------------------------------
// Update Status
// ---------------------------------------
const updateCategoryStatus = async (categoryId, status, userId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(categoryId)) {
        throw new Error("Invalid category ID");
    }
    if (!["active", "inactive"].includes(status)) {
        throw new Error("Status must be active or inactive");
    }
    const category = await category_model_1.default.findById(categoryId);
    if (!category) {
        throw new Error("Category not found");
    }
    category.status = status;
    category.updatedBy = userId || null;
    await category.save();
    return category;
};
exports.updateCategoryStatus = updateCategoryStatus;
// ---------------------------------------
// Delete Category
// ---------------------------------------
const deleteCategory = async (categoryId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(categoryId)) {
        throw new Error("Invalid category ID");
    }
    const category = await category_model_1.default.findById(categoryId);
    if (!category) {
        throw new Error("Category not found");
    }
    // Check children
    const childCount = await category_model_1.default.countDocuments({
        parentCategory: categoryId,
    });
    if (childCount > 0) {
        throw new Error("Cannot delete category because it has sub categories");
    }
    await category_model_1.default.findByIdAndDelete(categoryId);
    return true;
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
//# sourceMappingURL=category.service.js.map