import { Request, Response, NextFunction } from "express";
export declare const uploadDir: string;
export declare const handleVendorDocUpload: (req: Request, res: Response, next: NextFunction) => void;
declare const _default: {
    handleVendorDocUpload: typeof handleVendorDocUpload;
    uploadDir: string;
};
export default _default;
