import { Request, Response, NextFunction, RequestHandler } from "express";
export type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any> | any;
export declare const asyncHandler: (fn: AsyncRequestHandler) => RequestHandler;
export default asyncHandler;
