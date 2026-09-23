import { Request, Response } from "express";
export declare const createCategory: (req: Request, res: Response) => Promise<Response>;
export declare const getCategories: (req: Request, res: Response) => Promise<Response>;
export declare const getCategoryById: (req: Request, res: Response) => Promise<Response>;
export declare const updateCategory: (req: Request, res: Response) => Promise<Response>;
export declare const updateCategoryStatus: (req: Request, res: Response) => Promise<Response>;
export declare const deleteCategory: (req: Request, res: Response) => Promise<Response>;
declare const _default: {
    createCategory: typeof createCategory;
    getCategories: typeof getCategories;
    getCategoryById: typeof getCategoryById;
    updateCategory: typeof updateCategory;
    updateCategoryStatus: typeof updateCategoryStatus;
    deleteCategory: typeof deleteCategory;
};
export default _default;
