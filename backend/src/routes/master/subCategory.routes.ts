import express, { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import authorize from "../../middleware/permissionMiddleware";
import {
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  updateSubCategoryStatus,
  deleteSubCategory,
} from "../../controllers/master/subCategory.controller";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sub Category Master
 *   description: Sub Category Master management APIs
 */

/**
 * @swagger
 * /api/admin/master/sub-categories:
 *   post:
 *     summary: Create sub category
 *     tags:
 *       - Sub Category Master
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
 *               - subCategoryCode
 *               - subCategoryName
 *               - category
 *             properties:
 *               subCategoryCode:
 *                 type: string
 *                 example: SUBCAT001
 *               subCategoryName:
 *                 type: string
 *                 example: Mobile Phones
 *               category:
 *                 type: string
 *                 example: 68b123456789abcdef123456
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *                 example: active
 *
 *     responses:
 *       201:
 *         description: Sub category created successfully
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
  authorize("subcategories.create"),
  createSubCategory
);

/**
 * @swagger
 * /api/admin/master/sub-categories:
 *   get:
 *     summary: Get sub categories
 *     tags:
 *       - Sub Category Master
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
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Sub categories retrieved successfully
 */
router.get(
  "/",
  protect,
  authorize("subcategories.read"),
  getSubCategories
);

/**
 * @swagger
 * /api/admin/master/sub-categories/{id}:
 *   get:
 *     summary: Get sub category by ID
 *     tags:
 *       - Sub Category Master
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
 *         description: Sub category retrieved successfully
 *       404:
 *         description: Sub category not found
 */
router.get(
  "/:id",
  protect,
  authorize("subcategories.read"),
  getSubCategoryById
);

/**
 * @swagger
 * /api/admin/master/sub-categories/{id}:
 *   put:
 *     summary: Update sub category
 *     tags:
 *       - Sub Category Master
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/:id",
  protect,
  authorize("subcategories.update"),
  updateSubCategory
);

/**
 * @swagger
 * /api/admin/master/sub-categories/{id}/status:
 *   patch:
 *     summary: Update sub category status
 *     tags:
 *       - Sub Category Master
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *                 example: inactive
 */
router.patch(
  "/:id/status",
  protect,
  authorize("subcategories.update"),
  updateSubCategoryStatus
);

/**
 * @swagger
 * /api/admin/master/sub-categories/{id}:
 *   delete:
 *     summary: Delete sub category
 *     tags:
 *       - Sub Category Master
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:id",
  protect,
  authorize("subcategories.delete"),
  deleteSubCategory
);

export default router;
