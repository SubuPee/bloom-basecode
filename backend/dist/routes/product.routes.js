"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = __importDefault(require("../controllers/product.controller"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const permissionMiddleware_1 = __importDefault(require("../middleware/permissionMiddleware"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management APIs
 */
/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     summary: Create a product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - sellingPrice
 *             properties:
 *               productCode:
 *                 type: string
 *                 example: PROD001
 *               productName:
 *                 type: string
 *                 example: Cotton T-Shirt
 *               productType:
 *                 type: string
 *                 enum:
 *                   - simple
 *                   - variable
 *                   - digital
 *                   - service
 *                 example: simple
 *               category:
 *                 type: string
 *                 example: Electronics
 *               subCategory:
 *                 type: string
 *                 nullable: true
 *                 example: Headphones
 *               brand:
 *                 type: string
 *                 nullable: true
 *                 example: Auralink
 *               unit:
 *                 type: string
 *                 example: Piece
 *               hsnSacCode:
 *                 type: string
 *                 example: 6109
 *               barcode:
 *                 type: string
 *                 example: 8901234567890
 *               shortDescription:
 *                 type: string
 *                 example: Comfortable cotton t-shirt
 *               description:
 *                 type: string
 *                 example: Premium quality cotton t-shirt
 *               purchasePrice:
 *                 type: number
 *                 example: 400
 *               sellingPrice:
 *                 type: number
 *                 example: 599
 *               mrp:
 *                 type: number
 *                 example: 799
 *               tax:
 *                 type: string
 *                 nullable: true
 *                 example: GST 18%
 *               reorderLevel:
 *                 type: number
 *                 example: 10
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: https://example.com/tshirt.jpg
 *                     altText:
 *                       type: string
 *                       example: Cotton T-Shirt
 *                     isPrimary:
 *                       type: boolean
 *                       example: true
 *                     sortOrder:
 *                       type: number
 *                       example: 0
 *               hasVariants:
 *                 type: boolean
 *                 example: false
 *               attributes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                 example: []
 *               slug:
 *                 type: string
 *                 example: cotton-t-shirt
 *               metaTitle:
 *                 type: string
 *                 example: Cotton T-Shirt
 *               metaDescription:
 *                 type: string
 *                 example: Buy premium cotton t-shirts.
 *               metaKeywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *               isFeatured:
 *                 type: boolean
 *                 example: false
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *               requiresShipping:
 *                 type: boolean
 *                 example: true
 *               weight:
 *                 type: number
 *                 example: 0.5
 *               weightUnit:
 *                 type: string
 *                 enum:
 *                   - g
 *                   - kg
 *                   - lb
 *                   - oz
 *               length:
 *                 type: number
 *                 example: 30
 *               width:
 *                 type: number
 *                 example: 25
 *               height:
 *                 type: number
 *                 example: 2
 *               dimensionUnit:
 *                 type: string
 *                 enum:
 *                   - cm
 *                   - m
 *                   - in
 *                   - ft
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *                 example: active
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Permission denied
 *       409:
 *         description: Duplicate product data
 */
router.post("/", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("products.create"), product_controller_1.default.createProduct);
/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Get products
 *     tags:
 *       - Products
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
 *         description: Number of products per page
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product code, name, barcode, slug or tag
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
 *         description: Category ID
 *
 *       - in: query
 *         name: subCategory
 *         schema:
 *           type: string
 *         description: Sub category ID
 *
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Brand ID
 *
 *       - in: query
 *         name: productType
 *         schema:
 *           type: string
 *           enum:
 *             - simple
 *             - variable
 *             - digital
 *             - service
 *
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *
 *       - in: query
 *         name: hasVariants
 *         schema:
 *           type: boolean
 *
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Permission denied
 */
router.get("/", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("products.read"), product_controller_1.default.getProducts);
/**
 * @swagger
 * /api/admin/products/stats:
 *   get:
 *     summary: Get product catalog metrics and counts
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Catalog statistics fetched successfully
 */
router.get("/stats", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("products.read"), product_controller_1.default.getProductStats);
/**
 * @swagger
 * /api/admin/products/bulk/status:
 *   post:
 *     summary: Bulk update product status
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *               - status
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft, archived]
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.post("/bulk/status", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("products.update"), product_controller_1.default.bulkUpdateStatus);
/**
 * @swagger
 * /api/admin/products/bulk/publish:
 *   post:
 *     summary: Bulk update product published state
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *               - isPublished
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Published state updated successfully
 */
router.post("/bulk/publish", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("products.update"), product_controller_1.default.bulkUpdatePublish);
/**
 * @swagger
 * /api/admin/products/bulk/delete:
 *   post:
 *     summary: Bulk delete products
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Products deleted successfully
 */
router.post("/bulk/delete", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("products.delete"), product_controller_1.default.bulkDelete);
router.delete("/bulk", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("products.delete"), product_controller_1.default.bulkDelete);
/**
 * @swagger
 * /api/admin/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Product not found
 */
router.get("/:id", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("products.read"), product_controller_1.default.getProductById);
/**
 * @swagger
 * /api/admin/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Product not found
 *       409:
 *         description: Duplicate product data
 */
router.put("/:id", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("products.update"), product_controller_1.default.updateProduct);
/**
 * @swagger
 * /api/admin/products/{id}/status:
 *   patch:
 *     summary: Update product status
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
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
 *         description: Product status updated successfully
 *       400:
 *         description: Invalid status or product ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Product not found
 */
router.patch("/:id/status", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("products.update"), product_controller_1.default.updateProductStatus);
/**
 * @swagger
 * /api/admin/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Product not found
 */
router.delete("/:id", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("products.delete"), product_controller_1.default.deleteProduct);
/**
 * @swagger
 * /api/admin/products/{id}/duplicate:
 *   post:
 *     summary: Duplicate an existing product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       201:
 *         description: Product duplicated successfully
 *       404:
 *         description: Product not found
 */
router.post("/:id/duplicate", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("products.create"), product_controller_1.default.duplicateProduct);
/**
 * @swagger
 * /api/admin/products/{id}/orders:
 *   get:
 *     summary: Get recent orders containing this product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product orders fetched successfully
 *       404:
 *         description: Product not found
 */
router.get("/:id/orders", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("products.read"), product_controller_1.default.getProductOrders);
exports.default = router;
//# sourceMappingURL=product.routes.js.map