import express, { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import authorize from "../../middleware/permissionMiddleware";
import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  updateBrandStatus,
  deleteBrand,
} from "../../controllers/master/brand.controller";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Brand Master
 *   description: Brand Master management APIs
 */

/**
 * @swagger
 * /api/admin/master/brands:
 *   post:
 *     summary: Create brand
 *     tags:
 *       - Brand Master
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brandCode
 *               - brandName
 *             properties:
 *               brandCode:
 *                 type: string
 *                 example: BRAND001
 *               brandName:
 *                 type: string
 *                 example: Samsung
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *                 example: active
 *
 *     responses:
 *       201:
 *         description: Brand created successfully
 *       400:
 *         description: Validation or duplicate error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Permission denied
 */
router.post(
  "/",
  protect,
  authorize("brands.create"),
  createBrand
);

/**
 * @swagger
 * /api/admin/master/brands:
 *   get:
 *     summary: Get brands
 *     tags:
 *       - Brand Master
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - active
 *             - inactive
 *
 *     responses:
 *       200:
 *         description: Brands retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Permission denied
 */
router.get(
  "/",
  protect,
  authorize("brands.read"),
  getBrands
);

/**
 * @swagger
 * /api/admin/master/brands/{id}:
 *   get:
 *     summary: Get brand by ID
 *     tags:
 *       - Brand Master
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 68b123456789abcdef123456
 *
 *     responses:
 *       200:
 *         description: Brand retrieved successfully
 *       400:
 *         description: Invalid brand ID
 *       404:
 *         description: Brand not found
 */
router.get(
  "/:id",
  protect,
  authorize("brands.read"),
  getBrandById
);

/**
 * @swagger
 * /api/admin/master/brands/{id}:
 *   put:
 *     summary: Update brand
 *     tags:
 *       - Brand Master
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brandCode:
 *                 type: string
 *                 example: BRAND001
 *               brandName:
 *                 type: string
 *                 example: Samsung
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *       400:
 *         description: Validation or duplicate error
 *       404:
 *         description: Brand not found
 */
router.put(
  "/:id",
  protect,
  authorize("brands.update"),
  updateBrand
);

/**
 * @swagger
 * /api/admin/master/brands/{id}/status:
 *   patch:
 *     summary: Update brand status
 *     tags:
 *       - Brand Master
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
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
 *
 *     responses:
 *       200:
 *         description: Brand status updated successfully
 *       400:
 *         description: Invalid status or ID
 *       404:
 *         description: Brand not found
 */
router.patch(
  "/:id/status",
  protect,
  authorize("brands.update"),
  updateBrandStatus
);

/**
 * @swagger
 * /api/admin/master/brands/{id}:
 *   delete:
 *     summary: Delete brand
 *     tags:
 *       - Brand Master
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *       400:
 *         description: Invalid brand ID
 *       404:
 *         description: Brand not found
 */
router.delete(
  "/:id",
  protect,
  authorize("brands.delete"),
  deleteBrand
);

export default router;
