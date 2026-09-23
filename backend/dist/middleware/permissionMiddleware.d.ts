import { Request, Response, NextFunction } from "express";
export declare const authorize: (...requiredPermissions: string[]) => (req: Request, res: Response, next: NextFunction) => void | Response;
export default authorize;
