export declare const UNIT_TYPES: string[];
export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}
export declare const validateCreateUnit: (data?: any) => ValidationResult;
export declare const validateUpdateUnit: (data?: any) => ValidationResult;
export declare const validateObjectId: (id: any) => boolean;
declare const _default: {
    validateCreateUnit: typeof validateCreateUnit;
    validateUpdateUnit: typeof validateUpdateUnit;
    validateObjectId: typeof validateObjectId;
    UNIT_TYPES: string[];
};
export default _default;
