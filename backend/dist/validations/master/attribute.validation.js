"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateObjectId = exports.validateUpdateAttribute = exports.validateCreateAttribute = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// -----------------------------------------
// Validate Attribute Values
// -----------------------------------------
const validateValues = (values, errors) => {
    if (values === undefined) {
        return;
    }
    if (!Array.isArray(values)) {
        errors.values = "Values must be an array";
        return;
    }
    const seenValues = new Set();
    values.forEach((item, index) => {
        if (!item || typeof item !== "object") {
            errors[`values.${index}`] =
                "Attribute value must be an object";
            return;
        }
        // Validate value
        if (typeof item.value !== "string" ||
            !item.value.trim()) {
            errors[`values.${index}.value`] =
                "Attribute value must be a valid string";
        }
        else {
            const normalizedValue = item.value
                .trim()
                .toLowerCase();
            if (seenValues.has(normalizedValue)) {
                errors[`values.${index}.value`] =
                    "Duplicate attribute value";
            }
            seenValues.add(normalizedValue);
        }
        // Validate value status
        if (item.status !== undefined &&
            !["active", "inactive"].includes(item.status)) {
            errors[`values.${index}.status`] =
                "Value status must be either active or inactive";
        }
    });
};
// -----------------------------------------
// Create Attribute Validation
// -----------------------------------------
const validateCreateAttribute = (data = {}) => {
    const errors = {};
    // Attribute Code
    if (!data.attributeCode) {
        errors.attributeCode =
            "Attribute code is required";
    }
    else if (typeof data.attributeCode !== "string" ||
        !data.attributeCode.trim()) {
        errors.attributeCode =
            "Attribute code must be a valid string";
    }
    // Attribute Name
    if (!data.attributeName) {
        errors.attributeName =
            "Attribute name is required";
    }
    else if (typeof data.attributeName !== "string" ||
        !data.attributeName.trim()) {
        errors.attributeName =
            "Attribute name must be a valid string";
    }
    // Display Type
    if (data.displayType !== undefined &&
        ![
            "dropdown",
            "radio",
            "checkbox",
            "text",
            "color",
        ].includes(data.displayType)) {
        errors.displayType =
            "Display type must be dropdown, radio, checkbox, text or color";
    }
    // Values
    validateValues(data.values, errors);
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
exports.validateCreateAttribute = validateCreateAttribute;
// -----------------------------------------
// Update Attribute Validation
// -----------------------------------------
const validateUpdateAttribute = (data = {}) => {
    const errors = {};
    // Attribute Code
    if (data.attributeCode !== undefined &&
        (typeof data.attributeCode !== "string" ||
            !data.attributeCode.trim())) {
        errors.attributeCode =
            "Attribute code must be a valid string";
    }
    // Attribute Name
    if (data.attributeName !== undefined &&
        (typeof data.attributeName !== "string" ||
            !data.attributeName.trim())) {
        errors.attributeName =
            "Attribute name must be a valid string";
    }
    // Display Type
    if (data.displayType !== undefined &&
        ![
            "dropdown",
            "radio",
            "checkbox",
            "text",
            "color",
        ].includes(data.displayType)) {
        errors.displayType =
            "Display type must be dropdown, radio, checkbox, text or color";
    }
    // Values
    validateValues(data.values, errors);
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
exports.validateUpdateAttribute = validateUpdateAttribute;
// -----------------------------------------
// ObjectId Validation
// -----------------------------------------
const validateObjectId = (id) => {
    return mongoose_1.default.Types.ObjectId.isValid(id);
};
exports.validateObjectId = validateObjectId;
exports.default = {
    validateCreateAttribute: exports.validateCreateAttribute,
    validateUpdateAttribute: exports.validateUpdateAttribute,
    validateObjectId: exports.validateObjectId,
};
//# sourceMappingURL=attribute.validation.js.map