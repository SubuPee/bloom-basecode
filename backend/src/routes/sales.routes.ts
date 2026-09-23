import express, { Router } from "express";
import salesController from "../controllers/sales.controller";
import { protect } from "../middleware/authMiddleware";
import authorize from "../middleware/permissionMiddleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sales
 *   description: Sales, Revenue, and Financial Performance Analytics APIs
 */

/**
 * @swagger
 * /api/admin/sales/overview:
 *   get:
 *     summary: Get complete sales performance dashboard overview
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum:
 *             - this_month
 *             - today
 *             - yesterday
 *             - this_week
 *             - last_month
 *             - this_quarter
 *             - this_year
 *             - all_time
 *           default: this_month
 *         description: Reporting time period
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Custom start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Custom end date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Sales overview fetched successfully
 *       401:
 *         description: Authentication required
 */
router.get("/overview", protect, authorize("sales.read"), salesController.getSalesOverview);
router.get("/", protect, authorize("sales.read"), salesController.getSalesOverview);

/**
 * @swagger
 * /api/admin/sales/metrics:
 *   get:
 *     summary: Get top KPI metric cards (Gross sales, Net revenue, Orders, AOV)
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           default: this_month
 *         description: Reporting period
 *     responses:
 *       200:
 *         description: Sales metrics fetched successfully
 *       401:
 *         description: Authentication required
 */
router.get("/metrics", protect, authorize("sales.read"), salesController.getSalesMetrics);

/**
 * @swagger
 * /api/admin/sales/chart:
 *   get:
 *     summary: Get revenue time-series bars and chart data
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: daily
 *         description: Time-series bucket interval
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           default: this_month
 *     responses:
 *       200:
 *         description: Sales chart data fetched successfully
 *       401:
 *         description: Authentication required
 */
router.get("/chart", protect, authorize("sales.read"), salesController.getSalesChart);

/**
 * @swagger
 * /api/admin/sales/channels:
 *   get:
 *     summary: Get sales breakdown by sales channel
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales channels fetched successfully
 *       401:
 *         description: Authentication required
 */
router.get("/channels", protect, authorize("sales.read"), salesController.getSalesChannels);

/**
 * @swagger
 * /api/admin/sales/top-products:
 *   get:
 *     summary: Get best selling products by revenue and quantity
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top products fetched successfully
 *       401:
 *         description: Authentication required
 */
router.get("/top-products", protect, authorize("sales.read"), salesController.getTopProducts);

/**
 * @swagger
 * /api/admin/sales/customer-mix:
 *   get:
 *     summary: Get customer mix (new vs returning distribution)
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer mix fetched successfully
 *       401:
 *         description: Authentication required
 */
router.get("/customer-mix", protect, authorize("sales.read"), salesController.getCustomerMix);

/**
 * @swagger
 * /api/admin/sales/transactions:
 *   get:
 *     summary: Get paginated sales transactions ledger
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Sales transactions fetched successfully
 *       401:
 *         description: Authentication required
 */
router.get("/transactions", protect, authorize("sales.read"), salesController.getSalesTransactions);

/**
 * @swagger
 * /api/admin/sales/export:
 *   get:
 *     summary: Export sales report to CSV or JSON
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: json
 *     responses:
 *       200:
 *         description: Exported sales report
 *       401:
 *         description: Authentication required
 */
router.get("/export", protect, authorize("sales.read"), salesController.exportSalesReport);

export default router;
