import { Request, Response } from "express";
export declare const createWarehouse: (req: Request, res: Response) => Promise<Response>;
export declare const getWarehouses: (req: Request, res: Response) => Promise<Response>;
export declare const getWarehouseById: (req: Request, res: Response) => Promise<Response>;
export declare const updateWarehouse: (req: Request, res: Response) => Promise<Response>;
export declare const updateWarehouseStatus: (req: Request, res: Response) => Promise<Response>;
export declare const deleteWarehouse: (req: Request, res: Response) => Promise<Response>;
declare const _default: {
    createWarehouse: typeof createWarehouse;
    getWarehouses: typeof getWarehouses;
    getWarehouseById: typeof getWarehouseById;
    updateWarehouse: typeof updateWarehouse;
    updateWarehouseStatus: typeof updateWarehouseStatus;
    deleteWarehouse: typeof deleteWarehouse;
};
export default _default;
