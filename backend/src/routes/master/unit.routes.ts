import express, { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import authorize from "../../middleware/permissionMiddleware";
import {
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  updateUnitStatus,
  deleteUnit,
} from "../../controllers/master/unit.controller";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Unit Master
 *   description: Unit Master management APIs
 */

/**
 * @swagger
 * /api/admin/master/units:
 *   post:
 *     summary: Create unit
 *     tags:
 *       - Unit Master
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - unitCode
 *               - unitName
 *               - symbol
 *               - unitType
 *             properties:
 *               unitCode:
 *                 type: string
 *                 example: UNIT001
 *               unitName:
 *                 type: string
 *                 example: Piece
 *               symbol:
 *                 type: string
 *                 example: PCS
 *               unitType:
 *                 type: string
 *                 enum:
 *                   - quantity
 *                   - weight
 *                   - length
 *                   - volume
 *                   - area
 *                 example: quantity
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *                 example: active
 *     responses:
 *       201:
 *         description: Unit created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Duplicate unit
 */
router.post(
  "/",
  protect,
  authorize("units.create"),
  createUnit
);

/**
 * @swagger
 * /api/admin/master/units:
 *   get:
 *     summary: Get all units
 *     tags:
 *       - Unit Master
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
 *         name: unitType
 *         schema:
 *           type: string
 *           enum:
 *             - quantity
 *             - weight
 *             - length
 *             - volume
 *             - area
 *     responses:
 *       200:
 *         description: Units retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  protect,
  authorize("units.read"),
  getUnits
);

/**
 * @swagger
 * /api/admin/master/units/{id}:
 *   get:
 *     summary: Get unit by ID
 *     tags:
 *       - Unit Master
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
 *         description: Unit retrieved successfully
 *       400:
 *         description: Invalid unit ID
 *       404:
 *         description: Unit not found
 */
router.get(
  "/:id",
  protect,
  authorize("units.read"),
  getUnitById
);

/**
 * @swagger
 * /api/admin/master/units/{id}:
 *   put:
 *     summary: Update unit
 *     tags:
 *       - Unit Master
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
 *               unitCode:
 *                 type: string
 *                 example: UNIT001
 *               unitName:
 *                 type: string
 *                 example: Pieces
 *               symbol:
 *                 type: string
 *                 example: PCS
 *               unitType:
 *                 type: string
 *                 enum:
 *                   - quantity
 *                   - weight
 *                   - length
 *                   - volume
 *                   - area
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *     responses:
 *       200:
 *         description: Unit updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Unit not found
 *       409:
 *         description: Duplicate unit
 */
router.put(
  "/:id",
  protect,
  authorize("units.update"),
  updateUnit
);

/**
 * @swagger
 * /api/admin/master/units/{id}/status:
 *   patch:
 *     summary: Update unit status
 *     tags:
 *       - Unit Master
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
 *         description: Unit status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Unit not found
 */
router.patch(
  "/:id/status",
  protect,
  authorize("units.update"),
  updateUnitStatus
);

/**
 * @swagger
 * /api/admin/master/units/{id}:
 *   delete:
 *     summary: Delete unit
 *     tags:
 *       - Unit Master
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
 *         description: Unit deleted successfully
 *       400:
 *         description: Invalid unit ID
 *       404:
 *         description: Unit not found
 */
router.delete(
  "/:id",
  protect,
  authorize("units.delete"),
  deleteUnit
);

export default router;
