import { Request, Response, NextFunction } from "express";
export declare const errorMiddleware: (err: any, req: Request, res: Response, _next: NextFunction) => Response;
export default errorMiddleware;
