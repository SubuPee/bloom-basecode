"use strict";
// =====================================================
// SETTINGS MODULE VALIDATIONS
// =====================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRole = exports.validateUpdateUser = exports.validateCreateUser = exports.validatePreferences = exports.validateChangePassword = exports.validateUpdateProfile = void 0;
const validateUpdateProfile = (data = {}) => {
    const errors = {};
    if (!data.firstName || typeof data.firstName !== "string" || !data.firstName.trim()) {
        errors.firstName = "First name is required";
    }
    if (!data.lastName || typeof data.lastName !== "string" || !data.lastName.trim()) {
        errors.lastName = "Last name is required";
    }
    if (data.email && (!/\S+@\S+\.\S+/.test(data.email))) {
        errors.email = "Please provide a valid email address";
    }
    if (data.recoveryEmail && (!/\S+@\S+\.\S+/.test(data.recoveryEmail))) {
        errors.recoveryEmail = "Please provide a valid recovery email address";
    }
    return errors;
};
exports.validateUpdateProfile = validateUpdateProfile;
const validateChangePassword = (data = {}) => {
    const errors = {};
    if (!data.currentPassword) {
        errors.currentPassword = "Current password is required";
    }
    if (!data.newPassword || typeof data.newPassword !== "string" || data.newPassword.length < 6) {
        errors.newPassword = "New password must be at least 6 characters long";
    }
    if (data.currentPassword && data.newPassword && data.currentPassword === data.newPassword) {
        errors.newPassword = "New password cannot be the same as current password";
    }
    return errors;
};
exports.validateChangePassword = validateChangePassword;
const validatePreferences = (data = {}) => {
    const errors = {};
    if (data.storeDetails) {
        if (data.storeDetails.supportEmail && !/\S+@\S+\.\S+/.test(data.storeDetails.supportEmail)) {
            errors.supportEmail = "Invalid support email address";
        }
    }
    return errors;
};
exports.validatePreferences = validatePreferences;
const validateCreateUser = (data = {}) => {
    const errors = {};
    if (!data.firstName || typeof data.firstName !== "string" || !data.firstName.trim()) {
        errors.firstName = "First name is required";
    }
    if (!data.lastName || typeof data.lastName !== "string" || !data.lastName.trim()) {
        errors.lastName = "Last name is required";
    }
    if (!data.email || typeof data.email !== "string" || !/\S+@\S+\.\S+/.test(data.email)) {
        errors.email = "Valid email is required";
    }
    if (!data.role) {
        errors.role = "Role is required";
    }
    return errors;
};
exports.validateCreateUser = validateCreateUser;
const validateUpdateUser = (data = {}) => {
    const errors = {};
    if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
        errors.email = "Valid email is required";
    }
    if (data.status && !["active", "inactive", "suspended"].includes(data.status.toLowerCase())) {
        errors.status = "Status must be active, inactive, or suspended";
    }
    return errors;
};
exports.validateUpdateUser = validateUpdateUser;
const validateRole = (data = {}) => {
    const errors = {};
    if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
        errors.name = "Role name is required";
    }
    return errors;
};
exports.validateRole = validateRole;
//# sourceMappingURL=settings.validation.js.map