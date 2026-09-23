"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const rateLimiter_middleware_1 = require("../middleware/rateLimiter.middleware");
const router = express_1.default.Router();
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
router.post("/login", rateLimiter_middleware_1.authLimiter, auth_controller_1.default.login);
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
router.get("/me", authMiddleware_1.protect, auth_controller_1.default.getMe);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map