import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import {
  initTransfer,
  listTransfers,
  confirmReceive,
  cancelTransferHandler,
} from "../../controllers/inventory/stockTransfer.controller";

/**
 * @swagger
 * tags:
 *   name: Stock Transfers
 *   description: Inter-warehouse stock transfer management (2-phase dispatch → receive)
 */

const router = Router();

router.use(protect);

/**
 * @swagger
 * /api/inventory/transfers:
 *   post:
 *     summary: Initiate stock transfer
 *     description: Phase 1 — deducts from source availableStock and places into destination inTransitStock. Creates a TRF-XXXXXX reference.
 *     tags: [Stock Transfers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, variantId, fromWarehouseId, toWarehouseId, quantity]
 *             properties:
 *               productId: { type: string }
 *               variantId: { type: string }
 *               fromWarehouseId: { type: string }
 *               toWarehouseId: { type: string }
 *               quantity: { type: number }
 *               batchNumber: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Transfer initiated
 *       400:
 *         description: Validation failed or insufficient stock
 *       404:
 *         description: Inventory record not found
 */
router.post("/transfers", initTransfer);

/**
 * @swagger
 * /api/inventory/transfers:
 *   get:
 *     summary: List stock transfers
 *     description: Paginated list of all stock transfers with optional status/warehouse filters.
 *     tags: [Stock Transfers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [All, Pending, In Transit, Completed, Cancelled] }
 *       - in: query
 *         name: fromWarehouseId
 *         schema: { type: string }
 *       - in: query
 *         name: toWarehouseId
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Transfers retrieved
 */
router.get("/transfers", listTransfers);

/**
 * @swagger
 * /api/inventory/transfers/{id}/receive:
 *   patch:
 *     summary: Receive / confirm transfer
 *     description: Phase 2 — converts destination inTransitStock to availableStock and sets transfer status to Completed.
 *     tags: [Stock Transfers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Transfer ID (TRF-XXXXXX)
 *     responses:
 *       200:
 *         description: Transfer received and stock updated
 *       400:
 *         description: Transfer is not in In Transit status
 *       404:
 *         description: Transfer not found
 */
router.patch("/transfers/:id/receive", confirmReceive);

/**
 * @swagger
 * /api/inventory/transfers/{id}/cancel:
 *   patch:
 *     summary: Cancel a transfer
 *     description: Reverses Phase 1 — returns qty to source availableStock, clears destination inTransitStock, sets status to Cancelled.
 *     tags: [Stock Transfers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Transfer ID (TRF-XXXXXX)
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
 *         description: Transfer cancelled and stock reversed
 *       400:
 *         description: Transfer not cancellable in current status
 *       404:
 *         description: Transfer not found
 */
router.patch("/transfers/:id/cancel", cancelTransferHandler);

export default router;
