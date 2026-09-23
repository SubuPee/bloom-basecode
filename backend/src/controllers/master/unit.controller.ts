import { Request, Response } from "express";
import unitService from "../../services/master/unit.service";
import logger from "../../utils/logger";

// -----------------------------------------
// Create Unit
// -----------------------------------------
export const createUnit = async (req: Request, res: Response): Promise<Response> => {
  try {
    const unit = await unitService.createUnit(req.body, req.user);

    return res.status(201).json({
      success: true,
      message: "Unit created successfully",
      data: unit,
    });
  } catch (error: any) {
    logger.error("Create unit error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to create unit",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// -----------------------------------------
// Get Units
// -----------------------------------------
export const getUnits = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await unitService.getUnits(req.query);

    return res.status(200).json({
      success: true,
      message: "Units retrieved successfully",
      data: result.units,
      pagination: result.pagination,
    });
  } catch (error: any) {
    logger.error("Get units error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to get units",
    });
  }
};

// -----------------------------------------
// Get Unit By ID
// -----------------------------------------
export const getUnitById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const unit = await unitService.getUnitById(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Unit retrieved successfully",
      data: unit,
    });
  } catch (error: any) {
    logger.error("Get unit by ID error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to get unit",
    });
  }
};

// -----------------------------------------
// Update Unit
// -----------------------------------------
export const updateUnit = async (req: Request, res: Response): Promise<Response> => {
  try {
    const unit = await unitService.updateUnit(req.params.id as string, req.body, req.user);

    return res.status(200).json({
      success: true,
      message: "Unit updated successfully",
      data: unit,
    });
  } catch (error: any) {
    logger.error("Update unit error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update unit",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// -----------------------------------------
// Update Unit Status
// -----------------------------------------
export const updateUnitStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const unit = await unitService.updateUnitStatus(
      req.params.id as string,
      req.body.status,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Unit status updated successfully",
      data: unit,
    });
  } catch (error: any) {
    logger.error("Update unit status error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update unit status",
    });
  }
};

// -----------------------------------------
// Delete Unit
// -----------------------------------------
export const deleteUnit = async (req: Request, res: Response): Promise<Response> => {
  try {
    await unitService.deleteUnit(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Unit deleted successfully",
    });
  } catch (error: any) {
    logger.error("Delete unit error: " + (error?.message || error));

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to delete unit",
    });
  }
};

export default {
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  updateUnitStatus,
  deleteUnit,
};
