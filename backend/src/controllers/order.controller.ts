import { Request, Response } from "express";
import orderService from "../services/order.service";
import logger from "../utils/logger";

// =====================================================
// GET ORDERS
// =====================================================

export const getOrders = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await orderService.getOrders(req.query);

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully.",
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error: any) {
    logger.error("Get Orders Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch orders.",
      ...(error.errors && { errors: error.errors }),
    });
  }
};

// =====================================================
// GET ORDER STATS
// =====================================================

export const getOrderStats = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const stats = await orderService.getOrderStats();

    return res.status(200).json({
      success: true,
      message: "Order statistics fetched successfully.",
      data: stats,
    });
  } catch (error: any) {
    logger.error("Get Order Stats Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch order statistics.",
    });
  }
};

// =====================================================
// GET ORDER BY ID / NUMBER
// =====================================================

export const getOrderById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const order = await orderService.getOrderById(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully.",
      data: order,
    });
  } catch (error: any) {
    logger.error("Get Order By ID Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch order.",
      ...(error.errors && { errors: error.errors }),
    });
  }
};

// =====================================================
// CREATE ORDER
// =====================================================

export const createOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const order = await orderService.createOrder(req.body, req.user);

    return res.status(201).json({
      success: true,
      message: "Order created successfully.",
      data: order,
    });
  } catch (error: any) {
    logger.error("Create Order Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create order.",
      ...(error.errors && { errors: error.errors }),
    });
  }
};

// =====================================================
// UPDATE ORDER STATUS
// =====================================================

export const updateOrderStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id as string,
      req.body.status || req.body.orderStatus,
      req.body.notes,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${order.status}.`,
      data: order,
    });
  } catch (error: any) {
    logger.error("Update Order Status Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update order status.",
      ...(error.errors && { errors: error.errors }),
    });
  }
};

// =====================================================
// UPDATE PAYMENT STATUS
// =====================================================

export const updatePaymentStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const order = await orderService.updatePaymentStatus(
      req.params.id as string,
      req.body.paymentStatus || req.body.payment,
      req.body.notes,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: `Order payment status updated to ${order.payment}.`,
      data: order,
    });
  } catch (error: any) {
    logger.error("Update Payment Status Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update payment status.",
      ...(error.errors && { errors: error.errors }),
    });
  }
};

// =====================================================
// BULK UPDATE STATUS
// =====================================================

export const bulkUpdateStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await orderService.bulkUpdateStatus(
      req.body.ids,
      req.body.status || req.body.orderStatus,
      req.body.notes,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: `Successfully updated ${result.updatedCount} orders to ${result.status}.`,
      data: result,
    });
  } catch (error: any) {
    logger.error("Bulk Update Order Status Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to bulk update orders.",
      ...(error.errors && { errors: error.errors }),
    });
  }
};

// =====================================================
// GET ORDER INVOICE
// =====================================================

export const getOrderInvoice = async (req: Request, res: Response): Promise<Response> => {
  try {
    const invoice = await orderService.getOrderInvoice(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Order invoice retrieved successfully.",
      data: invoice,
    });
  } catch (error: any) {
    logger.error("Get Order Invoice Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve invoice.",
    });
  }
};

// =====================================================
// EXPORT ORDERS (CSV / JSON)
// =====================================================

export const exportOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    const format = (req.query.format as string) || "json";
    const data = await orderService.exportOrders(format, req.query);

    if (String(format).toLowerCase() === "csv") {
      res.header("Content-Type", "text/csv");
      res.attachment(`bloom-orders-${Date.now()}.csv`);
      return res.send(data);
    }

    return res.status(200).json({
      success: true,
      message: "Orders exported successfully.",
      data,
    });
  } catch (error: any) {
    logger.error("Export Orders Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to export orders.",
    });
  }
};

// =====================================================
// DELETE ORDER
// =====================================================

export const deleteOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await orderService.deleteOrder(req.params.id as string, req.user);

    return res.status(200).json(result);
  } catch (error: any) {
    logger.error("Delete Order Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete order.",
    });
  }
};

export default {
  getOrders,
  getOrderStats,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  bulkUpdateStatus,
  getOrderInvoice,
  exportOrders,
  deleteOrder,
};
