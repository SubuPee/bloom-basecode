import { Request, Response } from "express";
import { HTTP_STATUS } from "../constants/httpStatusCodes";

// =====================================================
// NOT FOUND (404) ROUTE HANDLER
// =====================================================

export const notFoundMiddleware = (req: Request, res: Response): Response => {
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    requestId: req.id,
  });
};

export default notFoundMiddleware;
