"use strict";
// =====================================================
// VENDOR VALIDATIONS
// =====================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProcessPayment = exports.validateDocVerify = exports.validateKycUpdate = exports.validateStatusUpdate = exports.validateUpdateVendor = exports.validateCreateVendor = void 0;
const validateCreateVendor = (data = {}) => {
    const errors = {};
    if (!data.businessName || !data.businessName.trim()) {
        errors.businessName = "Business name is required";
    }
    if (!data.ownerName || !data.ownerName.trim()) {
        errors.ownerName = "Owner / Contact person name is required";
    }
    if (!data.email || !data.email.trim()) {
        errors.email = "Email address is required";
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        errors.email = "Please enter a valid email address";
    }
    if (!data.phone || !data.phone.trim()) {
        errors.phone = "Phone number is required";
    }
    if (!data.address || !data.address.trim()) {
        errors.address = "Registered address is required";
    }
    if (!data.city || !data.city.trim()) {
        errors.city = "City is required";
    }
    if (!data.state || !data.state.trim()) {
        errors.state = "State is required";
    }
    if (!data.pincode || !data.pincode.trim()) {
        errors.pincode = "Postal code / PIN code is required";
    }
    if (data.commissionRate !== undefined) {
        const rate = Number(data.commissionRate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            errors.commissionRate = "Commission rate must be a percentage between 0 and 100";
        }
    }
    return errors;
};
exports.validateCreateVendor = validateCreateVendor;
const validateUpdateVendor = (data = {}) => {
    const errors = {};
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        errors.email = "Please enter a valid email address";
    }
    if (data.commissionRate !== undefined) {
        const rate = Number(data.commissionRate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            errors.commissionRate = "Commission rate must be a percentage between 0 and 100";
        }
    }
    return errors;
};
exports.validateUpdateVendor = validateUpdateVendor;
const validateStatusUpdate = (data = {}) => {
    const errors = {};
    const validStatuses = ["Pending", "Under Review", "Approved", "Rejected", "Suspended", "Inactive"];
    if (!data.status) {
        errors.status = "Status is required";
    }
    else if (!validStatuses.includes(data.status)) {
        errors.status = `Status must be one of: ${validStatuses.join(", ")}`;
    }
    if ((data.status === "Rejected" || data.status === "Suspended") && (!data.reason || !data.reason.trim())) {
        errors.reason = `Reason is mandatory when setting status to ${data.status}`;
    }
    return errors;
};
exports.validateStatusUpdate = validateStatusUpdate;
const validateKycUpdate = (data = {}) => {
    const errors = {};
    const validKyc = ["Pending", "Verified", "Rejected", "In Review"];
    if (!data.kycStatus) {
        errors.kycStatus = "KYC status is required";
    }
    else if (!validKyc.includes(data.kycStatus)) {
        errors.kycStatus = `KYC status must be one of: ${validKyc.join(", ")}`;
    }
    return errors;
};
exports.validateKycUpdate = validateKycUpdate;
const validateDocVerify = (data = {}) => {
    const errors = {};
    const validStatuses = ["Pending", "Verified", "Rejected", "Expired"];
    if (!data.status) {
        errors.status = "Document verification status is required";
    }
    else if (!validStatuses.includes(data.status)) {
        errors.status = `Status must be one of: ${validStatuses.join(", ")}`;
    }
    return errors;
};
exports.validateDocVerify = validateDocVerify;
const validateProcessPayment = (data = {}) => {
    const errors = {};
    if (!data.referenceId || !data.referenceId.trim()) {
        errors.referenceId = "Payment Reference / UTR Number is required";
    }
    return errors;
};
exports.validateProcessPayment = validateProcessPayment;
exports.default = {
    validateCreateVendor: exports.validateCreateVendor,
    validateUpdateVendor: exports.validateUpdateVendor,
    validateStatusUpdate: exports.validateStatusUpdate,
    validateKycUpdate: exports.validateKycUpdate,
    validateDocVerify: exports.validateDocVerify,
    validateProcessPayment: exports.validateProcessPayment,
};
//# sourceMappingURL=vendor.validation.js.map