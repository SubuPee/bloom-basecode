"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const httpStatusCodes_1 = require("../constants/httpStatusCodes");
const authorize = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(httpStatusCodes_1.HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: "Access denied",
            });
        }
        // Super Admin gets full access
        if (req.user.role.name === "Super Admin") {
            return next();
        }
        const rolePermissions = Array.isArray(req.user.role.permissions)
            ? req.user.role.permissions
            : [];
        const userPermissions = rolePermissions.map((permission) => typeof permission === "string" ? permission : permission?.name);
        const hasPermission = requiredPermissions.every((permission) => userPermissions.includes(permission));
        if (!hasPermission) {
            return res.status(httpStatusCodes_1.HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: "You do not have permission to perform this action",
            });
        }
        next();
    };
};
exports.authorize = authorize;
exports.default = exports.authorize;
//# sourceMappingURL=permissionMiddleware.js.map