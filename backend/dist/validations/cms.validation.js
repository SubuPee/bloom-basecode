"use strict";
// =====================================================
// CMS VALIDATIONS
// =====================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateCms = exports.validateCreateCms = void 0;
const ALLOWED_TYPES = [
    "Homepage banner",
    "Editorial page",
    "Policy page",
    "Campaign",
    "Content page",
];
const ALLOWED_STATUSES = ["Published", "Draft", "Archived"];
const validateCreateCms = (data = {}) => {
    const errors = {};
    if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
        errors.title = "Content title is required";
    }
    if (data.type && !ALLOWED_TYPES.includes(data.type)) {
        errors.type = `Content type must be one of: ${ALLOWED_TYPES.join(", ")}`;
    }
    if (data.status && !ALLOWED_STATUSES.includes(data.status)) {
        errors.status = `Status must be one of: ${ALLOWED_STATUSES.join(", ")}`;
    }
    if (data.slug && typeof data.slug === "string") {
        if (!/^[a-z0-9-]+$/.test(data.slug.trim().toLowerCase())) {
            errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
        }
    }
    return errors;
};
exports.validateCreateCms = validateCreateCms;
const validateUpdateCms = (data = {}) => {
    const errors = {};
    if (data.title !== undefined) {
        if (typeof data.title !== "string" || !data.title.trim()) {
            errors.title = "Content title cannot be empty";
        }
    }
    if (data.type !== undefined && !ALLOWED_TYPES.includes(data.type)) {
        errors.type = `Content type must be one of: ${ALLOWED_TYPES.join(", ")}`;
    }
    if (data.status !== undefined && !ALLOWED_STATUSES.includes(data.status)) {
        errors.status = `Status must be one of: ${ALLOWED_STATUSES.join(", ")}`;
    }
    if (data.slug !== undefined && typeof data.slug === "string") {
        if (!/^[a-z0-9-]+$/.test(data.slug.trim().toLowerCase())) {
            errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
        }
    }
    return errors;
};
exports.validateUpdateCms = validateUpdateCms;
//# sourceMappingURL=cms.validation.js.map