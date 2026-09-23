"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_controller_1 = __importDefault(require("../../controllers/master/category.controller"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const permissionMiddleware_1 = __importDefault(require("../../middleware/permissionMiddleware"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Category Master
 *   description: Category management APIs
 */
/**
 * @swagger
 * /api/admin/master/categories:
 *   post:
 *     summary: Create a category
 *     tags:
 *       - Category Master
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryCode
 *               - categoryName
 *             properties:
 *               categoryCode:
 *                 type: string
 *                 example: CAT001
 *               categoryName:
 *                 type: string
 *                 example: Electronics
 *               parentCategory:
 *                 type: string
 *                 nullable: true
 *                 example: 65f1a1234567890123456789
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *                 example: active
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Permission denied
 *       409:
 *         description: Duplicate category
 */
router.post("/", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("categories.create"), category_controller_1.default.createCategory);
/**
 * @swagger
 * /api/admin/master/categories:
 *   get:
 *     summary: Get categories
 *     tags:
 *       - Category Master
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by category code or category name
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
 *         name: parentCategory
 *         schema:
 *           type: string
 *         description: Parent category ID
 *
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Permission denied
 */
router.get("/", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("categories.read"), category_controller_1.default.getCategories);
/**
 * @swagger
 * /api/admin/master/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags:
 *       - Category Master
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *       400:
 *         description: Invalid category ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Category not found
 */
router.get("/:id", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("categories.read"), category_controller_1.default.getCategoryById);
/**
 * @swagger
 * /api/admin/master/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags:
 *       - Category Master
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryCode:
 *                 type: string
 *                 example: CAT001
 *               categoryName:
 *                 type: string
 *                 example: Electronics
 *               parentCategory:
 *                 type: string
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Category not found
 *       409:
 *         description: Duplicate category
 */
router.put("/:id", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("categories.update"), category_controller_1.default.updateCategory);
/**
 * @swagger
 * /api/admin/master/categories/{id}/status:
 *   patch:
 *     summary: Update category status
 *     tags:
 *       - Category Master
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
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
 *                 example: active
 *     responses:
 *       200:
 *         description: Category status updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Category not found
 */
router.patch("/:id/status", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("categories.update"), category_controller_1.default.updateCategoryStatus);
/**
 * @swagger
 * /api/admin/master/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags:
 *       - Category Master
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Invalid category ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Category not found
 */
router.delete("/:id", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("categories.delete"), category_controller_1.default.deleteCategory);
exports.default = router;
//# sourceMappingURL=category.routes.js.map