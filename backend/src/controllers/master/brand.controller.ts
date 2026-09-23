import { Request, Response } from "express";
import brandService from "../../services/master/brand.service";
import logger from "../../utils/logger";

// -----------------------------------------
// Create Brand
// -----------------------------------------
export const createBrand = async (req: Request, res: Response): Promise<Response> => {
  try {
    const brand = await brandService.createBrand(req.body, req.user);

    return res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: brand,
    });
  } catch (error: any) {
    logger.error("Create brand error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to create brand",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// -----------------------------------------
// Get All Brands
// -----------------------------------------
export const getBrands = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await brandService.getBrands(req.query);

    return res.status(200).json({
      success: true,
      message: "Brands retrieved successfully",
      data: result.brands,
      pagination: result.pagination,
    });
  } catch (error: any) {
    logger.error("Get brands error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to get brands",
    });
  }
};

// -----------------------------------------
// Get Brand By ID
// -----------------------------------------
export const getBrandById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const brand = await brandService.getBrandById(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Brand retrieved successfully",
      data: brand,
    });
  } catch (error: any) {
    logger.error("Get brand by ID error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to get brand",
    });
  }
};

// -----------------------------------------
// Update Brand
// -----------------------------------------
export const updateBrand = async (req: Request, res: Response): Promise<Response> => {
  try {
    const brand = await brandService.updateBrand(req.params.id as string, req.body, req.user);

    return res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error: any) {
    logger.error("Update brand error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update brand",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// -----------------------------------------
// Update Brand Status
// -----------------------------------------
export const updateBrandStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const brand = await brandService.updateBrandStatus(
      req.params.id as string,
      req.body.status,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Brand status updated successfully",
      data: brand,
    });
  } catch (error: any) {
    logger.error("Update brand status error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update brand status",
    });
  }
};

// -----------------------------------------
// Delete Brand
// -----------------------------------------
export const deleteBrand = async (req: Request, res: Response): Promise<Response> => {
  try {
    await brandService.deleteBrand(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error: any) {
    logger.error("Delete brand error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to delete brand",
    });
  }
};

export default {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  updateBrandStatus,
  deleteBrand,
};
