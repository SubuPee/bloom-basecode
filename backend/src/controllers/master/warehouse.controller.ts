import { Request, Response } from "express";
import warehouseService from "../../services/master/warehouse.service";
import logger from "../../utils/logger";

// -----------------------------------------
// Create Warehouse
// -----------------------------------------
export const createWarehouse = async (req: Request, res: Response): Promise<Response> => {
  try {
    const warehouse = await warehouseService.createWarehouse(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Warehouse created successfully",
      data: warehouse,
    });
  } catch (error: any) {
    logger.error("Create Warehouse Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create warehouse",
      ...(error.errors && { errors: error.errors }),
    });
  }
};

// -----------------------------------------
// Get All Warehouses
// -----------------------------------------
export const getWarehouses = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await warehouseService.getWarehouses(req.query);

    return res.status(200).json({
      success: true,
      message: "Warehouses fetched successfully",
      data: result.warehouses,
      pagination: result.pagination,
    });
  } catch (error: any) {
    logger.error("Get Warehouses Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch warehouses",
    });
  }
};

// -----------------------------------------
// Get Warehouse By ID
// -----------------------------------------
export const getWarehouseById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const warehouse = await warehouseService.getWarehouseById(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Warehouse fetched successfully",
      data: warehouse,
    });
  } catch (error: any) {
    logger.error("Get Warehouse Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch warehouse",
    });
  }
};

// -----------------------------------------
// Update Warehouse
// -----------------------------------------
export const updateWarehouse = async (req: Request, res: Response): Promise<Response> => {
  try {
    const warehouse = await warehouseService.updateWarehouse(
      req.params.id as string,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Warehouse updated successfully",
      data: warehouse,
    });
  } catch (error: any) {
    logger.error("Update Warehouse Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update warehouse",
      ...(error.errors && { errors: error.errors }),
    });
  }
};

// -----------------------------------------
// Update Warehouse Status
// -----------------------------------------
export const updateWarehouseStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const warehouse = await warehouseService.updateWarehouseStatus(
      req.params.id as string,
      req.body.status,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Warehouse status updated successfully",
      data: warehouse,
    });
  } catch (error: any) {
    logger.error("Update Warehouse Status Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update warehouse status",
    });
  }
};

// -----------------------------------------
// Delete Warehouse
// -----------------------------------------
export const deleteWarehouse = async (req: Request, res: Response): Promise<Response> => {
  try {
    await warehouseService.deleteWarehouse(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Warehouse deleted successfully",
    });
  } catch (error: any) {
    logger.error("Delete Warehouse Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete warehouse",
    });
  }
};

export default {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  updateWarehouseStatus,
  deleteWarehouse,
};
