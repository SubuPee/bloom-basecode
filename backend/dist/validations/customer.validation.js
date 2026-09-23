"use strict";
// =====================================================
// CUSTOMER VALIDATIONS
// =====================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateCustomer = exports.validateCreateCustomer = void 0;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SEGMENTS = ["VIP", "Returning", "New", "At risk"];
const ALLOWED_STATUSES = ["Active", "Inactive"];
const validateCreateCustomer = (data = {}) => {
    const errors = {};
    if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
        errors.name = "Customer name is required";
    }
    if (!data.email || typeof data.email !== "string" || !data.email.trim()) {
        errors.email = "Email address is required";
    }
    else if (!EMAIL_REGEX.test(data.email.trim())) {
        errors.email = "Please enter a valid email address";
    }
    if (data.phone && typeof data.phone === "string" && data.phone.trim().length > 30) {
        errors.phone = "Phone number is too long";
    }
    if (data.segment && !ALLOWED_SEGMENTS.includes(data.segment)) {
        errors.segment = `Segment must be one of: ${ALLOWED_SEGMENTS.join(", ")}`;
    }
    if (data.status && !ALLOWED_STATUSES.includes(data.status)) {
        errors.status = `Status must be one of: ${ALLOWED_STATUSES.join(", ")}`;
    }
    if (data.ordersCount !== undefined) {
        const orders = Number(data.ordersCount);
        if (isNaN(orders) || orders < 0) {
            errors.ordersCount = "Orders count must be a non-negative number";
        }
    }
    if (data.totalSpent !== undefined) {
        const spent = Number(data.totalSpent);
        if (isNaN(spent) || spent < 0) {
            errors.totalSpent = "Total spent must be a non-negative number";
        }
    }
    return errors;
};
exports.validateCreateCustomer = validateCreateCustomer;
const validateUpdateCustomer = (data = {}) => {
    const errors = {};
    if (data.name !== undefined) {
        if (typeof data.name !== "string" || !data.name.trim()) {
            errors.name = "Customer name cannot be empty";
        }
    }
    if (data.email !== undefined) {
        if (typeof data.email !== "string" || !data.email.trim()) {
            errors.email = "Email address cannot be empty";
        }
        else if (!EMAIL_REGEX.test(data.email.trim())) {
            errors.email = "Please enter a valid email address";
        }
    }
    if (data.segment !== undefined && !ALLOWED_SEGMENTS.includes(data.segment)) {
        errors.segment = `Segment must be one of: ${ALLOWED_SEGMENTS.join(", ")}`;
    }
    if (data.status !== undefined && !ALLOWED_STATUSES.includes(data.status)) {
        errors.status = `Status must be one of: ${ALLOWED_STATUSES.join(", ")}`;
    }
    if (data.ordersCount !== undefined) {
        const orders = Number(data.ordersCount);
        if (isNaN(orders) || orders < 0) {
            errors.ordersCount = "Orders count must be a non-negative number";
        }
    }
    if (data.totalSpent !== undefined) {
        const spent = Number(data.totalSpent);
        if (isNaN(spent) || spent < 0) {
            errors.totalSpent = "Total spent must be a non-negative number";
        }
    }
    return errors;
};
exports.validateUpdateCustomer = validateUpdateCustomer;
//# sourceMappingURL=customer.validation.js.map