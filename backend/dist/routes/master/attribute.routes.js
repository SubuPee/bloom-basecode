"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const permissionMiddleware_1 = __importDefault(require("../../middleware/permissionMiddleware"));
const attribute_controller_1 = require("../../controllers/master/attribute.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Attribute Master
 *   description: Attribute Master management APIs
 */
/**
 * @swagger
 * /api/admin/master/attributes:
 *   post:
 *     summary: Create attribute
 *     tags:
 *       - Attribute Master
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attributeCode
 *               - attributeName
 *             properties:
 *               attributeCode:
 *                 type: string
 *                 example: COLOR
 *               attributeName:
 *                 type: string
 *                 example: Color
 *               displayType:
 *                 type: string
 *                 enum:
 *                   - dropdown
 *                   - radio
 *                   - checkbox
 *                   - text
 *                   - color
 *                 example: dropdown
 *               values:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: string
 *                       example: Red
 *                     status:
 *                       type: string
 *                       enum:
 *                         - active
 *                         - inactive
 *                       example: active
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *                 example: active
 *     responses:
 *       201:
 *         description: Attribute created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Duplicate attribute
 */
router.post("/", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("attributes.create"), attribute_controller_1.createAttribute);
/**
 * @swagger
 * /api/admin/master/attributes:
 *   get:
 *     summary: Get all attributes
 *     tags:
 *       - Attribute Master
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
 *         name: displayType
 *         schema:
 *           type: string
 *           enum:
 *             - dropdown
 *             - radio
 *             - checkbox
 *             - text
 *             - color
 *     responses:
 *       200:
 *         description: Attributes retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("attributes.read"), attribute_controller_1.getAttributes);
/**
 * @swagger
 * /api/admin/master/attributes/{id}:
 *   get:
 *     summary: Get attribute by ID
 *     tags:
 *       - Attribute Master
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
 *         description: Attribute retrieved successfully
 *       400:
 *         description: Invalid attribute ID
 *       404:
 *         description: Attribute not found
 */
router.get("/:id", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("attributes.read"), attribute_controller_1.getAttributeById);
/**
 * @swagger
 * /api/admin/master/attributes/{id}:
 *   put:
 *     summary: Update attribute
 *     tags:
 *       - Attribute Master
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
 *               attributeCode:
 *                 type: string
 *               attributeName:
 *                 type: string
 *               displayType:
 *                 type: string
 *                 enum:
 *                   - dropdown
 *                   - radio
 *                   - checkbox
 *                   - text
 *                   - color
 *               values:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum:
 *                         - active
 *                         - inactive
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *     responses:
 *       200:
 *         description: Attribute updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Attribute not found
 *       409:
 *         description: Duplicate attribute
 */
router.put("/:id", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("attributes.update"), attribute_controller_1.updateAttribute);
/**
 * @swagger
 * /api/admin/master/attributes/{id}/status:
 *   patch:
 *     summary: Update attribute status
 *     tags:
 *       - Attribute Master
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
 *         description: Attribute status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Attribute not found
 */
router.patch("/:id/status", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("attributes.update"), attribute_controller_1.updateAttributeStatus);
/**
 * @swagger
 * /api/admin/master/attributes/{id}:
 *   delete:
 *     summary: Delete attribute
 *     tags:
 *       - Attribute Master
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
 *         description: Attribute deleted successfully
 *       400:
 *         description: Invalid attribute ID
 *       404:
 *         description: Attribute not found
 */
router.delete("/:id", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("attributes.delete"), attribute_controller_1.deleteAttribute);
exports.default = router;
//# sourceMappingURL=attribute.routes.js.map