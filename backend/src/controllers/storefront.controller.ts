import { Request, Response } from "express";
import storefrontService from "../services/storefront.service";
import {
  validateUpdateStorefrontConfig,
  validatePublishToggle,
} from "../validations/storefront.validation";
import logger from "../utils/logger";

// =====================================================
// 1. GET STOREFRONT PREVIEW (COMPLETE BUNDLE)
// =====================================================

export const getStorefrontPreviewHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const preview = await storefrontService.getStorefrontPreview();
    res.status(200).json({
      success: true,
      data: preview,
    });
  } catch (error: any) {
    logger.error("Error in getStorefrontPreviewHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch storefront preview",
    });
  }
};

// =====================================================
// 2. GET STOREFRONT HERO BANNER
// =====================================================

export const getStorefrontHeroHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const hero = await storefrontService.getStorefrontHero();
    res.status(200).json({
      success: true,
      data: hero,
    });
  } catch (error: any) {
    logger.error("Error in getStorefrontHeroHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch storefront hero banner",
    });
  }
};

// =====================================================
// 3. GET PUBLISHED STOREFRONT PRODUCTS
// =====================================================

export const getStorefrontProductsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await storefrontService.getStorefrontProducts(req.query);
    res.status(200).json({
      success: true,
      data: result.items,
      totalCount: result.totalCount,
    });
  } catch (error: any) {
    logger.error("Error in getStorefrontProductsHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch storefront products",
    });
  }
};

// =====================================================
// 4. GET STOREFRONT HIGHLIGHTS
// =====================================================

export const getStorefrontHighlightsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const highlights = await storefrontService.getStorefrontHighlights();
    res.status(200).json({
      success: true,
      data: highlights,
    });
  } catch (error: any) {
    logger.error("Error in getStorefrontHighlightsHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch storefront highlights",
    });
  }
};

// =====================================================
// 5. GET STOREFRONT CONFIG
// =====================================================

export const getStorefrontConfigHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const config = await storefrontService.getStorefrontConfig();
    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    logger.error("Error in getStorefrontConfigHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch storefront configuration",
    });
  }
};

// =====================================================
// 6. UPDATE STOREFRONT CONFIG
// =====================================================

export const updateStorefrontConfigHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validationErrors = validateUpdateStorefrontConfig(req.body);
    if (Object.keys(validationErrors).length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
      return;
    }

    const userId = (req as any).user?.id || (req as any).user?._id;
    const config = await storefrontService.updateStorefrontConfig(
      req.body,
      userId
    );

    res.status(200).json({
      success: true,
      message: "Storefront configuration updated successfully",
      data: config,
    });
  } catch (error: any) {
    logger.error("Error in updateStorefrontConfigHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update storefront configuration",
    });
  }
};

// =====================================================
// 7. TOGGLE PRODUCT PUBLISH STATUS
// =====================================================

export const toggleProductPublishHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validationErrors = validatePublishToggle(req.body);
    if (Object.keys(validationErrors).length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
      return;
    }

    const productId = String(req.params.id);
    const result = await storefrontService.toggleProductPublish(
      productId,
      req.body.isPublished
    );

    if (!result) {
      res.status(404).json({
        success: false,
        message: `Product with identifier '${productId}' not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Product publication status updated to ${result.isPublished ? "published" : "hidden"}`,
      data: result,
    });
  } catch (error: any) {
    logger.error("Error in toggleProductPublishHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle product publish status",
    });
  }
};

export default {
  getStorefrontPreviewHandler,
  getStorefrontHeroHandler,
  getStorefrontProductsHandler,
  getStorefrontHighlightsHandler,
  getStorefrontConfigHandler,
  updateStorefrontConfigHandler,
  toggleProductPublishHandler,
};
