export declare const sanitizeLogData: (data: any) => any;
export declare const formatLog: (level: string, message: string, meta?: Record<string, any>) => string;
export interface Logger {
    info: (message: string, meta?: Record<string, any>) => void;
    warn: (message: string, meta?: Record<string, any>) => void;
    error: (message: string, meta?: Record<string, any>) => void;
    debug: (message: string, meta?: Record<string, any>) => void;
}
export declare const logger: Logger;
export default logger;
