"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vendor_controller_1 = __importDefault(require("../controllers/vendor.controller"));
const vendorUpload_middleware_1 = require("../middleware/vendorUpload.middleware");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Note: If authentication is enabled across the dashboard, we can optionally protect these.
// For smooth dashboard pairing and public registration, we allow token passthrough when present.
const optionalProtect = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        return (0, authMiddleware_1.protect)(req, res, next);
    }
    next();
};
/**
 * @swagger
 * tags:
 *   name: Vendor Management
 *   description: Comprehensive Vendor Onboarding, Document Compliance, Profile, Orders & Settlements APIs
 */
// =====================================================
// 1. DASHBOARD OVERVIEW & AUDIT LOGS
// =====================================================
/**
 * @swagger
 * /api/vendors/dashboard-stats:
 *   get:
 *     summary: Retrieve aggregate vendor metrics
 *     tags: [Vendor Management]
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 */
router.get("/dashboard-stats", vendor_controller_1.default.getDashboardStats);
/**
 * @swagger
 * /api/vendors/activity-logs:
 *   get:
 *     summary: Retrieve vendor administrative audit logs
 *     tags: [Vendor Management]
 *     responses:
 *       200:
 *         description: Activity logs retrieved
 */
router.get("/activity-logs", vendor_controller_1.default.getActivityLogs);
// =====================================================
// 2. VENDOR REGISTRATIONS QUEUE
// =====================================================
/**
 * @swagger
 * /api/vendors/registrations:
 *   get:
 *     summary: Get all vendor registrations with filtering and pagination
 *     tags: [Vendor Management]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of vendor registrations
 */
router.get("/registrations", vendor_controller_1.default.getRegistrations);
router.get("/export", vendor_controller_1.default.exportVendorsCsv);
/**
 * @swagger
 * /api/vendors:
 *   post:
 *     summary: Register a new vendor with compliance documents
 *     tags: [Vendor Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - ownerName
 *               - email
 *               - phone
 *               - address
 *               - city
 *               - state
 *               - pincode
 *     responses:
 *       201:
 *         description: Vendor registered successfully
 */
router.post("/", optionalProtect, vendor_controller_1.default.registerVendor);
// =====================================================
// 3. SETTLEMENTS & PAYOUTS
// =====================================================
router.get("/settlements", vendor_controller_1.default.getSettlements);
router.post("/settlements/generate", optionalProtect, vendor_controller_1.default.generateSettlement);
router.patch("/settlements/:settlementId/approve", optionalProtect, vendor_controller_1.default.approveSettlement);
router.post("/payments/:paymentId/process", optionalProtect, vendor_controller_1.default.processPayment);
router.get("/transactions", vendor_controller_1.default.getTransactions);
// =====================================================
// 4. ORDERS & RETURNS
// =====================================================
router.get("/orders", vendor_controller_1.default.getVendorOrders);
router.patch("/orders/:orderId/status", optionalProtect, vendor_controller_1.default.updateOrderStatus);
router.get("/returns", vendor_controller_1.default.getVendorReturns);
router.patch("/returns/:returnId/inspect", optionalProtect, vendor_controller_1.default.inspectReturn);
// =====================================================
// 5. INDIVIDUAL VENDOR OPERATIONS
// =====================================================
/**
 * @swagger
 * /api/vendors/{id}:
 *   get:
 *     summary: Get vendor profile details by ID
 *     tags: [Vendor Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor details
 */
router.get("/:id", vendor_controller_1.default.getVendorById);
router.put("/:id", optionalProtect, vendor_controller_1.default.updateVendorProfile);
router.patch("/:id/status", optionalProtect, vendor_controller_1.default.updateVendorStatus);
router.patch("/:id/kyc-status", optionalProtect, vendor_controller_1.default.updateKycStatus);
router.patch("/:id/commission", optionalProtect, vendor_controller_1.default.updateCommission);
router.patch("/:id/bank-tax", optionalProtect, vendor_controller_1.default.updateVendorBankTax);
router.delete("/:id", optionalProtect, vendor_controller_1.default.softDeleteVendor);
router.get("/:id/products", vendor_controller_1.default.getVendorProducts);
router.post("/:id/products", optionalProtect, vendor_controller_1.default.createVendorProduct);
// =====================================================
// 6. COMPLIANCE DOCUMENTS (UPLOAD, VERIFY, REMOVE)
// =====================================================
/**
 * @swagger
 * /api/vendors/{id}/documents:
 *   post:
 *     summary: Upload compliance document (GST, PAN, Address Proof, Bank Proof)
 *     tags: [Vendor Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - type
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *               documentNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 */
router.post("/:id/documents", vendorUpload_middleware_1.handleVendorDocUpload, optionalProtect, vendor_controller_1.default.uploadDocument);
router.get("/:id/documents", vendor_controller_1.default.getVendorDocuments);
router.patch("/:id/documents/:docId/verify", optionalProtect, vendor_controller_1.default.verifyDocument);
router.delete("/:id/documents/:docId", optionalProtect, vendor_controller_1.default.deleteDocument);
// =====================================================
// 7. VENDOR SPECIFIC SUBLISTS (ORDERS, RETURNS, WALLET)
// =====================================================
router.get("/:id/wallet", vendor_controller_1.default.getVendorWallet);
router.get("/:id/orders", vendor_controller_1.default.getVendorOrders);
router.get("/:id/returns", vendor_controller_1.default.getVendorReturns);
router.get("/:id/settlements", vendor_controller_1.default.getSettlements);
router.get("/:id/transactions", vendor_controller_1.default.getTransactions);
exports.default = router;
//# sourceMappingURL=vendor.routes.js.map