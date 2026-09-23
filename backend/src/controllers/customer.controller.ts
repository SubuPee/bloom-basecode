import { Request, Response } from "express";
import customerService from "../services/customer.service";
import {
  validateCreateCustomer,
  validateUpdateCustomer,
} from "../validations/customer.validation";
import logger from "../utils/logger";

// =====================================================
// 1. GET CUSTOMER STATS
// =====================================================

export const getCustomerStatsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await customerService.getCustomerStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error("Error in getCustomerStatsHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch customer statistics",
    });
  }
};

// =====================================================
// 2. GET CUSTOMERS LIST
// =====================================================

export const getCustomersHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await customerService.getCustomers(req.query);
    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error: any) {
    logger.error("Error in getCustomersHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch customers",
    });
  }
};

// =====================================================
// 3. GET CUSTOMER BY ID OR CODE
// =====================================================

export const getCustomerByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const customerId = String(req.params.id);
    const customer = await customerService.getCustomerById(customerId);
    if (!customer) {
      res.status(404).json({
        success: false,
        message: `Customer with identifier '${customerId}' not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    logger.error("Error in getCustomerByIdHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch customer details",
    });
  }
};

// =====================================================
// 4. GET CUSTOMER ORDERS
// =====================================================

export const getCustomerOrdersHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const customerId = String(req.params.id);
    const result = await customerService.getCustomerOrders(
      customerId,
      req.query
    );
    if (!result) {
      res.status(404).json({
        success: false,
        message: `Customer with identifier '${customerId}' not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.items,
      customer: result.customer,
      pagination: result.pagination,
    });
  } catch (error: any) {
    logger.error("Error in getCustomerOrdersHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch customer orders",
    });
  }
};

// =====================================================
// 5. CREATE CUSTOMER
// =====================================================

export const createCustomerHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validationErrors = validateCreateCustomer(req.body);
    if (Object.keys(validationErrors).length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
      return;
    }

    const userId = (req as any).user?.id || (req as any).user?._id;
    const customer = await customerService.createCustomer(req.body, userId);

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error: any) {
    logger.error("Error in createCustomerHandler:", error);
    const status = error.message?.includes("already exists") ? 409 : 500;
    res.status(status).json({
      success: false,
      message: error.message || "Failed to create customer",
    });
  }
};

// =====================================================
// 6. UPDATE CUSTOMER
// =====================================================

export const updateCustomerHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validationErrors = validateUpdateCustomer(req.body);
    if (Object.keys(validationErrors).length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
      return;
    }

    const customerId = String(req.params.id);
    const userId = (req as any).user?.id || (req as any).user?._id;
    const customer = await customerService.updateCustomer(
      customerId,
      req.body,
      userId
    );

    if (!customer) {
      res.status(404).json({
        success: false,
        message: `Customer with identifier '${customerId}' not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error: any) {
    logger.error("Error in updateCustomerHandler:", error);
    const status = error.message?.includes("already exists") ? 409 : 500;
    res.status(status).json({
      success: false,
      message: error.message || "Failed to update customer",
    });
  }
};

// =====================================================
// 7. DELETE CUSTOMER
// =====================================================

export const deleteCustomerHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const customerId = String(req.params.id);
    const result = await customerService.deleteCustomer(customerId);
    if (!result) {
      res.status(404).json({
        success: false,
        message: `Customer with identifier '${customerId}' not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
      data: result,
    });
  } catch (error: any) {
    logger.error("Error in deleteCustomerHandler:", error);
    const status = error.message?.includes("Cannot delete") ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || "Failed to delete customer",
    });
  }
};

// =====================================================
// 8. EXPORT CUSTOMERS
// =====================================================

export const exportCustomersHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const format = req.query.format === "csv" ? "csv" : "json";
    const result = await customerService.exportCustomers(req.query, format);

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="bloom_customers_${Date.now()}.csv"`
      );
      res.status(200).send(result);
    } else {
      res.status(200).json({
        success: true,
        data: result,
      });
    }
  } catch (error: any) {
    logger.error("Error in exportCustomersHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to export customers",
    });
  }
};

export default {
  getCustomerStatsHandler,
  getCustomersHandler,
  getCustomerByIdHandler,
  getCustomerOrdersHandler,
  createCustomerHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
  exportCustomersHandler,
};
