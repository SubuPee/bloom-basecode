"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductStats = exports.getProductOrders = exports.bulkDelete = exports.bulkUpdatePublish = exports.bulkUpdateStatus = exports.duplicateProduct = exports.deleteProduct = exports.updateProductStatus = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const product_service_1 = __importDefault(require("../services/product.service"));
const logger_1 = __importDefault(require("../utils/logger"));
// =====================================================
// CREATE PRODUCT
// =====================================================
const createProduct = async (req, res) => {
    try {
        const product = await product_service_1.default.createProduct(req.body, req.user);
        return res.status(201).json({
            success: true,
            message: "Product created successfully.",
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error("Create Product Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to create product.",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.createProduct = createProduct;
// =====================================================
// GET PRODUCTS
// =====================================================
const getProducts = async (req, res) => {
    try {
        const result = await product_service_1.default.getProducts(req.query);
        return res.status(200).json({
            success: true,
            message: "Products fetched successfully.",
            data: result.products,
            pagination: result.pagination,
        });
    }
    catch (error) {
        logger_1.default.error("Get Products Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch products.",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.getProducts = getProducts;
// =====================================================
// GET PRODUCT BY ID
// =====================================================
const getProductById = async (req, res) => {
    try {
        const product = await product_service_1.default.getProductById(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Product fetched successfully.",
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error("Get Product By ID Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch product.",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.getProductById = getProductById;
// =====================================================
// UPDATE PRODUCT
// =====================================================
const updateProduct = async (req, res) => {
    try {
        const product = await product_service_1.default.updateProduct(req.params.id, req.body, req.user);
        return res.status(200).json({
            success: true,
            message: "Product updated successfully.",
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error("Update Product Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update product.",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.updateProduct = updateProduct;
// =====================================================
// UPDATE PRODUCT STATUS
// =====================================================
const updateProductStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const product = await product_service_1.default.updateProductStatus(req.params.id, status, req.user);
        return res.status(200).json({
            success: true,
            message: "Product status updated successfully.",
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error("Update Product Status Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update product status.",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.updateProductStatus = updateProductStatus;
// =====================================================
// DELETE PRODUCT
// =====================================================
const deleteProduct = async (req, res) => {
    try {
        const result = await product_service_1.default.deleteProduct(req.params.id);
        return res.status(200).json({
            success: true,
            message: result.message || "Product deleted successfully.",
        });
    }
    catch (error) {
        logger_1.default.error("Delete Product Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to delete product.",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.deleteProduct = deleteProduct;
// =====================================================
// DUPLICATE PRODUCT
// =====================================================
const duplicateProduct = async (req, res) => {
    try {
        const product = await product_service_1.default.duplicateProduct(req.params.id, req.user);
        return res.status(201).json({
            success: true,
            message: "Product duplicated successfully.",
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error("Duplicate Product Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to duplicate product.",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.duplicateProduct = duplicateProduct;
// =====================================================
// BULK UPDATE STATUS
// =====================================================
const bulkUpdateStatus = async (req, res) => {
    try {
        const { ids, status } = req.body;
        const result = await product_service_1.default.bulkUpdateStatus(ids, status, req.user);
        return res.status(200).json({
            success: true,
            message: `Updated status for ${result.modifiedCount} product(s).`,
            data: result,
        });
    }
    catch (error) {
        logger_1.default.error("Bulk Update Status Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to bulk update product status.",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.bulkUpdateStatus = bulkUpdateStatus;
// =====================================================
// BULK UPDATE PUBLISH
// =====================================================
const bulkUpdatePublish = async (req, res) => {
    try {
        const { ids, isPublished } = req.body;
        const result = await product_service_1.default.bulkUpdatePublish(ids, isPublished, req.user);
        return res.status(200).json({
            success: true,
            message: `Updated publish state for ${result.modifiedCount} product(s).`,
            data: result,
        });
    }
    catch (error) {
        logger_1.default.error("Bulk Update Publish Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to bulk update publish state.",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.bulkUpdatePublish = bulkUpdatePublish;
// =====================================================
// BULK DELETE
// =====================================================
const bulkDelete = async (req, res) => {
    try {
        const { ids } = req.body;
        const result = await product_service_1.default.bulkDelete(ids);
        return res.status(200).json({
            success: true,
            message: `Deleted ${result.deletedCount} product(s) successfully.`,
            data: result,
        });
    }
    catch (error) {
        logger_1.default.error("Bulk Delete Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to bulk delete products.",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.bulkDelete = bulkDelete;
// =====================================================
// GET PRODUCT ORDERS
// =====================================================
const getProductOrders = async (req, res) => {
    try {
        const orders = await product_service_1.default.getProductOrders(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Product orders fetched successfully.",
            data: orders,
        });
    }
    catch (error) {
        logger_1.default.error("Get Product Orders Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch product orders.",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.getProductOrders = getProductOrders;
// =====================================================
// GET PRODUCT STATS
// =====================================================
const getProductStats = async (req, res) => {
    try {
        const stats = await product_service_1.default.getProductStats();
        return res.status(200).json({
            success: true,
            message: "Product catalog stats fetched successfully.",
            data: stats,
        });
    }
    catch (error) {
        logger_1.default.error("Get Product Stats Error: " + (error?.message || error));
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch product catalog stats.",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.getProductStats = getProductStats;
exports.default = {
    createProduct: exports.createProduct,
    getProducts: exports.getProducts,
    getProductById: exports.getProductById,
    updateProduct: exports.updateProduct,
    updateProductStatus: exports.updateProductStatus,
    duplicateProduct: exports.duplicateProduct,
    bulkUpdateStatus: exports.bulkUpdateStatus,
    bulkUpdatePublish: exports.bulkUpdatePublish,
    bulkDelete: exports.bulkDelete,
    getProductOrders: exports.getProductOrders,
    getProductStats: exports.getProductStats,
    deleteProduct: exports.deleteProduct,
};
//# sourceMappingURL=product.controller.js.map