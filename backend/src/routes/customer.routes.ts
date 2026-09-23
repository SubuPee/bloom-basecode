import { Router } from "express";
import {
  getCustomerStatsHandler,
  getCustomersHandler,
  getCustomerByIdHandler,
  getCustomerOrdersHandler,
  createCustomerHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
  exportCustomersHandler,
} from "../controllers/customer.controller";
import { protect } from "../middleware/authMiddleware";
import authorize from "../middleware/permissionMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management, profiles, KPI metrics, purchase history and segments
 */

/**
 * @swagger
 * /api/customers/stats:
 *   get:
 *     summary: Get customer KPI statistics and card metrics
 *     description: Returns top summary cards including total customers, new this month, returning customers %, and average lifetime value.
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer metrics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/stats",
  protect,
  authorize("customers.read"),
  getCustomerStatsHandler
);

/**
 * @swagger
 * /api/customers/export:
 *   get:
 *     summary: Export customers directory
 *     description: Export all or filtered customers in CSV or JSON format.
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: json
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: segment
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customers exported successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/export",
  protect,
  authorize("customers.read"),
  exportCustomersHandler
);

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: List customers with filtering, search, and pagination
 *     description: Retrieve paginated customer records with optional search query, segment filtering, and status filtering.
 *     tags: [Customers]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, customerCode, phone, or city
 *       - in: query
 *         name: segment
 *         schema:
 *           type: string
 *           enum: [All segments, VIP, Returning, New, At risk]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [All statuses, Active, Inactive]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, totalSpent, ordersCount, name]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Customers list retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  protect,
  authorize("customers.read"),
  getCustomersHandler
);

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer profile
 *     description: Register a new customer in the catalog.
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Aarav Mehta"
 *               email:
 *                 type: string
 *                 example: "aarav@example.com"
 *               phone:
 *                 type: string
 *                 example: "+91 98765 41082"
 *               city:
 *                 type: string
 *                 example: "Mumbai"
 *               address:
 *                 type: string
 *                 example: "Bandra West, Mumbai"
 *               segment:
 *                 type: string
 *                 enum: [VIP, Returning, New, At risk]
 *                 default: "New"
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *                 default: "Active"
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or customer code already exists
 */
router.post(
  "/",
  protect,
  authorize("customers.create"),
  createCustomerHandler
);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer details by ID or code
 *     description: Retrieve detailed customer profile including contact info, customer value metrics, preferences, order history, and addresses.
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId or customer code (e.g. CUS-2048) or email
 *     responses:
 *       200:
 *         description: Customer details retrieved successfully
 *       404:
 *         description: Customer not found
 */
router.get(
  "/:id",
  protect,
  authorize("customers.read"),
  getCustomerByIdHandler
);

/**
 * @swagger
 * /api/customers/{id}/orders:
 *   get:
 *     summary: Get customer order history
 *     description: Retrieve paginated order history records for a specific customer.
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Customer orders retrieved successfully
 *       404:
 *         description: Customer not found
 */
router.get(
  "/:id/orders",
  protect,
  authorize("customers.read"),
  getCustomerOrdersHandler
);

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update customer details
 *     description: Update customer profile, contact information, segment, preferences, or status.
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               city:
 *                 type: string
 *               address:
 *                 type: string
 *               segment:
 *                 type: string
 *                 enum: [VIP, Returning, New, At risk]
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Customer not found
 */
router.put(
  "/:id",
  protect,
  authorize("customers.update"),
  updateCustomerHandler
);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete customer profile
 *     description: Remove a customer if there are no pending or active orders.
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       400:
 *         description: Customer has active pending orders
 *       404:
 *         description: Customer not found
 */
router.delete(
  "/:id",
  protect,
  authorize("customers.delete"),
  deleteCustomerHandler
);

export default router;
