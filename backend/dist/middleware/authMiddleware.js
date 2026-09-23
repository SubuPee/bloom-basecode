"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const httpStatusCodes_1 = require("../constants/httpStatusCodes");
const logger_1 = __importDefault(require("../utils/logger"));
const protect = async (req, res, next) => {
    try {
        let token;
        // ---------------------------------------
        // Get token from Authorization header
        // ---------------------------------------
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }
        // ---------------------------------------
        // Token missing
        // ---------------------------------------
        if (!token) {
            return res.status(httpStatusCodes_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: "Authentication required",
            });
        }
        // ---------------------------------------
        // Verify JWT token
        // ---------------------------------------
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded || !decoded.userId) {
            return res.status(httpStatusCodes_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: "Invalid or expired token",
            });
        }
        // ---------------------------------------
        // Find user and populate role + permissions
        // Note: Do NOT select +password to avoid leaking hash
        // ---------------------------------------
        const user = await User_1.default.findById(decoded.userId).populate({
            path: "role",
            populate: {
                path: "permissions",
            },
        });
        // ---------------------------------------
        // User not found
        // ---------------------------------------
        if (!user) {
            return res.status(httpStatusCodes_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: "User not found",
            });
        }
        // ---------------------------------------
        // Check account status
        // ---------------------------------------
        if (user.status !== "active") {
            return res.status(httpStatusCodes_1.HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: "Your account is not active",
            });
        }
        // ---------------------------------------
        // Attach authenticated user to request
        // ---------------------------------------
        req.user = user;
        // ---------------------------------------
        // Continue to controller
        // ---------------------------------------
        next();
    }
    catch (error) {
        logger_1.default.error("AUTH ERROR: " + (error?.message || error));
        return res.status(httpStatusCodes_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
exports.protect = protect;
exports.default = {
    protect: exports.protect,
};
//# sourceMappingURL=authMiddleware.js.map