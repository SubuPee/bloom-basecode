import { Request, Response } from "express";
import cmsService from "../services/cms.service";
import {
  validateCreateCms,
  validateUpdateCms,
} from "../validations/cms.validation";
import logger from "../utils/logger";

// =====================================================
// 1. GET CMS STATS
// =====================================================

export const getCmsStatsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await cmsService.getCmsStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error("Error in getCmsStatsHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch CMS statistics",
    });
  }
};

// =====================================================
// 2. GET CMS ENTRIES LIST
// =====================================================

export const getCmsEntriesHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await cmsService.getCmsEntries(req.query);
    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error: any) {
    logger.error("Error in getCmsEntriesHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch CMS entries",
    });
  }
};

// =====================================================
// 3. GET STOREFRONT HERO BANNER
// =====================================================

export const getStorefrontHeroHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const hero = await cmsService.getStorefrontHero();
    if (!hero) {
      res.status(404).json({
        success: false,
        message: "No active storefront hero banner found",
      });
      return;
    }

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
// 4. GET CMS ENTRY BY ID OR SLUG
// =====================================================

export const getCmsEntryByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const idOrSlug = String(req.params.id);
    const entry = await cmsService.getCmsEntryById(idOrSlug);
    if (!entry) {
      res.status(404).json({
        success: false,
        message: `CMS entry with identifier '${idOrSlug}' not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (error: any) {
    logger.error("Error in getCmsEntryByIdHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch CMS entry",
    });
  }
};

// =====================================================
// 5. CREATE CMS ENTRY
// =====================================================

export const createCmsEntryHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validationErrors = validateCreateCms(req.body);
    if (Object.keys(validationErrors).length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
      return;
    }

    const userId = (req as any).user?.id || (req as any).user?._id;
    const entry = await cmsService.createCmsEntry(req.body, userId);

    res.status(201).json({
      success: true,
      message: "CMS entry created successfully",
      data: entry,
    });
  } catch (error: any) {
    logger.error("Error in createCmsEntryHandler:", error);
    const status = error.message?.includes("already exists") ? 409 : 500;
    res.status(status).json({
      success: false,
      message: error.message || "Failed to create CMS entry",
    });
  }
};

// =====================================================
// 6. UPDATE CMS ENTRY
// =====================================================

export const updateCmsEntryHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validationErrors = validateUpdateCms(req.body);
    if (Object.keys(validationErrors).length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
      return;
    }

    const idOrSlug = String(req.params.id);
    const userId = (req as any).user?.id || (req as any).user?._id;
    const entry = await cmsService.updateCmsEntry(
      idOrSlug,
      req.body,
      userId
    );

    if (!entry) {
      res.status(404).json({
        success: false,
        message: `CMS entry with identifier '${idOrSlug}' not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "CMS entry updated successfully",
      data: entry,
    });
  } catch (error: any) {
    logger.error("Error in updateCmsEntryHandler:", error);
    const status = error.message?.includes("already exists") ? 409 : 500;
    res.status(status).json({
      success: false,
      message: error.message || "Failed to update CMS entry",
    });
  }
};

// =====================================================
// 7. DELETE CMS ENTRY
// =====================================================

export const deleteCmsEntryHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const idOrSlug = String(req.params.id);
    const result = await cmsService.deleteCmsEntry(idOrSlug);
    if (!result) {
      res.status(404).json({
        success: false,
        message: `CMS entry with identifier '${idOrSlug}' not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "CMS entry deleted successfully",
      data: result,
    });
  } catch (error: any) {
    logger.error("Error in deleteCmsEntryHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete CMS entry",
    });
  }
};

export default {
  getCmsStatsHandler,
  getCmsEntriesHandler,
  getStorefrontHeroHandler,
  getCmsEntryByIdHandler,
  createCmsEntryHandler,
  updateCmsEntryHandler,
  deleteCmsEntryHandler,
};
