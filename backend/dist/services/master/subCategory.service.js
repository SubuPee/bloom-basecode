"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubCategory = exports.updateSubCategoryStatus = exports.updateSubCategory = exports.getSubCategoryById = exports.getSubCategories = exports.createSubCategory = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const subCategory_model_1 = __importDefault(require("../../models/master/subCategory.model"));
const category_model_1 = __importDefault(require("../../models/master/category.model"));
// ---------------------------------------
// Create Sub Category
// ---------------------------------------
const createSubCategory = async (data, userId) => {
    const { subCategoryCode, subCategoryName, category, status } = data;
    const normalizedCode = subCategoryCode.trim().toUpperCase();
    const normalizedName = subCategoryName.trim();
    // Check duplicate code
    const existingCode = await subCategory_model_1.default.findOne({
        subCategoryCode: normalizedCode,
    });
    if (existingCode) {
        throw new Error("Sub category code already exists");
    }
    // Check parent category
    const parentCategory = await category_model_1.default.findById(category);
    if (!parentCategory) {
        throw new Error("Category not found");
    }
    if (parentCategory.status !== "active") {
        throw new Error("Inactive category cannot be selected");
    }
    // Duplicate name inside category
    const existingName = await subCategory_model_1.default.findOne({
        subCategoryName: normalizedName,
        category,
    });
    if (existingName) {
        throw new Error("Sub category name already exists under this category");
    }
    const subCategory = await subCategory_model_1.default.create({
        subCategoryCode: normalizedCode,
        subCategoryName: normalizedName,
        category: parentCategory._id,
        status: status || "active",
        createdBy: userId || null,
        updatedBy: userId || null,
    });
    return subCategory_model_1.default.findById(subCategory._id)
        .populate("category", "categoryCode categoryName status")
        .populate("createdBy", "firstName lastName email");
};
exports.createSubCategory = createSubCategory;
// ---------------------------------------
// Get all Sub Categories
// ---------------------------------------
const getSubCategories = async ({ page = 1, limit = 10, search = "", status, category, } = {}) => {
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
    if (search && search.trim()) {
        filter.$or = [
            { subCategoryCode: { $regex: search.trim(), $options: "i" } },
            { subCategoryName: { $regex: search.trim(), $options: "i" } },
        ];
    }
    if (status) {
        filter.status = status;
    }
    if (category && mongoose_1.default.Types.ObjectId.isValid(category)) {
        filter.category = category;
    }
    const [subCategories, total] = await Promise.all([
        subCategory_model_1.default.find(filter)
            .populate("category", "categoryCode categoryName status")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        subCategory_model_1.default.countDocuments(filter),
    ]);
    return {
        subCategories,
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
exports.getSubCategories = getSubCategories;
// ---------------------------------------
// Get by ID
// ---------------------------------------
const getSubCategoryById = async (subCategoryId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(subCategoryId)) {
        throw new Error("Invalid sub category ID");
    }
    const subCategory = await subCategory_model_1.default.findById(subCategoryId)
        .populate("category", "categoryCode categoryName status")
        .populate("createdBy", "firstName lastName email")
        .populate("updatedBy", "firstName lastName email");
    if (!subCategory) {
        throw new Error("Sub category not found");
    }
    return subCategory;
};
exports.getSubCategoryById = getSubCategoryById;
// ---------------------------------------
// Update
// ---------------------------------------
const updateSubCategory = async (subCategoryId, data, userId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(subCategoryId)) {
        throw new Error("Invalid sub category ID");
    }
    const subCategory = await subCategory_model_1.default.findById(subCategoryId);
    if (!subCategory) {
        throw new Error("Sub category not found");
    }
    // Code
    if (data.subCategoryCode) {
        const normalizedCode = data.subCategoryCode.trim().toUpperCase();
        const duplicateCode = await subCategory_model_1.default.findOne({
            subCategoryCode: normalizedCode,
            _id: { $ne: subCategoryId },
        });
        if (duplicateCode) {
            throw new Error("Sub category code already exists");
        }
        subCategory.subCategoryCode = normalizedCode;
    }
    // Category
    let catId = subCategory.category;
    if (data.category !== undefined) {
        if (!mongoose_1.default.Types.ObjectId.isValid(data.category)) {
            throw new Error("Invalid category ID");
        }
        const parentCategory = await category_model_1.default.findById(data.category);
        if (!parentCategory) {
            throw new Error("Category not found");
        }
        if (parentCategory.status !== "active") {
            throw new Error("Inactive category cannot be selected");
        }
        subCategory.category = parentCategory._id;
        catId = parentCategory._id;
    }
    // Name
    if (data.subCategoryName) {
        const normalizedName = data.subCategoryName.trim();
        const duplicateName = await subCategory_model_1.default.findOne({
            subCategoryName: normalizedName,
            category: catId,
            _id: { $ne: subCategoryId },
        });
        if (duplicateName) {
            throw new Error("Sub category name already exists under this category");
        }
        subCategory.subCategoryName = normalizedName;
    }
    if (data.status) {
        subCategory.status = data.status;
    }
    subCategory.updatedBy = userId || null;
    await subCategory.save();
    return subCategory_model_1.default.findById(subCategory._id)
        .populate("category", "categoryCode categoryName status")
        .populate("updatedBy", "firstName lastName email");
};
exports.updateSubCategory = updateSubCategory;
// ---------------------------------------
// Update Status
// ---------------------------------------
const updateSubCategoryStatus = async (subCategoryId, status, userId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(subCategoryId)) {
        throw new Error("Invalid sub category ID");
    }
    if (!["active", "inactive"].includes(status)) {
        throw new Error("Status must be active or inactive");
    }
    const subCategory = await subCategory_model_1.default.findById(subCategoryId);
    if (!subCategory) {
        throw new Error("Sub category not found");
    }
    subCategory.status = status;
    subCategory.updatedBy = userId || null;
    await subCategory.save();
    return subCategory_model_1.default.findById(subCategory._id).populate("category", "categoryCode categoryName status");
};
exports.updateSubCategoryStatus = updateSubCategoryStatus;
// ---------------------------------------
// Delete
// ---------------------------------------
const deleteSubCategory = async (subCategoryId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(subCategoryId)) {
        throw new Error("Invalid sub category ID");
    }
    const subCategory = await subCategory_model_1.default.findById(subCategoryId);
    if (!subCategory) {
        throw new Error("Sub category not found");
    }
    await subCategory_model_1.default.findByIdAndDelete(subCategoryId);
    return true;
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
//# sourceMappingURL=subCategory.service.js.map