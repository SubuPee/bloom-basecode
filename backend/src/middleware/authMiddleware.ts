import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { verifyToken } from "../utils/jwt";
import { HTTP_STATUS } from "../constants/httpStatusCodes";
import logger from "../utils/logger";

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    let token: string | undefined;

    // ---------------------------------------
    // Get token from Authorization header
    // ---------------------------------------
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ---------------------------------------
    // Token missing
    // ---------------------------------------
    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ---------------------------------------
    // Verify JWT token
    // ---------------------------------------
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // ---------------------------------------
    // Find user and populate role + permissions
    // Note: Do NOT select +password to avoid leaking hash
    // ---------------------------------------
    const user = await User.findById(decoded.userId).populate({
      path: "role",
      populate: {
        path: "permissions",
      },
    });

    // ---------------------------------------
    // User not found
    // ---------------------------------------
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "User not found",
      });
    }

    // ---------------------------------------
    // Check account status
    // ---------------------------------------
    if (user.status !== "active") {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Your account is not active",
      });
    }

    // ---------------------------------------
    // Attach authenticated user to request
    // ---------------------------------------
    req.user = user as any;

    // ---------------------------------------
    // Continue to controller
    // ---------------------------------------
    next();
  } catch (error: any) {
    logger.error("AUTH ERROR: " + (error?.message || error));

    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default {
  protect,
};