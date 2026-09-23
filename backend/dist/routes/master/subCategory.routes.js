"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const permissionMiddleware_1 = __importDefault(require("../../middleware/permissionMiddleware"));
const subCategory_controller_1 = require("../../controllers/master/subCategory.controller");
const router = express_1.default.Router();
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
router.post("/", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("subcategories.create"), subCategory_controller_1.createSubCategory);
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
router.get("/", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("subcategories.read"), subCategory_controller_1.getSubCategories);
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
router.get("/:id", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("subcategories.read"), subCategory_controller_1.getSubCategoryById);
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
router.put("/:id", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("subcategories.update"), subCategory_controller_1.updateSubCategory);
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
router.patch("/:id/status", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("subcategories.update"), subCategory_controller_1.updateSubCategoryStatus);
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
router.delete("/:id", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("subcategories.delete"), subCategory_controller_1.deleteSubCategory);
exports.default = router;
//# sourceMappingURL=subCategory.routes.js.map