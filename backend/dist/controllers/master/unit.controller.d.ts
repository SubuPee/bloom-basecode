import { Request, Response } from "express";
export declare const createUnit: (req: Request, res: Response) => Promise<Response>;
export declare const getUnits: (req: Request, res: Response) => Promise<Response>;
export declare const getUnitById: (req: Request, res: Response) => Promise<Response>;
export declare const updateUnit: (req: Request, res: Response) => Promise<Response>;
export declare const updateUnitStatus: (req: Request, res: Response) => Promise<Response>;
export declare const deleteUnit: (req: Request, res: Response) => Promise<Response>;
declare const _default: {
    createUnit: typeof createUnit;
    getUnits: typeof getUnits;
    getUnitById: typeof getUnitById;
    updateUnit: typeof updateUnit;
    updateUnitStatus: typeof updateUnitStatus;
    deleteUnit: typeof deleteUnit;
};
export default _default;
