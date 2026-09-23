"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateObjectId = exports.validateUpdateUnit = exports.validateCreateUnit = exports.UNIT_TYPES = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.UNIT_TYPES = [
    "quantity",
    "weight",
    "length",
    "volume",
    "area",
];
const validateCreateUnit = (data = {}) => {
    const errors = {};
    // Unit Code
    if (!data.unitCode) {
        errors.unitCode = "Unit code is required";
    }
    else if (typeof data.unitCode !== "string" ||
        !data.unitCode.trim()) {
        errors.unitCode = "Unit code must be a valid string";
    }
    // Unit Name
    if (!data.unitName) {
        errors.unitName = "Unit name is required";
    }
    else if (typeof data.unitName !== "string" ||
        !data.unitName.trim()) {
        errors.unitName = "Unit name must be a valid string";
    }
    // Symbol
    if (!data.symbol) {
        errors.symbol = "Unit symbol is required";
    }
    else if (typeof data.symbol !== "string" ||
        !data.symbol.trim()) {
        errors.symbol = "Unit symbol must be a valid string";
    }
    // Unit Type
    if (!data.unitType) {
        errors.unitType = "Unit type is required";
    }
    else if (!exports.UNIT_TYPES.includes(String(data.unitType).toLowerCase())) {
        errors.unitType =
            "Unit type must be one of: quantity, weight, length, volume, area";
    }
    // Status
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
exports.validateCreateUnit = validateCreateUnit;
const validateUpdateUnit = (data = {}) => {
    const errors = {};
    // Unit Code
    if (data.unitCode !== undefined &&
        (typeof data.unitCode !== "string" ||
            !data.unitCode.trim())) {
        errors.unitCode =
            "Unit code must be a valid string";
    }
    // Unit Name
    if (data.unitName !== undefined &&
        (typeof data.unitName !== "string" ||
            !data.unitName.trim())) {
        errors.unitName =
            "Unit name must be a valid string";
    }
    // Symbol
    if (data.symbol !== undefined &&
        (typeof data.symbol !== "string" ||
            !data.symbol.trim())) {
        errors.symbol =
            "Unit symbol must be a valid string";
    }
    // Unit Type
    if (data.unitType !== undefined &&
        !exports.UNIT_TYPES.includes(String(data.unitType).toLowerCase())) {
        errors.unitType =
            "Unit type must be one of: quantity, weight, length, volume, area";
    }
    // Status
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
exports.validateUpdateUnit = validateUpdateUnit;
const validateObjectId = (id) => {
    return mongoose_1.default.Types.ObjectId.isValid(id);
};
exports.validateObjectId = validateObjectId;
exports.default = {
    validateCreateUnit: exports.validateCreateUnit,
    validateUpdateUnit: exports.validateUpdateUnit,
    validateObjectId: exports.validateObjectId,
    UNIT_TYPES: exports.UNIT_TYPES,
};
//# sourceMappingURL=unit.validation.js.map