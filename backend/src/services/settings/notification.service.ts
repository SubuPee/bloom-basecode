import Notification, { INotification } from "../../models/settings/Notification";
import AppError from "../../errors/AppError";
import httpStatusCodes from "../../constants/httpStatusCodes";

// Default initial notifications matching the frontend mock data
const defaultNotifications = [
  {
    notificationId: "NTF-9012",
    title: "New order #BLM-10482 placed",
    body: "Aarav Mehta placed an order worth ₹18,450 with express delivery.",
    detail:
      "The order contains 3 items and has been paid through UPI. Warehouse Mumbai Central has been notified and the packing slip is queued for printing. Expected dispatch is within 6 hours.",
    type: "order" as const,
    priority: "High" as const,
    read: false,
    source: "Orders",
    actor: "Checkout service",
    link: { label: "View order", to: "/orders" },
  },
  {
    notificationId: "NTF-9011",
    title: "Low stock alert — Wireless Headphones",
    body: "Only 6 units remain across all warehouses.",
    detail:
      "Stock has dropped below the reorder threshold of 10 units. Average daily velocity is 4 units, giving roughly 1.5 days of cover. Raise a purchase order with the supplier to avoid a stock-out on the storefront.",
    type: "inventory" as const,
    priority: "High" as const,
    read: false,
    source: "Inventory",
    actor: "Stock monitor",
    link: { label: "View products", to: "/products" },
  },
  {
    notificationId: "NTF-9010",
    title: "Payout of ₹2,84,300 settled",
    body: "Weekly settlement completed to HDFC ••4421.",
    detail:
      "The settlement covers 214 orders between 11 and 17 September, minus ₹9,420 in platform fees and ₹3,150 in refunds. The bank reference number is HDFC/STL/884210.",
    type: "payment" as const,
    priority: "Medium" as const,
    read: true,
    source: "Payments",
    actor: "Settlement engine",
    link: { label: "View sales", to: "/sales" },
  },
  {
    notificationId: "NTF-9009",
    title: "New customer segment reached 500 members",
    body: "The Loyal segment crossed 500 active customers.",
    detail:
      "Customers qualify for the Loyal segment after 5 completed orders in 12 months. Average order value in this segment is ₹4,180, which is 34% higher than the store average.",
    type: "customer" as const,
    priority: "Low" as const,
    read: true,
    source: "Customers",
    actor: "Segmentation job",
    link: { label: "View customers", to: "/customers" },
  },
  {
    notificationId: "NTF-9008",
    title: "Storefront banner published",
    body: "Monsoon Essentials campaign is now live.",
    detail:
      "The campaign hero was published by Priya Nair and is visible on the storefront homepage. Scheduled to run until 30 September 2026.",
    type: "system" as const,
    priority: "Low" as const,
    read: true,
    source: "CMS",
    actor: "Priya Nair",
    link: { label: "View storefront", to: "/storefront" },
  },
  {
    notificationId: "NTF-9007",
    title: "Failed payment retry succeeded",
    body: "Order #BLM-10460 payment captured on retry.",
    detail:
      "The initial card authorisation failed due to insufficient funds. An automatic retry after 4 hours succeeded and the order has moved to Processing.",
    type: "payment" as const,
    priority: "Medium" as const,
    read: true,
    source: "Payments",
    actor: "Payment gateway",
  },
  {
    notificationId: "NTF-9006",
    title: "Role updated — Catalog Manager",
    body: "Product delete permission was revoked.",
    detail:
      "Administrator Alex Morgan updated the Catalog Manager role. Members can still create and edit products but can no longer delete them. 4 users are affected.",
    type: "system" as const,
    priority: "Medium" as const,
    read: true,
    source: "Security",
    actor: "Alex Morgan",
    link: { label: "View roles", to: "/settings/roles" },
  },
];

// Seed notifications if database collection is empty
const ensureDefaultNotifications = async () => {
  const count = await Notification.countDocuments();
  if (count === 0) {
    await Notification.insertMany(defaultNotifications);
  }
};

// =====================================================
// LIST NOTIFICATIONS
// =====================================================
export const getNotifications = async (filters: {
  search?: string;
  type?: string;
  priority?: string;
  read?: string;
  page?: number;
  limit?: number;
}) => {
  await ensureDefaultNotifications();

  const { search, type, priority, read, page = 1, limit = 20 } = filters;
  const query: Record<string, any> = { isArchived: false };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { body: { $regex: search, $options: "i" } },
      { detail: { $regex: search, $options: "i" } },
    ];
  }

  if (type && type !== "All") {
    const t = type.toLowerCase();
    if (t === "orders") query.type = "order";
    else if (t === "inventory") query.type = "inventory";
    else if (t === "payments") query.type = "payment";
    else if (t === "system") query.type = { $in: ["system", "customer"] };
    else query.type = t;
  }

  if (priority && priority !== "All") {
    query.priority = priority;
  }

  if (read !== undefined && read !== "") {
    if (read === "true" || read === "read") query.read = true;
    else if (read === "false" || read === "unread") query.read = false;
  }

  const skip = (page - 1) * limit;

  const [data, total, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ isArchived: false, read: false }),
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

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

// =====================================================
// GET NOTIFICATION DETAIL
// =====================================================
export const getNotificationById = async (id: string) => {
  await ensureDefaultNotifications();

  const notification = await Notification.findOne({
    $or: [{ notificationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  });

  if (!notification) {
    throw new AppError("Notification not found", httpStatusCodes.NOT_FOUND);
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

// =====================================================
// MARK NOTIFICATION READ / UNREAD
// =====================================================
export const markNotificationRead = async (id: string, read: boolean = true) => {
  const notification = await Notification.findOneAndUpdate(
    {
      $or: [{ notificationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    },
    { read },
    { new: true }
  );

  if (!notification) {
    throw new AppError("Notification not found", httpStatusCodes.NOT_FOUND);
  }

  return notification;
};

// =====================================================
// MARK ALL AS READ
// =====================================================
export const markAllNotificationsRead = async () => {
  await Notification.updateMany({ isArchived: false, read: false }, { read: true });
  return { message: "All notifications marked as read" };
};

// =====================================================
// ARCHIVE NOTIFICATION
// =====================================================
export const archiveNotification = async (id: string) => {
  const notification = await Notification.findOneAndUpdate(
    {
      $or: [{ notificationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    },
    { isArchived: true },
    { new: true }
  );

  if (!notification) {
    throw new AppError("Notification not found", httpStatusCodes.NOT_FOUND);
  }

  return { message: "Notification archived successfully" };
};
