"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const stockMovement_controller_1 = require("../../controllers/inventory/stockMovement.controller");
/**
 * @swagger
 * tags:
 *   name: Stock Movements
 *   description: Immutable stock movement ledger and audit history
 */
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
/**
 * @swagger
 * /api/inventory/movements:
 *   get:
 *     summary: Stock movement ledger
 *     description: Complete filterable immutable chronological ledger of every stock change.
 *     tags: [Stock Movements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by movement ID, product, batch number, or reference
 *       - in: query
 *         name: movementType
 *         schema:
 *           type: string
 *           enum: [All, Opening Stock, Purchase, Production, Order, Order Cancellation, Return, Damage, Expiry, Adjustment, Transfer In, Transfer Out, Manual Addition, Manual Deduction]
 *       - in: query
 *         name: vendorId
 *         schema: { type: string }
 *       - in: query
 *         name: warehouseId
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
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: Ledger retrieved
 */
router.get("/movements", stockMovement_controller_1.movementsLedger);
/**
 * @swagger
 * /api/inventory/history:
 *   get:
 *     summary: Stock audit history
 *     description: Full audit trail with date range filtering for compliance reporting.
 *     tags: [Stock Movements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: movementType
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
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: Audit history retrieved
 */
router.get("/history", stockMovement_controller_1.auditHistory);
exports.default = router;
//# sourceMappingURL=stockMovement.routes.js.map