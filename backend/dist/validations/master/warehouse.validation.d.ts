export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}
export declare const validateCreateWarehouse: (data?: any) => ValidationResult;
export declare const validateUpdateWarehouse: (data?: any) => ValidationResult;
export declare const validateObjectId: (id: any) => boolean;
declare const _default: {
    validateCreateWarehouse: typeof validateCreateWarehouse;
    validateUpdateWarehouse: typeof validateUpdateWarehouse;
    validateObjectId: typeof validateObjectId;
};
export default _default;
