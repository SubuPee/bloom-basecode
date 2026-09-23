import { Request, Response, NextFunction } from "express";
export declare const protect: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>;
declare const _default: {
    protect: typeof protect;
};
export default _default;
