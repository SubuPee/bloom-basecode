export declare const ORDER_STATUSES: readonly ["Processing", "Shipped", "Delivered", "Returned", "Cancelled"];
export declare const PAYMENT_STATUSES: readonly ["Paid", "Pending", "Refunded", "Failed"];
export declare const validateCreateOrder: (data?: any) => Record<string, string>;
export declare const validateUpdateOrderStatus: (data?: any) => Record<string, string>;
export declare const validateUpdatePaymentStatus: (data?: any) => Record<string, string>;
export declare const validateBulkOrderStatus: (data?: any) => Record<string, string>;
