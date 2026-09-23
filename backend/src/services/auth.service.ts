import User from "../models/User";
import { UnauthorizedError, ForbiddenError } from "../errors/AppError";
import { generateToken } from "../utils/jwt";
import { LoginDto, AuthUserResponse, AuthenticatedUser } from "../types/common.types";

export interface LoginResult {
  token: string;
  user: AuthUserResponse;
}

// =====================================================
// AUTHENTICATION SERVICE (Single Responsibility - Business Logic)
// =====================================================

export const loginAdmin = async ({ email, password }: LoginDto): Promise<LoginResult> => {
  const user = await User.findOne({ email })
    .select("+password")
    .populate({
      path: "role",
      populate: {
        path: "permissions",
      },
    });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const role: any = user.role;
  if (!role) {
    throw new ForbiddenError("User role is not configured");
  }

  if (user.status !== "active") {
    throw new ForbiddenError("Your account is not active");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Update last login timestamp asynchronously
  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  // Generate JWT Bearer Token
  const token = generateToken(user._id.toString());

  const permissions: string[] =
    role.permissions?.map((permission: any) =>
      typeof permission === "string" ? permission : permission?.name
    ) || [];

  return {
    token,
    user: {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: role.name,
      permissions,
    },
  };
};

export const getCurrentUser = async (user: AuthenticatedUser | any): Promise<AuthUserResponse> => {
  if (!user) {
    throw new UnauthorizedError("User profile not found");
  }

  const role: any = user.role;
  const permissions: string[] =
    role?.permissions?.map((permission: any) =>
      typeof permission === "string" ? permission : permission?.name
    ) || [];

  return {
    id: (user._id || user.id).toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: role?.name,
    permissions,
  };
};

export default {
  loginAdmin,
  getCurrentUser,
};
