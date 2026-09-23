import express, { Router } from "express";
import authController from "../controllers/auth.controller";
import { protect } from "../middleware/authMiddleware";
import { authLimiter } from "../middleware/rateLimiter.middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Administrative login and session APIs
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticate a Supervision admin user with brute-force rate limit protection.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account is not active
 *       429:
 *         description: Too many login attempts
 */
router.post("/login", authLimiter, authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current admin
 *     description: Get the currently authenticated Supervision user.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Unauthorized
 */
router.get("/me", protect, authController.getMe);

export default router;
