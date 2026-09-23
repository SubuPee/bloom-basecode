export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}
export declare const validateCreateBrand: (data?: any) => ValidationResult;
export declare const validateUpdateBrand: (data?: any) => ValidationResult;
export declare const validateObjectId: (id: any) => boolean;
declare const _default: {
    validateCreateBrand: typeof validateCreateBrand;
    validateUpdateBrand: typeof validateUpdateBrand;
    validateObjectId: typeof validateObjectId;
};
export default _default;
