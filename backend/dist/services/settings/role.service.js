"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoleById = exports.getRoles = exports.ensureDefaultRoles = exports.defaultPermissionModules = void 0;
const Role_1 = __importDefault(require("../../models/Role"));
const User_1 = __importDefault(require("../../models/User"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
exports.defaultPermissionModules = [
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
];
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
const ensureDefaultRoles = async () => {
    for (const dr of defaultRoles) {
        await Role_1.default.findOneAndUpdate({ name: dr.name }, {
            $set: {
                description: dr.description,
                scope: dr.scope,
                isSystemRole: dr.isSystemRole,
                modulePermissions: dr.modulePermissions,
                status: "active",
            },
        }, { upsert: true });
    }
};
exports.ensureDefaultRoles = ensureDefaultRoles;
// =====================================================
// GET ALL ROLES (with member count and permissions matrix)
// =====================================================
const getRoles = async () => {
    await (0, exports.ensureDefaultRoles)();
    const roles = await Role_1.default.find({ status: "active" }).lean();
    const users = await User_1.default.find().select("role firstName lastName email lastLogin").lean();
    const formattedRoles = roles.map((r) => {
        const roleIdStr = r._id.toString();
        const members = users.filter((u) => u.role?.toString() === roleIdStr);
        let permissionsObj = {};
        if (r.modulePermissions instanceof Map) {
            r.modulePermissions.forEach((val, key) => {
                permissionsObj[key] = val;
            });
        }
        else if (r.modulePermissions && typeof r.modulePermissions === "object") {
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
exports.getRoles = getRoles;
// =====================================================
// GET ROLE BY ID (with assigned members list)
// =====================================================
const getRoleById = async (id) => {
    await (0, exports.ensureDefaultRoles)();
    const role = await Role_1.default.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { name: id }],
    }).lean();
    if (!role) {
        throw new AppError_1.default("Role not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    const roleIdStr = role._id.toString();
    const users = await User_1.default.find({ role: roleIdStr })
        .select("firstName lastName email lastLogin")
        .lean();
    const members = users.map((u) => {
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
    let permissionsObj = {};
    const mp = role.modulePermissions;
    if (mp instanceof Map) {
        mp.forEach((val, key) => {
            permissionsObj[key] = val;
        });
    }
    else if (mp && typeof mp === "object") {
        permissionsObj = mp;
    }
    return {
        id: roleIdStr,
        name: role.name,
        description: role.description,
        scope: role.scope || "Custom",
        isSystemRole: role.isSystemRole || false,
        membersCount: members.length,
        permissions: permissionsObj,
        members,
    };
};
exports.getRoleById = getRoleById;
// =====================================================
// CREATE CUSTOM ROLE
// =====================================================
const createRole = async (data) => {
    const existing = await Role_1.default.findOne({ name: data.name.trim() });
    if (existing) {
        throw new AppError_1.default("A role with this name already exists", httpStatusCodes_1.default.CONFLICT);
    }
    const role = await Role_1.default.create({
        name: data.name.trim(),
        description: data.description?.trim() || "",
        scope: data.scope?.trim() || "Custom",
        isSystemRole: false,
        modulePermissions: data.modulePermissions || {},
        status: "active",
    });
    return (0, exports.getRoleById)(role._id.toString());
};
exports.createRole = createRole;
// =====================================================
// UPDATE ROLE
// =====================================================
const updateRole = async (id, data) => {
    const role = await Role_1.default.findById(id);
    if (!role) {
        throw new AppError_1.default("Role not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    if (data.name)
        role.name = data.name.trim();
    if (data.description !== undefined)
        role.description = data.description.trim();
    if (data.scope !== undefined)
        role.scope = data.scope.trim();
    if (data.modulePermissions)
        role.modulePermissions = data.modulePermissions;
    await role.save();
    return (0, exports.getRoleById)(id);
};
exports.updateRole = updateRole;
// =====================================================
// DELETE ROLE
// =====================================================
const deleteRole = async (id) => {
    const role = await Role_1.default.findById(id);
    if (!role) {
        throw new AppError_1.default("Role not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    if (role.isSystemRole || role.name === "Administrator") {
        throw new AppError_1.default("System roles cannot be deleted", httpStatusCodes_1.default.FORBIDDEN);
    }
    // Reassign users of this role to another active role
    const fallbackRole = await Role_1.default.findOne({ name: "Support Agent" }) || await Role_1.default.findOne();
    if (fallbackRole) {
        await User_1.default.updateMany({ role: role._id }, { role: fallbackRole._id });
    }
    await Role_1.default.findByIdAndDelete(id);
    return { message: "Role deleted successfully" };
};
exports.deleteRole = deleteRole;
//# sourceMappingURL=role.service.js.map