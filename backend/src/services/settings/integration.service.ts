import Integration, { IIntegration } from "../../models/settings/Integration";
import AppError from "../../errors/AppError";
import httpStatusCodes from "../../constants/httpStatusCodes";

// Default integrations matching frontend bloom-settings.ts
const defaultIntegrations = [
  {
    key: "razorpay",
    name: "Razorpay",
    category: "Payments",
    status: "Connected" as const,
    detail: "Live keys · settled weekly",
    config: { keyId: "rzp_live_••••••", webhookActive: true },
  },
  {
    key: "shiprocket",
    name: "Shiprocket",
    category: "Logistics",
    status: "Connected" as const,
    detail: "3 courier partners active",
    config: { partnerCount: 3, trackingSync: true },
  },
  {
    key: "mailchimp",
    name: "Mailchimp",
    category: "Marketing",
    status: "Connected" as const,
    detail: "12,480 subscribers synced",
    config: { listId: "mc_bloom_all", lastSync: "Today, 04:00" },
  },
  {
    key: "google-analytics",
    name: "Google Analytics",
    category: "Analytics",
    status: "Not connected" as const,
    detail: "Track storefront traffic",
    config: {},
  },
  {
    key: "whatsapp",
    name: "WhatsApp Business",
    category: "Messaging",
    status: "Not connected" as const,
    detail: "Order updates over WhatsApp",
    config: {},
  },
  {
    key: "tally",
    name: "Tally",
    category: "Accounting",
    status: "Connected" as const,
    detail: "Daily ledger export at 11 PM",
    config: { exportHour: 23, autoExport: true },
  },
];

export const ensureDefaultIntegrations = async () => {
  const count = await Integration.countDocuments();
  if (count === 0) {
    await Integration.insertMany(defaultIntegrations);
  }
};

// =====================================================
// GET INTEGRATIONS LIST
// =====================================================
export const getIntegrations = async () => {
  await ensureDefaultIntegrations();

  const list = await Integration.find().sort({ createdAt: 1 }).lean();
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

// =====================================================
// TOGGLE INTEGRATION STATUS (Connect / Disconnect)
// =====================================================
export const toggleIntegration = async (idOrKey: string) => {
  await ensureDefaultIntegrations();

  const item = await Integration.findOne({
    $or: [{ key: idOrKey }, { _id: idOrKey.match(/^[0-9a-fA-F]{24}$/) ? idOrKey : null }],
  });

  if (!item) {
    throw new AppError("Integration not found", httpStatusCodes.NOT_FOUND);
  }

  item.status = item.status === "Connected" ? "Not connected" : "Connected";
  if (item.status === "Connected") {
    item.lastSyncedAt = new Date();
  }
  await item.save();

  return item;
};

// =====================================================
// CONFIGURE INTEGRATION
// =====================================================
export const configureIntegration = async (
  idOrKey: string,
  data: {
    detail?: string;
    config?: Record<string, any>;
    status?: "Connected" | "Not connected";
  }
) => {
  await ensureDefaultIntegrations();

  const item = await Integration.findOne({
    $or: [{ key: idOrKey }, { _id: idOrKey.match(/^[0-9a-fA-F]{24}$/) ? idOrKey : null }],
  });

  if (!item) {
    throw new AppError("Integration not found", httpStatusCodes.NOT_FOUND);
  }

  if (data.detail !== undefined) item.detail = data.detail;
  if (data.status) item.status = data.status;
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
