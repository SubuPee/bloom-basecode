import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import {
  overview,
  listOrders,
  getOrder,
  create,
  start,
  complete,
  cancel,
  history,
} from "../../controllers/production/production.controller";

/**
 * @swagger
 * tags:
 *   name: Production
 *   description: Manufacturing work orders, QA output, and inventory inwarding
 */

const router = Router();

router.use(protect);

/**
 * @swagger
 * /api/production/overview:
 *   get:
 *     summary: Production dashboard overview
 *     description: Returns production stats, active orders with progress, and recent batches.
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Production overview retrieved
 */
router.get("/overview", overview);

/**
 * @swagger
 * /api/production/history:
 *   get:
 *     summary: Production history
 *     description: Completed and cancelled orders with date range filtering for audit.
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: vendorId
 *         schema: { type: string }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Production history retrieved
 */
router.get("/history", history);

/**
 * @swagger
 * /api/production/orders:
 *   get:
 *     summary: List production orders
 *     description: Paginated list of production work orders with search, status, and vendor filters.
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [All, Planned, In Progress, Partially Completed, Completed, Cancelled] }
 *       - in: query
 *         name: vendorId
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Production orders retrieved
 */
router.get("/orders", listOrders);

/**
 * @swagger
 * /api/production/orders:
 *   post:
 *     summary: Schedule a new production order
 *     description: Creates a manufacturing work order with BOM, batch assignment, and warehouse allocation.
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, variantId, vendorId, batchNumber, plannedQuantity, unit, warehouseId, expectedCompletion]
 *             properties:
 *               productId: { type: string }
 *               variantId: { type: string }
 *               vendorId: { type: string }
 *               batchNumber: { type: string }
 *               plannedQuantity: { type: number }
 *               unit: { type: string, enum: [PCS, KG, LTR, BOX] }
 *               warehouseId: { type: string }
 *               storageLocation: { type: string }
 *               expectedCompletion: { type: string, format: date }
 *               notes: { type: string }
 *               rawMaterials:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name: { type: string }
 *                     requiredQuantity: { type: number }
 *                     unit: { type: string }
 *     responses:
 *       201:
 *         description: Production order scheduled
 *       400:
 *         description: Validation failed
 */
router.post("/orders", create);

/**
 * @swagger
 * /api/production/orders/{id}:
 *   get:
 *     summary: Get production order details
 *     description: Full order details with populated product, vendor, warehouse, BOM, and related batch.
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Order ID (PRD-XXXXXX)
 *     responses:
 *       200:
 *         description: Production order retrieved
 *       404:
 *         description: Order not found
 */
router.get("/orders/:id", getOrder);

/**
 * @swagger
 * /api/production/orders/{id}/start:
 *   patch:
 *     summary: Start production run
 *     description: Transitions order from Planned to In Progress.
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Production order started
 *       400:
 *         description: Order is not in Planned status
 */
router.patch("/orders/:id/start", start);

/**
 * @swagger
 * /api/production/orders/{id}/complete:
 *   patch:
 *     summary: Record production output and QA
 *     description: Records produced and rejected quantities. Good output is inwarded to inventory, rejects go to damaged stock. A ProductionBatch is auto-created.
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [producedQuantity, rejectedQuantity]
 *             properties:
 *               producedQuantity: { type: number, description: "Total units manufactured" }
 *               rejectedQuantity: { type: number, description: "QA defective units (0 if none)" }
 *     responses:
 *       200:
 *         description: Production completed and inventory inwarded
 *       400:
 *         description: Validation failed or order not in correct status
 */
router.patch("/orders/:id/complete", complete);

/**
 * @swagger
 * /api/production/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel production order
 *     description: Cancels a Planned or In Progress order with a mandatory reason.
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cancelReason]
 *             properties:
 *               cancelReason: { type: string }
 *     responses:
 *       200:
 *         description: Production order cancelled
 *       400:
 *         description: Order cannot be cancelled in current status
 */
router.patch("/orders/:id/cancel", cancel);

export default router;
