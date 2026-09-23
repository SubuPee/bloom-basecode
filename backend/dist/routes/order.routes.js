"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_controller_1 = __importDefault(require("../controllers/order.controller"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const permissionMiddleware_1 = __importDefault(require("../middleware/permissionMiddleware"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: E-Commerce Customer Orders and Fulfillment APIs
 */
/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get paginated customer orders
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of orders per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by order number (e.g. BLM-10482 or #BLM-10482), customer name, or email
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - All
 *             - Processing
 *             - Shipped
 *             - Delivered
 *             - Returned
 *             - Cancelled
 *         description: Filter by fulfillment status
 *       - in: query
 *         name: payment
 *         schema:
 *           type: string
 *           enum:
 *             - All payments
 *             - Paid
 *             - Pending
 *             - Refunded
 *             - Failed
 *         description: Filter by payment status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for order filtering (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for order filtering (YYYY-MM-DD)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: "createdAt:desc"
 *         description: Sort field and order (e.g. createdAt:desc, totalAmount:desc)
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *       401:
 *         description: Authentication required
 */
router.get("/", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("orders.read"), order_controller_1.default.getOrders);
/**
 * @swagger
 * /api/admin/orders/stats:
 *   get:
 *     summary: Get order fulfillment and revenue statistics
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics fetched successfully
 *       401:
 *         description: Authentication required
 */
router.get("/stats", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("orders.read"), order_controller_1.default.getOrderStats);
/**
 * @swagger
 * /api/admin/orders/export:
 *   get:
 *     summary: Export orders data (CSV or JSON)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: Export file format
 *     responses:
 *       200:
 *         description: Exported orders file
 *       401:
 *         description: Authentication required
 */
router.get("/export", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("orders.read"), order_controller_1.default.exportOrders);
/**
 * @swagger
 * /api/admin/orders/bulk/status:
 *   post:
 *     summary: Bulk update order fulfillment status
 *     tags:
 *       - Orders
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
 *                 example: ["BLM-10482", "BLM-10481"]
 *               status:
 *                 type: string
 *                 enum: [Processing, Shipped, Delivered, Returned, Cancelled]
 *                 example: Shipped
 *               notes:
 *                 type: string
 *                 example: Batch pickup confirmed by BlueDart courier
 *     responses:
 *       200:
 *         description: Bulk status updated successfully
 *       400:
 *         description: Validation error
 */
router.post("/bulk/status", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("orders.update"), order_controller_1.default.bulkUpdateStatus);
/**
 * @swagger
 * /api/admin/orders:
 *   post:
 *     summary: Create a new customer order
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - customerEmail
 *               - items
 *               - shippingAddress
 *             properties:
 *               orderNumber:
 *                 type: string
 *                 example: BLM-10499
 *               customerName:
 *                 type: string
 *                 example: Aarav Mehta
 *               customerEmail:
 *                 type: string
 *                 example: aarav@example.com
 *               customerPhone:
 *                 type: string
 *                 example: "+91 98765 41082"
 *               customerSegment:
 *                 type: string
 *                 example: VIP
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productName
 *                     - quantity
 *                     - unitPrice
 *                   properties:
 *                     productName:
 *                       type: string
 *                       example: Wireless Headphones
 *                     quantity:
 *                       type: number
 *                       example: 1
 *                     unitPrice:
 *                       type: number
 *                       example: 6999
 *               shippingAddress:
 *                 type: string
 *                 example: Bandra West, Mumbai
 *               paymentStatus:
 *                 type: string
 *                 enum: [Paid, Pending, Refunded, Failed]
 *                 example: Paid
 *               paymentMethod:
 *                 type: string
 *                 example: Credit Card
 *               orderStatus:
 *                 type: string
 *                 enum: [Processing, Shipped, Delivered, Returned, Cancelled]
 *                 example: Processing
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Order number already exists
 */
router.post("/", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("orders.create"), order_controller_1.default.createOrder);
/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: Get order details by ID, order number, or index
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID, order number (e.g. BLM-10482 or #BLM-10482), or 1-based index (e.g. 1)
 *     responses:
 *       200:
 *         description: Order details fetched successfully
 *       404:
 *         description: Order not found
 */
router.get("/:id", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("orders.read"), order_controller_1.default.getOrderById);
/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   patch:
 *     summary: Update order fulfillment status
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID or order number
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
 *                 enum: [Processing, Shipped, Delivered, Returned, Cancelled]
 *                 example: Shipped
 *               notes:
 *                 type: string
 *                 example: Dispatched from Mumbai Central hub
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Order not found
 */
router.patch("/:id/status", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("orders.update"), order_controller_1.default.updateOrderStatus);
/**
 * @swagger
 * /api/admin/orders/{id}/payment:
 *   patch:
 *     summary: Update order payment status
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID or order number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentStatus
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [Paid, Pending, Refunded, Failed]
 *                 example: Paid
 *               notes:
 *                 type: string
 *                 example: Payment verified via Stripe Webhook
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *       400:
 *         description: Invalid payment status
 *       404:
 *         description: Order not found
 */
router.patch("/:id/payment", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("orders.update"), order_controller_1.default.updatePaymentStatus);
/**
 * @swagger
 * /api/admin/orders/{id}/invoice:
 *   get:
 *     summary: Get order invoice details
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID or order number
 *     responses:
 *       200:
 *         description: Invoice data retrieved successfully
 *       404:
 *         description: Order not found
 */
router.get("/:id/invoice", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("orders.read"), order_controller_1.default.getOrderInvoice);
/**
 * @swagger
 * /api/admin/orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID or order number
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
router.delete("/:id", authMiddleware_1.protect, (0, permissionMiddleware_1.default)("orders.delete"), order_controller_1.default.deleteOrder);
exports.default = router;
//# sourceMappingURL=order.routes.js.map