"use strict";
// =====================================================
// STOREFRONT VALIDATIONS
// =====================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePublishToggle = exports.validateUpdateStorefrontConfig = void 0;
const validateUpdateStorefrontConfig = (data = {}) => {
    const errors = {};
    if (data.storeName !== undefined) {
        if (typeof data.storeName !== "string" || !data.storeName.trim()) {
            errors.storeName = "Store name cannot be empty";
        }
    }
    if (data.storeDomain !== undefined) {
        if (typeof data.storeDomain !== "string" || !data.storeDomain.trim()) {
            errors.storeDomain = "Store domain cannot be empty";
        }
    }
    if (data.highlights !== undefined) {
        if (!Array.isArray(data.highlights)) {
            errors.highlights = "Highlights must be an array";
        }
        else {
            for (let i = 0; i < data.highlights.length; i++) {
                const h = data.highlights[i];
                if (!h.title || typeof h.title !== "string" || !h.title.trim()) {
                    errors[`highlights.${i}.title`] = "Highlight title is required";
                }
                if (!h.text || typeof h.text !== "string" || !h.text.trim()) {
                    errors[`highlights.${i}.text`] = "Highlight text is required";
                }
            }
        }
    }
    return errors;
};
exports.validateUpdateStorefrontConfig = validateUpdateStorefrontConfig;
const validatePublishToggle = (data = {}) => {
    const errors = {};
    if (data.isPublished === undefined || typeof data.isPublished !== "boolean") {
        errors.isPublished = "Field 'isPublished' is required and must be a boolean";
    }
    return errors;
};
exports.validatePublishToggle = validatePublishToggle;
//# sourceMappingURL=storefront.validation.js.map