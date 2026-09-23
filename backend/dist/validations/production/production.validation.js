"use strict";
// =====================================================
// PRODUCTION ORDER VALIDATIONS
// =====================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCancelOrder = exports.validateCompleteOrder = exports.validateCreateOrder = void 0;
const validateCreateOrder = (data = {}) => {
    const errors = {};
    if (!data.productId || !String(data.productId).trim()) {
        errors.productId = "Product is required";
    }
    if (!data.variantId || !String(data.variantId).trim()) {
        errors.variantId = "Variant is required";
    }
    if (!data.vendorId || !String(data.vendorId).trim()) {
        errors.vendorId = "Vendor is required";
    }
    if (!data.batchNumber || !String(data.batchNumber).trim()) {
        errors.batchNumber = "Batch number is required";
    }
    if (data.plannedQuantity === undefined || data.plannedQuantity === null) {
        errors.plannedQuantity = "Planned quantity is required";
    }
    else {
        const qty = Number(data.plannedQuantity);
        if (isNaN(qty) || qty <= 0) {
            errors.plannedQuantity = "Planned quantity must be a positive number";
        }
    }
    if (!data.unit || !String(data.unit).trim()) {
        errors.unit = "Unit of measure is required";
    }
    if (!data.warehouseId || !String(data.warehouseId).trim()) {
        errors.warehouseId = "Destination warehouse is required";
    }
    if (!data.expectedCompletion) {
        errors.expectedCompletion = "Expected completion date is required";
    }
    return errors;
};
exports.validateCreateOrder = validateCreateOrder;
const validateCompleteOrder = (data = {}) => {
    const errors = {};
    if (data.producedQuantity === undefined || data.producedQuantity === null) {
        errors.producedQuantity = "Total produced quantity is required";
    }
    else {
        const qty = Number(data.producedQuantity);
        if (isNaN(qty) || qty <= 0) {
            errors.producedQuantity = "Produced quantity must be a positive number";
        }
    }
    if (data.rejectedQuantity === undefined || data.rejectedQuantity === null) {
        errors.rejectedQuantity = "Rejected quantity is required (use 0 if none)";
    }
    else {
        const rej = Number(data.rejectedQuantity);
        if (isNaN(rej) || rej < 0) {
            errors.rejectedQuantity = "Rejected quantity cannot be negative";
        }
        const prod = Number(data.producedQuantity);
        if (!isNaN(prod) && !isNaN(rej) && rej > prod) {
            errors.rejectedQuantity = "Rejected quantity cannot exceed produced quantity";
        }
    }
    return errors;
};
exports.validateCompleteOrder = validateCompleteOrder;
const validateCancelOrder = (data = {}) => {
    const errors = {};
    if (!data.cancelReason || !String(data.cancelReason).trim()) {
        errors.cancelReason = "Cancellation reason is required";
    }
    return errors;
};
exports.validateCancelOrder = validateCancelOrder;
exports.default = {
    validateCreateOrder: exports.validateCreateOrder,
    validateCompleteOrder: exports.validateCompleteOrder,
    validateCancelOrder: exports.validateCancelOrder,
};
//# sourceMappingURL=production.validation.js.map