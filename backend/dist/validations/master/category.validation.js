"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateCategory = exports.validateCreateCategory = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const validateCreateCategory = (data = {}) => {
    const errors = {};
    if (!data.categoryCode) {
        errors.categoryCode =
            "Category code is required";
    }
    else if (typeof data.categoryCode !== "string") {
        errors.categoryCode =
            "Category code must be a string";
    }
    else if (data.categoryCode.trim().length < 2) {
        errors.categoryCode =
            "Category code must be at least 2 characters";
    }
    if (!data.categoryName) {
        errors.categoryName =
            "Category name is required";
    }
    else if (typeof data.categoryName !== "string") {
        errors.categoryName =
            "Category name must be a string";
    }
    else if (data.categoryName.trim().length < 2) {
        errors.categoryName =
            "Category name must be at least 2 characters";
    }
    if (data.parentCategory &&
        !mongoose_1.default.Types.ObjectId.isValid(data.parentCategory)) {
        errors.parentCategory =
            "Invalid parent category ID";
    }
    if (data.status &&
        !["active", "inactive"].includes(data.status)) {
        errors.status =
            "Status must be active or inactive";
    }
    return errors;
};
exports.validateCreateCategory = validateCreateCategory;
const validateUpdateCategory = (data = {}) => {
    const errors = {};
    if (data.categoryCode !== undefined) {
        if (typeof data.categoryCode !== "string") {
            errors.categoryCode =
                "Category code must be a string";
        }
        else if (data.categoryCode.trim().length < 2) {
            errors.categoryCode =
                "Category code must be at least 2 characters";
        }
    }
    if (data.categoryName !== undefined) {
        if (typeof data.categoryName !== "string") {
            errors.categoryName =
                "Category name must be a string";
        }
        else if (data.categoryName.trim().length < 2) {
            errors.categoryName =
                "Category name must be at least 2 characters";
        }
    }
    if (data.parentCategory !== undefined &&
        data.parentCategory !== null &&
        data.parentCategory !== "" &&
        !mongoose_1.default.Types.ObjectId.isValid(data.parentCategory)) {
        errors.parentCategory =
            "Invalid parent category ID";
    }
    if (data.status !== undefined &&
        !["active", "inactive"].includes(data.status)) {
        errors.status =
            "Status must be active or inactive";
    }
    return errors;
};
exports.validateUpdateCategory = validateUpdateCategory;
exports.default = {
    validateCreateCategory: exports.validateCreateCategory,
    validateUpdateCategory: exports.validateUpdateCategory,
};
//# sourceMappingURL=category.validation.js.map