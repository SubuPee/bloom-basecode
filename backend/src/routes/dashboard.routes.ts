import { Router } from "express";
import {
  getDashboardOverviewHandler,
  getDashboardStatsHandler,
  getDashboardCategorySplitHandler,
  getDashboardRecentProductsHandler,
} from "../controllers/dashboard.controller";
import { protect } from "../middleware/authMiddleware";
import authorize from "../middleware/permissionMiddleware";

const router = Router();

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
router.get(
  "/overview",
  protect,
  authorize("dashboard.read"),
  getDashboardOverviewHandler
);

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
router.get(
  "/stats",
  protect,
  authorize("dashboard.read"),
  getDashboardStatsHandler
);

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
router.get(
  "/category-split",
  protect,
  authorize("dashboard.read"),
  getDashboardCategorySplitHandler
);

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
router.get(
  "/recent-products",
  protect,
  authorize("dashboard.read"),
  getDashboardRecentProductsHandler
);

export default router;
