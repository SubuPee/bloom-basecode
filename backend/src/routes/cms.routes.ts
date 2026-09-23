import { Router } from "express";
import {
  getCmsStatsHandler,
  getCmsEntriesHandler,
  getStorefrontHeroHandler,
  getCmsEntryByIdHandler,
  createCmsEntryHandler,
  updateCmsEntryHandler,
  deleteCmsEntryHandler,
} from "../controllers/cms.controller";
import { protect } from "../middleware/authMiddleware";
import authorize from "../middleware/permissionMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: CMS
 *   description: Content Management System for storefront pages, campaigns, and editorial assets
 */

/**
 * @swagger
 * /api/cms/stats:
 *   get:
 *     summary: Get CMS overview statistics
 *     description: Retrieve summary metrics including published pages, active campaigns, and reusable sections.
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CMS stats retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/stats",
  protect,
  authorize("cms.read"),
  getCmsStatsHandler
);

/**
 * @swagger
 * /api/cms/hero:
 *   get:
 *     summary: Get live storefront hero banner
 *     description: Retrieve the active published hero banner content for storefront rendering and previews.
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Storefront hero retrieved successfully
 *       404:
 *         description: No active hero found
 */
router.get(
  "/hero",
  protect,
  authorize("cms.read"),
  getStorefrontHeroHandler
);

/**
 * @swagger
 * /api/cms:
 *   get:
 *     summary: List CMS entries with search and filters
 *     description: Retrieve paginated CMS content with search query, content type, and publishing status filters.
 *     tags: [CMS]
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
 *         description: Search by title, type, summary, slug, author, or placement
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [All content types, Homepage banner, Editorial page, Policy page, Campaign, Content page]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [All statuses, Published, Draft, Archived]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [updatedAt, createdAt, title, type, status]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: CMS entries retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  protect,
  authorize("cms.read"),
  getCmsEntriesHandler
);

/**
 * @swagger
 * /api/cms:
 *   post:
 *     summary: Create a new CMS content entry
 *     description: Create a new page, campaign, or banner.
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Diwali Gift Guide"
 *               type:
 *                 type: string
 *                 enum: [Homepage banner, Editorial page, Policy page, Campaign, Content page]
 *                 default: "Content page"
 *               status:
 *                 type: string
 *                 enum: [Published, Draft, Archived]
 *                 default: "Draft"
 *               author:
 *                 type: string
 *                 example: "Alex Morgan"
 *               placement:
 *                 type: string
 *                 example: "Discover · Featured"
 *               summary:
 *                 type: string
 *                 example: "Curated gift bundles for Diwali festive season."
 *               body:
 *                 type: string
 *                 example: "Detailed editorial body content here..."
 *     responses:
 *       201:
 *         description: CMS entry created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Slug already exists
 */
router.post(
  "/",
  protect,
  authorize("cms.create"),
  createCmsEntryHandler
);

/**
 * @swagger
 * /api/cms/{id}:
 *   get:
 *     summary: Get CMS entry details by slug or ID
 *     description: Retrieve detailed CMS entry including storefront preview, publishing metadata, and timeline.
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug (e.g. home-banner) or MongoDB ObjectId
 *     responses:
 *       200:
 *         description: CMS entry details retrieved successfully
 *       404:
 *         description: CMS entry not found
 */
router.get(
  "/:id",
  protect,
  authorize("cms.read"),
  getCmsEntryByIdHandler
);

/**
 * @swagger
 * /api/cms/{id}:
 *   put:
 *     summary: Update CMS entry details
 *     description: Update title, type, status, summary, body, placement, or hero configuration.
 *     tags: [CMS]
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
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Homepage banner, Editorial page, Policy page, Campaign, Content page]
 *               status:
 *                 type: string
 *                 enum: [Published, Draft, Archived]
 *               author:
 *                 type: string
 *               placement:
 *                 type: string
 *               summary:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       200:
 *         description: CMS entry updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: CMS entry not found
 */
router.put(
  "/:id",
  protect,
  authorize("cms.update"),
  updateCmsEntryHandler
);

/**
 * @swagger
 * /api/cms/{id}:
 *   delete:
 *     summary: Delete a CMS content entry
 *     description: Remove a CMS entry by slug or ID.
 *     tags: [CMS]
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
 *         description: CMS entry deleted successfully
 *       404:
 *         description: CMS entry not found
 */
router.delete(
  "/:id",
  protect,
  authorize("cms.delete"),
  deleteCmsEntryHandler
);

export default router;
