import { Request, Response } from "express";
export declare const createAttribute: (req: Request, res: Response) => Promise<Response>;
export declare const getAttributes: (req: Request, res: Response) => Promise<Response>;
export declare const getAttributeById: (req: Request, res: Response) => Promise<Response>;
export declare const updateAttribute: (req: Request, res: Response) => Promise<Response>;
export declare const updateAttributeStatus: (req: Request, res: Response) => Promise<Response>;
export declare const deleteAttribute: (req: Request, res: Response) => Promise<Response>;
declare const _default: {
    createAttribute: typeof createAttribute;
    getAttributes: typeof getAttributes;
    getAttributeById: typeof getAttributeById;
    updateAttribute: typeof updateAttribute;
    updateAttributeStatus: typeof updateAttributeStatus;
    deleteAttribute: typeof deleteAttribute;
};
export default _default;
