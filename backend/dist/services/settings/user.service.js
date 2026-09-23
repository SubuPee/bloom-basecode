"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeamUser = exports.resendInvite = exports.updateUserStatus = exports.updateTeamUser = exports.createTeamUser = exports.getUserById = exports.getTeamUsers = exports.ensureDefaultTeamUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = require("mongoose");
const User_1 = __importDefault(require("../../models/User"));
const Role_1 = __importDefault(require("../../models/Role"));
const warehouse_model_1 = __importDefault(require("../../models/master/warehouse.model"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
// Default team members matching frontend mock data
const defaultTeamUsers = [
    {
        firstName: "Alex",
        lastName: "Morgan",
        email: "alex.morgan@bloom.store",
        roleName: "Administrator",
        status: "active",
        warehouseName: "All warehouses",
        lastActive: "Online now",
    },
    {
        firstName: "Priya",
        lastName: "Nair",
        email: "priya.nair@bloom.store",
        roleName: "Content Editor",
        status: "active",
        warehouseName: "Mumbai Central",
        lastActive: "2 hours ago",
    },
    {
        firstName: "Rohan",
        lastName: "Desai",
        email: "rohan.desai@bloom.store",
        roleName: "Catalog Manager",
        status: "active",
        warehouseName: "Pune Hub",
        lastActive: "Yesterday",
    },
    {
        firstName: "Sara",
        lastName: "Khan",
        email: "sara.khan@bloom.store",
        roleName: "Support Agent",
        status: "active",
        warehouseName: "All warehouses",
        lastActive: "4 hours ago",
    },
    {
        firstName: "Vikram",
        lastName: "Iyer",
        email: "vikram.iyer@bloom.store",
        roleName: "Finance",
        status: "inactive", // Invited
        warehouseName: "All warehouses",
        lastActive: "Invite sent 2 days ago",
    },
    {
        firstName: "Neha",
        lastName: "Gupta",
        email: "neha.gupta@bloom.store",
        roleName: "Warehouse Staff",
        status: "suspended",
        warehouseName: "Delhi North",
        lastActive: "3 weeks ago",
    },
];
// Helper to seed team users if not already present
const ensureDefaultTeamUsers = async () => {
    const count = await User_1.default.countDocuments();
    if (count <= 1) {
        const defaultPassword = await bcryptjs_1.default.hash("Team@123456", 10);
        for (const tu of defaultTeamUsers) {
            const existing = await User_1.default.findOne({ email: tu.email });
            if (!existing) {
                // Find or create role
                let role = await Role_1.default.findOne({ name: tu.roleName });
                if (!role) {
                    role = await Role_1.default.create({
                        name: tu.roleName,
                        description: `${tu.roleName} role with designated workspace permissions`,
                        scope: tu.roleName === "Administrator" ? "Global" : "Custom",
                        isSystemRole: tu.roleName === "Administrator",
                        status: "active",
                    });
                }
                await User_1.default.create({
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
exports.ensureDefaultTeamUsers = ensureDefaultTeamUsers;
// =====================================================
// GET TEAM USERS LIST
// =====================================================
const getTeamUsers = async (filters) => {
    await (0, exports.ensureDefaultTeamUsers)();
    const { search, role, status, page = 1, limit = 20 } = filters;
    const query = {};
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }
    if (status && status !== "All status") {
        const s = status.toLowerCase();
        if (s === "active")
            query.status = "active";
        else if (s === "invited")
            query.status = "inactive";
        else if (s === "suspended")
            query.status = "suspended";
        else
            query.status = s;
    }
    // Filter by role name if provided
    if (role && role !== "All roles") {
        const roleDoc = await Role_1.default.findOne({ name: role });
        if (roleDoc) {
            query.role = roleDoc._id;
        }
    }
    const skip = (page - 1) * limit;
    const [users, total, allUsers, rolesCount] = await Promise.all([
        User_1.default.find(query)
            .populate("role", "name description scope")
            .populate("warehouseId", "warehouseName")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        User_1.default.countDocuments(query),
        User_1.default.find().select("status").lean(),
        Role_1.default.countDocuments(),
    ]);
    const activeCount = allUsers.filter((u) => u.status === "active").length;
    const pendingInvites = allUsers.filter((u) => u.status === "inactive").length;
    const formattedUsers = users.map((u) => {
        const f = u.firstName?.[0] || "";
        const l = u.lastName?.[0] || "";
        const initials = `${f}${l}`.toUpperCase() || "US";
        let displayStatus = "Active";
        if (u.status === "suspended")
            displayStatus = "Suspended";
        else if (u.status === "inactive")
            displayStatus = "Invited";
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
exports.getTeamUsers = getTeamUsers;
// =====================================================
// GET USER BY ID
// =====================================================
const getUserById = async (id) => {
    const user = await User_1.default.findById(id)
        .populate("role", "name description scope modulePermissions")
        .populate("warehouseId", "warehouseName warehouseCode");
    if (!user) {
        throw new AppError_1.default("User not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    return user;
};
exports.getUserById = getUserById;
// =====================================================
// CREATE / INVITE USER
// =====================================================
const createTeamUser = async (data) => {
    const existing = await User_1.default.findOne({ email: data.email.toLowerCase() });
    if (existing) {
        throw new AppError_1.default("A user with this email already exists", httpStatusCodes_1.default.CONFLICT);
    }
    // Resolve role
    let roleDoc = await Role_1.default.findOne({
        $or: [
            { _id: data.role.match(/^[0-9a-fA-F]{24}$/) ? data.role : null },
            { name: data.role },
        ],
    });
    if (!roleDoc) {
        roleDoc = await Role_1.default.create({
            name: data.role,
            description: `${data.role} role`,
            scope: "Custom",
            status: "active",
        });
    }
    // Resolve warehouse name if ID provided
    let warehouseName = data.warehouseName || "All warehouses";
    let warehouseId = null;
    if (data.warehouseId && data.warehouseId.match(/^[0-9a-fA-F]{24}$/)) {
        warehouseId = new mongoose_1.Types.ObjectId(data.warehouseId);
        const wh = await warehouse_model_1.default.findById(data.warehouseId);
        if (wh)
            warehouseName = wh.warehouseName;
    }
    const tempPassword = await bcryptjs_1.default.hash("Bloom@" + Math.random().toString(36).slice(-6), 12);
    const status = data.sendInvite !== false ? "inactive" : "active"; // inactive = Invited
    const newUser = await User_1.default.create({
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
exports.createTeamUser = createTeamUser;
// =====================================================
// UPDATE USER
// =====================================================
const updateTeamUser = async (id, data) => {
    const user = await User_1.default.findById(id);
    if (!user) {
        throw new AppError_1.default("User not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    if (data.firstName)
        user.firstName = data.firstName.trim();
    if (data.lastName)
        user.lastName = data.lastName.trim();
    if (data.email)
        user.email = data.email.toLowerCase().trim();
    if (data.role) {
        const roleDoc = await Role_1.default.findOne({
            $or: [
                { _id: data.role.match(/^[0-9a-fA-F]{24}$/) ? data.role : null },
                { name: data.role },
            ],
        });
        if (roleDoc)
            user.role = roleDoc._id;
    }
    if (data.warehouseId !== undefined) {
        if (data.warehouseId && data.warehouseId.match(/^[0-9a-fA-F]{24}$/)) {
            user.warehouseId = new mongoose_1.Types.ObjectId(data.warehouseId);
            const wh = await warehouse_model_1.default.findById(data.warehouseId);
            if (wh)
                user.warehouseName = wh.warehouseName;
        }
        else {
            user.warehouseId = null;
            user.warehouseName = data.warehouseName || "All warehouses";
        }
    }
    if (data.status) {
        const s = data.status.toLowerCase();
        if (s === "active")
            user.status = "active";
        else if (s === "invited" || s === "inactive")
            user.status = "inactive";
        else if (s === "suspended")
            user.status = "suspended";
    }
    await user.save();
    return (0, exports.getUserById)(id);
};
exports.updateTeamUser = updateTeamUser;
// =====================================================
// UPDATE USER STATUS (Active / Suspended)
// =====================================================
const updateUserStatus = async (id, status) => {
    const user = await User_1.default.findById(id);
    if (!user) {
        throw new AppError_1.default("User not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    const s = status.toLowerCase();
    user.status = s === "suspended" ? "suspended" : s === "invited" ? "inactive" : "active";
    await user.save();
    return { id: user._id, status };
};
exports.updateUserStatus = updateUserStatus;
// =====================================================
// RESEND INVITE
// =====================================================
const resendInvite = async (id) => {
    const user = await User_1.default.findById(id);
    if (!user) {
        throw new AppError_1.default("User not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    user.status = "inactive"; // Invited
    await user.save();
    return { message: `Invitation re-sent to ${user.email}` };
};
exports.resendInvite = resendInvite;
// =====================================================
// DELETE USER
// =====================================================
const deleteTeamUser = async (id) => {
    const user = await User_1.default.findById(id);
    if (!user) {
        throw new AppError_1.default("User not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    await User_1.default.findByIdAndDelete(id);
    return { message: "User removed successfully" };
};
exports.deleteTeamUser = deleteTeamUser;
//# sourceMappingURL=user.service.js.map