"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const inventory_controller_1 = require("../../controllers/inventory/inventory.controller");
/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management — stock levels, inbound receipts, adjustments, alerts
 */
const router = (0, express_1.Router)();
// All inventory routes require authentication
router.use(authMiddleware_1.protect);
/**
 * @swagger
 * /api/inventory/overview:
 *   get:
 *     summary: Inventory dashboard overview
 *     description: Returns total stock counters (available, reserved, in-transit, damaged, expired), category breakdown for charts, and last 5 movements.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory overview retrieved
 */
router.get("/overview", inventory_controller_1.overview);
/**
 * @swagger
 * /api/inventory/stock:
 *   get:
 *     summary: Product stock ledger
 *     description: Paginated list of all variant stock levels with optional filters.
 *     tags: [Inventory]
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
 *         name: warehouseId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [In Stock, Low Stock, Out of Stock] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Stock ledger retrieved
 */
router.get("/stock", inventory_controller_1.stockLedger);
/**
 * @swagger
 * /api/inventory/stock/add:
 *   post:
 *     summary: Add inbound stock (Purchase Receipt)
 *     description: Increments available stock for a variant at a warehouse and creates an immutable ledger entry.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, variantId, warehouseId, quantity, notes]
 *             properties:
 *               productId: { type: string }
 *               variantId: { type: string }
 *               warehouseId: { type: string }
 *               vendorId: { type: string }
 *               sku: { type: string }
 *               unitCode: { type: string }
 *               quantity: { type: number }
 *               batchNumber: { type: string }
 *               notes: { type: string }
 *               referenceId: { type: string, description: "Purchase Order number" }
 *               location: { type: string, description: "Bin / shelf" }
 *     responses:
 *       201:
 *         description: Stock added successfully
 *       400:
 *         description: Validation failed
 */
router.post("/stock/add", inventory_controller_1.addInboundStock);
/**
 * @swagger
 * /api/inventory/stock/adjust:
 *   post:
 *     summary: Apply stock adjustment
 *     description: Adjusts stock count. Damage/Expiry moves units to segregated pools. Decrease is blocked if would result in negative available stock.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, variantId, warehouseId, adjustmentType, quantity, reason, notes]
 *             properties:
 *               productId: { type: string }
 *               variantId: { type: string }
 *               warehouseId: { type: string }
 *               adjustmentType:
 *                 type: string
 *                 enum: [Increase, Decrease, Damage, Expiry]
 *               quantity: { type: number }
 *               reason: { type: string }
 *               notes: { type: string }
 *               batchNumber: { type: string }
 *     responses:
 *       200:
 *         description: Stock adjustment applied
 *       400:
 *         description: Validation failed or zero-negative-stock rule violated
 */
router.post("/stock/adjust", inventory_controller_1.adjustInventoryStock);
/**
 * @swagger
 * /api/inventory/stock/adjust:
 *   get:
 *     summary: Get adjustment history
 *     description: Returns ledger entries of type Damage, Expiry, Manual Addition, Manual Deduction, and Adjustment.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: Adjustment history retrieved
 */
router.get("/stock/adjust", inventory_controller_1.adjustmentHistory);
/**
 * @swagger
 * /api/inventory/low-stock:
 *   get:
 *     summary: Low stock alerts
 *     description: Returns variants where availableStock <= minStock and availableStock > 0.
 *     tags: [Inventory]
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
 *         name: warehouseId
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Low stock items retrieved
 */
router.get("/low-stock", inventory_controller_1.lowStock);
/**
 * @swagger
 * /api/inventory/out-of-stock:
 *   get:
 *     summary: Out of stock items
 *     description: Returns all variants with availableStock === 0 and related backorder / vendor stats.
 *     tags: [Inventory]
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
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Out of stock items retrieved
 */
router.get("/out-of-stock", inventory_controller_1.outOfStock);
exports.default = router;
//# sourceMappingURL=inventory.routes.js.map