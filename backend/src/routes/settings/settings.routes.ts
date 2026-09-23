import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import {
  getProfile,
  updateProfile,
  updatePassword,
  deleteSession,
} from "../../controllers/settings/profile.controller";
import {
  listNotifications,
  getNotification,
  toggleRead,
  markAllRead,
  deleteNotification,
} from "../../controllers/settings/notification.controller";
import {
  listPreferences,
  savePreferences,
} from "../../controllers/settings/preferences.controller";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  setStatus,
  sendInvite,
  removeUser,
} from "../../controllers/settings/user.controller";
import {
  listRoles,
  getRole,
  addRole,
  editRole,
  removeRole,
} from "../../controllers/settings/role.controller";
import {
  listIntegrations,
  toggle,
  configure,
} from "../../controllers/settings/integration.controller";

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Workspace settings, profile, team members, roles & permissions, alerts, and integrations
 */

const router = Router();

router.use(protect);

// =====================================================
// 1. PROFILE & SECURITY
// =====================================================

/**
 * @swagger
 * /api/settings/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Returns personal details, stats, recent activity log, and active sessions.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
router.get("/profile", getProfile);

/**
 * @swagger
 * /api/settings/profile:
 *   put:
 *     summary: Update profile details
 *     description: Update name, phone, location, timezone, and recovery email.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone: { type: string }
 *               location: { type: string }
 *               timezone: { type: string }
 *               recoveryEmail: { type: string }
 *               twoFactorEnabled: { type: boolean }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put("/profile", updateProfile);

/**
 * @swagger
 * /api/settings/profile/change-password:
 *   patch:
 *     summary: Change user password
 *     description: Changes password after validating current password.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation failed or current password incorrect
 */
router.patch("/profile/change-password", updatePassword);

/**
 * @swagger
 * /api/settings/profile/sessions/{sessionId}:
 *   delete:
 *     summary: Revoke an active session
 *     description: Removes the session from active sessions list.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Session revoked successfully
 */
router.delete("/profile/sessions/:sessionId", deleteSession);

// =====================================================
// 2. NOTIFICATIONS & ALERTS
// =====================================================

/**
 * @swagger
 * /api/settings/notifications:
 *   get:
 *     summary: List notifications
 *     description: Returns workspace alerts with filters and unread count.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [All, Orders, Inventory, Payments, System] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [All, High, Medium, Low] }
 *       - in: query
 *         name: read
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get("/notifications", listNotifications);

/**
 * @swagger
 * /api/settings/notifications/mark-all-read:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch("/notifications/mark-all-read", markAllRead);

/**
 * @swagger
 * /api/settings/notifications/{id}:
 *   get:
 *     summary: Get notification detail
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification details retrieved
 */
router.get("/notifications/:id", getNotification);

/**
 * @swagger
 * /api/settings/notifications/{id}/read:
 *   patch:
 *     summary: Toggle or set notification read state
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               read: { type: boolean, default: true }
 *     responses:
 *       200:
 *         description: Notification read state updated
 */
router.patch("/notifications/:id/read", toggleRead);

/**
 * @swagger
 * /api/settings/notifications/{id}:
 *   delete:
 *     summary: Archive notification
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification archived successfully
 */
router.delete("/notifications/:id", deleteNotification);

// =====================================================
// 3. PREFERENCES / STORE SETTINGS
// =====================================================

/**
 * @swagger
 * /api/settings/preferences:
 *   get:
 *     summary: Get workspace preferences
 *     description: Store identity, regional settings, and alert notification toggles.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences retrieved successfully
 */
router.get("/preferences", listPreferences);

/**
 * @swagger
 * /api/settings/preferences:
 *   put:
 *     summary: Update workspace preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeDetails:
 *                 type: object
 *                 properties:
 *                   storeName: { type: string }
 *                   supportEmail: { type: string }
 *                   supportPhone: { type: string }
 *                   storefrontDomain: { type: string }
 *               regional:
 *                 type: object
 *                 properties:
 *                   currency: { type: string }
 *                   timezone: { type: string }
 *                   dateFormat: { type: string }
 *                   weightUnit: { type: string }
 *               notificationPreferences:
 *                 type: object
 *                 properties:
 *                   orders: { type: boolean }
 *                   stock: { type: boolean }
 *                   payouts: { type: boolean }
 *                   reviews: { type: boolean }
 *                   security: { type: boolean }
 *     responses:
 *       200:
 *         description: Preferences saved successfully
 */
router.put("/preferences", savePreferences);

// =====================================================
// 4. TEAM USERS MANAGEMENT
// =====================================================

/**
 * @swagger
 * /api/settings/users:
 *   get:
 *     summary: List team members
 *     description: Returns team users with metrics, status, role, and warehouse assignments.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: role
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [All status, Active, Invited, Suspended] }
 *     responses:
 *       200:
 *         description: Team users retrieved successfully
 */
router.get("/users", listUsers);

/**
 * @swagger
 * /api/settings/users:
 *   post:
 *     summary: Invite or create team user
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, role]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               role: { type: string }
 *               warehouseId: { type: string }
 *               warehouseName: { type: string }
 *               sendInvite: { type: boolean, default: true }
 *     responses:
 *       201:
 *         description: Team user invited successfully
 */
router.post("/users", createUser);

/**
 * @swagger
 * /api/settings/users/{id}:
 *   get:
 *     summary: Get user details
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User retrieved successfully
 */
router.get("/users/:id", getUser);

/**
 * @swagger
 * /api/settings/users/{id}:
 *   put:
 *     summary: Update team user
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               role: { type: string }
 *               warehouseId: { type: string }
 *               warehouseName: { type: string }
 *               status: { type: string, enum: [active, inactive, suspended] }
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put("/users/:id", updateUser);

/**
 * @swagger
 * /api/settings/users/{id}/status:
 *   patch:
 *     summary: Toggle user status (Active / Suspended)
 *     tags: [Settings]
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
 *               status: { type: string, enum: [Active, Suspended, Invited] }
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.patch("/users/:id/status", setStatus);

/**
 * @swagger
 * /api/settings/users/{id}/resend-invite:
 *   post:
 *     summary: Resend invitation email to user
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invitation resent successfully
 */
router.post("/users/:id/resend-invite", sendInvite);

/**
 * @swagger
 * /api/settings/users/{id}:
 *   delete:
 *     summary: Delete team user
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete("/users/:id", removeUser);

// =====================================================
// 5. ROLES & PERMISSIONS
// =====================================================

/**
 * @swagger
 * /api/settings/roles:
 *   get:
 *     summary: List all roles
 *     description: Returns roles with scope, members count, and 11-module permission matrix.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 */
router.get("/roles", listRoles);

/**
 * @swagger
 * /api/settings/roles:
 *   post:
 *     summary: Create custom role
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               scope: { type: string }
 *               modulePermissions: { type: object }
 *     responses:
 *       201:
 *         description: Role created successfully
 */
router.post("/roles", addRole);

/**
 * @swagger
 * /api/settings/roles/{id}:
 *   get:
 *     summary: Get role details
 *     description: Returns role with permission matrix and assigned team members.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Role details retrieved successfully
 */
router.get("/roles/:id", getRole);

/**
 * @swagger
 * /api/settings/roles/{id}:
 *   put:
 *     summary: Update role
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               scope: { type: string }
 *               modulePermissions: { type: object }
 *     responses:
 *       200:
 *         description: Role updated successfully
 */
router.put("/roles/:id", editRole);

/**
 * @swagger
 * /api/settings/roles/{id}:
 *   delete:
 *     summary: Delete role
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Role deleted successfully
 */
router.delete("/roles/:id", removeRole);

// =====================================================
// 6. INTEGRATIONS
// =====================================================

/**
 * @swagger
 * /api/settings/integrations:
 *   get:
 *     summary: List integrations
 *     description: Third-party services (Razorpay, Shiprocket, Mailchimp, Google Analytics, WhatsApp, Tally).
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Integrations retrieved successfully
 */
router.get("/integrations", listIntegrations);

/**
 * @swagger
 * /api/settings/integrations/{id}/toggle:
 *   patch:
 *     summary: Connect or disconnect an integration
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Integration status toggled
 */
router.patch("/integrations/:id/toggle", toggle);

/**
 * @swagger
 * /api/settings/integrations/{id}:
 *   put:
 *     summary: Configure integration credentials
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               detail: { type: string }
 *               config: { type: object }
 *               status: { type: string, enum: [Connected, Not connected] }
 *     responses:
 *       200:
 *         description: Integration configured successfully
 */
router.put("/integrations/:id", configure);

export default router;
