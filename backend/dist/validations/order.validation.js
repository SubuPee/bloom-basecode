"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBulkOrderStatus = exports.validateUpdatePaymentStatus = exports.validateUpdateOrderStatus = exports.validateCreateOrder = exports.PAYMENT_STATUSES = exports.ORDER_STATUSES = void 0;
exports.ORDER_STATUSES = [
    "Processing",
    "Shipped",
    "Delivered",
    "Returned",
    "Cancelled",
];
exports.PAYMENT_STATUSES = [
    "Paid",
    "Pending",
    "Refunded",
    "Failed",
];
const isValidString = (value) => {
    return typeof value === "string" && value.trim().length > 0;
};
const isValidEmail = (value) => {
    if (typeof value !== "string")
        return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
};
const isNonNegativeNumber = (value) => {
    if (value === undefined || value === null || value === "")
        return false;
    const num = Number(value);
    return !isNaN(num) && num >= 0;
};
const isPositiveNumber = (value) => {
    if (value === undefined || value === null || value === "")
        return false;
    const num = Number(value);
    return !isNaN(num) && num > 0;
};
// =====================================================
// CREATE ORDER VALIDATION
// =====================================================
const validateCreateOrder = (data = {}) => {
    const errors = {};
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return { body: "Request body must be an object." };
    }
    // Customer Name
    if (!isValidString(data.customerName) && !isValidString(data.customer)) {
        errors.customerName = "Customer name is required.";
    }
    // Customer Email
    const email = data.customerEmail || data.email;
    if (!email || !isValidEmail(email)) {
        errors.customerEmail = "A valid customer email is required.";
    }
    // Items
    const items = data.items || data.products;
    if (!Array.isArray(items) || items.length === 0) {
        errors.items = "Order must contain at least one item.";
    }
    else {
        items.forEach((item, index) => {
            if (!item || typeof item !== "object") {
                if (typeof item === "string" && item.trim()) {
                    // Allowed shorthand: product name as string
                    return;
                }
                errors[`items.${index}`] = "Item must be a valid object.";
                return;
            }
            if (!isValidString(item.productName) && !isValidString(item.name)) {
                errors[`items.${index}.productName`] = "Product name is required.";
            }
            if (item.quantity !== undefined && !isPositiveNumber(item.quantity)) {
                errors[`items.${index}.quantity`] = "Quantity must be greater than 0.";
            }
            if (item.unitPrice !== undefined && !isNonNegativeNumber(item.unitPrice)) {
                errors[`items.${index}.unitPrice`] = "Unit price must be a non-negative number.";
            }
        });
    }
    // Shipping Address
    const shippingAddr = data.shippingAddress || data.address;
    if (!shippingAddr) {
        errors.shippingAddress = "Shipping address is required.";
    }
    else if (typeof shippingAddr === "object") {
        if (!isValidString(shippingAddr.fullAddress) && !isValidString(shippingAddr.addressLine1)) {
            errors.shippingAddress = "Shipping address cannot be empty.";
        }
    }
    else if (!isValidString(shippingAddr)) {
        errors.shippingAddress = "Shipping address must be a valid string.";
    }
    // Order Status
    if (data.orderStatus !== undefined || data.status !== undefined) {
        const rawStatus = data.orderStatus || data.status;
        const match = exports.ORDER_STATUSES.find((s) => s.toLowerCase() === String(rawStatus).trim().toLowerCase());
        if (!match) {
            errors.orderStatus = `Order status must be one of: ${exports.ORDER_STATUSES.join(", ")}.`;
        }
    }
    // Payment Status
    if (data.paymentStatus !== undefined || data.payment !== undefined) {
        const rawPay = data.paymentStatus || data.payment;
        const match = exports.PAYMENT_STATUSES.find((p) => p.toLowerCase() === String(rawPay).trim().toLowerCase());
        if (!match) {
            errors.paymentStatus = `Payment status must be one of: ${exports.PAYMENT_STATUSES.join(", ")}.`;
        }
    }
    // Pricing numbers
    ["subtotal", "tax", "shippingFee", "discount", "totalAmount"].forEach((field) => {
        if (data[field] !== undefined && data[field] !== "" && !isNonNegativeNumber(data[field])) {
            errors[field] = `${field} must be a non-negative number.`;
        }
    });
    return errors;
};
exports.validateCreateOrder = validateCreateOrder;
// =====================================================
// UPDATE STATUS VALIDATION
// =====================================================
const validateUpdateOrderStatus = (data = {}) => {
    const errors = {};
    const status = data.status || data.orderStatus;
    if (!status) {
        errors.status = "Status is required.";
    }
    else {
        const match = exports.ORDER_STATUSES.find((s) => s.toLowerCase() === String(status).trim().toLowerCase());
        if (!match) {
            errors.status = `Status must be one of: ${exports.ORDER_STATUSES.join(", ")}.`;
        }
    }
    return errors;
};
exports.validateUpdateOrderStatus = validateUpdateOrderStatus;
// =====================================================
// UPDATE PAYMENT VALIDATION
// =====================================================
const validateUpdatePaymentStatus = (data = {}) => {
    const errors = {};
    const payment = data.paymentStatus || data.payment;
    if (!payment) {
        errors.paymentStatus = "Payment status is required.";
    }
    else {
        const match = exports.PAYMENT_STATUSES.find((p) => p.toLowerCase() === String(payment).trim().toLowerCase());
        if (!match) {
            errors.paymentStatus = `Payment status must be one of: ${exports.PAYMENT_STATUSES.join(", ")}.`;
        }
    }
    return errors;
};
exports.validateUpdatePaymentStatus = validateUpdatePaymentStatus;
// =====================================================
// BULK ORDER STATUS VALIDATION
// =====================================================
const validateBulkOrderStatus = (data = {}) => {
    const errors = {};
    if (!Array.isArray(data.ids) || data.ids.length === 0) {
        errors.ids = "A non-empty array of order IDs or order numbers is required.";
    }
    else {
        data.ids.forEach((id, index) => {
            if (!id || (typeof id !== "string" && typeof id !== "number") || !String(id).trim()) {
                errors[`ids.${index}`] = `Invalid order ID or number at index ${index}.`;
            }
        });
    }
    const status = data.status || data.orderStatus;
    if (!status) {
        errors.status = "Status is required.";
    }
    else {
        const match = exports.ORDER_STATUSES.find((s) => s.toLowerCase() === String(status).trim().toLowerCase());
        if (!match) {
            errors.status = `Status must be one of: ${exports.ORDER_STATUSES.join(", ")}.`;
        }
    }
    return errors;
};
exports.validateBulkOrderStatus = validateBulkOrderStatus;
//# sourceMappingURL=order.validation.js.map