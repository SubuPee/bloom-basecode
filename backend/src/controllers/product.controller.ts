import { Request, Response } from "express";
import productService from "../services/product.service";
import logger from "../utils/logger";

// =====================================================
// CREATE PRODUCT
// =====================================================

export const createProduct = async (req: Request, res: Response): Promise<Response> => {
  try {
    const product = await productService.createProduct(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (error: any) {
    logger.error("Create Product Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create product.",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// =====================================================
// GET PRODUCTS
// =====================================================

export const getProducts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await productService.getProducts(req.query);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error: any) {
    logger.error("Get Products Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch products.",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// =====================================================
// GET PRODUCT BY ID
// =====================================================

export const getProductById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const product = await productService.getProductById(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully.",
      data: product,
    });
  } catch (error: any) {
    logger.error("Get Product By ID Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch product.",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// =====================================================
// UPDATE PRODUCT
// =====================================================

export const updateProduct = async (req: Request, res: Response): Promise<Response> => {
  try {
    const product = await productService.updateProduct(
      req.params.id as string,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error: any) {
    logger.error("Update Product Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update product.",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// =====================================================
// UPDATE PRODUCT STATUS
// =====================================================

export const updateProductStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { status } = req.body;

    const product = await productService.updateProductStatus(
      req.params.id as string,
      status,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Product status updated successfully.",
      data: product,
    });
  } catch (error: any) {
    logger.error("Update Product Status Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update product status.",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// =====================================================
// DELETE PRODUCT
// =====================================================

export const deleteProduct = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await productService.deleteProduct(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: result.message || "Product deleted successfully.",
    });
  } catch (error: any) {
    logger.error("Delete Product Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete product.",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// =====================================================
// DUPLICATE PRODUCT
// =====================================================

export const duplicateProduct = async (req: Request, res: Response): Promise<Response> => {
  try {
    const product = await productService.duplicateProduct(
      req.params.id as string,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Product duplicated successfully.",
      data: product,
    });
  } catch (error: any) {
    logger.error("Duplicate Product Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to duplicate product.",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// =====================================================
// BULK UPDATE STATUS
// =====================================================

export const bulkUpdateStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ids, status } = req.body;
    const result = await productService.bulkUpdateStatus(ids, status, req.user);

    return res.status(200).json({
      success: true,
      message: `Updated status for ${result.modifiedCount} product(s).`,
      data: result,
    });
  } catch (error: any) {
    logger.error("Bulk Update Status Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to bulk update product status.",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// =====================================================
// BULK UPDATE PUBLISH
// =====================================================

export const bulkUpdatePublish = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ids, isPublished } = req.body;
    const result = await productService.bulkUpdatePublish(ids, isPublished, req.user);

    return res.status(200).json({
      success: true,
      message: `Updated publish state for ${result.modifiedCount} product(s).`,
      data: result,
    });
  } catch (error: any) {
    logger.error("Bulk Update Publish Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to bulk update publish state.",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// =====================================================
// BULK DELETE
// =====================================================

export const bulkDelete = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ids } = req.body;
    const result = await productService.bulkDelete(ids);

    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} product(s) successfully.`,
      data: result,
    });
  } catch (error: any) {
    logger.error("Bulk Delete Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to bulk delete products.",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// =====================================================
// GET PRODUCT ORDERS
// =====================================================

export const getProductOrders = async (req: Request, res: Response): Promise<Response> => {
  try {
    const orders = await productService.getProductOrders(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Product orders fetched successfully.",
      data: orders,
    });
  } catch (error: any) {
    logger.error("Get Product Orders Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch product orders.",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// =====================================================
// GET PRODUCT STATS
// =====================================================

export const getProductStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const stats = await productService.getProductStats();

    return res.status(200).json({
      success: true,
      message: "Product catalog stats fetched successfully.",
      data: stats,
    });
  } catch (error: any) {
    logger.error("Get Product Stats Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch product catalog stats.",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateProductStatus,
  duplicateProduct,
  bulkUpdateStatus,
  bulkUpdatePublish,
  bulkDelete,
  getProductOrders,
  getProductStats,
  deleteProduct,
};
