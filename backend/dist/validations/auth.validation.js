"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLoginInput = void 0;
const AppError_1 = require("../errors/AppError");
const validateLoginInput = (data) => {
    const errors = {};
    if (!data?.email || !String(data.email).trim()) {
        errors.email = "Email is required";
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email).trim())) {
        errors.email = "Please provide a valid email address";
    }
    if (!data?.password || !String(data.password).trim()) {
        errors.password = "Password is required";
    }
    if (Object.keys(errors).length > 0) {
        throw new AppError_1.ValidationError("Validation failed", errors);
    }
    return {
        email: String(data.email).toLowerCase().trim(),
        password: String(data.password),
    };
};
exports.validateLoginInput = validateLoginInput;
exports.default = {
    validateLoginInput: exports.validateLoginInput,
};
//# sourceMappingURL=auth.validation.js.map