"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateObjectId = exports.validateUpdateWarehouse = exports.validateCreateWarehouse = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const validateEmail = (email) => {
    if (!email) {
        return true;
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
// -----------------------------------------
// Create Warehouse Validation
// -----------------------------------------
const validateCreateWarehouse = (data = {}) => {
    const errors = {};
    if (!data.warehouseCode) {
        errors.warehouseCode =
            "Warehouse code is required";
    }
    else if (typeof data.warehouseCode !== "string" ||
        !data.warehouseCode.trim()) {
        errors.warehouseCode =
            "Warehouse code must be a valid string";
    }
    if (!data.warehouseName) {
        errors.warehouseName =
            "Warehouse name is required";
    }
    else if (typeof data.warehouseName !== "string" ||
        !data.warehouseName.trim()) {
        errors.warehouseName =
            "Warehouse name must be a valid string";
    }
    if (!data.addressLine1) {
        errors.addressLine1 =
            "Address line 1 is required";
    }
    if (!data.city) {
        errors.city = "City is required";
    }
    if (!data.state) {
        errors.state = "State is required";
    }
    if (!data.country) {
        errors.country = "Country is required";
    }
    if (!data.postalCode) {
        errors.postalCode =
            "Postal code is required";
    }
    if (!data.contactPerson) {
        errors.contactPerson =
            "Contact person is required";
    }
    if (!data.contactPhone) {
        errors.contactPhone =
            "Contact phone is required";
    }
    if (data.email !== undefined &&
        data.email !== "" &&
        !validateEmail(data.email)) {
        errors.email = "Invalid email address";
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
exports.validateCreateWarehouse = validateCreateWarehouse;
// -----------------------------------------
// Update Warehouse Validation
// -----------------------------------------
const validateUpdateWarehouse = (data = {}) => {
    const errors = {};
    if (data.warehouseCode !== undefined &&
        (typeof data.warehouseCode !== "string" ||
            !data.warehouseCode.trim())) {
        errors.warehouseCode =
            "Warehouse code must be a valid string";
    }
    if (data.warehouseName !== undefined &&
        (typeof data.warehouseName !== "string" ||
            !data.warehouseName.trim())) {
        errors.warehouseName =
            "Warehouse name must be a valid string";
    }
    if (data.addressLine1 !== undefined &&
        (typeof data.addressLine1 !== "string" ||
            !data.addressLine1.trim())) {
        errors.addressLine1 =
            "Address line 1 cannot be empty";
    }
    if (data.addressLine2 !== undefined &&
        typeof data.addressLine2 !== "string") {
        errors.addressLine2 =
            "Address line 2 must be a valid string";
    }
    if (data.city !== undefined &&
        (typeof data.city !== "string" ||
            !data.city.trim())) {
        errors.city = "City cannot be empty";
    }
    if (data.state !== undefined &&
        (typeof data.state !== "string" ||
            !data.state.trim())) {
        errors.state = "State cannot be empty";
    }
    if (data.country !== undefined &&
        (typeof data.country !== "string" ||
            !data.country.trim())) {
        errors.country =
            "Country cannot be empty";
    }
    if (data.postalCode !== undefined &&
        (typeof data.postalCode !== "string" ||
            !data.postalCode.trim())) {
        errors.postalCode =
            "Postal code cannot be empty";
    }
    if (data.contactPerson !== undefined &&
        (typeof data.contactPerson !== "string" ||
            !data.contactPerson.trim())) {
        errors.contactPerson =
            "Contact person cannot be empty";
    }
    if (data.contactPhone !== undefined &&
        (typeof data.contactPhone !== "string" ||
            !data.contactPhone.trim())) {
        errors.contactPhone =
            "Contact phone cannot be empty";
    }
    if (data.email !== undefined &&
        data.email !== "" &&
        !validateEmail(data.email)) {
        errors.email = "Invalid email address";
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
exports.validateUpdateWarehouse = validateUpdateWarehouse;
// -----------------------------------------
// ObjectId Validation
// -----------------------------------------
const validateObjectId = (id) => {
    return mongoose_1.default.Types.ObjectId.isValid(id);
};
exports.validateObjectId = validateObjectId;
exports.default = {
    validateCreateWarehouse: exports.validateCreateWarehouse,
    validateUpdateWarehouse: exports.validateUpdateWarehouse,
    validateObjectId: exports.validateObjectId,
};
//# sourceMappingURL=warehouse.validation.js.map