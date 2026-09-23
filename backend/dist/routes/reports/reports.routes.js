"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const reports_controller_1 = require("../../controllers/reports/reports.controller");
/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Executive reports center, sales attribution, inventory stock ledger, production audit, transactions, and CSV exports
 */
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
/**
 * @swagger
 * /api/reports/overview:
 *   get:
 *     summary: Executive reports overview and ecosystem KPIs
 *     description: Returns aggregated gross sales (GMV), platform fees, sellable stock units, disbursed settlements, and activity counts.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema: { type: string }
 *       - in: query
 *         name: dateRange
 *         schema: { type: string, enum: [7d, 30d, 90d, all] }
 *     responses:
 *       200:
 *         description: Reports overview retrieved successfully
 */
router.get("/overview", reports_controller_1.overview);
/**
 * @swagger
 * /api/reports/sales:
 *   get:
 *     summary: Vendor sales and revenue report
 *     description: Order sales ledger with gross merchant volume, platform commission, and vendor net earnings.
 *     tags: [Reports]
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
 *         name: dateRange
 *         schema: { type: string, enum: [7d, 30d, 90d, all] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Sales report retrieved successfully
 */
router.get("/sales", reports_controller_1.sales);
/**
 * @swagger
 * /api/reports/orders:
 *   get:
 *     summary: Vendor orders and fulfillment report
 *     description: Orders list with fulfillment status, line-item counts, and payment details.
 *     tags: [Reports]
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
 *         name: dateRange
 *         schema: { type: string, enum: [7d, 30d, 90d, all] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Orders report retrieved successfully
 */
router.get("/orders", reports_controller_1.orders);
/**
 * @swagger
 * /api/reports/inventory:
 *   get:
 *     summary: Inventory stock ledger report
 *     description: Sellable stock levels, reserved units, damaged units, and prices across product variants and warehouses.
 *     tags: [Reports]
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
 *         description: Inventory report retrieved successfully
 */
router.get("/inventory", reports_controller_1.inventory);
/**
 * @swagger
 * /api/reports/production:
 *   get:
 *     summary: Production output and QA report
 *     description: Manufacturing work orders, batch tracking, planned vs good inwarded quantities, and QA rejects.
 *     tags: [Reports]
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
 *         name: dateRange
 *         schema: { type: string, enum: [7d, 30d, 90d, all] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Production report retrieved successfully
 */
router.get("/production", reports_controller_1.production);
/**
 * @swagger
 * /api/reports/transactions:
 *   get:
 *     summary: Financial transactions ledger
 *     description: Detailed credit and debit transactions across vendor escrow and platform wallets.
 *     tags: [Reports]
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
 *         name: dateRange
 *         schema: { type: string, enum: [7d, 30d, 90d, all] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Transactions report retrieved successfully
 */
router.get("/transactions", reports_controller_1.transactions);
/**
 * @swagger
 * /api/reports/settlements:
 *   get:
 *     summary: Vendor settlements and payouts report
 *     description: Weekly settlement tranches, deductions, net payable, and payment status.
 *     tags: [Reports]
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
 *         description: Settlements report retrieved successfully
 */
router.get("/settlements", reports_controller_1.settlements);
/**
 * @swagger
 * /api/reports/returns:
 *   get:
 *     summary: Customer returns and restock disposition report
 *     description: Customer RMA inspection results, return reasons, and refund adjustments.
 *     tags: [Reports]
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
 *         description: Returns report retrieved successfully
 */
router.get("/returns", reports_controller_1.returns);
/**
 * @swagger
 * /api/reports/export:
 *   get:
 *     summary: Export report data as CSV or JSON
 *     description: Downloads verified report data matching the frontend export specifications.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         required: true
 *         schema: { type: string, enum: [overview, sales, orders, inventory, production, transactions, settlements, returns] }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [csv, json], default: csv }
 *       - in: query
 *         name: vendorId
 *         schema: { type: string }
 *       - in: query
 *         name: dateRange
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: CSV file download or JSON export data
 */
router.get("/export", reports_controller_1.exportReport);
router.get("/:category/export", reports_controller_1.exportReport);
exports.default = router;
//# sourceMappingURL=reports.routes.js.map