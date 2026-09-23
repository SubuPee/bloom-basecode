export type Notification = {
  id: string;
  title: string;
  body: string;
  detail: string;
  type: "order" | "inventory" | "customer" | "system" | "payment";
  priority: "High" | "Medium" | "Low";
  time: string;
  date: string;
  read: boolean;
  source: string;
  actor: string;
  link?: { label: string; to: string };
};

export const notifications: Notification[] = [
  {
    id: "NTF-9012",
    title: "New order #BLM-10482 placed",
    body: "Aarav Mehta placed an order worth ₹18,450 with express delivery.",
    detail:
      "The order contains 3 items and has been paid through UPI. Warehouse Mumbai Central has been notified and the packing slip is queued for printing. Expected dispatch is within 6 hours.",
    type: "order",
    priority: "High",
    time: "12 minutes ago",
    date: "18 Sep 2026, 09:12",
    read: false,
    source: "Orders",
    actor: "Checkout service",
    link: { label: "View order", to: "/orders" },
  },
  {
    id: "NTF-9011",
    title: "Low stock alert — Wireless Headphones",
    body: "Only 6 units remain across all warehouses.",
    detail:
      "Stock has dropped below the reorder threshold of 10 units. Average daily velocity is 4 units, giving roughly 1.5 days of cover. Raise a purchase order with the supplier to avoid a stock-out on the storefront.",
    type: "inventory",
    priority: "High",
    time: "1 hour ago",
    date: "18 Sep 2026, 08:20",
    read: false,
    source: "Inventory",
    actor: "Stock monitor",
    link: { label: "View products", to: "/products" },
  },
  {
    id: "NTF-9010",
    title: "Payout of ₹2,84,300 settled",
    body: "Weekly settlement completed to HDFC ••4421.",
    detail:
      "The settlement covers 214 orders between 11 and 17 September, minus ₹9,420 in platform fees and ₹3,150 in refunds. The bank reference number is HDFC/STL/884210.",
    type: "payment",
    priority: "Medium",
    time: "3 hours ago",
    date: "18 Sep 2026, 06:05",
    read: true,
    source: "Payments",
    actor: "Settlement engine",
    link: { label: "View sales", to: "/sales" },
  },
  {
    id: "NTF-9009",
    title: "New customer segment reached 500 members",
    body: "The Loyal segment crossed 500 active customers.",
    detail:
      "Customers qualify for the Loyal segment after 5 completed orders in 12 months. Average order value in this segment is ₹4,180, which is 34% higher than the store average.",
    type: "customer",
    priority: "Low",
    time: "Yesterday",
    date: "17 Sep 2026, 18:44",
    read: true,
    source: "Customers",
    actor: "Segmentation job",
    link: { label: "View customers", to: "/customers" },
  },
  {
    id: "NTF-9008",
    title: "Storefront banner published",
    body: "Monsoon Essentials campaign is now live.",
    detail:
      "The campaign hero was published by Priya Nair and is visible on the storefront homepage. Scheduled to run until 30 September 2026.",
    type: "system",
    priority: "Low",
    time: "Yesterday",
    date: "17 Sep 2026, 15:10",
    read: true,
    source: "CMS",
    actor: "Priya Nair",
    link: { label: "View storefront", to: "/storefront" },
  },
  {
    id: "NTF-9007",
    title: "Failed payment retry succeeded",
    body: "Order #BLM-10460 payment captured on retry.",
    detail:
      "The initial card authorisation failed due to insufficient funds. An automatic retry after 4 hours succeeded and the order has moved to Processing.",
    type: "payment",
    priority: "Medium",
    time: "2 days ago",
    date: "16 Sep 2026, 11:02",
    read: true,
    source: "Payments",
    actor: "Payment gateway",
  },
  {
    id: "NTF-9006",
    title: "Role updated — Catalog Manager",
    body: "Product delete permission was revoked.",
    detail:
      "Administrator Alex Morgan updated the Catalog Manager role. Members can still create and edit products but can no longer delete them. 4 users are affected.",
    type: "system",
    priority: "Medium",
    time: "3 days ago",
    date: "15 Sep 2026, 17:35",
    read: true,
    source: "Security",
    actor: "Alex Morgan",
    link: { label: "View roles", to: "/settings/roles" },
  },
];

export type TeamUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Invited" | "Suspended";
  lastActive: string;
  warehouse: string;
  initials: string;
};

export const teamUsers: TeamUser[] = [
  {
    id: "USR-01",
    name: "Alex Morgan",
    email: "alex.morgan@bloom.store",
    role: "Administrator",
    status: "Active",
    lastActive: "Online now",
    warehouse: "All warehouses",
    initials: "AM",
  },
  {
    id: "USR-02",
    name: "Priya Nair",
    email: "priya.nair@bloom.store",
    role: "Content Editor",
    status: "Active",
    lastActive: "2 hours ago",
    warehouse: "Mumbai Central",
    initials: "PN",
  },
  {
    id: "USR-03",
    name: "Rohan Desai",
    email: "rohan.desai@bloom.store",
    role: "Catalog Manager",
    status: "Active",
    lastActive: "Yesterday",
    warehouse: "Pune Hub",
    initials: "RD",
  },
  {
    id: "USR-04",
    name: "Sara Khan",
    email: "sara.khan@bloom.store",
    role: "Support Agent",
    status: "Active",
    lastActive: "4 hours ago",
    warehouse: "All warehouses",
    initials: "SK",
  },
  {
    id: "USR-05",
    name: "Vikram Iyer",
    email: "vikram.iyer@bloom.store",
    role: "Finance",
    status: "Invited",
    lastActive: "Invite sent 2 days ago",
    warehouse: "All warehouses",
    initials: "VI",
  },
  {
    id: "USR-06",
    name: "Neha Gupta",
    email: "neha.gupta@bloom.store",
    role: "Warehouse Staff",
    status: "Suspended",
    lastActive: "3 weeks ago",
    warehouse: "Delhi North",
    initials: "NG",
  },
];

export type Role = {
  id: string;
  name: string;
  description: string;
  members: number;
  scope: string;
  permissions: Record<string, ("view" | "create" | "edit" | "delete")[]>;
};

export const permissionModules = [
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

export const roles: Role[] = [
  {
    id: "administrator",
    name: "Administrator",
    description: "Full access to every module including billing and security.",
    members: 1,
    scope: "Global",
    permissions: {
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
    id: "catalog-manager",
    name: "Catalog Manager",
    description: "Manages products, categories and inventory levels.",
    members: 4,
    scope: "Catalog",
    permissions: {
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
    id: "content-editor",
    name: "Content Editor",
    description: "Owns storefront content, banners and campaigns.",
    members: 3,
    scope: "CMS",
    permissions: {
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
    id: "support-agent",
    name: "Support Agent",
    description: "Handles customer queries, returns and order updates.",
    members: 6,
    scope: "Service",
    permissions: {
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
    id: "finance",
    name: "Finance",
    description: "Reads sales, payouts and tax reports.",
    members: 2,
    scope: "Reporting",
    permissions: {
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

export const integrations = [
  {
    name: "Razorpay",
    category: "Payments",
    status: "Connected",
    detail: "Live keys · settled weekly",
  },
  {
    name: "Shiprocket",
    category: "Logistics",
    status: "Connected",
    detail: "3 courier partners active",
  },
  {
    name: "Mailchimp",
    category: "Marketing",
    status: "Connected",
    detail: "12,480 subscribers synced",
  },
  {
    name: "Google Analytics",
    category: "Analytics",
    status: "Not connected",
    detail: "Track storefront traffic",
  },
  {
    name: "WhatsApp Business",
    category: "Messaging",
    status: "Not connected",
    detail: "Order updates over WhatsApp",
  },
  {
    name: "Tally",
    category: "Accounting",
    status: "Connected",
    detail: "Daily ledger export at 11 PM",
  },
];
