"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVendorProduct = exports.getVendorProducts = exports.updateVendorBankTax = exports.exportVendorsCsv = exports.getActivityLogs = exports.getDashboardStats = exports.getTransactions = exports.processPayment = exports.approveSettlement = exports.generateSettlement = exports.getSettlements = exports.getVendorWallet = exports.inspectReturn = exports.getVendorReturns = exports.updateOrderStatus = exports.getVendorOrders = exports.softDeleteVendor = exports.updateCommission = exports.updateVendorProfile = exports.deleteDocument = exports.verifyDocument = exports.getVendorDocuments = exports.uploadDocument = exports.updateKycStatus = exports.updateVendorStatus = exports.getVendorById = exports.getRegistrations = exports.registerVendor = void 0;
const vendor_service_1 = __importDefault(require("../services/vendor.service"));
const vendor_validation_1 = require("../validations/vendor.validation");
// =====================================================
// 1. REGISTRATION & ONBOARDING CONTROLLERS
// =====================================================
const registerVendor = async (req, res) => {
    try {
        const errors = (0, vendor_validation_1.validateCreateVendor)(req.body);
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
        const vendor = await vendor_service_1.default.registerVendor(req.body, actor, req.user?._id);
        return res.status(201).json({
            success: true,
            message: "Vendor registered successfully",
            data: vendor,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to register vendor",
        });
    }
};
exports.registerVendor = registerVendor;
const getRegistrations = async (req, res) => {
    try {
        const result = await vendor_service_1.default.getRegistrations(req.query);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve registrations",
        });
    }
};
exports.getRegistrations = getRegistrations;
const getVendorById = async (req, res) => {
    try {
        const vendor = await vendor_service_1.default.getVendorById(req.params.id);
        return res.status(200).json({
            success: true,
            data: vendor,
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message || "Vendor not found",
        });
    }
};
exports.getVendorById = getVendorById;
const updateVendorStatus = async (req, res) => {
    try {
        const errors = (0, vendor_validation_1.validateStatusUpdate)(req.body);
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
        const vendor = await vendor_service_1.default.updateVendorStatus(req.params.id, req.body, actor);
        return res.status(200).json({
            success: true,
            message: `Vendor status updated to ${req.body.status}`,
            data: vendor,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update vendor status",
        });
    }
};
exports.updateVendorStatus = updateVendorStatus;
const updateKycStatus = async (req, res) => {
    try {
        const errors = (0, vendor_validation_1.validateKycUpdate)(req.body);
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
        const vendor = await vendor_service_1.default.updateKycStatus(req.params.id, req.body, actor);
        return res.status(200).json({
            success: true,
            message: `KYC status updated to ${req.body.kycStatus}`,
            data: vendor,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update KYC status",
        });
    }
};
exports.updateKycStatus = updateKycStatus;
// =====================================================
// 2. DOCUMENT MANAGEMENT CONTROLLERS
// =====================================================
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No document file was uploaded. Please attach a PDF or image file under the 'file' field.",
            });
        }
        const actor = req.user?.firstName
            ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
            : "Alex Morgan";
        const doc = await vendor_service_1.default.uploadDocument(req.params.id, req.file, req.body, actor);
        return res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            data: doc,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to upload document",
        });
    }
};
exports.uploadDocument = uploadDocument;
const getVendorDocuments = async (req, res) => {
    try {
        const vendor = await vendor_service_1.default.getVendorById(req.params.id);
        return res.status(200).json({
            success: true,
            data: vendor.documents || [],
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message || "Vendor not found",
        });
    }
};
exports.getVendorDocuments = getVendorDocuments;
const verifyDocument = async (req, res) => {
    try {
        const errors = (0, vendor_validation_1.validateDocVerify)(req.body);
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
        const doc = await vendor_service_1.default.verifyDocument(req.params.id, req.params.docId, req.body, actor);
        return res.status(200).json({
            success: true,
            message: `Document status updated to ${req.body.status}`,
            data: doc,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to verify document",
        });
    }
};
exports.verifyDocument = verifyDocument;
const deleteDocument = async (req, res) => {
    try {
        const actor = req.user?.firstName
            ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
            : "Alex Morgan";
        await vendor_service_1.default.deleteDocument(req.params.id, req.params.docId, actor);
        return res.status(200).json({
            success: true,
            message: "Document removed successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to delete document",
        });
    }
};
exports.deleteDocument = deleteDocument;
// =====================================================
// 3. PROFILE & COMMISSION CONTROLLERS
// =====================================================
const updateVendorProfile = async (req, res) => {
    try {
        const errors = (0, vendor_validation_1.validateUpdateVendor)(req.body);
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
        const vendor = await vendor_service_1.default.updateVendorProfile(req.params.id, req.body, actor);
        return res.status(200).json({
            success: true,
            message: "Vendor profile updated successfully",
            data: vendor,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update vendor profile",
        });
    }
};
exports.updateVendorProfile = updateVendorProfile;
const updateCommission = async (req, res) => {
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
        const vendor = await vendor_service_1.default.updateCommission(req.params.id, commissionRate, actor);
        return res.status(200).json({
            success: true,
            message: `Commission rate updated to ${commissionRate}%`,
            data: vendor,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update commission rate",
        });
    }
};
exports.updateCommission = updateCommission;
const softDeleteVendor = async (req, res) => {
    try {
        const actor = req.user?.firstName
            ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
            : "Alex Morgan";
        await vendor_service_1.default.softDeleteVendor(req.params.id, actor);
        return res.status(200).json({
            success: true,
            message: "Vendor archived successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to archive vendor",
        });
    }
};
exports.softDeleteVendor = softDeleteVendor;
// =====================================================
// 4. ORDERS & RETURNS CONTROLLERS
// =====================================================
const getVendorOrders = async (req, res) => {
    try {
        const vendorId = req.params.id || req.query.vendorId || "";
        const result = await vendor_service_1.default.getVendorOrders(vendorId, req.query);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve orders",
        });
    }
};
exports.getVendorOrders = getVendorOrders;
const updateOrderStatus = async (req, res) => {
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
        const order = await vendor_service_1.default.updateOrderStatus(req.params.orderId, { status, carrier, trackingNumber }, actor);
        return res.status(200).json({
            success: true,
            message: `Order #${order.orderNumber} status updated to ${status}`,
            data: order,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update order status",
        });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const getVendorReturns = async (req, res) => {
    try {
        const vendorId = req.params.id || req.query.vendorId || "";
        const result = await vendor_service_1.default.getVendorReturns(vendorId, req.query);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve returns",
        });
    }
};
exports.getVendorReturns = getVendorReturns;
const inspectReturn = async (req, res) => {
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
        const ret = await vendor_service_1.default.inspectReturn(req.params.returnId, { inspectionResult, dispositionAction, notes }, actor);
        return res.status(200).json({
            success: true,
            message: `Return inspected as ${inspectionResult}`,
            data: ret,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to inspect return",
        });
    }
};
exports.inspectReturn = inspectReturn;
// =====================================================
// 5. WALLET, SETTLEMENTS & PAYMENTS CONTROLLERS
// =====================================================
const getVendorWallet = async (req, res) => {
    try {
        const wallet = await vendor_service_1.default.getVendorWallet(req.params.id);
        return res.status(200).json({
            success: true,
            data: wallet,
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message || "Vendor wallet could not be retrieved",
        });
    }
};
exports.getVendorWallet = getVendorWallet;
const getSettlements = async (req, res) => {
    try {
        const vendorId = req.params.id || req.query.vendorId || "";
        const result = await vendor_service_1.default.getSettlements(vendorId, req.query);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve settlements",
        });
    }
};
exports.getSettlements = getSettlements;
const generateSettlement = async (req, res) => {
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
        const settlement = await vendor_service_1.default.generateSettlement(vendorId, period, actor);
        return res.status(201).json({
            success: true,
            message: "Settlement statement generated successfully",
            data: settlement,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to generate settlement",
        });
    }
};
exports.generateSettlement = generateSettlement;
const approveSettlement = async (req, res) => {
    try {
        const actor = req.user?.firstName
            ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
            : "Alex Morgan";
        const result = await vendor_service_1.default.approveSettlement(req.params.settlementId, actor);
        return res.status(200).json({
            success: true,
            message: "Settlement approved for disbursement",
            data: result,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to approve settlement",
        });
    }
};
exports.approveSettlement = approveSettlement;
const processPayment = async (req, res) => {
    try {
        const errors = (0, vendor_validation_1.validateProcessPayment)(req.body);
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
        const result = await vendor_service_1.default.processPayment(req.params.paymentId, req.body, actor);
        return res.status(200).json({
            success: true,
            message: `Payment marked as Completed with Reference #${req.body.referenceId}`,
            data: result,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to process payment disbursement",
        });
    }
};
exports.processPayment = processPayment;
const getTransactions = async (req, res) => {
    try {
        const vendorId = req.params.id || req.query.vendorId || "";
        const result = await vendor_service_1.default.getTransactions(vendorId, req.query);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve transactions",
        });
    }
};
exports.getTransactions = getTransactions;
// =====================================================
// 6. DASHBOARD & AUDIT LOGS CONTROLLERS
// =====================================================
const getDashboardStats = async (_req, res) => {
    try {
        const stats = await vendor_service_1.default.getDashboardStats();
        return res.status(200).json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve dashboard stats",
        });
    }
};
exports.getDashboardStats = getDashboardStats;
const getActivityLogs = async (req, res) => {
    try {
        const logs = await vendor_service_1.default.getActivityLogs(req.query);
        return res.status(200).json({
            success: true,
            data: logs,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve activity logs",
        });
    }
};
exports.getActivityLogs = getActivityLogs;
const exportVendorsCsv = async (req, res) => {
    try {
        const csvContent = await vendor_service_1.default.exportVendorsCsv(req.query);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", 'attachment; filename="bloom_vendors_export.csv"');
        return res.status(200).send(csvContent);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to export vendors to CSV",
        });
    }
};
exports.exportVendorsCsv = exportVendorsCsv;
const updateVendorBankTax = async (req, res) => {
    try {
        const actor = req.user?.firstName
            ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
            : "Alex Morgan";
        const vendor = await vendor_service_1.default.updateVendorBankTax(req.params.id, req.body, actor);
        return res.status(200).json({
            success: true,
            message: "Bank and tax information updated successfully",
            data: vendor,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update bank and tax details",
        });
    }
};
exports.updateVendorBankTax = updateVendorBankTax;
const getVendorProducts = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const result = await vendor_service_1.default.getVendorProducts(vendorId, req.query);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve vendor products",
        });
    }
};
exports.getVendorProducts = getVendorProducts;
const createVendorProduct = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const actor = req.user?.firstName
            ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
            : "Alex Morgan";
        const product = await vendor_service_1.default.createVendorProduct(vendorId, req.body, actor);
        return res.status(201).json({
            success: true,
            message: "Product created for vendor successfully",
            data: product,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create product for vendor",
        });
    }
};
exports.createVendorProduct = createVendorProduct;
exports.default = {
    registerVendor: exports.registerVendor,
    getRegistrations: exports.getRegistrations,
    getVendorById: exports.getVendorById,
    updateVendorStatus: exports.updateVendorStatus,
    updateKycStatus: exports.updateKycStatus,
    uploadDocument: exports.uploadDocument,
    getVendorDocuments: exports.getVendorDocuments,
    verifyDocument: exports.verifyDocument,
    deleteDocument: exports.deleteDocument,
    updateVendorProfile: exports.updateVendorProfile,
    updateCommission: exports.updateCommission,
    softDeleteVendor: exports.softDeleteVendor,
    getVendorOrders: exports.getVendorOrders,
    updateOrderStatus: exports.updateOrderStatus,
    getVendorReturns: exports.getVendorReturns,
    inspectReturn: exports.inspectReturn,
    getVendorWallet: exports.getVendorWallet,
    getSettlements: exports.getSettlements,
    generateSettlement: exports.generateSettlement,
    approveSettlement: exports.approveSettlement,
    processPayment: exports.processPayment,
    getTransactions: exports.getTransactions,
    getDashboardStats: exports.getDashboardStats,
    getActivityLogs: exports.getActivityLogs,
    exportVendorsCsv: exports.exportVendorsCsv,
    updateVendorBankTax: exports.updateVendorBankTax,
    getVendorProducts: exports.getVendorProducts,
    createVendorProduct: exports.createVendorProduct,
};
//# sourceMappingURL=vendor.controller.js.map