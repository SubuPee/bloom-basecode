import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import { listBatches, updateStatus } from "../../controllers/production/productionBatch.controller";

/**
 * @swagger
 * tags:
 *   name: Production
 *   description: Manufacturing work orders, QA output, and inventory inwarding
 */

const router = Router();

router.use(protect);

/**
 * @swagger
 * /api/production/batches:
 *   get:
 *     summary: List production batches
 *     description: Paginated list of batches with status breakdown, active counts, and expiry tracking.
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [All, Active, Consumed, Expired, Quarantined] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Production batches retrieved
 */
router.get("/batches", listBatches);

/**
 * @swagger
 * /api/production/batches/{id}/status:
 *   patch:
 *     summary: Update production batch status
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [Active, Consumed, Expired, Quarantined] }
 *     responses:
 *       200:
 *         description: Batch status updated
 */
router.patch("/batches/:id/status", updateStatus);

export default router;

