import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// =====================================================
// REQUEST ID & CORRELATION MIDDLEWARE (Observability)
// =====================================================

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const correlationId = (req.headers["x-request-id"] as string) || crypto.randomUUID();
  req.id = correlationId;
  res.setHeader("X-Request-ID", correlationId);
  next();
};

export default requestIdMiddleware;
