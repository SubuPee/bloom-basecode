import { Request, Response } from "express";
import categoryService from "../../services/master/category.service";
import {
  validateCreateCategory,
  validateUpdateCategory,
} from "../../validations/master/category.validation";
import logger from "../../utils/logger";

// ---------------------------------------
// Create
// ---------------------------------------
export const createCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validateCreateCategory(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const category = await categoryService.createCategory(
      req.body,
      req.user?._id?.toString()
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error: any) {
    logger.error("Create category error: " + (error?.message || error));
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------------------------------
// Get all
// ---------------------------------------
export const getCategories = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await categoryService.getCategories({
      page: req.query.page as any,
      limit: req.query.limit as any,
      search: (req.query.search as string) || "",
      status: req.query.status as string,
      parentCategory: req.query.parentCategory as string,
    });

    return res.status(200).json({
      success: true,
      data: result.categories,
      pagination: result.pagination,
    });
  } catch (error: any) {
    logger.error("Get categories error: " + (error?.message || error));
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------------------------------
// Get one
// ---------------------------------------
export const getCategoryById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const category = await categoryService.getCategoryById(req.params.id as string);

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    logger.error("Get category error: " + (error?.message || error));
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------------------------------
// Update
// ---------------------------------------
export const updateCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validateUpdateCategory(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const category = await categoryService.updateCategory(
      req.params.id as string,
      req.body,
      req.user?._id?.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error: any) {
    logger.error("Update category error: " + (error?.message || error));
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------------------------------
// Status
// ---------------------------------------
export const updateCategoryStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { status } = req.body;

    const category = await categoryService.updateCategoryStatus(
      req.params.id as string,
      status,
      req.user?._id?.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Category status updated successfully",
      data: category,
    });
  } catch (error: any) {
    logger.error("Update category status error: " + (error?.message || error));
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------------------------------
// Delete
// ---------------------------------------
export const deleteCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    await categoryService.deleteCategory(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    logger.error("Delete category error: " + (error?.message || error));
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
};
