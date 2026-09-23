export declare const TAX_TYPES: string[];
export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}
export declare const validateCreateTax: (data?: any) => ValidationResult;
export declare const validateUpdateTax: (data?: any) => ValidationResult;
export declare const validateObjectId: (id: any) => boolean;
declare const _default: {
    validateCreateTax: typeof validateCreateTax;
    validateUpdateTax: typeof validateUpdateTax;
    validateObjectId: typeof validateObjectId;
    TAX_TYPES: string[];
};
export default _default;
