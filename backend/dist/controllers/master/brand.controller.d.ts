import { Request, Response } from "express";
export declare const createBrand: (req: Request, res: Response) => Promise<Response>;
export declare const getBrands: (req: Request, res: Response) => Promise<Response>;
export declare const getBrandById: (req: Request, res: Response) => Promise<Response>;
export declare const updateBrand: (req: Request, res: Response) => Promise<Response>;
export declare const updateBrandStatus: (req: Request, res: Response) => Promise<Response>;
export declare const deleteBrand: (req: Request, res: Response) => Promise<Response>;
declare const _default: {
    createBrand: typeof createBrand;
    getBrands: typeof getBrands;
    getBrandById: typeof getBrandById;
    updateBrand: typeof updateBrand;
    updateBrandStatus: typeof updateBrandStatus;
    deleteBrand: typeof deleteBrand;
};
export default _default;
