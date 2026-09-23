"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const permissionMiddleware_1 = __importDefault(require("../../middleware/permissionMiddleware"));
const tax_controller_1 = require("../../controllers/master/tax.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Tax Master
 *   description: Tax Master management APIs
 */
/**
 * @swagger
 * /api/admin/master/taxes:
 *   post:
 *     summary: Create tax
 *     tags:
 *       - Tax Master
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taxCode
 *               - taxName
 *               - taxRate
 *               - taxType
 *             properties:
 *               taxCode:
 *                 type: string
 *                 example: GST18
 *               taxName:
 *                 type: string
 *                 example: GST 18%
 *               taxRate:
 *                 type: number
 *                 example: 18
 *               taxType:
 *                 type: string
 *                 enum:
 *                   - percentage
 *                   - fixed
 *                 example: percentage
 *               description:
 *                 type: string
 *                 example: GST applicable at 18%
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *                 example: active
 *     responses:
 *       201:
 *         description: Tax created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Duplicate tax
 */
router.post("/", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("taxes.create"), tax_controller_1.createTax);
/**
 * @swagger
 * /api/admin/master/taxes:
 *   get:
 *     summary: Get all taxes
 *     tags:
 *       - Tax Master
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
 *         name: taxType
 *         schema:
 *           type: string
 *           enum:
 *             - percentage
 *             - fixed
 *     responses:
 *       200:
 *         description: Taxes retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("taxes.read"), tax_controller_1.getTaxes);
/**
 * @swagger
 * /api/admin/master/taxes/{id}:
 *   get:
 *     summary: Get tax by ID
 *     tags:
 *       - Tax Master
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
 *         description: Tax retrieved successfully
 *       400:
 *         description: Invalid tax ID
 *       404:
 *         description: Tax not found
 */
router.get("/:id", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("taxes.read"), tax_controller_1.getTaxById);
/**
 * @swagger
 * /api/admin/master/taxes/{id}:
 *   put:
 *     summary: Update tax
 *     tags:
 *       - Tax Master
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
 *               taxCode:
 *                 type: string
 *                 example: GST18
 *               taxName:
 *                 type: string
 *                 example: GST 18%
 *               taxRate:
 *                 type: number
 *                 example: 18
 *               taxType:
 *                 type: string
 *                 enum:
 *                   - percentage
 *                   - fixed
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *     responses:
 *       200:
 *         description: Tax updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Tax not found
 *       409:
 *         description: Duplicate tax
 */
router.put("/:id", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("taxes.update"), tax_controller_1.updateTax);
/**
 * @swagger
 * /api/admin/master/taxes/{id}/status:
 *   patch:
 *     summary: Update tax status
 *     tags:
 *       - Tax Master
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
 *         description: Tax status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Tax not found
 */
router.patch("/:id/status", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("taxes.update"), tax_controller_1.updateTaxStatus);
/**
 * @swagger
 * /api/admin/master/taxes/{id}:
 *   delete:
 *     summary: Delete tax
 *     tags:
 *       - Tax Master
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
 *         description: Tax deleted successfully
 *       400:
 *         description: Invalid tax ID
 *       404:
 *         description: Tax not found
 */
router.delete("/:id", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("taxes.delete"), tax_controller_1.deleteTax);
exports.default = router;
//# sourceMappingURL=tax.routes.js.map