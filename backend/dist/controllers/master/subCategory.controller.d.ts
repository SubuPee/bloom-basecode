import { Request, Response } from "express";
export declare const createSubCategory: (req: Request, res: Response) => Promise<Response>;
export declare const getSubCategories: (req: Request, res: Response) => Promise<Response>;
export declare const getSubCategoryById: (req: Request, res: Response) => Promise<Response>;
export declare const updateSubCategory: (req: Request, res: Response) => Promise<Response>;
export declare const updateSubCategoryStatus: (req: Request, res: Response) => Promise<Response>;
export declare const deleteSubCategory: (req: Request, res: Response) => Promise<Response>;
declare const _default: {
    createSubCategory: typeof createSubCategory;
    getSubCategories: typeof getSubCategories;
    getSubCategoryById: typeof getSubCategoryById;
    updateSubCategory: typeof updateSubCategory;
    updateSubCategoryStatus: typeof updateSubCategoryStatus;
    deleteSubCategory: typeof deleteSubCategory;
};
export default _default;
