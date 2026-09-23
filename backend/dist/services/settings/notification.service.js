"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.archiveNotification = exports.markAllNotificationsRead = exports.markNotificationRead = exports.getNotificationById = exports.getNotifications = void 0;
const Notification_1 = __importDefault(require("../../models/settings/Notification"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
// Default initial notifications matching the frontend mock data
const defaultNotifications = [
    {
        notificationId: "NTF-9012",
        title: "New order #BLM-10482 placed",
        body: "Aarav Mehta placed an order worth ₹18,450 with express delivery.",
        detail: "The order contains 3 items and has been paid through UPI. Warehouse Mumbai Central has been notified and the packing slip is queued for printing. Expected dispatch is within 6 hours.",
        type: "order",
        priority: "High",
        read: false,
        source: "Orders",
        actor: "Checkout service",
        link: { label: "View order", to: "/orders" },
    },
    {
        notificationId: "NTF-9011",
        title: "Low stock alert — Wireless Headphones",
        body: "Only 6 units remain across all warehouses.",
        detail: "Stock has dropped below the reorder threshold of 10 units. Average daily velocity is 4 units, giving roughly 1.5 days of cover. Raise a purchase order with the supplier to avoid a stock-out on the storefront.",
        type: "inventory",
        priority: "High",
        read: false,
        source: "Inventory",
        actor: "Stock monitor",
        link: { label: "View products", to: "/products" },
    },
    {
        notificationId: "NTF-9010",
        title: "Payout of ₹2,84,300 settled",
        body: "Weekly settlement completed to HDFC ••4421.",
        detail: "The settlement covers 214 orders between 11 and 17 September, minus ₹9,420 in platform fees and ₹3,150 in refunds. The bank reference number is HDFC/STL/884210.",
        type: "payment",
        priority: "Medium",
        read: true,
        source: "Payments",
        actor: "Settlement engine",
        link: { label: "View sales", to: "/sales" },
    },
    {
        notificationId: "NTF-9009",
        title: "New customer segment reached 500 members",
        body: "The Loyal segment crossed 500 active customers.",
        detail: "Customers qualify for the Loyal segment after 5 completed orders in 12 months. Average order value in this segment is ₹4,180, which is 34% higher than the store average.",
        type: "customer",
        priority: "Low",
        read: true,
        source: "Customers",
        actor: "Segmentation job",
        link: { label: "View customers", to: "/customers" },
    },
    {
        notificationId: "NTF-9008",
        title: "Storefront banner published",
        body: "Monsoon Essentials campaign is now live.",
        detail: "The campaign hero was published by Priya Nair and is visible on the storefront homepage. Scheduled to run until 30 September 2026.",
        type: "system",
        priority: "Low",
        read: true,
        source: "CMS",
        actor: "Priya Nair",
        link: { label: "View storefront", to: "/storefront" },
    },
    {
        notificationId: "NTF-9007",
        title: "Failed payment retry succeeded",
        body: "Order #BLM-10460 payment captured on retry.",
        detail: "The initial card authorisation failed due to insufficient funds. An automatic retry after 4 hours succeeded and the order has moved to Processing.",
        type: "payment",
        priority: "Medium",
        read: true,
        source: "Payments",
        actor: "Payment gateway",
    },
    {
        notificationId: "NTF-9006",
        title: "Role updated — Catalog Manager",
        body: "Product delete permission was revoked.",
        detail: "Administrator Alex Morgan updated the Catalog Manager role. Members can still create and edit products but can no longer delete them. 4 users are affected.",
        type: "system",
        priority: "Medium",
        read: true,
        source: "Security",
        actor: "Alex Morgan",
        link: { label: "View roles", to: "/settings/roles" },
    },
];
// Seed notifications if database collection is empty
const ensureDefaultNotifications = async () => {
    const count = await Notification_1.default.countDocuments();
    if (count === 0) {
        await Notification_1.default.insertMany(defaultNotifications);
    }
};
// =====================================================
// LIST NOTIFICATIONS
// =====================================================
const getNotifications = async (filters) => {
    await ensureDefaultNotifications();
    const { search, type, priority, read, page = 1, limit = 20 } = filters;
    const query = { isArchived: false };
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { body: { $regex: search, $options: "i" } },
            { detail: { $regex: search, $options: "i" } },
        ];
    }
    if (type && type !== "All") {
        const t = type.toLowerCase();
        if (t === "orders")
            query.type = "order";
        else if (t === "inventory")
            query.type = "inventory";
        else if (t === "payments")
            query.type = "payment";
        else if (t === "system")
            query.type = { $in: ["system", "customer"] };
        else
            query.type = t;
    }
    if (priority && priority !== "All") {
        query.priority = priority;
    }
    if (read !== undefined && read !== "") {
        if (read === "true" || read === "read")
            query.read = true;
        else if (read === "false" || read === "unread")
            query.read = false;
    }
    const skip = (page - 1) * limit;
    const [data, total, unreadCount] = await Promise.all([
        Notification_1.default.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Notification_1.default.countDocuments(query),
        Notification_1.default.countDocuments({ isArchived: false, read: false }),
    ]);
    // Format date/time helper strings for frontend
    const formattedData = data.map((n) => {
        const createdAt = new Date(n.createdAt);
        return {
            id: n.notificationId,
            _id: n._id,
            title: n.title,
            body: n.body,
            detail: n.detail,
            type: n.type,
            priority: n.priority,
            read: n.read,
            source: n.source,
            actor: n.actor,
            link: n.link,
            date: createdAt.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }),
            time: getTimeAgo(createdAt),
        };
    });
    return {
        unreadCount,
        total,
        data: formattedData,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    };
};
exports.getNotifications = getNotifications;
function getTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60)
        return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
        return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
        return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1)
        return "Yesterday";
    return `${days} days ago`;
}
// =====================================================
// GET NOTIFICATION DETAIL
// =====================================================
const getNotificationById = async (id) => {
    await ensureDefaultNotifications();
    const notification = await Notification_1.default.findOne({
        $or: [{ notificationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });
    if (!notification) {
        throw new AppError_1.default("Notification not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    const createdAt = new Date(notification.createdAt);
    return {
        id: notification.notificationId,
        _id: notification._id,
        title: notification.title,
        body: notification.body,
        detail: notification.detail,
        type: notification.type,
        priority: notification.priority,
        read: notification.read,
        source: notification.source,
        actor: notification.actor,
        link: notification.link,
        date: createdAt.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }),
        time: getTimeAgo(createdAt),
    };
};
exports.getNotificationById = getNotificationById;
// =====================================================
// MARK NOTIFICATION READ / UNREAD
// =====================================================
const markNotificationRead = async (id, read = true) => {
    const notification = await Notification_1.default.findOneAndUpdate({
        $or: [{ notificationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }, { read }, { new: true });
    if (!notification) {
        throw new AppError_1.default("Notification not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    return notification;
};
exports.markNotificationRead = markNotificationRead;
// =====================================================
// MARK ALL AS READ
// =====================================================
const markAllNotificationsRead = async () => {
    await Notification_1.default.updateMany({ isArchived: false, read: false }, { read: true });
    return { message: "All notifications marked as read" };
};
exports.markAllNotificationsRead = markAllNotificationsRead;
// =====================================================
// ARCHIVE NOTIFICATION
// =====================================================
const archiveNotification = async (id) => {
    const notification = await Notification_1.default.findOneAndUpdate({
        $or: [{ notificationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }, { isArchived: true }, { new: true });
    if (!notification) {
        throw new AppError_1.default("Notification not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    return { message: "Notification archived successfully" };
};
exports.archiveNotification = archiveNotification;
//# sourceMappingURL=notification.service.js.map