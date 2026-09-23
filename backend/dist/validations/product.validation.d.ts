declare const PRODUCT_STATUSES: string[];
declare const validateCreateProduct: (data?: any) => Record<string, string>;
declare const validateUpdateProduct: (data?: any) => Record<string, string>;
declare const validateObjectId: (id: any, fieldName?: string) => Record<string, string>;
declare const validateBulkStatus: (data?: any) => Record<string, string>;
declare const validateBulkPublish: (data?: any) => Record<string, string>;
declare const validateBulkDelete: (data?: any) => Record<string, string>;
export { PRODUCT_STATUSES, validateCreateProduct, validateUpdateProduct, validateObjectId, validateBulkStatus, validateBulkPublish, validateBulkDelete, };
declare const _default: {
    PRODUCT_STATUSES: string[];
    validateCreateProduct: typeof validateCreateProduct;
    validateUpdateProduct: typeof validateUpdateProduct;
    validateObjectId: typeof validateObjectId;
    validateBulkStatus: typeof validateBulkStatus;
    validateBulkPublish: typeof validateBulkPublish;
    validateBulkDelete: typeof validateBulkDelete;
};
export default _default;
