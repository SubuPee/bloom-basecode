import { Request, Response } from "express";
export declare const createTax: (req: Request, res: Response) => Promise<Response>;
export declare const getTaxes: (req: Request, res: Response) => Promise<Response>;
export declare const getTaxById: (req: Request, res: Response) => Promise<Response>;
export declare const updateTax: (req: Request, res: Response) => Promise<Response>;
export declare const updateTaxStatus: (req: Request, res: Response) => Promise<Response>;
export declare const deleteTax: (req: Request, res: Response) => Promise<Response>;
declare const _default: {
    createTax: typeof createTax;
    getTaxes: typeof getTaxes;
    getTaxById: typeof getTaxById;
    updateTax: typeof updateTax;
    updateTaxStatus: typeof updateTaxStatus;
    deleteTax: typeof deleteTax;
};
export default _default;
