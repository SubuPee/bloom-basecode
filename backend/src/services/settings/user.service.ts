import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import User, { IUser } from "../../models/User";
import Role from "../../models/Role";
import Warehouse from "../../models/master/warehouse.model";
import AppError from "../../errors/AppError";
import httpStatusCodes from "../../constants/httpStatusCodes";

// Default team members matching frontend mock data
const defaultTeamUsers = [
  {
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex.morgan@bloom.store",
    roleName: "Administrator",
    status: "active" as const,
    warehouseName: "All warehouses",
    lastActive: "Online now",
  },
  {
    firstName: "Priya",
    lastName: "Nair",
    email: "priya.nair@bloom.store",
    roleName: "Content Editor",
    status: "active" as const,
    warehouseName: "Mumbai Central",
    lastActive: "2 hours ago",
  },
  {
    firstName: "Rohan",
    lastName: "Desai",
    email: "rohan.desai@bloom.store",
    roleName: "Catalog Manager",
    status: "active" as const,
    warehouseName: "Pune Hub",
    lastActive: "Yesterday",
  },
  {
    firstName: "Sara",
    lastName: "Khan",
    email: "sara.khan@bloom.store",
    roleName: "Support Agent",
    status: "active" as const,
    warehouseName: "All warehouses",
    lastActive: "4 hours ago",
  },
  {
    firstName: "Vikram",
    lastName: "Iyer",
    email: "vikram.iyer@bloom.store",
    roleName: "Finance",
    status: "inactive" as const, // Invited
    warehouseName: "All warehouses",
    lastActive: "Invite sent 2 days ago",
  },
  {
    firstName: "Neha",
    lastName: "Gupta",
    email: "neha.gupta@bloom.store",
    roleName: "Warehouse Staff",
    status: "suspended" as const,
    warehouseName: "Delhi North",
    lastActive: "3 weeks ago",
  },
];

// Helper to seed team users if not already present
export const ensureDefaultTeamUsers = async () => {
  const count = await User.countDocuments();
  if (count <= 1) {
    const defaultPassword = await bcrypt.hash("Team@123456", 10);

    for (const tu of defaultTeamUsers) {
      const existing = await User.findOne({ email: tu.email });
      if (!existing) {
        // Find or create role
        let role = await Role.findOne({ name: tu.roleName });
        if (!role) {
          role = await Role.create({
            name: tu.roleName,
            description: `${tu.roleName} role with designated workspace permissions`,
            scope: tu.roleName === "Administrator" ? "Global" : "Custom",
            isSystemRole: tu.roleName === "Administrator",
            status: "active",
          });
        }

        await User.create({
          firstName: tu.firstName,
          lastName: tu.lastName,
          email: tu.email,
          password: defaultPassword,
          role: role._id,
          status: tu.status,
          warehouseName: tu.warehouseName,
          phone: "+91 98200 41122",
          location: "Mumbai, India",
        });
      }
    }
  }
};

// =====================================================
// GET TEAM USERS LIST
// =====================================================
export const getTeamUsers = async (filters: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  await ensureDefaultTeamUsers();

  const { search, role, status, page = 1, limit = 20 } = filters;
  const query: Record<string, any> = {};

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (status && status !== "All status") {
    const s = status.toLowerCase();
    if (s === "active") query.status = "active";
    else if (s === "invited") query.status = "inactive";
    else if (s === "suspended") query.status = "suspended";
    else query.status = s;
  }

  // Filter by role name if provided
  if (role && role !== "All roles") {
    const roleDoc = await Role.findOne({ name: role });
    if (roleDoc) {
      query.role = roleDoc._id;
    }
  }

  const skip = (page - 1) * limit;

  const [users, total, allUsers, rolesCount] = await Promise.all([
    User.find(query)
      .populate("role", "name description scope")
      .populate("warehouseId", "warehouseName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
    User.find().select("status").lean(),
    Role.countDocuments(),
  ]);

  const activeCount = allUsers.filter((u) => u.status === "active").length;
  const pendingInvites = allUsers.filter((u) => u.status === "inactive").length;

  const formattedUsers = users.map((u: any) => {
    const f = u.firstName?.[0] || "";
    const l = u.lastName?.[0] || "";
    const initials = `${f}${l}`.toUpperCase() || "US";

    let displayStatus: "Active" | "Invited" | "Suspended" = "Active";
    if (u.status === "suspended") displayStatus = "Suspended";
    else if (u.status === "inactive") displayStatus = "Invited";

    return {
      id: u._id.toString(),
      name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role?.name || "Administrator",
      roleId: u.role?._id,
      warehouse: u.warehouseName || u.warehouseId?.warehouseName || "All warehouses",
      warehouseId: u.warehouseId?._id,
      status: displayStatus,
      initials,
      lastActive: u.lastLogin
        ? new Date(u.lastLogin).toLocaleDateString("en-IN")
        : displayStatus === "Invited"
          ? "Invite sent recently"
          : "Online recently",
    };
  });

  return {
    counts: [
      { label: "Total users", value: allUsers.length },
      { label: "Active", value: activeCount },
      { label: "Pending invites", value: pendingInvites },
      { label: "Roles", value: rolesCount },
    ],
    data: formattedUsers,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

// =====================================================
// GET USER BY ID
// =====================================================
export const getUserById = async (id: string) => {
  const user = await User.findById(id)
    .populate("role", "name description scope modulePermissions")
    .populate("warehouseId", "warehouseName warehouseCode");

  if (!user) {
    throw new AppError("User not found", httpStatusCodes.NOT_FOUND);
  }

  return user;
};

// =====================================================
// CREATE / INVITE USER
// =====================================================
export const createTeamUser = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  role: string; // role ID or role name
  warehouseId?: string;
  warehouseName?: string;
  sendInvite?: boolean;
}) => {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw new AppError("A user with this email already exists", httpStatusCodes.CONFLICT);
  }

  // Resolve role
  let roleDoc = await Role.findOne({
    $or: [
      { _id: data.role.match(/^[0-9a-fA-F]{24}$/) ? data.role : null },
      { name: data.role },
    ],
  });

  if (!roleDoc) {
    roleDoc = await Role.create({
      name: data.role,
      description: `${data.role} role`,
      scope: "Custom",
      status: "active",
    });
  }

  // Resolve warehouse name if ID provided
  let warehouseName = data.warehouseName || "All warehouses";
  let warehouseId: Types.ObjectId | null = null;
  if (data.warehouseId && data.warehouseId.match(/^[0-9a-fA-F]{24}$/)) {
    warehouseId = new Types.ObjectId(data.warehouseId);
    const wh = await Warehouse.findById(data.warehouseId);
    if (wh) warehouseName = wh.warehouseName;
  }

  const tempPassword = await bcrypt.hash("Bloom@" + Math.random().toString(36).slice(-6), 12);
  const status = data.sendInvite !== false ? "inactive" : "active"; // inactive = Invited

  const newUser = await User.create({
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.toLowerCase().trim(),
    password: tempPassword,
    role: roleDoc._id,
    warehouseId,
    warehouseName,
    status,
    phone: "+91 98200 41122",
    location: "Mumbai, India",
  });

  return {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: roleDoc.name,
    warehouse: warehouseName,
    status: status === "inactive" ? "Invited" : "Active",
    initials: newUser.initials,
  };
};

// =====================================================
// UPDATE USER
// =====================================================
export const updateTeamUser = async (
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    warehouseId?: string;
    warehouseName?: string;
    status?: string;
  }
) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError("User not found", httpStatusCodes.NOT_FOUND);
  }

  if (data.firstName) user.firstName = data.firstName.trim();
  if (data.lastName) user.lastName = data.lastName.trim();
  if (data.email) user.email = data.email.toLowerCase().trim();

  if (data.role) {
    const roleDoc = await Role.findOne({
      $or: [
        { _id: data.role.match(/^[0-9a-fA-F]{24}$/) ? data.role : null },
        { name: data.role },
      ],
    });
    if (roleDoc) user.role = roleDoc._id;
  }

  if (data.warehouseId !== undefined) {
    if (data.warehouseId && data.warehouseId.match(/^[0-9a-fA-F]{24}$/)) {
      user.warehouseId = new Types.ObjectId(data.warehouseId);
      const wh = await Warehouse.findById(data.warehouseId);
      if (wh) user.warehouseName = wh.warehouseName;
    } else {
      user.warehouseId = null;
      user.warehouseName = data.warehouseName || "All warehouses";
    }
  }

  if (data.status) {
    const s = data.status.toLowerCase();
    if (s === "active") user.status = "active";
    else if (s === "invited" || s === "inactive") user.status = "inactive";
    else if (s === "suspended") user.status = "suspended";
  }

  await user.save();
  return getUserById(id);
};

// =====================================================
// UPDATE USER STATUS (Active / Suspended)
// =====================================================
export const updateUserStatus = async (id: string, status: "Active" | "Suspended" | "Invited") => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError("User not found", httpStatusCodes.NOT_FOUND);
  }

  const s = status.toLowerCase();
  user.status = s === "suspended" ? "suspended" : s === "invited" ? "inactive" : "active";
  await user.save();

  return { id: user._id, status };
};

// =====================================================
// RESEND INVITE
// =====================================================
export const resendInvite = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError("User not found", httpStatusCodes.NOT_FOUND);
  }

  user.status = "inactive"; // Invited
  await user.save();

  return { message: `Invitation re-sent to ${user.email}` };
};

// =====================================================
// DELETE USER
// =====================================================
export const deleteTeamUser = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError("User not found", httpStatusCodes.NOT_FOUND);
  }

  await User.findByIdAndDelete(id);
  return { message: "User removed successfully" };
};
