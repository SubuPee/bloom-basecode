import { Router } from "express";
import {
  getPlatformOverviewHandler,
  getOffersHandler,
  getOfferByIdHandler,
  createOfferHandler,
  updateOfferHandler,
  deleteOfferHandler,
  getTransactionsHandler,
  getPayoutsHandler,
  getRefundsHandler,
  getReviewsHandler,
  createReviewHandler,
  updateReviewStatusHandler,
  deleteReviewHandler,
  getTicketsHandler,
  createTicketHandler,
  updateTicketStatusHandler,
  deleteTicketHandler,
  getShippingZonesHandler,
  updateShippingZonesHandler,
} from "../controllers/platform.controller";
import { protect } from "../middleware/authMiddleware";
import authorize from "../middleware/permissionMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Platform
 *   description: B2C Control Centre operations, promotional coupons, payments, customer reviews, and support tickets
 */

// -----------------------------------------------------
// 1. OVERVIEW
// -----------------------------------------------------

/**
 * @swagger
 * /api/platform/overview:
 *   get:
 *     summary: Get B2C Control Centre overview
 *     description: Retrieve executive metrics (revenue today, orders today, new B2C users, conversion rate), recent transactions, active offers, review feed, and support tickets.
 *     tags: [Platform]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Control Centre overview retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/overview",
  protect,
  authorize("platform.read"),
  getPlatformOverviewHandler
);

// -----------------------------------------------------
// 2. OFFERS & COUPONS
// -----------------------------------------------------

/**
 * @swagger
 * /api/platform/offers:
 *   get:
 *     summary: Get promotional offers & coupons
 *     description: Retrieve list of discount codes and campaigns with tab status and search filtering.
 *     tags: [Platform]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tab
 *         schema:
 *           type: string
 *           enum: [All, Active, Scheduled, Expired]
 *         description: Filter by campaign lifecycle status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by coupon code or title
 *     responses:
 *       200:
 *         description: Offers retrieved successfully
 */
router.get(
  "/offers",
  protect,
  authorize("platform.read"),
  getOffersHandler
);

/**
 * @swagger
 * /api/platform/offers/{id}:
 *   get:
 *     summary: Get offer by ID
 *     description: Retrieve single offer details by ID.
 *     tags: [Platform]
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
 *         description: Offer details retrieved successfully
 *       404:
 *         description: Offer not found
 */
router.get(
  "/offers/:id",
  protect,
  authorize("platform.read"),
  getOfferByIdHandler
);

/**
 * @swagger
 * /api/platform/offers:
 *   post:
 *     summary: Create new promotional offer
 *     description: Add a new discount campaign, coupon code, or BOGO promotion.
 *     tags: [Platform]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - title
 *               - value
 *             properties:
 *               code:
 *                 type: string
 *                 example: FESTIVE30
 *               title:
 *                 type: string
 *                 example: Festive season 30% off
 *               type:
 *                 type: string
 *                 enum: [Percent, Flat, Free shipping, BOGO]
 *                 example: Percent
 *               value:
 *                 type: string
 *                 example: 30%
 *               minOrder:
 *                 type: number
 *                 example: 999
 *               limit:
 *                 type: number
 *                 example: 2500
 *               status:
 *                 type: string
 *                 enum: [Active, Scheduled, Expired]
 *                 example: Active
 *               window:
 *                 type: string
 *                 example: 01 – 31 Oct 2026
 *               audience:
 *                 type: string
 *                 example: All customers
 *     responses:
 *       201:
 *         description: Offer created successfully
 *       400:
 *         description: Bad request or duplicate code
 */
router.post(
  "/offers",
  protect,
  authorize("platform.create"),
  createOfferHandler
);

/**
 * @swagger
 * /api/platform/offers/{id}:
 *   put:
 *     summary: Update offer
 *     description: Update an existing promotional campaign by ID.
 *     tags: [Platform]
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
 *         description: Offer updated successfully
 *       404:
 *         description: Offer not found
 */
router.put(
  "/offers/:id",
  protect,
  authorize("platform.update"),
  updateOfferHandler
);

/**
 * @swagger
 * /api/platform/offers/{id}:
 *   delete:
 *     summary: Delete offer
 *     description: Soft-delete an existing promotional campaign by ID.
 *     tags: [Platform]
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
 *         description: Offer deleted successfully
 *       404:
 *         description: Offer not found
 */
router.delete(
  "/offers/:id",
  protect,
  authorize("platform.delete"),
  deleteOfferHandler
);

// -----------------------------------------------------
// 3. PAYMENTS, PAYOUTS & REFUNDS
// -----------------------------------------------------

/**
 * @swagger
 * /api/platform/payments/transactions:
 *   get:
 *     summary: Get B2C payment transactions
 *     description: Retrieve customer payments, payment gateways, and settlement states.
 *     tags: [Platform]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [All status, Captured, Pending, Refunded, Failed]
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [All methods, UPI, Card, Netbanking, COD, Wallet]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment transactions retrieved successfully
 */
router.get(
  "/payments/transactions",
  protect,
  authorize("platform.read"),
  getTransactionsHandler
);
router.get(
  "/transactions",
  protect,
  authorize("platform.read"),
  getTransactionsHandler
);

/**
 * @swagger
 * /api/platform/payments/payouts:
 *   get:
 *     summary: Get merchant settlement payouts
 *     description: Retrieve weekly payout batches, fees, refunds, and bank accounts.
 *     tags: [Platform]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payouts retrieved successfully
 */
router.get(
  "/payments/payouts",
  protect,
  authorize("platform.read"),
  getPayoutsHandler
);
router.get(
  "/payouts",
  protect,
  authorize("platform.read"),
  getPayoutsHandler
);

/**
 * @swagger
 * /api/platform/payments/refunds:
 *   get:
 *     summary: Get customer refunds
 *     description: Retrieve refund claims, reasons, and settlement status.
 *     tags: [Platform]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Refunds retrieved successfully
 */
router.get(
  "/payments/refunds",
  protect,
  authorize("platform.read"),
  getRefundsHandler
);
router.get(
  "/refunds",
  protect,
  authorize("platform.read"),
  getRefundsHandler
);

// -----------------------------------------------------
// 4. REVIEWS & RATINGS MODERATION
// -----------------------------------------------------

/**
 * @swagger
 * /api/platform/reviews:
 *   get:
 *     summary: Get customer product reviews
 *     description: List shopper reviews with moderation status filter.
 *     tags: [Platform]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 */
router.get(
  "/reviews",
  protect,
  authorize("platform.read"),
  getReviewsHandler
);

/**
 * @swagger
 * /api/platform/reviews:
 *   post:
 *     summary: Create customer review
 *     description: Submit a new product review and rating.
 *     tags: [Platform]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product
 *               - customer
 *               - rating
 *               - text
 *             properties:
 *               product:
 *                 type: string
 *               customer:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review submitted successfully
 */
router.post(
  "/reviews",
  protect,
  authorize("platform.create"),
  createReviewHandler
);

/**
 * @swagger
 * /api/platform/reviews/{id}/status:
 *   put:
 *     summary: Moderate review status
 *     description: Approve or reject a customer product review.
 *     tags: [Platform]
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
 *                 enum: [Pending, Approved, Rejected]
 *     responses:
 *       200:
 *         description: Review status updated successfully
 */
router.put(
  "/reviews/:id/status",
  protect,
  authorize("platform.update"),
  updateReviewStatusHandler
);
router.patch(
  "/reviews/:id/status",
  protect,
  authorize("platform.update"),
  updateReviewStatusHandler
);

/**
 * @swagger
 * /api/platform/reviews/{id}:
 *   delete:
 *     summary: Delete review
 *     description: Remove a customer product review.
 *     tags: [Platform]
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
 *         description: Review deleted successfully
 */
router.delete(
  "/reviews/:id",
  protect,
  authorize("platform.delete"),
  deleteReviewHandler
);

// -----------------------------------------------------
// 5. SUPPORT TICKETS
// -----------------------------------------------------

/**
 * @swagger
 * /api/platform/tickets:
 *   get:
 *     summary: Get customer support tickets
 *     description: Retrieve tickets from customer operations.
 *     tags: [Platform]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, In progress, Resolved, Closed]
 *     responses:
 *       200:
 *         description: Support tickets retrieved successfully
 */
router.get(
  "/tickets",
  protect,
  authorize("platform.read"),
  getTicketsHandler
);

/**
 * @swagger
 * /api/platform/tickets:
 *   post:
 *     summary: Create support ticket
 *     description: Open a new customer service ticket.
 *     tags: [Platform]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - customer
 *             properties:
 *               subject:
 *                 type: string
 *               customer:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [High, Medium, Low]
 *     responses:
 *       201:
 *         description: Support ticket created successfully
 */
router.post(
  "/tickets",
  protect,
  authorize("platform.create"),
  createTicketHandler
);

/**
 * @swagger
 * /api/platform/tickets/{id}/status:
 *   put:
 *     summary: Update ticket status
 *     description: Transition ticket lifecycle state (Open, In progress, Resolved, Closed).
 *     tags: [Platform]
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
 *                 enum: [Open, In progress, Resolved, Closed]
 *     responses:
 *       200:
 *         description: Ticket status updated successfully
 */
router.put(
  "/tickets/:id/status",
  protect,
  authorize("platform.update"),
  updateTicketStatusHandler
);
router.patch(
  "/tickets/:id/status",
  protect,
  authorize("platform.update"),
  updateTicketStatusHandler
);

/**
 * @swagger
 * /api/platform/tickets/{id}:
 *   delete:
 *     summary: Delete ticket
 *     description: Remove a support ticket.
 *     tags: [Platform]
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
 *         description: Support ticket deleted successfully
 */
router.delete(
  "/tickets/:id",
  protect,
  authorize("platform.delete"),
  deleteTicketHandler
);

// -----------------------------------------------------
// 6. SHIPPING ZONES
// -----------------------------------------------------

/**
 * @swagger
 * /api/platform/shipping-zones:
 *   get:
 *     summary: Get shipping zones and delivery rules
 *     description: Retrieve active B2C delivery zones, ETAs, and courier partner rules.
 *     tags: [Platform]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shipping zones retrieved successfully
 */
router.get(
  "/shipping-zones",
  protect,
  authorize("platform.read"),
  getShippingZonesHandler
);

/**
 * @swagger
 * /api/platform/shipping-zones:
 *   put:
 *     summary: Update shipping zones
 *     description: Replace or configure B2C shipping zones and delivery partner rules.
 *     tags: [Platform]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - zones
 *             properties:
 *               zones:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     zone:
 *                       type: string
 *                     rate:
 *                       type: string
 *                     eta:
 *                       type: string
 *                     partners:
 *                       type: string
 *     responses:
 *       200:
 *         description: Shipping zones updated successfully
 */
router.put(
  "/shipping-zones",
  protect,
  authorize("platform.update"),
  updateShippingZonesHandler
);

export default router;
