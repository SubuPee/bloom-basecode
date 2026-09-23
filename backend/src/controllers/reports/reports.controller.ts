import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import httpStatusCodes from "../../constants/httpStatusCodes";
import {
  getReportsOverview,
  getSalesReport,
  getOrdersReport,
  getInventoryReport,
  getProductionReport,
  getTransactionsReport,
  getSettlementsReport,
  getReturnsReport,
  exportReportData,
} from "../../services/reports/reports.service";

// =====================================================
// GET /api/reports/overview
// =====================================================
export const overview = asyncHandler(async (req: Request, res: Response) => {
  const { vendorId, dateRange } = req.query as Record<string, string>;
  const result = await getReportsOverview({ vendorId, dateRange });
  return sendSuccess(res, result, "Reports overview retrieved successfully", httpStatusCodes.OK);
});

// =====================================================
// GET /api/reports/sales
// =====================================================
export const sales = asyncHandler(async (req: Request, res: Response) => {
  const { search, vendorId, dateRange, page = "1", limit = "20" } = req.query as Record<string, string>;
  const result = await getSalesReport({
    search,
    vendorId,
    dateRange,
    page: parseInt(page),
    limit: parseInt(limit),
  });
  return sendSuccess(res, result, "Sales report retrieved successfully", httpStatusCodes.OK);
});

// =====================================================
// GET /api/reports/orders
// =====================================================
export const orders = asyncHandler(async (req: Request, res: Response) => {
  const { search, vendorId, dateRange, page = "1", limit = "20" } = req.query as Record<string, string>;
  const result = await getOrdersReport({
    search,
    vendorId,
    dateRange,
    page: parseInt(page),
    limit: parseInt(limit),
  });
  return sendSuccess(res, result, "Orders report retrieved successfully", httpStatusCodes.OK);
});

// =====================================================
// GET /api/reports/inventory
// =====================================================
export const inventory = asyncHandler(async (req: Request, res: Response) => {
  const { search, vendorId, page = "1", limit = "20" } = req.query as Record<string, string>;
  const result = await getInventoryReport({
    search,
    vendorId,
    page: parseInt(page),
    limit: parseInt(limit),
  });
  return sendSuccess(res, result, "Inventory report retrieved successfully", httpStatusCodes.OK);
});

// =====================================================
// GET /api/reports/production
// =====================================================
export const production = asyncHandler(async (req: Request, res: Response) => {
  const { search, vendorId, dateRange, page = "1", limit = "20" } = req.query as Record<string, string>;
  const result = await getProductionReport({
    search,
    vendorId,
    dateRange,
    page: parseInt(page),
    limit: parseInt(limit),
  });
  return sendSuccess(res, result, "Production report retrieved successfully", httpStatusCodes.OK);
});

// =====================================================
// GET /api/reports/transactions
// =====================================================
export const transactions = asyncHandler(async (req: Request, res: Response) => {
  const { search, vendorId, dateRange, page = "1", limit = "20" } = req.query as Record<string, string>;
  const result = await getTransactionsReport({
    search,
    vendorId,
    dateRange,
    page: parseInt(page),
    limit: parseInt(limit),
  });
  return sendSuccess(res, result, "Transactions report retrieved successfully", httpStatusCodes.OK);
});

// =====================================================
// GET /api/reports/settlements
// =====================================================
export const settlements = asyncHandler(async (req: Request, res: Response) => {
  const { search, vendorId, page = "1", limit = "20" } = req.query as Record<string, string>;
  const result = await getSettlementsReport({
    search,
    vendorId,
    page: parseInt(page),
    limit: parseInt(limit),
  });
  return sendSuccess(res, result, "Settlements report retrieved successfully", httpStatusCodes.OK);
});

// =====================================================
// GET /api/reports/returns
// =====================================================
export const returns = asyncHandler(async (req: Request, res: Response) => {
  const { search, vendorId, page = "1", limit = "20" } = req.query as Record<string, string>;
  const result = await getReturnsReport({
    search,
    vendorId,
    page: parseInt(page),
    limit: parseInt(limit),
  });
  return sendSuccess(res, result, "Returns report retrieved successfully", httpStatusCodes.OK);
});

// =====================================================
// GET /api/reports/:category/export OR /api/reports/export
// =====================================================
export const exportReport = asyncHandler(async (req: Request, res: Response) => {
  const category = (req.params.category || req.query.category || "overview") as string;
  const { vendorId, dateRange, search, format = "csv" } = req.query as Record<string, string>;

  const exportResult = await exportReportData(
    category,
    { vendorId, dateRange, search },
    format === "json" ? "json" : "csv"
  );

  if (format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${exportResult.filename}"`);
    return res.status(httpStatusCodes.OK).send(exportResult.csvContent);
  }

  return sendSuccess(res, exportResult, "Report export generated successfully", httpStatusCodes.OK);
});
