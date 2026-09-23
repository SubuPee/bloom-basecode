"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storefront_controller_1 = require("../controllers/storefront.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const permissionMiddleware_1 = __importDefault(require("../middleware/permissionMiddleware"));
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Storefront
 *   description: Storefront preview, live catalog, hero campaigns, trust highlights, and configuration
 */
/**
 * @swagger
 * /api/storefront:
 *   get:
 *     summary: Get complete live storefront preview bundle
 *     description: Retrieve all components required to render the storefront preview including store domain, hero campaign, trust highlights, and published catalog products.
 *     tags: [Storefront]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Storefront preview bundle retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("storefront.read"), storefront_controller_1.getStorefrontPreviewHandler);
/**
 * @swagger
 * /api/storefront/hero:
 *   get:
 *     summary: Get storefront hero banner
 *     description: Retrieve active published hero banner content and CTA details for the storefront header.
 *     tags: [Storefront]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hero banner retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/hero", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("storefront.read"), storefront_controller_1.getStorefrontHeroHandler);
/**
 * @swagger
 * /api/storefront/products:
 *   get:
 *     summary: Get published storefront products
 *     description: Retrieve catalog products visible to shoppers on the storefront with pricing and discount calculations.
 *     tags: [Storefront]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search products by name or category
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: Published products retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/products", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("storefront.read"), storefront_controller_1.getStorefrontProductsHandler);
/**
 * @swagger
 * /api/storefront/highlights:
 *   get:
 *     summary: Get storefront trust & policy highlights
 *     description: Retrieve policy feature badges (free delivery threshold, average customer rating, return policy).
 *     tags: [Storefront]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trust highlights retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/highlights", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("storefront.read"), storefront_controller_1.getStorefrontHighlightsHandler);
/**
 * @swagger
 * /api/storefront/config:
 *   get:
 *     summary: Get storefront configuration
 *     description: Retrieve store domain, name, live URL, announcement banner, and SEO settings.
 *     tags: [Storefront]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Storefront config retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/config", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("storefront.read"), storefront_controller_1.getStorefrontConfigHandler);
/**
 * @swagger
 * /api/storefront/config:
 *   put:
 *     summary: Update storefront configuration
 *     description: Update store name, domain, hero banner binding, trust highlights, or announcement banner.
 *     tags: [Storefront]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeName:
 *                 type: string
 *                 example: "bloom.store"
 *               storeDomain:
 *                 type: string
 *                 example: "bloom.store"
 *               heroSlug:
 *                 type: string
 *                 example: "home-banner"
 *               highlights:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     icon: { type: string }
 *                     title: { type: string }
 *                     text: { type: string }
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put("/config", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("storefront.manage"), storefront_controller_1.updateStorefrontConfigHandler);
/**
 * @swagger
 * /api/storefront/products/{id}/publish:
 *   post:
 *     summary: Toggle product publication on storefront
 *     description: Set whether a catalog product is published and visible on the storefront.
 *     tags: [Storefront]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product code or MongoDB ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isPublished
 *             properties:
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Publication status updated successfully
 *       404:
 *         description: Product not found
 */
router.post("/products/:id/publish", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("storefront.manage"), storefront_controller_1.toggleProductPublishHandler);
exports.default = router;
//# sourceMappingURL=storefront.routes.js.map