import { Request, Response } from "express";
export declare const getCmsStatsHandler: (req: Request, res: Response) => Promise<void>;
export declare const getCmsEntriesHandler: (req: Request, res: Response) => Promise<void>;
export declare const getStorefrontHeroHandler: (req: Request, res: Response) => Promise<void>;
export declare const getCmsEntryByIdHandler: (req: Request, res: Response) => Promise<void>;
export declare const createCmsEntryHandler: (req: Request, res: Response) => Promise<void>;
export declare const updateCmsEntryHandler: (req: Request, res: Response) => Promise<void>;
export declare const deleteCmsEntryHandler: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    getCmsStatsHandler: typeof getCmsStatsHandler;
    getCmsEntriesHandler: typeof getCmsEntriesHandler;
    getStorefrontHeroHandler: typeof getStorefrontHeroHandler;
    getCmsEntryByIdHandler: typeof getCmsEntryByIdHandler;
    createCmsEntryHandler: typeof createCmsEntryHandler;
    updateCmsEntryHandler: typeof updateCmsEntryHandler;
    deleteCmsEntryHandler: typeof deleteCmsEntryHandler;
};
export default _default;
