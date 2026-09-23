"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const permissionMiddleware_1 = __importDefault(require("../middleware/permissionMiddleware"));
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Executive dashboard metrics, catalog statistics, low stock alerts, and quick actions
 */
/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Get complete dashboard executive overview
 *     description: Retrieve KPI metrics, products by category, status split donut, recently added products, and awaiting order confirmations.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview payload returned successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/overview", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("dashboard.read"), dashboard_controller_1.getDashboardOverviewHandler);
/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard top KPI summary cards
 *     description: Retrieve total products, active categories, low stock alerts, and warehouse counts with trends.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPI stats retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("dashboard.read"), dashboard_controller_1.getDashboardStatsHandler);
/**
 * @swagger
 * /api/dashboard/category-split:
 *   get:
 *     summary: Get products by category breakdown
 *     description: Retrieve category distribution with catalog item counts and percentages.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category distribution retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/category-split", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("dashboard.read"), dashboard_controller_1.getDashboardCategorySplitHandler);
/**
 * @swagger
 * /api/dashboard/recent-products:
 *   get:
 *     summary: Get recently added products
 *     description: Retrieve latest catalog additions with price, category, and status.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of recent products to return (default 6)
 *     responses:
 *       200:
 *         description: Recent products retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/recent-products", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("dashboard.read"), dashboard_controller_1.getDashboardRecentProductsHandler);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map