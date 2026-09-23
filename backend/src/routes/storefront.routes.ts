import { Router } from "express";
import {
  getStorefrontPreviewHandler,
  getStorefrontHeroHandler,
  getStorefrontProductsHandler,
  getStorefrontHighlightsHandler,
  getStorefrontConfigHandler,
  updateStorefrontConfigHandler,
  toggleProductPublishHandler,
} from "../controllers/storefront.controller";
import { protect } from "../middleware/authMiddleware";
import authorize from "../middleware/permissionMiddleware";

const router = Router();

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
router.get(
  "/",
  protect,
  authorize("storefront.read"),
  getStorefrontPreviewHandler
);

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
router.get(
  "/hero",
  protect,
  authorize("storefront.read"),
  getStorefrontHeroHandler
);

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
router.get(
  "/products",
  protect,
  authorize("storefront.read"),
  getStorefrontProductsHandler
);

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
router.get(
  "/highlights",
  protect,
  authorize("storefront.read"),
  getStorefrontHighlightsHandler
);

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
router.get(
  "/config",
  protect,
  authorize("storefront.read"),
  getStorefrontConfigHandler
);

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
router.put(
  "/config",
  protect,
  authorize("storefront.manage"),
  updateStorefrontConfigHandler
);

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
router.post(
  "/products/:id/publish",
  protect,
  authorize("storefront.manage"),
  toggleProductPublishHandler
);

export default router;
