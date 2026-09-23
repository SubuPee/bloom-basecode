import Role, { IRole } from "../../models/Role";
import User from "../../models/User";
import AppError from "../../errors/AppError";
import httpStatusCodes from "../../constants/httpStatusCodes";

export const defaultPermissionModules = [
  "Dashboard",
  "Vendors",
  "Inventory",
  "Production",
  "Transactions",
  "Settlements",
  "Products",
  "Orders",
  "Customers",
  "CMS",
  "Settings",
] as const;

// Default roles matching frontend bloom-settings.ts
const defaultRoles = [
  {
    name: "Administrator",
    description: "Full access to every module including billing and security.",
    scope: "Global",
    isSystemRole: true,
    modulePermissions: {
      Dashboard: ["view"],
      Vendors: ["view", "create", "edit", "delete"],
      Inventory: ["view", "create", "edit", "delete"],
      Production: ["view", "create", "edit", "delete"],
      Transactions: ["view", "create", "edit", "delete"],
      Settlements: ["view", "create", "edit", "delete"],
      Products: ["view", "create", "edit", "delete"],
      Orders: ["view", "create", "edit", "delete"],
      Customers: ["view", "create", "edit", "delete"],
      CMS: ["view", "create", "edit", "delete"],
      Settings: ["view", "create", "edit", "delete"],
    },
  },
  {
    name: "Catalog Manager",
    description: "Manages products, categories and inventory levels.",
    scope: "Catalog",
    isSystemRole: false,
    modulePermissions: {
      Dashboard: ["view"],
      Vendors: ["view", "edit"],
      Inventory: ["view", "create", "edit"],
      Production: ["view", "create", "edit"],
      Transactions: ["view"],
      Settlements: [],
      Products: ["view", "create", "edit"],
      Orders: ["view"],
      Customers: [],
      CMS: ["view"],
      Settings: [],
    },
  },
  {
    name: "Content Editor",
    description: "Owns storefront content, banners and campaigns.",
    scope: "CMS",
    isSystemRole: false,
    modulePermissions: {
      Dashboard: ["view"],
      Vendors: ["view"],
      Inventory: [],
      Production: [],
      Transactions: [],
      Settlements: [],
      Products: ["view"],
      Orders: [],
      Customers: [],
      CMS: ["view", "create", "edit", "delete"],
      Settings: [],
    },
  },
  {
    name: "Support Agent",
    description: "Handles customer queries, returns and order updates.",
    scope: "Service",
    isSystemRole: false,
    modulePermissions: {
      Dashboard: ["view"],
      Vendors: ["view"],
      Inventory: ["view"],
      Production: [],
      Transactions: ["view"],
      Settlements: [],
      Products: ["view"],
      Orders: ["view", "edit"],
      Customers: ["view", "edit"],
      CMS: [],
      Settings: [],
    },
  },
  {
    name: "Finance",
    description: "Reads sales, payouts and tax reports.",
    scope: "Reporting",
    isSystemRole: false,
    modulePermissions: {
      Dashboard: ["view"],
      Vendors: ["view"],
      Inventory: ["view"],
      Production: ["view"],
      Transactions: ["view", "create", "edit"],
      Settlements: ["view", "create", "edit"],
      Products: ["view"],
      Orders: ["view"],
      Customers: ["view"],
      CMS: [],
      Settings: ["view"],
    },
  },
];

// Helper to seed or update default roles with module permissions
export const ensureDefaultRoles = async () => {
  for (const dr of defaultRoles) {
    await Role.findOneAndUpdate(
      { name: dr.name },
      {
        $set: {
          description: dr.description,
          scope: dr.scope,
          isSystemRole: dr.isSystemRole,
          modulePermissions: dr.modulePermissions,
          status: "active",
        },
      },
      { upsert: true }
    );
  }
};

// =====================================================
// GET ALL ROLES (with member count and permissions matrix)
// =====================================================
export const getRoles = async () => {
  await ensureDefaultRoles();

  const roles = await Role.find({ status: "active" }).lean();
  const users = await User.find().select("role firstName lastName email lastLogin").lean();

  const formattedRoles = roles.map((r: any) => {
    const roleIdStr = r._id.toString();
    const members = users.filter((u: any) => u.role?.toString() === roleIdStr);

    let permissionsObj: Record<string, string[]> = {};
    if (r.modulePermissions instanceof Map) {
      r.modulePermissions.forEach((val: string[], key: string) => {
        permissionsObj[key] = val;
      });
    } else if (r.modulePermissions && typeof r.modulePermissions === "object") {
      permissionsObj = r.modulePermissions;
    }

    return {
      id: r._id.toString(),
      name: r.name,
      description: r.description,
      scope: r.scope || "Custom",
      isSystemRole: r.isSystemRole || false,
      members: members.length,
      permissions: permissionsObj,
    };
  });

  return formattedRoles;
};

// =====================================================
// GET ROLE BY ID (with assigned members list)
// =====================================================
export const getRoleById = async (id: string) => {
  await ensureDefaultRoles();

  const role = await Role.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { name: id }],
  }).lean();

  if (!role) {
    throw new AppError("Role not found", httpStatusCodes.NOT_FOUND);
  }

  const roleIdStr = (role as any)._id.toString();
  const users = await User.find({ role: roleIdStr })
    .select("firstName lastName email lastLogin")
    .lean();

  const members = users.map((u: any) => {
    const f = u.firstName?.[0] || "";
    const l = u.lastName?.[0] || "";
    return {
      id: u._id.toString(),
      name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
      email: u.email,
      initials: `${f}${l}`.toUpperCase() || "US",
      lastActive: u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("en-IN") : "Online recently",
    };
  });

  let permissionsObj: Record<string, string[]> = {};
  const mp = (role as any).modulePermissions;
  if (mp instanceof Map) {
    mp.forEach((val: string[], key: string) => {
      permissionsObj[key] = val;
    });
  } else if (mp && typeof mp === "object") {
    permissionsObj = mp;
  }

  return {
    id: roleIdStr,
    name: role.name,
    description: role.description,
    scope: (role as any).scope || "Custom",
    isSystemRole: role.isSystemRole || false,
    membersCount: members.length,
    permissions: permissionsObj,
    members,
  };
};

// =====================================================
// CREATE CUSTOM ROLE
// =====================================================
export const createRole = async (data: {
  name: string;
  description?: string;
  scope?: string;
  modulePermissions?: Record<string, string[]>;
}) => {
  const existing = await Role.findOne({ name: data.name.trim() });
  if (existing) {
    throw new AppError("A role with this name already exists", httpStatusCodes.CONFLICT);
  }

  const role = await Role.create({
    name: data.name.trim(),
    description: data.description?.trim() || "",
    scope: data.scope?.trim() || "Custom",
    isSystemRole: false,
    modulePermissions: data.modulePermissions || {},
    status: "active",
  });

  return getRoleById((role as any)._id.toString());
};

// =====================================================
// UPDATE ROLE
// =====================================================
export const updateRole = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    scope?: string;
    modulePermissions?: Record<string, string[]>;
  }
) => {
  const role = await Role.findById(id);
  if (!role) {
    throw new AppError("Role not found", httpStatusCodes.NOT_FOUND);
  }

  if (data.name) role.name = data.name.trim();
  if (data.description !== undefined) role.description = data.description.trim();
  if (data.scope !== undefined) role.scope = data.scope.trim();
  if (data.modulePermissions) role.modulePermissions = data.modulePermissions as any;

  await role.save();
  return getRoleById(id);
};

// =====================================================
// DELETE ROLE
// =====================================================
export const deleteRole = async (id: string) => {
  const role = await Role.findById(id);
  if (!role) {
    throw new AppError("Role not found", httpStatusCodes.NOT_FOUND);
  }

  if (role.isSystemRole || role.name === "Administrator") {
    throw new AppError("System roles cannot be deleted", httpStatusCodes.FORBIDDEN);
  }

  // Reassign users of this role to another active role
  const fallbackRole = await Role.findOne({ name: "Support Agent" }) || await Role.findOne();
  if (fallbackRole) {
    await User.updateMany({ role: role._id }, { role: fallbackRole._id });
  }

  await Role.findByIdAndDelete(id);
  return { message: "Role deleted successfully" };
};
