import { Request, Response } from "express";
import subCategoryService from "../../services/master/subCategory.service";
import {
  validateCreateSubCategory,
  validateUpdateSubCategory,
} from "../../validations/master/subCategory.validation";
import logger from "../../utils/logger";

// ---------------------------------------
// Create Sub Category
// ---------------------------------------
export const createSubCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validateCreateSubCategory(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const subCategory = await subCategoryService.createSubCategory(
      req.body,
      req.user?._id?.toString()
    );

    return res.status(201).json({
      success: true,
      message: "Sub category created successfully",
      data: subCategory,
    });
  } catch (error: any) {
    logger.error("Create sub category error: " + (error?.message || error));
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------------------------------
// Get all Sub Categories
// ---------------------------------------
export const getSubCategories = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await subCategoryService.getSubCategories({
      page: req.query.page as any,
      limit: req.query.limit as any,
      search: (req.query.search as string) || "",
      status: req.query.status as string,
      category: req.query.category as string,
    });

    return res.status(200).json({
      success: true,
      data: result.subCategories,
      pagination: result.pagination,
    });
  } catch (error: any) {
    logger.error("Get sub categories error: " + (error?.message || error));
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------------------------------
// Get by ID
// ---------------------------------------
export const getSubCategoryById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const subCategory = await subCategoryService.getSubCategoryById(req.params.id as string);

    return res.status(200).json({
      success: true,
      data: subCategory,
    });
  } catch (error: any) {
    logger.error("Get sub category error: " + (error?.message || error));
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------------------------------
// Update
// ---------------------------------------
export const updateSubCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validateUpdateSubCategory(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const subCategory = await subCategoryService.updateSubCategory(
      req.params.id as string,
      req.body,
      req.user?._id?.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Sub category updated successfully",
      data: subCategory,
    });
  } catch (error: any) {
    logger.error("Update sub category error: " + (error?.message || error));
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------------------------------
// Update Status
// ---------------------------------------
export const updateSubCategoryStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { status } = req.body;

    const subCategory = await subCategoryService.updateSubCategoryStatus(
      req.params.id as string,
      status,
      req.user?._id?.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Sub category status updated successfully",
      data: subCategory,
    });
  } catch (error: any) {
    logger.error("Update sub category status error: " + (error?.message || error));
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------------------------------
// Delete
// ---------------------------------------
export const deleteSubCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    await subCategoryService.deleteSubCategory(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Sub category deleted successfully",
    });
  } catch (error: any) {
    logger.error("Delete sub category error: " + (error?.message || error));
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  updateSubCategoryStatus,
  deleteSubCategory,
};
