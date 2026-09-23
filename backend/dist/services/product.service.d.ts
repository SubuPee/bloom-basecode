import mongoose from "mongoose";
import { IProduct } from "../models/Product";
export declare const findProductByIdOrIdentifier: (idOrIdentifier: string) => Promise<(mongoose.Document<unknown, {}, IProduct, {}, mongoose.DefaultSchemaOptions> & IProduct & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | null | undefined>;
export declare const seedCatalogIfEmpty: () => Promise<void>;
export declare const createProduct: (data: any, user?: any) => Promise<any>;
export interface GetProductsQuery {
    page?: number | string;
    limit?: number | string;
    search?: string;
    status?: string;
    category?: string;
    subCategory?: string;
    brand?: string;
    productType?: string;
    isPublished?: boolean | string;
    isFeatured?: boolean | string;
    hasVariants?: boolean | string;
}
export declare const getProducts: (query?: GetProductsQuery) => Promise<{
    products: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare const getProductById: (id: string) => Promise<any>;
export declare const updateProduct: (id: string, data: any, user?: any) => Promise<any>;
export declare const updateProductStatus: (id: string, status: string, user?: any) => Promise<any>;
export declare const duplicateProduct: (id: string, user?: any) => Promise<any>;
export declare const bulkUpdateStatus: (ids: string[], status: string, user?: any) => Promise<{
    matchedCount: number;
    modifiedCount: number;
    status: string;
}>;
export declare const bulkUpdatePublish: (ids: string[], isPublished: boolean, user?: any) => Promise<{
    matchedCount: number;
    modifiedCount: number;
    isPublished: boolean;
}>;
export declare const bulkDelete: (ids: string[]) => Promise<{
    deletedCount: number;
}>;
export declare const getProductOrders: (productId: string) => Promise<{
    id: any;
    customer: any;
    date: string;
    total: string;
    status: any;
    payment: any;
}[]>;
export declare const getProductStats: () => Promise<{
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    draftProducts: number;
    publishedProducts: number;
    featuredProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
}>;
export declare const deleteProduct: (id: string) => Promise<{
    message: string;
}>;
declare const _default: {
    createProduct: typeof createProduct;
    getProducts: typeof getProducts;
    getProductById: typeof getProductById;
    updateProduct: typeof updateProduct;
    updateProductStatus: typeof updateProductStatus;
    duplicateProduct: typeof duplicateProduct;
    bulkUpdateStatus: typeof bulkUpdateStatus;
    bulkUpdatePublish: typeof bulkUpdatePublish;
    bulkDelete: typeof bulkDelete;
    getProductOrders: typeof getProductOrders;
    getProductStats: typeof getProductStats;
    deleteProduct: typeof deleteProduct;
    seedCatalogIfEmpty: typeof seedCatalogIfEmpty;
    findProductByIdOrIdentifier: typeof findProductByIdOrIdentifier;
};
export default _default;
