import { Request, Response } from "express";
import attributeService from "../../services/master/attribute.service";
import logger from "../../utils/logger";

// -----------------------------------------
// Create Attribute
// -----------------------------------------
export const createAttribute = async (req: Request, res: Response): Promise<Response> => {
  try {
    const attribute = await attributeService.createAttribute(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Attribute created successfully",
      data: attribute,
    });
  } catch (error: any) {
    logger.error("Create Attribute Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create attribute",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// -----------------------------------------
// Get All Attributes
// -----------------------------------------
export const getAttributes = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await attributeService.getAttributes(req.query);

    return res.status(200).json({
      success: true,
      message: "Attributes fetched successfully",
      data: result.attributes,
      pagination: result.pagination,
    });
  } catch (error: any) {
    logger.error("Get Attributes Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch attributes",
    });
  }
};

// -----------------------------------------
// Get Attribute By ID
// -----------------------------------------
export const getAttributeById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const attribute = await attributeService.getAttributeById(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Attribute fetched successfully",
      data: attribute,
    });
  } catch (error: any) {
    logger.error("Get Attribute Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch attribute",
    });
  }
};

// -----------------------------------------
// Update Attribute
// -----------------------------------------
export const updateAttribute = async (req: Request, res: Response): Promise<Response> => {
  try {
    const attribute = await attributeService.updateAttribute(
      req.params.id as string,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Attribute updated successfully",
      data: attribute,
    });
  } catch (error: any) {
    logger.error("Update Attribute Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update attribute",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// -----------------------------------------
// Update Attribute Status
// -----------------------------------------
export const updateAttributeStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const attribute = await attributeService.updateAttributeStatus(
      req.params.id as string,
      req.body.status,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Attribute status updated successfully",
      data: attribute,
    });
  } catch (error: any) {
    logger.error("Update Attribute Status Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update attribute status",
    });
  }
};

// -----------------------------------------
// Delete Attribute
// -----------------------------------------
export const deleteAttribute = async (req: Request, res: Response): Promise<Response> => {
  try {
    await attributeService.deleteAttribute(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Attribute deleted successfully",
    });
  } catch (error: any) {
    logger.error("Delete Attribute Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete attribute",
    });
  }
};

export default {
  createAttribute,
  getAttributes,
  getAttributeById,
  updateAttribute,
  updateAttributeStatus,
  deleteAttribute,
};
