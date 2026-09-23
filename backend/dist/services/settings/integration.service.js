"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureIntegration = exports.toggleIntegration = exports.getIntegrations = exports.ensureDefaultIntegrations = void 0;
const Integration_1 = __importDefault(require("../../models/settings/Integration"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
// Default integrations matching frontend bloom-settings.ts
const defaultIntegrations = [
    {
        key: "razorpay",
        name: "Razorpay",
        category: "Payments",
        status: "Connected",
        detail: "Live keys · settled weekly",
        config: { keyId: "rzp_live_••••••", webhookActive: true },
    },
    {
        key: "shiprocket",
        name: "Shiprocket",
        category: "Logistics",
        status: "Connected",
        detail: "3 courier partners active",
        config: { partnerCount: 3, trackingSync: true },
    },
    {
        key: "mailchimp",
        name: "Mailchimp",
        category: "Marketing",
        status: "Connected",
        detail: "12,480 subscribers synced",
        config: { listId: "mc_bloom_all", lastSync: "Today, 04:00" },
    },
    {
        key: "google-analytics",
        name: "Google Analytics",
        category: "Analytics",
        status: "Not connected",
        detail: "Track storefront traffic",
        config: {},
    },
    {
        key: "whatsapp",
        name: "WhatsApp Business",
        category: "Messaging",
        status: "Not connected",
        detail: "Order updates over WhatsApp",
        config: {},
    },
    {
        key: "tally",
        name: "Tally",
        category: "Accounting",
        status: "Connected",
        detail: "Daily ledger export at 11 PM",
        config: { exportHour: 23, autoExport: true },
    },
];
const ensureDefaultIntegrations = async () => {
    const count = await Integration_1.default.countDocuments();
    if (count === 0) {
        await Integration_1.default.insertMany(defaultIntegrations);
    }
};
exports.ensureDefaultIntegrations = ensureDefaultIntegrations;
// =====================================================
// GET INTEGRATIONS LIST
// =====================================================
const getIntegrations = async () => {
    await (0, exports.ensureDefaultIntegrations)();
    const list = await Integration_1.default.find().sort({ createdAt: 1 }).lean();
    return list.map((i) => ({
        id: i._id.toString(),
        key: i.key,
        name: i.name,
        category: i.category,
        status: i.status,
        detail: i.detail,
        config: i.config || {},
        lastSyncedAt: i.lastSyncedAt,
    }));
};
exports.getIntegrations = getIntegrations;
// =====================================================
// TOGGLE INTEGRATION STATUS (Connect / Disconnect)
// =====================================================
const toggleIntegration = async (idOrKey) => {
    await (0, exports.ensureDefaultIntegrations)();
    const item = await Integration_1.default.findOne({
        $or: [{ key: idOrKey }, { _id: idOrKey.match(/^[0-9a-fA-F]{24}$/) ? idOrKey : null }],
    });
    if (!item) {
        throw new AppError_1.default("Integration not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    item.status = item.status === "Connected" ? "Not connected" : "Connected";
    if (item.status === "Connected") {
        item.lastSyncedAt = new Date();
    }
    await item.save();
    return item;
};
exports.toggleIntegration = toggleIntegration;
// =====================================================
// CONFIGURE INTEGRATION
// =====================================================
const configureIntegration = async (idOrKey, data) => {
    await (0, exports.ensureDefaultIntegrations)();
    const item = await Integration_1.default.findOne({
        $or: [{ key: idOrKey }, { _id: idOrKey.match(/^[0-9a-fA-F]{24}$/) ? idOrKey : null }],
    });
    if (!item) {
        throw new AppError_1.default("Integration not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    if (data.detail !== undefined)
        item.detail = data.detail;
    if (data.status)
        item.status = data.status;
    if (data.config) {
        item.config = {
            ...(item.config || {}),
            ...data.config,
        };
    }
    item.lastSyncedAt = new Date();
    await item.save();
    return item;
};
exports.configureIntegration = configureIntegration;
//# sourceMappingURL=integration.service.js.map