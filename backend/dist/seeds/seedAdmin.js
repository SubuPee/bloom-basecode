"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const User_1 = __importDefault(require("../models/User"));
const Role_1 = __importDefault(require("../models/Role"));
const Permission_1 = __importDefault(require("../models/Permission"));
const logger_1 = __importDefault(require("../utils/logger"));
// -----------------------------------------
// Permissions
// -----------------------------------------
const permissions = [
    // Dashboard
    {
        name: "dashboard.read",
        resource: "dashboard",
        action: "read",
        description: "View dashboard",
    },
    // Products
    {
        name: "products.create",
        resource: "products",
        action: "create",
        description: "Create products",
    },
    {
        name: "products.read",
        resource: "products",
        action: "read",
        description: "View products",
    },
    {
        name: "products.update",
        resource: "products",
        action: "update",
        description: "Update products",
    },
    {
        name: "products.delete",
        resource: "products",
        action: "delete",
        description: "Delete products",
    },
    // Categories
    {
        name: "categories.create",
        resource: "categories",
        action: "create",
        description: "Create categories",
    },
    {
        name: "categories.read",
        resource: "categories",
        action: "read",
        description: "View categories",
    },
    {
        name: "categories.update",
        resource: "categories",
        action: "update",
        description: "Update categories",
    },
    {
        name: "categories.delete",
        resource: "categories",
        action: "delete",
        description: "Delete categories",
    },
    // Sub Categories
    {
        name: "subcategories.create",
        resource: "subcategories",
        action: "create",
        description: "Create sub categories",
    },
    {
        name: "subcategories.read",
        resource: "subcategories",
        action: "read",
        description: "View sub categories",
    },
    {
        name: "subcategories.update",
        resource: "subcategories",
        action: "update",
        description: "Update sub categories",
    },
    {
        name: "subcategories.delete",
        resource: "subcategories",
        action: "delete",
        description: "Delete sub categories",
    },
    // Brands
    {
        name: "brands.create",
        resource: "brands",
        action: "create",
        description: "Create brands",
    },
    {
        name: "brands.read",
        resource: "brands",
        action: "read",
        description: "View brands",
    },
    {
        name: "brands.update",
        resource: "brands",
        action: "update",
        description: "Update brands",
    },
    {
        name: "brands.delete",
        resource: "brands",
        action: "delete",
        description: "Delete brands",
    },
    // Units
    {
        name: "units.create",
        resource: "units",
        action: "create",
        description: "Create units",
    },
    {
        name: "units.read",
        resource: "units",
        action: "read",
        description: "View units",
    },
    {
        name: "units.update",
        resource: "units",
        action: "update",
        description: "Update units",
    },
    {
        name: "units.delete",
        resource: "units",
        action: "delete",
        description: "Delete units",
    },
    // Taxes
    {
        name: "taxes.create",
        resource: "taxes",
        action: "create",
        description: "Create taxes",
    },
    {
        name: "taxes.read",
        resource: "taxes",
        action: "read",
        description: "View taxes",
    },
    {
        name: "taxes.update",
        resource: "taxes",
        action: "update",
        description: "Update taxes",
    },
    {
        name: "taxes.delete",
        resource: "taxes",
        action: "delete",
        description: "Delete taxes",
    },
    // Warehouses
    {
        name: "warehouses.create",
        resource: "warehouses",
        action: "create",
        description: "Create warehouses",
    },
    {
        name: "warehouses.read",
        resource: "warehouses",
        action: "read",
        description: "View warehouses",
    },
    {
        name: "warehouses.update",
        resource: "warehouses",
        action: "update",
        description: "Update warehouses",
    },
    {
        name: "warehouses.delete",
        resource: "warehouses",
        action: "delete",
        description: "Delete warehouses",
    },
    // Attributes
    {
        name: "attributes.create",
        resource: "attributes",
        action: "create",
        description: "Create attributes",
    },
    {
        name: "attributes.read",
        resource: "attributes",
        action: "read",
        description: "View attributes",
    },
    {
        name: "attributes.update",
        resource: "attributes",
        action: "update",
        description: "Update attributes",
    },
    {
        name: "attributes.delete",
        resource: "attributes",
        action: "delete",
        description: "Delete attributes",
    },
    // Orders
    {
        name: "orders.create",
        resource: "orders",
        action: "create",
        description: "Create orders",
    },
    {
        name: "orders.read",
        resource: "orders",
        action: "read",
        description: "View orders",
    },
    {
        name: "orders.update",
        resource: "orders",
        action: "update",
        description: "Update order status",
    },
    {
        name: "orders.delete",
        resource: "orders",
        action: "delete",
        description: "Delete orders",
    },
    // Sales
    {
        name: "sales.read",
        resource: "sales",
        action: "read",
        description: "View sales analytics and reports",
    },
    // Customers
    {
        name: "customers.create",
        resource: "customers",
        action: "create",
        description: "Create customers",
    },
    {
        name: "customers.read",
        resource: "customers",
        action: "read",
        description: "View customers",
    },
    {
        name: "customers.update",
        resource: "customers",
        action: "update",
        description: "Update customers",
    },
    {
        name: "customers.delete",
        resource: "customers",
        action: "delete",
        description: "Delete customers",
    },
    // Users
    {
        name: "users.create",
        resource: "users",
        action: "create",
        description: "Create admin users",
    },
    {
        name: "users.read",
        resource: "users",
        action: "read",
        description: "View admin users",
    },
    {
        name: "users.update",
        resource: "users",
        action: "update",
        description: "Update admin users",
    },
    {
        name: "users.delete",
        resource: "users",
        action: "delete",
        description: "Delete admin users",
    },
    // Roles
    {
        name: "roles.create",
        resource: "roles",
        action: "create",
        description: "Create roles",
    },
    {
        name: "roles.read",
        resource: "roles",
        action: "read",
        description: "View roles",
    },
    {
        name: "roles.update",
        resource: "roles",
        action: "update",
        description: "Update roles",
    },
    {
        name: "roles.delete",
        resource: "roles",
        action: "delete",
        description: "Delete roles",
    },
    // CMS
    {
        name: "cms.create",
        resource: "cms",
        action: "create",
        description: "Create CMS content",
    },
    {
        name: "cms.read",
        resource: "cms",
        action: "read",
        description: "View CMS content",
    },
    {
        name: "cms.update",
        resource: "cms",
        action: "update",
        description: "Update CMS content",
    },
    {
        name: "cms.delete",
        resource: "cms",
        action: "delete",
        description: "Delete CMS content",
    },
    // Settings
    {
        name: "settings.manage",
        resource: "settings",
        action: "manage",
        description: "Manage application settings",
    },
    // Storefront
    {
        name: "storefront.read",
        resource: "storefront",
        action: "read",
        description: "View storefront configuration and preview",
    },
    {
        name: "storefront.manage",
        resource: "storefront",
        action: "manage",
        description: "Manage storefront settings and layout",
    },
    // Dashboard
    {
        name: "dashboard.read",
        resource: "dashboard",
        action: "read",
        description: "View executive dashboard metrics and overview",
    },
    // Platform (B2C Control Centre)
    {
        name: "platform.read",
        resource: "platform",
        action: "read",
        description: "View platform control centre, offers, payments and operations",
    },
    {
        name: "platform.create",
        resource: "platform",
        action: "create",
        description: "Create offers, reviews, and support tickets",
    },
    {
        name: "platform.update",
        resource: "platform",
        action: "update",
        description: "Update offers, review statuses, and support tickets",
    },
    {
        name: "platform.delete",
        resource: "platform",
        action: "delete",
        description: "Delete offers, reviews, and support tickets",
    },
];
// -----------------------------------------
// Seed Database
// -----------------------------------------
const seedDatabase = async () => {
    try {
        await (0, db_1.connectDB)();
        console.log("Starting database seed...");
        // 1. Create / Update Permissions
        const permissionDocuments = [];
        for (const permissionData of permissions) {
            const permission = await Permission_1.default.findOneAndUpdate({
                name: permissionData.name,
            }, permissionData, {
                returnDocument: "after",
                upsert: true,
                setDefaultsOnInsert: true,
            });
            permissionDocuments.push(permission);
        }
        console.log(`✓ ${permissionDocuments.length} permissions created/updated`);
        // 2. Create / Update Roles
        const permissionIds = permissionDocuments.map((permission) => permission._id);
        const permissionMap = {};
        permissionDocuments.forEach((permission) => {
            permissionMap[permission.name] = permission._id;
        });
        // Super Admin
        const superAdminRole = await Role_1.default.findOneAndUpdate({
            name: "Super Admin",
        }, {
            name: "Super Admin",
            description: "Full access to the ecommerce administration",
            permissions: permissionIds,
            isSystemRole: true,
            status: "active",
        }, {
            returnDocument: "after",
            upsert: true,
            setDefaultsOnInsert: true,
        });
        // Admin
        const adminPermissionNames = permissionDocuments
            .filter((permission) => !["roles.delete", "settings.manage"].includes(permission.name))
            .map((permission) => permission._id);
        const adminRole = await Role_1.default.findOneAndUpdate({
            name: "Admin",
        }, {
            name: "Admin",
            description: "General ecommerce administration",
            permissions: adminPermissionNames,
            isSystemRole: true,
            status: "active",
        }, {
            returnDocument: "after",
            upsert: true,
            setDefaultsOnInsert: true,
        });
        // Order Manager
        const orderManagerPermissions = [
            "dashboard.read",
            "orders.read",
            "orders.update",
            "customers.create",
            "customers.read",
            "customers.update",
            "customers.delete",
        ]
            .map((name) => permissionMap[name])
            .filter(Boolean);
        const orderManagerRole = await Role_1.default.findOneAndUpdate({
            name: "Order Manager",
        }, {
            name: "Order Manager",
            description: "Manage ecommerce orders and customers",
            permissions: orderManagerPermissions,
            isSystemRole: true,
            status: "active",
        }, {
            returnDocument: "after",
            upsert: true,
            setDefaultsOnInsert: true,
        });
        // Editor
        const editorPermissions = [
            "dashboard.read",
            "products.read",
            "categories.read",
            "subcategories.read",
            "brands.read",
            "units.read",
            "taxes.read",
            "warehouses.read",
            "attributes.read",
            "cms.create",
            "cms.read",
            "cms.update",
            "cms.delete",
            "storefront.read",
            "storefront.manage",
        ]
            .map((name) => permissionMap[name])
            .filter(Boolean);
        const editorRole = await Role_1.default.findOneAndUpdate({
            name: "Editor",
        }, {
            name: "Editor",
            description: "Manage ecommerce content and CMS",
            permissions: editorPermissions,
            isSystemRole: true,
            status: "active",
        }, {
            returnDocument: "after",
            upsert: true,
            setDefaultsOnInsert: true,
        });
        console.log("✓ Roles created/updated");
        // 3. Create / Update Super Admin
        const adminEmail = "admin@bloom-ecommerce.com";
        const adminPassword = "Admin@123456";
        const hashedPassword = await bcryptjs_1.default.hash(adminPassword, 12);
        const superAdmin = await User_1.default.findOneAndUpdate({
            email: adminEmail,
        }, {
            firstName: "Super",
            lastName: "Admin",
            email: adminEmail,
            password: hashedPassword,
            role: superAdminRole?._id,
            status: "active",
        }, {
            returnDocument: "after",
            upsert: true,
            setDefaultsOnInsert: true,
        });
        console.log("✓ Super Admin created/updated");
        console.log("\n=================================");
        console.log("DATABASE SEED COMPLETED");
        console.log("=================================");
        console.log(`Email:    ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log("=================================\n");
        console.log("Roles:");
        console.log(`- ${superAdminRole?.name}`);
        console.log(`- ${adminRole?.name}`);
        console.log(`- ${orderManagerRole?.name}`);
        console.log(`- ${editorRole?.name}`);
        await mongoose_1.default.connection.close();
        process.exit(0);
    }
    catch (error) {
        logger_1.default.error("Seed failed: " + (error?.message || error));
        await mongoose_1.default.connection.close();
        process.exit(1);
    }
};
exports.seedDatabase = seedDatabase;
if (require.main === module) {
    (0, exports.seedDatabase)();
}
exports.default = exports.seedDatabase;
//# sourceMappingURL=seedAdmin.js.map