import { Response } from "express";
import { HttpStatusCode } from "../constants/httpStatusCodes";
import { PaginationMeta } from "../types/common.types";
export declare const sendSuccess: <T = any>(res: Response, data?: T | null, message?: string, statusCode?: HttpStatusCode) => Response;
export declare const sendCreated: <T = any>(res: Response, data?: T | null, message?: string) => Response;
export declare const sendPaginated: <T = any>(res: Response, items?: T[], pagination?: Partial<PaginationMeta>, message?: string) => Response;
export declare const sendError: (res: Response, message?: string, statusCode?: HttpStatusCode, errors?: Record<string, string> | null) => Response;
