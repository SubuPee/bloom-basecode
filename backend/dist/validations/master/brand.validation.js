"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateObjectId = exports.validateUpdateBrand = exports.validateCreateBrand = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// -----------------------------------------
// Create Brand Validation
// -----------------------------------------
const validateCreateBrand = (data = {}) => {
    const errors = {};
    if (!data.brandCode) {
        errors.brandCode = "Brand code is required";
    }
    else if (typeof data.brandCode !== "string" ||
        !data.brandCode.trim()) {
        errors.brandCode = "Brand code must be a valid string";
    }
    if (!data.brandName) {
        errors.brandName = "Brand name is required";
    }
    else if (typeof data.brandName !== "string" ||
        !data.brandName.trim()) {
        errors.brandName = "Brand name must be a valid string";
    }
    if (data.status !== undefined &&
        !["active", "inactive"].includes(data.status)) {
        errors.status =
            "Status must be either active or inactive";
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};
exports.validateCreateBrand = validateCreateBrand;
// -----------------------------------------
// Update Brand Validation
// -----------------------------------------
const validateUpdateBrand = (data = {}) => {
    const errors = {};
    if (data.brandCode !== undefined &&
        (typeof data.brandCode !== "string" ||
            !data.brandCode.trim())) {
        errors.brandCode = "Brand code must be a valid string";
    }
    if (data.brandName !== undefined &&
        (typeof data.brandName !== "string" ||
            !data.brandName.trim())) {
        errors.brandName = "Brand name must be a valid string";
    }
    if (data.status !== undefined &&
        !["active", "inactive"].includes(data.status)) {
        errors.status =
            "Status must be either active or inactive";
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};
exports.validateUpdateBrand = validateUpdateBrand;
// -----------------------------------------
// Object ID Validation
// -----------------------------------------
const validateObjectId = (id) => {
    return mongoose_1.default.Types.ObjectId.isValid(id);
};
exports.validateObjectId = validateObjectId;
// -----------------------------------------
// Export
// -----------------------------------------
exports.default = {
    validateCreateBrand: exports.validateCreateBrand,
    validateUpdateBrand: exports.validateUpdateBrand,
    validateObjectId: exports.validateObjectId,
};
//# sourceMappingURL=brand.validation.js.map