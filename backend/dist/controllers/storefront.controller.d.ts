import { Request, Response } from "express";
export declare const getStorefrontPreviewHandler: (req: Request, res: Response) => Promise<void>;
export declare const getStorefrontHeroHandler: (req: Request, res: Response) => Promise<void>;
export declare const getStorefrontProductsHandler: (req: Request, res: Response) => Promise<void>;
export declare const getStorefrontHighlightsHandler: (req: Request, res: Response) => Promise<void>;
export declare const getStorefrontConfigHandler: (req: Request, res: Response) => Promise<void>;
export declare const updateStorefrontConfigHandler: (req: Request, res: Response) => Promise<void>;
export declare const toggleProductPublishHandler: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    getStorefrontPreviewHandler: typeof getStorefrontPreviewHandler;
    getStorefrontHeroHandler: typeof getStorefrontHeroHandler;
    getStorefrontProductsHandler: typeof getStorefrontProductsHandler;
    getStorefrontHighlightsHandler: typeof getStorefrontHighlightsHandler;
    getStorefrontConfigHandler: typeof getStorefrontConfigHandler;
    updateStorefrontConfigHandler: typeof updateStorefrontConfigHandler;
    toggleProductPublishHandler: typeof toggleProductPublishHandler;
};
export default _default;
