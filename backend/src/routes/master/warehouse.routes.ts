import express, { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import authorize from "../../middleware/permissionMiddleware";
import {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  updateWarehouseStatus,
  deleteWarehouse,
} from "../../controllers/master/warehouse.controller";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Warehouse Master
 *   description: Warehouse Master management APIs
 */

/**
 * @swagger
 * /api/admin/master/warehouses:
 *   post:
 *     summary: Create warehouse
 *     tags:
 *       - Warehouse Master
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - warehouseCode
 *               - warehouseName
 *               - addressLine1
 *               - city
 *               - state
 *               - country
 *               - postalCode
 *               - contactPerson
 *               - contactPhone
 *             properties:
 *               warehouseCode:
 *                 type: string
 *                 example: WH001
 *               warehouseName:
 *                 type: string
 *                 example: Main Warehouse
 *               addressLine1:
 *                 type: string
 *                 example: 123 Industrial Area
 *               addressLine2:
 *                 type: string
 *                 example: Building A
 *               city:
 *                 type: string
 *                 example: Delhi
 *               state:
 *                 type: string
 *                 example: Delhi
 *               country:
 *                 type: string
 *                 example: India
 *               postalCode:
 *                 type: string
 *                 example: 110001
 *               contactPerson:
 *                 type: string
 *                 example: Rahul Kumar
 *               contactPhone:
 *                 type: string
 *                 example: 9876543210
 *               email:
 *                 type: string
 *                 example: warehouse@example.com
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *                 example: active
 *     responses:
 *       201:
 *         description: Warehouse created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Duplicate warehouse
 */
router.post(
  "/",
  protect,
  authorize("warehouses.create"),
  createWarehouse
);

/**
 * @swagger
 * /api/admin/master/warehouses:
 *   get:
 *     summary: Get all warehouses
 *     tags:
 *       - Warehouse Master
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - active
 *             - inactive
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouses retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  protect,
  authorize("warehouses.read"),
  getWarehouses
);

/**
 * @swagger
 * /api/admin/master/warehouses/{id}:
 *   get:
 *     summary: Get warehouse by ID
 *     tags:
 *       - Warehouse Master
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
 *         description: Warehouse retrieved successfully
 *       400:
 *         description: Invalid warehouse ID
 *       404:
 *         description: Warehouse not found
 */
router.get(
  "/:id",
  protect,
  authorize("warehouses.read"),
  getWarehouseById
);

/**
 * @swagger
 * /api/admin/master/warehouses/{id}:
 *   put:
 *     summary: Update warehouse
 *     tags:
 *       - Warehouse Master
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
 *               warehouseCode:
 *                 type: string
 *               warehouseName:
 *                 type: string
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               email:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *     responses:
 *       200:
 *         description: Warehouse updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Warehouse not found
 *       409:
 *         description: Duplicate warehouse
 */
router.put(
  "/:id",
  protect,
  authorize("warehouses.update"),
  updateWarehouse
);

/**
 * @swagger
 * /api/admin/master/warehouses/{id}/status:
 *   patch:
 *     summary: Update warehouse status
 *     tags:
 *       - Warehouse Master
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *                 example: inactive
 *     responses:
 *       200:
 *         description: Warehouse status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Warehouse not found
 */
router.patch(
  "/:id/status",
  protect,
  authorize("warehouses.update"),
  updateWarehouseStatus
);

/**
 * @swagger
 * /api/admin/master/warehouses/{id}:
 *   delete:
 *     summary: Delete warehouse
 *     tags:
 *       - Warehouse Master
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
 *         description: Warehouse deleted successfully
 *       400:
 *         description: Invalid warehouse ID
 *       404:
 *         description: Warehouse not found
 */
router.delete(
  "/:id",
  protect,
  authorize("warehouses.delete"),
  deleteWarehouse
);

export default router;
