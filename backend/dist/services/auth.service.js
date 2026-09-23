"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.loginAdmin = void 0;
const User_1 = __importDefault(require("../models/User"));
const AppError_1 = require("../errors/AppError");
const jwt_1 = require("../utils/jwt");
// =====================================================
// AUTHENTICATION SERVICE (Single Responsibility - Business Logic)
// =====================================================
const loginAdmin = async ({ email, password }) => {
    const user = await User_1.default.findOne({ email })
        .select("+password")
        .populate({
        path: "role",
        populate: {
            path: "permissions",
        },
    });
    if (!user) {
        throw new AppError_1.UnauthorizedError("Invalid email or password");
    }
    const role = user.role;
    if (!role) {
        throw new AppError_1.ForbiddenError("User role is not configured");
    }
    if (user.status !== "active") {
        throw new AppError_1.ForbiddenError("Your account is not active");
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new AppError_1.UnauthorizedError("Invalid email or password");
    }
    // Update last login timestamp asynchronously
    await User_1.default.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    // Generate JWT Bearer Token
    const token = (0, jwt_1.generateToken)(user._id.toString());
    const permissions = role.permissions?.map((permission) => typeof permission === "string" ? permission : permission?.name) || [];
    return {
        token,
        user: {
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: role.name,
            permissions,
        },
    };
};
exports.loginAdmin = loginAdmin;
const getCurrentUser = async (user) => {
    if (!user) {
        throw new AppError_1.UnauthorizedError("User profile not found");
    }
    const role = user.role;
    const permissions = role?.permissions?.map((permission) => typeof permission === "string" ? permission : permission?.name) || [];
    return {
        id: (user._id || user.id).toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: role?.name,
        permissions,
    };
};
exports.getCurrentUser = getCurrentUser;
exports.default = {
    loginAdmin: exports.loginAdmin,
    getCurrentUser: exports.getCurrentUser,
};
//# sourceMappingURL=auth.service.js.map