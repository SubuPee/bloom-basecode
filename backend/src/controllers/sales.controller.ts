import { Request, Response } from "express";
import salesService from "../services/sales.service";
import logger from "../utils/logger";

// =====================================================
// GET SALES OVERVIEW (Complete Dashboard)
// =====================================================

export const getSalesOverview = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = await salesService.getSalesOverview(req.query);

    return res.status(200).json({
      success: true,
      message: "Sales overview fetched successfully.",
      data,
    });
  } catch (error: any) {
    logger.error("Get Sales Overview Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch sales overview.",
    });
  }
};

// =====================================================
// GET SALES METRICS (KPI Cards)
// =====================================================

export const getSalesMetrics = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = await salesService.getSalesMetrics(req.query);

    return res.status(200).json({
      success: true,
      message: "Sales metrics fetched successfully.",
      data,
    });
  } catch (error: any) {
    logger.error("Get Sales Metrics Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch sales metrics.",
    });
  }
};

// =====================================================
// GET SALES CHART DATA
// =====================================================

export const getSalesChart = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = await salesService.getSalesChart(req.query);

    return res.status(200).json({
      success: true,
      message: "Sales chart data fetched successfully.",
      data,
    });
  } catch (error: any) {
    logger.error("Get Sales Chart Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch sales chart data.",
    });
  }
};

// =====================================================
// GET SALES BY CHANNEL
// =====================================================

export const getSalesChannels = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = await salesService.getSalesChannels(req.query);

    return res.status(200).json({
      success: true,
      message: "Sales channels fetched successfully.",
      data,
    });
  } catch (error: any) {
    logger.error("Get Sales Channels Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch sales channels.",
    });
  }
};

// =====================================================
// GET TOP PRODUCTS
// =====================================================

export const getTopProducts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = await salesService.getTopProducts(req.query);

    return res.status(200).json({
      success: true,
      message: "Top products fetched successfully.",
      data,
    });
  } catch (error: any) {
    logger.error("Get Top Products Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch top products.",
    });
  }
};

// =====================================================
// GET CUSTOMER MIX
// =====================================================

export const getCustomerMix = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = await salesService.getCustomerMix(req.query);

    return res.status(200).json({
      success: true,
      message: "Customer mix fetched successfully.",
      data,
    });
  } catch (error: any) {
    logger.error("Get Customer Mix Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch customer mix.",
    });
  }
};

// =====================================================
// GET SALES TRANSACTIONS
// =====================================================

export const getSalesTransactions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = await salesService.getSalesTransactions(req.query);

    return res.status(200).json({
      success: true,
      message: "Sales transactions fetched successfully.",
      data: data.transactions,
      pagination: data.pagination,
    });
  } catch (error: any) {
    logger.error("Get Sales Transactions Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch sales transactions.",
    });
  }
};

// =====================================================
// EXPORT SALES REPORT (CSV / JSON)
// =====================================================

export const exportSalesReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const format = (req.query.format as string) || "json";
    const data = await salesService.exportSalesReport(format, req.query);

    if (String(format).toLowerCase() === "csv") {
      res.header("Content-Type", "text/csv");
      res.attachment(`bloom-sales-report-${Date.now()}.csv`);
      return res.send(data);
    }

    return res.status(200).json({
      success: true,
      message: "Sales report exported successfully.",
      data,
    });
  } catch (error: any) {
    logger.error("Export Sales Report Error: " + (error?.message || error));

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to export sales report.",
    });
  }
};

export default {
  getSalesOverview,
  getSalesMetrics,
  getSalesChart,
  getSalesChannels,
  getTopProducts,
  getCustomerMix,
  getSalesTransactions,
  exportSalesReport,
};
