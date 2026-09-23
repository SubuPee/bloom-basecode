import { Request, Response } from "express";
import taxService from "../../services/master/tax.service";
import logger from "../../utils/logger";

// -----------------------------------------
// Create Tax
// -----------------------------------------
export const createTax = async (req: Request, res: Response): Promise<Response> => {
  try {
    const tax = await taxService.createTax(req.body, req.user);

    return res.status(201).json({
      success: true,
      message: "Tax created successfully",
      data: tax,
    });
  } catch (error: any) {
    logger.error("Create tax error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to create tax",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// -----------------------------------------
// Get Taxes
// -----------------------------------------
export const getTaxes = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await taxService.getTaxes(req.query);

    return res.status(200).json({
      success: true,
      message: "Taxes retrieved successfully",
      data: result.taxes,
      pagination: result.pagination,
    });
  } catch (error: any) {
    logger.error("Get taxes error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to get taxes",
    });
  }
};

// -----------------------------------------
// Get Tax By ID
// -----------------------------------------
export const getTaxById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const tax = await taxService.getTaxById(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Tax retrieved successfully",
      data: tax,
    });
  } catch (error: any) {
    logger.error("Get tax by ID error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to get tax",
    });
  }
};

// -----------------------------------------
// Update Tax
// -----------------------------------------
export const updateTax = async (req: Request, res: Response): Promise<Response> => {
  try {
    const tax = await taxService.updateTax(req.params.id as string, req.body, req.user);

    return res.status(200).json({
      success: true,
      message: "Tax updated successfully",
      data: tax,
    });
  } catch (error: any) {
    logger.error("Update tax error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update tax",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// -----------------------------------------
// Update Tax Status
// -----------------------------------------
export const updateTaxStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const tax = await taxService.updateTaxStatus(
      req.params.id as string,
      req.body.status,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Tax status updated successfully",
      data: tax,
    });
  } catch (error: any) {
    logger.error("Update tax status error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update tax status",
    });
  }
};

// -----------------------------------------
// Delete Tax
// -----------------------------------------
export const deleteTax = async (req: Request, res: Response): Promise<Response> => {
  try {
    await taxService.deleteTax(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Tax deleted successfully",
    });
  } catch (error: any) {
    logger.error("Delete tax error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to delete tax",
    });
  }
};

export default {
  createTax,
  getTaxes,
  getTaxById,
  updateTax,
  updateTaxStatus,
  deleteTax,
};
