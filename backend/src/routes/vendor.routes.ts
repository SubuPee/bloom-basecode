import express, { Router, Request, Response, NextFunction } from "express";
import vendorController from "../controllers/vendor.controller";
import { handleVendorDocUpload } from "../middleware/vendorUpload.middleware";
import { protect } from "../middleware/authMiddleware";

const router: Router = express.Router();

// Note: If authentication is enabled across the dashboard, we can optionally protect these.
// For smooth dashboard pairing and public registration, we allow token passthrough when present.
const optionalProtect = async (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    return protect(req, res, next);
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
router.get("/dashboard-stats", vendorController.getDashboardStats);

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
router.get("/activity-logs", vendorController.getActivityLogs);

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
router.get("/registrations", vendorController.getRegistrations);
router.get("/export", vendorController.exportVendorsCsv);

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
router.post("/", optionalProtect, vendorController.registerVendor);

// =====================================================
// 3. SETTLEMENTS & PAYOUTS
// =====================================================

router.get("/settlements", vendorController.getSettlements);
router.post("/settlements/generate", optionalProtect, vendorController.generateSettlement);
router.patch("/settlements/:settlementId/approve", optionalProtect, vendorController.approveSettlement);
router.post("/payments/:paymentId/process", optionalProtect, vendorController.processPayment);
router.get("/transactions", vendorController.getTransactions);

// =====================================================
// 4. ORDERS & RETURNS
// =====================================================

router.get("/orders", vendorController.getVendorOrders);
router.patch("/orders/:orderId/status", optionalProtect, vendorController.updateOrderStatus);

router.get("/returns", vendorController.getVendorReturns);
router.patch("/returns/:returnId/inspect", optionalProtect, vendorController.inspectReturn);

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
router.get("/:id", vendorController.getVendorById);

router.put("/:id", optionalProtect, vendorController.updateVendorProfile);
router.patch("/:id/status", optionalProtect, vendorController.updateVendorStatus);
router.patch("/:id/kyc-status", optionalProtect, vendorController.updateKycStatus);
router.patch("/:id/commission", optionalProtect, vendorController.updateCommission);
router.patch("/:id/bank-tax", optionalProtect, vendorController.updateVendorBankTax);
router.delete("/:id", optionalProtect, vendorController.softDeleteVendor);

router.get("/:id/products", vendorController.getVendorProducts);
router.post("/:id/products", optionalProtect, vendorController.createVendorProduct);

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
router.post("/:id/documents", handleVendorDocUpload, optionalProtect, vendorController.uploadDocument);
router.get("/:id/documents", vendorController.getVendorDocuments);
router.patch("/:id/documents/:docId/verify", optionalProtect, vendorController.verifyDocument);
router.delete("/:id/documents/:docId", optionalProtect, vendorController.deleteDocument);

// =====================================================
// 7. VENDOR SPECIFIC SUBLISTS (ORDERS, RETURNS, WALLET)
// =====================================================

router.get("/:id/wallet", vendorController.getVendorWallet);
router.get("/:id/orders", vendorController.getVendorOrders);
router.get("/:id/returns", vendorController.getVendorReturns);
router.get("/:id/settlements", vendorController.getSettlements);
router.get("/:id/transactions", vendorController.getTransactions);

export default router;
