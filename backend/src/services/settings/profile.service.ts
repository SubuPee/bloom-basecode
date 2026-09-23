import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import User, { IUser } from "../../models/User";
import AppError from "../../errors/AppError";
import httpStatusCodes from "../../constants/httpStatusCodes";

// =====================================================
// GET USER PROFILE & DASHBOARD
// =====================================================
export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId)
    .select("+password")
    .populate("role", "name description scope modulePermissions")
    .populate("warehouseId", "warehouseName warehouseCode");

  if (!user) {
    throw new AppError("User not found", httpStatusCodes.NOT_FOUND);
  }

  // Ensure default sessions if none exist
  if (!user.activeSessions || user.activeSessions.length === 0) {
    user.activeSessions = [
      {
        id: "SES-01",
        device: "MacBook Pro · Chrome",
        place: "Mumbai, IN",
        time: "Active now",
        current: true,
      },
      {
        id: "SES-02",
        device: "iPhone 15 · Safari",
        place: "Mumbai, IN",
        time: "3 hours ago",
        current: false,
      },
      {
        id: "SES-03",
        device: "Windows 11 · Edge",
        place: "Pune, IN",
        time: "2 days ago",
        current: false,
      },
    ];
    await user.save();
  }

  // Ensure default activity if none exist
  if (!user.recentActivity || user.recentActivity.length === 0) {
    user.recentActivity = [
      { title: "Published Monsoon Essentials campaign", time: "Today, 09:40" },
      { title: "Updated Catalog Manager role permissions", time: "Yesterday, 17:35" },
      { title: "Approved refund for order #BLM-10460", time: "16 Sep, 11:20" },
      { title: "Added Pune Hub warehouse", time: "14 Sep, 10:02" },
      { title: "Invited Vikram Iyer to the workspace", time: "12 Sep, 15:48" },
    ];
    await user.save();
  }

  const roleObj = user.role as any;
  const roleName = roleObj?.name || "Administrator";

  const stats = [
    { label: "Orders handled", value: "1,284", icon: "ShoppingCart", tone: "text-blue bg-blue-soft" },
    { label: "Products edited", value: "376", icon: "Package", tone: "text-success bg-success-soft" },
    { label: "Customers assisted", value: "912", icon: "Users", tone: "text-primary bg-primary/15" },
    { label: "Avg. response", value: "4m 12s", icon: "Clock", tone: "text-warning bg-warning-soft" },
  ];

  // Calculate days since password changed
  const pwdChanged = user.passwordChangedAt || user.createdAt || new Date();
  const diffTime = Math.abs(Date.now() - new Date(pwdChanged).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const passwordChangedAgo = `${diffDays} days ago`;

  return {
    id: user._id,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    initials: user.initials,
    email: user.email,
    role: roleName,
    roleScope: roleObj?.scope || "Global",
    status: user.status === "active" ? "Active" : user.status === "suspended" ? "Suspended" : "Invited",
    phone: user.phone || "+91 98200 41122",
    location: user.location || "Mumbai, India",
    timezone: user.timezone || "IST (UTC +5:30)",
    warehouse: user.warehouseName || "All warehouses",
    recoveryEmail: user.recoveryEmail || "a.morgan@gmail.com",
    twoFactorEnabled: user.twoFactorEnabled !== false,
    passwordChangedAgo,
    stats,
    recentActivity: user.recentActivity,
    activeSessions: user.activeSessions,
  };
};

// =====================================================
// UPDATE USER PROFILE
// =====================================================
export const updateUserProfile = async (
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
    timezone?: string;
    recoveryEmail?: string;
    twoFactorEnabled?: boolean;
  }
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", httpStatusCodes.NOT_FOUND);
  }

  if (data.firstName) user.firstName = data.firstName.trim();
  if (data.lastName) user.lastName = data.lastName.trim();
  if (data.phone !== undefined) user.phone = data.phone.trim();
  if (data.location !== undefined) user.location = data.location.trim();
  if (data.timezone !== undefined) user.timezone = data.timezone.trim();
  if (data.recoveryEmail !== undefined) user.recoveryEmail = data.recoveryEmail.trim();
  if (data.twoFactorEnabled !== undefined) user.twoFactorEnabled = Boolean(data.twoFactorEnabled);

  // Add activity log
  user.recentActivity = [
    { title: "Updated profile details", time: "Just now" },
    ...(user.recentActivity || []).slice(0, 9),
  ];

  await user.save();
  return getUserProfile(userId);
};

// =====================================================
// CHANGE PASSWORD
// =====================================================
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError("User not found", httpStatusCodes.NOT_FOUND);
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError("Incorrect current password", httpStatusCodes.BAD_REQUEST);
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.passwordChangedAt = new Date();

  user.recentActivity = [
    { title: "Changed account password", time: "Just now" },
    ...(user.recentActivity || []).slice(0, 9),
  ];

  await user.save();
  return { message: "Password updated successfully" };
};

// =====================================================
// REVOKE SESSION
// =====================================================
export const revokeSession = async (userId: string, sessionId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", httpStatusCodes.NOT_FOUND);
  }

  user.activeSessions = (user.activeSessions || []).filter((s) => s.id !== sessionId);
  await user.save();
  return user.activeSessions;
};
