export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}
export declare const validateCreateAttribute: (data?: any) => ValidationResult;
export declare const validateUpdateAttribute: (data?: any) => ValidationResult;
export declare const validateObjectId: (id: any) => boolean;
declare const _default: {
    validateCreateAttribute: typeof validateCreateAttribute;
    validateUpdateAttribute: typeof validateUpdateAttribute;
    validateObjectId: typeof validateObjectId;
};
export default _default;
