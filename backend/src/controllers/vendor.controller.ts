import { Request, Response } from "express";
import vendorService from "../services/vendor.service";
import {
  validateCreateVendor,
  validateUpdateVendor,
  validateStatusUpdate,
  validateKycUpdate,
  validateDocVerify,
  validateProcessPayment,
} from "../validations/vendor.validation";

// =====================================================
// 1. REGISTRATION & ONBOARDING CONTROLLERS
// =====================================================

export const registerVendor = async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validateCreateVendor(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const actor = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
      : "Alex Morgan";
    const vendor = await vendorService.registerVendor(req.body, actor, req.user?._id);

    return res.status(201).json({
      success: true,
      message: "Vendor registered successfully",
      data: vendor,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to register vendor",
    });
  }
};

export const getRegistrations = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await vendorService.getRegistrations(req.query as any);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve registrations",
    });
  }
};

export const getVendorById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const vendor = await vendorService.getVendorById(req.params.id as string);
    return res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Vendor not found",
    });
  }
};

export const updateVendorStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validateStatusUpdate(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const actor = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
      : "Alex Morgan";
    const vendor = await vendorService.updateVendorStatus(req.params.id as string, req.body, actor);

    return res.status(200).json({
      success: true,
      message: `Vendor status updated to ${req.body.status}`,
      data: vendor,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update vendor status",
    });
  }
};

export const updateKycStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validateKycUpdate(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const actor = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
      : "Alex Morgan";
    const vendor = await vendorService.updateKycStatus(req.params.id as string, req.body, actor);

    return res.status(200).json({
      success: true,
      message: `KYC status updated to ${req.body.kycStatus}`,
      data: vendor,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update KYC status",
    });
  }
};

// =====================================================
// 2. DOCUMENT MANAGEMENT CONTROLLERS
// =====================================================

export const uploadDocument = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "No document file was uploaded. Please attach a PDF or image file under the 'file' field.",
      });
    }

    const actor = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
      : "Alex Morgan";
    const doc = await vendorService.uploadDocument(
      req.params.id as string,
      req.file,
      req.body,
      actor
    );

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: doc,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to upload document",
    });
  }
};

export const getVendorDocuments = async (req: Request, res: Response): Promise<Response> => {
  try {
    const vendor = await vendorService.getVendorById(req.params.id as string);
    return res.status(200).json({
      success: true,
      data: vendor.documents || [],
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Vendor not found",
    });
  }
};

export const verifyDocument = async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validateDocVerify(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const actor = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
      : "Alex Morgan";
    const doc = await vendorService.verifyDocument(
      req.params.id as string,
      req.params.docId as string,
      req.body,
      actor
    );

    return res.status(200).json({
      success: true,
      message: `Document status updated to ${req.body.status}`,
      data: doc,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to verify document",
    });
  }
};

export const deleteDocument = async (req: Request, res: Response): Promise<Response> => {
  try {
    const actor = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
      : "Alex Morgan";
    await vendorService.deleteDocument(req.params.id as string, req.params.docId as string, actor);

    return res.status(200).json({
      success: true,
      message: "Document removed successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete document",
    });
  }
};

// =====================================================
// 3. PROFILE & COMMISSION CONTROLLERS
// =====================================================

export const updateVendorProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validateUpdateVendor(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const actor = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
      : "Alex Morgan";
    const vendor = await vendorService.updateVendorProfile(
      req.params.id as string,
      req.body,
      actor
    );

    return res.status(200).json({
      success: true,
      message: "Vendor profile updated successfully",
      data: vendor,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update vendor profile",
    });
  }
};

export const updateCommission = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { commissionRate } = req.body;
    if (commissionRate === undefined || isNaN(Number(commissionRate))) {
      return res.status(400).json({
        success: false,
        message: "Valid commissionRate number is required",
      });
    }

    const actor = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
      : "Alex Morgan";
    const vendor = await vendorService.updateCommission(
      req.params.id as string,
      commissionRate,
      actor
    );

    return res.status(200).json({
      success: true,
      message: `Commission rate updated to ${commissionRate}%`,
      data: vendor,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update commission rate",
    });
  }
};

export const softDeleteVendor = async (req: Request, res: Response): Promise<Response> => {
  try {
    const actor = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
      : "Alex Morgan";
    await vendorService.softDeleteVendor(req.params.id as string, actor);

    return res.status(200).json({
      success: true,
      message: "Vendor archived successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to archive vendor",
    });
  }
};

// =====================================================
// 4. ORDERS & RETURNS CONTROLLERS
// =====================================================

export const getVendorOrders = async (req: Request, res: Response): Promise<Response> => {
  try {
    const vendorId = (req.params.id as string) || (req.query.vendorId as string) || "";
    const result = await vendorService.getVendorOrders(vendorId, req.query as any);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve orders",
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { status, carrier, trackingNumber } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Order status is required" });
    }

    const actor = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
      : "Alex Morgan";
    const order = await vendorService.updateOrderStatus(
      req.params.orderId as string,
      { status, carrier, trackingNumber },
      actor
    );

    return res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} status updated to ${status}`,
      data: order,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update order status",
    });
  }
};

export const getVendorReturns = async (req: Request, res: Response): Promise<Response> => {
  try {
    const vendorId = (req.params.id as string) || (req.query.vendorId as string) || "";
    const result = await vendorService.getVendorReturns(vendorId, req.query as any);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve returns",
    });
  }
};

export const inspectReturn = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { inspectionResult, dispositionAction, notes } = req.body;
    if (!inspectionResult) {
      return res
        .status(400)
        .json({ success: false, message: "inspectionResult is required" });
    }

    const actor = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
      : "Alex Morgan";
    const ret = await vendorService.inspectReturn(
      req.params.returnId as string,
      { inspectionResult, dispositionAction, notes },
      actor
    );

    return res.status(200).json({
      success: true,
      message: `Return inspected as ${inspectionResult}`,
      data: ret,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to inspect return",
    });
  }
};

// =====================================================
// 5. WALLET, SETTLEMENTS & PAYMENTS CONTROLLERS
// =====================================================

export const getVendorWallet = async (req: Request, res: Response): Promise<Response> => {
  try {
    const wallet = await vendorService.getVendorWallet(req.params.id as string);
    return res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Vendor wallet could not be retrieved",
    });
  }
};

export const getSettlements = async (req: Request, res: Response): Promise<Response> => {
  try {
    const vendorId = (req.params.id as string) || (req.query.vendorId as string) || "";
    const result = await vendorService.getSettlements(vendorId, req.query as any);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve settlements",
    });
  }
};

export const generateSettlement = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { vendorId, period } = req.body;
    if (!vendorId || !period) {
      return res
        .status(400)
        .json({ success: false, message: "vendorId and period are required" });
    }

    const actor = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
      : "Alex Morgan";
    const settlement = await vendorService.generateSettlement(
      vendorId,
      period,
      actor
    );

    return res.status(201).json({
      success: true,
      message: "Settlement statement generated successfully",
      data: settlement,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to generate settlement",
    });
  }
};

export const approveSettlement = async (req: Request, res: Response): Promise<Response> => {
  try {
    const actor = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
      : "Alex Morgan";
    const result = await vendorService.approveSettlement(
      req.params.settlementId as string,
      actor
    );

    return res.status(200).json({
      success: true,
      message: "Settlement approved for disbursement",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to approve settlement",
    });
  }
};

export const processPayment = async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validateProcessPayment(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const actor = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
      : "Alex Morgan";
    const result = await vendorService.processPayment(
      req.params.paymentId as string,
      req.body,
      actor
    );

    return res.status(200).json({
      success: true,
      message: `Payment marked as Completed with Reference #${req.body.referenceId}`,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to process payment disbursement",
    });
  }
};

export const getTransactions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const vendorId = (req.params.id as string) || (req.query.vendorId as string) || "";
    const result = await vendorService.getTransactions(vendorId, req.query as any);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve transactions",
    });
  }
};

// =====================================================
// 6. DASHBOARD & AUDIT LOGS CONTROLLERS
// =====================================================

export const getDashboardStats = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const stats = await vendorService.getDashboardStats();
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve dashboard stats",
    });
  }
};

export const getActivityLogs = async (req: Request, res: Response): Promise<Response> => {
  try {
    const logs = await vendorService.getActivityLogs(req.query as any);
    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve activity logs",
    });
  }
};

export const exportVendorsCsv = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const csvContent = await vendorService.exportVendorsCsv(req.query as any);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="bloom_vendors_export.csv"'
    );
    return res.status(200).send(csvContent);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to export vendors to CSV",
    });
  }
};

export const updateVendorBankTax = async (req: Request, res: Response): Promise<Response> => {
  try {
    const actor = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
      : "Alex Morgan";
    const vendor = await vendorService.updateVendorBankTax(
      req.params.id as string,
      req.body,
      actor
    );
    return res.status(200).json({
      success: true,
      message: "Bank and tax information updated successfully",
      data: vendor,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update bank and tax details",
    });
  }
};

export const getVendorProducts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const vendorId = req.params.id as string;
    const result = await vendorService.getVendorProducts(vendorId, req.query as any);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve vendor products",
    });
  }
};

export const createVendorProduct = async (req: Request, res: Response): Promise<Response> => {
  try {
    const vendorId = req.params.id as string;
    const actor = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
      : "Alex Morgan";
    const product = await vendorService.createVendorProduct(
      vendorId,
      req.body,
      actor
    );
    return res.status(201).json({
      success: true,
      message: "Product created for vendor successfully",
      data: product,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create product for vendor",
    });
  }
};

export default {
  registerVendor,
  getRegistrations,
  getVendorById,
  updateVendorStatus,
  updateKycStatus,
  uploadDocument,
  getVendorDocuments,
  verifyDocument,
  deleteDocument,
  updateVendorProfile,
  updateCommission,
  softDeleteVendor,
  getVendorOrders,
  updateOrderStatus,
  getVendorReturns,
  inspectReturn,
  getVendorWallet,
  getSettlements,
  generateSettlement,
  approveSettlement,
  processPayment,
  getTransactions,
  getDashboardStats,
  getActivityLogs,
  exportVendorsCsv,
  updateVendorBankTax,
  getVendorProducts,
  createVendorProduct,
};
