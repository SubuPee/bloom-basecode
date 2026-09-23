import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../constants/httpStatusCodes";

export const authorize = (...requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.user || !req.user.role) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
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

    const userPermissions = rolePermissions.map((permission: any) =>
      typeof permission === "string" ? permission : permission?.name
    );

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

export default authorize;