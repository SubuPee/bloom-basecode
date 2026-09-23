export type Txn = {
  id: string;
  order: string;
  customer: string;
  method: "UPI" | "Card" | "Netbanking" | "COD" | "Wallet";
  amount: number;
  status: "Captured" | "Pending" | "Refunded" | "Failed";
  date: string;
  gateway: string;
};

export const transactions: Txn[] = [
  {
    id: "TXN-77412",
    order: "BLM-10482",
    customer: "Aarav Mehta",
    method: "UPI",
    amount: 18450,
    status: "Captured",
    date: "18 Sep 2026, 09:12",
    gateway: "Razorpay",
  },
  {
    id: "TXN-77411",
    order: "BLM-10481",
    customer: "Diya Sharma",
    method: "Card",
    amount: 6240,
    status: "Captured",
    date: "18 Sep 2026, 08:02",
    gateway: "Razorpay",
  },
  {
    id: "TXN-77410",
    order: "BLM-10480",
    customer: "Kabir Rao",
    method: "COD",
    amount: 2990,
    status: "Pending",
    date: "17 Sep 2026, 21:40",
    gateway: "Cash on delivery",
  },
  {
    id: "TXN-77409",
    order: "BLM-10479",
    customer: "Meera Joshi",
    method: "Netbanking",
    amount: 11200,
    status: "Refunded",
    date: "17 Sep 2026, 17:25",
    gateway: "Razorpay",
  },
  {
    id: "TXN-77408",
    order: "BLM-10478",
    customer: "Rahul Verma",
    method: "Wallet",
    amount: 1480,
    status: "Failed",
    date: "17 Sep 2026, 14:11",
    gateway: "Paytm",
  },
  {
    id: "TXN-77407",
    order: "BLM-10477",
    customer: "Ananya Iyer",
    method: "UPI",
    amount: 8320,
    status: "Captured",
    date: "17 Sep 2026, 11:55",
    gateway: "Razorpay",
  },
  {
    id: "TXN-77406",
    order: "BLM-10476",
    customer: "Zoya Khan",
    method: "Card",
    amount: 24990,
    status: "Captured",
    date: "16 Sep 2026, 19:30",
    gateway: "Razorpay",
  },
];

export const payouts = [
  {
    id: "PO-3312",
    period: "11 – 17 Sep 2026",
    gross: 312870,
    fees: 9420,
    refunds: 3150,
    net: 300300,
    status: "Settled",
    bank: "HDFC ••4421",
  },
  {
    id: "PO-3311",
    period: "04 – 10 Sep 2026",
    gross: 286400,
    fees: 8510,
    refunds: 6100,
    net: 271790,
    status: "Settled",
    bank: "HDFC ••4421",
  },
  {
    id: "PO-3310",
    period: "28 Aug – 03 Sep 2026",
    gross: 254120,
    fees: 7640,
    refunds: 2280,
    net: 244200,
    status: "Settled",
    bank: "HDFC ••4421",
  },
];

export const refunds = [
  {
    id: "RF-1208",
    order: "BLM-10479",
    customer: "Meera Joshi",
    amount: 11200,
    reason: "Damaged on arrival",
    status: "Processed",
    date: "17 Sep 2026",
  },
  {
    id: "RF-1207",
    order: "BLM-10465",
    customer: "Sahil Bhatt",
    amount: 3450,
    reason: "Wrong size",
    status: "In review",
    date: "16 Sep 2026",
  },
  {
    id: "RF-1206",
    order: "BLM-10451",
    customer: "Nisha Pillai",
    amount: 1990,
    reason: "Changed mind",
    status: "Processed",
    date: "14 Sep 2026",
  },
];

export type Offer = {
  id: string;
  code: string;
  title: string;
  type: "Percent" | "Flat" | "Free shipping" | "BOGO";
  value: string;
  minOrder: number;
  used: number;
  limit: number;
  status: "Active" | "Scheduled" | "Expired";
  window: string;
  audience: string;
};

export const offers: Offer[] = [
  {
    id: "OFF-01",
    code: "MONSOON20",
    title: "Monsoon Essentials 20% off",
    type: "Percent",
    value: "20%",
    minOrder: 1499,
    used: 842,
    limit: 2000,
    status: "Active",
    window: "01 – 30 Sep 2026",
    audience: "All customers",
  },
  {
    id: "OFF-02",
    code: "FIRST300",
    title: "₹300 off first order",
    type: "Flat",
    value: "₹300",
    minOrder: 999,
    used: 1204,
    limit: 5000,
    status: "Active",
    window: "Always on",
    audience: "New customers",
  },
  {
    id: "OFF-03",
    code: "FREESHIP",
    title: "Free shipping above ₹799",
    type: "Free shipping",
    value: "₹0 shipping",
    minOrder: 799,
    used: 3311,
    limit: 10000,
    status: "Active",
    window: "Always on",
    audience: "All customers",
  },
  {
    id: "OFF-04",
    code: "LOYAL10",
    title: "Loyal customer 10% off",
    type: "Percent",
    value: "10%",
    minOrder: 0,
    used: 418,
    limit: 1000,
    status: "Active",
    window: "Always on",
    audience: "Loyal segment",
  },
  {
    id: "OFF-05",
    code: "DIWALI25",
    title: "Diwali festive sale",
    type: "Percent",
    value: "25%",
    minOrder: 1999,
    used: 0,
    limit: 5000,
    status: "Scheduled",
    window: "12 – 22 Oct 2026",
    audience: "All customers",
  },
  {
    id: "OFF-06",
    code: "BOGOTEE",
    title: "Buy 1 get 1 on tees",
    type: "BOGO",
    value: "1 + 1",
    minOrder: 0,
    used: 674,
    limit: 700,
    status: "Expired",
    window: "01 – 15 Aug 2026",
    audience: "All customers",
  },
];

export const reviews = [
  {
    id: "RV-554",
    product: "Wireless Headphones",
    customer: "Aarav Mehta",
    rating: 5,
    text: "Brilliant sound and the battery easily lasts two days of commuting.",
    status: "Pending",
    date: "18 Sep 2026",
  },
  {
    id: "RV-553",
    product: "Ceramic Table Lamp",
    customer: "Diya Sharma",
    rating: 4,
    text: "Warm light, lovely finish. Cable could be a bit longer.",
    status: "Approved",
    date: "17 Sep 2026",
  },
  {
    id: "RV-552",
    product: "Everyday Cotton Shirt",
    customer: "Kabir Rao",
    rating: 2,
    text: "Fabric is nice but the fit runs a size small.",
    status: "Pending",
    date: "17 Sep 2026",
  },
  {
    id: "RV-551",
    product: "Portable Speaker",
    customer: "Ananya Iyer",
    rating: 5,
    text: "Compact, loud and survived a beach trip.",
    status: "Approved",
    date: "16 Sep 2026",
  },
];

export const supportTickets = [
  {
    id: "TK-2291",
    subject: "Delivery delayed beyond promise date",
    customer: "Rahul Verma",
    priority: "High",
    status: "Open",
    age: "2h",
  },
  {
    id: "TK-2290",
    subject: "Refund not credited yet",
    customer: "Sahil Bhatt",
    priority: "High",
    status: "In progress",
    age: "1d",
  },
  {
    id: "TK-2289",
    subject: "Need GST invoice",
    customer: "Zoya Khan",
    priority: "Low",
    status: "Open",
    age: "1d",
  },
  {
    id: "TK-2288",
    subject: "Exchange request — shirt size",
    customer: "Kabir Rao",
    priority: "Medium",
    status: "Resolved",
    age: "3d",
  },
];

export const shippingZones = [
  {
    zone: "Metro (Mumbai, Delhi, Bengaluru)",
    rate: "Free above ₹799",
    eta: "1 – 2 days",
    partners: "Delhivery, Blue Dart",
  },
  { zone: "Tier 2 cities", rate: "₹49", eta: "2 – 4 days", partners: "Delhivery, Ekart" },
  { zone: "Rest of India", rate: "₹79", eta: "4 – 7 days", partners: "India Post, Ekart" },
];
