import { Request, Response, NextFunction, RequestHandler } from "express";

// =====================================================
// ASYNC HANDLER UTILITY (Eliminates controller try/catch boilerplate)
// =====================================================

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any> | any;

export const asyncHandler =
  (fn: AsyncRequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
