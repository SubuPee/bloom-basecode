import { Types } from "mongoose";
import Offer, { IOffer } from "../models/platform/Offer";
import PlatformTransaction, { IPlatformTransaction } from "../models/platform/Transaction";
import PlatformPayout, { IPlatformPayout } from "../models/platform/Payout";
import PlatformRefund, { IPlatformRefund } from "../models/platform/Refund";
import PlatformReview, { IPlatformReview } from "../models/platform/Review";
import SupportTicket, { ISupportTicket } from "../models/platform/SupportTicket";
import ShippingZone, { IShippingZone } from "../models/platform/ShippingZone";
import logger from "../utils/logger";

// Baseline Data (from bloom-b2c.ts)
const initialOffers = [
  {
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

const initialTransactions = [
  {
    txnId: "TXN-77412",
    orderId: "BLM-10482",
    customer: "Aarav Mehta",
    method: "UPI",
    amount: 18450,
    status: "Captured",
    date: "18 Sep 2026, 09:12",
    gateway: "Razorpay",
  },
  {
    txnId: "TXN-77411",
    orderId: "BLM-10481",
    customer: "Diya Sharma",
    method: "Card",
    amount: 6240,
    status: "Captured",
    date: "18 Sep 2026, 08:02",
    gateway: "Razorpay",
  },
  {
    txnId: "TXN-77410",
    orderId: "BLM-10480",
    customer: "Kabir Rao",
    method: "COD",
    amount: 2990,
    status: "Pending",
    date: "17 Sep 2026, 21:40",
    gateway: "Cash on delivery",
  },
  {
    txnId: "TXN-77409",
    orderId: "BLM-10479",
    customer: "Meera Joshi",
    method: "Netbanking",
    amount: 11200,
    status: "Refunded",
    date: "17 Sep 2026, 17:25",
    gateway: "Razorpay",
  },
  {
    txnId: "TXN-77408",
    orderId: "BLM-10478",
    customer: "Rahul Verma",
    method: "Wallet",
    amount: 1480,
    status: "Failed",
    date: "17 Sep 2026, 14:11",
    gateway: "Paytm",
  },
  {
    txnId: "TXN-77407",
    orderId: "BLM-10477",
    customer: "Ananya Iyer",
    method: "UPI",
    amount: 8320,
    status: "Captured",
    date: "17 Sep 2026, 11:55",
    gateway: "Razorpay",
  },
  {
    txnId: "TXN-77406",
    orderId: "BLM-10476",
    customer: "Zoya Khan",
    method: "Card",
    amount: 24990,
    status: "Captured",
    date: "16 Sep 2026, 19:30",
    gateway: "Razorpay",
  },
];

const initialPayouts = [
  {
    payoutId: "PO-3312",
    period: "11 – 17 Sep 2026",
    gross: 312870,
    fees: 9420,
    refunds: 3150,
    net: 300300,
    status: "Settled",
    bank: "HDFC ••4421",
  },
  {
    payoutId: "PO-3311",
    period: "04 – 10 Sep 2026",
    gross: 286400,
    fees: 8510,
    refunds: 6100,
    net: 271790,
    status: "Settled",
    bank: "HDFC ••4421",
  },
  {
    payoutId: "PO-3310",
    period: "28 Aug – 03 Sep 2026",
    gross: 254120,
    fees: 7640,
    refunds: 2280,
    net: 244200,
    status: "Settled",
    bank: "HDFC ••4421",
  },
];

const initialRefunds = [
  {
    refundId: "RF-1208",
    orderId: "BLM-10479",
    customer: "Meera Joshi",
    amount: 11200,
    reason: "Damaged on arrival",
    status: "Processed",
    date: "17 Sep 2026",
  },
  {
    refundId: "RF-1207",
    orderId: "BLM-10465",
    customer: "Sahil Bhatt",
    amount: 3450,
    reason: "Wrong size",
    status: "In review",
    date: "16 Sep 2026",
  },
  {
    refundId: "RF-1206",
    orderId: "BLM-10451",
    customer: "Nisha Pillai",
    amount: 1990,
    reason: "Changed mind",
    status: "Processed",
    date: "14 Sep 2026",
  },
];

const initialReviews = [
  {
    reviewId: "RV-554",
    product: "Wireless Headphones",
    customer: "Aarav Mehta",
    rating: 5,
    text: "Brilliant sound and the battery easily lasts two days of commuting.",
    status: "Pending",
    date: "18 Sep 2026",
  },
  {
    reviewId: "RV-553",
    product: "Ceramic Table Lamp",
    customer: "Diya Sharma",
    rating: 4,
    text: "Warm light, lovely finish. Cable could be a bit longer.",
    status: "Approved",
    date: "17 Sep 2026",
  },
  {
    reviewId: "RV-552",
    product: "Everyday Cotton Shirt",
    customer: "Kabir Rao",
    rating: 2,
    text: "Fabric is nice but the fit runs a size small.",
    status: "Pending",
    date: "17 Sep 2026",
  },
  {
    reviewId: "RV-551",
    product: "Portable Speaker",
    customer: "Ananya Iyer",
    rating: 5,
    text: "Compact, loud and survived a beach trip.",
    status: "Approved",
    date: "16 Sep 2026",
  },
];

const initialTickets = [
  {
    ticketId: "TK-2291",
    subject: "Delivery delayed beyond promise date",
    customer: "Rahul Verma",
    priority: "High",
    status: "Open",
    age: "2h",
  },
  {
    ticketId: "TK-2290",
    subject: "Refund not credited yet",
    customer: "Sahil Bhatt",
    priority: "High",
    status: "In progress",
    age: "1d",
  },
  {
    ticketId: "TK-2289",
    subject: "Need GST invoice",
    customer: "Zoya Khan",
    priority: "Low",
    status: "Open",
    age: "1d",
  },
  {
    ticketId: "TK-2288",
    subject: "Exchange request — shirt size",
    customer: "Kabir Rao",
    priority: "Medium",
    status: "Resolved",
    age: "3d",
  },
];

const initialShippingZones = [
  {
    zone: "Metro (Mumbai, Delhi, Bengaluru)",
    rate: "Free above ₹799",
    eta: "1 – 2 days",
    partners: "Delhivery, Blue Dart",
  },
  {
    zone: "Tier 2 cities",
    rate: "₹49",
    eta: "2 – 4 days",
    partners: "Delhivery, Ekart",
  },
  {
    zone: "Rest of India",
    rate: "₹79",
    eta: "4 – 7 days",
    partners: "India Post, Ekart",
  },
];

// Seed Helper
export const ensurePlatformSeeded = async (): Promise<void> => {
  try {
    const offerCount = await Offer.countDocuments();
    if (offerCount === 0) {
      await Offer.insertMany(initialOffers);
      logger.info("Platform offers seeded successfully");
    }

    const txnCount = await PlatformTransaction.countDocuments();
    if (txnCount === 0) {
      await PlatformTransaction.insertMany(initialTransactions);
      logger.info("Platform transactions seeded successfully");
    }

    const payoutCount = await PlatformPayout.countDocuments();
    if (payoutCount === 0) {
      await PlatformPayout.insertMany(initialPayouts);
      logger.info("Platform payouts seeded successfully");
    }

    const refundCount = await PlatformRefund.countDocuments();
    if (refundCount === 0) {
      await PlatformRefund.insertMany(initialRefunds);
      logger.info("Platform refunds seeded successfully");
    }

    const reviewCount = await PlatformReview.countDocuments();
    if (reviewCount === 0) {
      await PlatformReview.insertMany(initialReviews);
      logger.info("Platform reviews seeded successfully");
    }

    const ticketCount = await SupportTicket.countDocuments();
    if (ticketCount === 0) {
      await SupportTicket.insertMany(initialTickets);
      logger.info("Platform support tickets seeded successfully");
    }

    const zoneCount = await ShippingZone.countDocuments();
    if (zoneCount === 0) {
      await ShippingZone.insertMany(initialShippingZones);
      logger.info("Platform shipping zones seeded successfully");
    }
  } catch (error: any) {
    logger.warn(`Platform auto-seed notice: ${error?.message || error}`);
  }
};

class PlatformService {
  // 1. Control Centre Overview
  async getOverview() {
    await ensurePlatformSeeded();

    const [txns, offersList, reviewsList, ticketsList] = await Promise.all([
      PlatformTransaction.find().sort({ createdAt: -1 }).limit(7).lean(),
      Offer.find({ softDeleted: { $ne: true } }).lean(),
      PlatformReview.find().sort({ createdAt: -1 }).limit(5).lean(),
      SupportTicket.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const capturedSum = txns
      .filter((t) => t.status === "Captured")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      kpis: [
        {
          label: "Revenue today",
          value: capturedSum > 0 ? `₹${capturedSum.toLocaleString("en-IN")}` : "₹1,84,320",
          delta: "+12.4%",
          tone: "bg-success-soft text-success",
        },
        {
          label: "Orders today",
          value: "148",
          delta: "+8.1%",
          tone: "bg-blue-soft text-blue",
        },
        {
          label: "New B2C users",
          value: "62",
          delta: "+14.0%",
          tone: "bg-primary/10 text-primary",
        },
        {
          label: "Conversion rate",
          value: "3.4%",
          delta: "+0.3%",
          tone: "bg-warning-soft text-warning",
        },
      ],
      recentTransactions: txns,
      activeOffers: offersList.filter((o) => o.status === "Active"),
      recentReviews: reviewsList,
      recentTickets: ticketsList,
    };
  }

  // 2. Offers
  async getOffers(tab?: string, search?: string) {
    await ensurePlatformSeeded();
    const filter: any = { softDeleted: { $ne: true } };

    if (tab && tab !== "All") {
      filter.status = tab;
    }

    if (search && search.trim()) {
      filter.$or = [
        { code: { $regex: search.trim(), $options: "i" } },
        { title: { $regex: search.trim(), $options: "i" } },
      ];
    }

    return Offer.find(filter).sort({ createdAt: -1 });
  }

  async getOfferById(id: string) {
    return Offer.findOne({ _id: id, softDeleted: { $ne: true } });
  }

  async createOffer(data: any) {
    const existing = await Offer.findOne({
      code: data.code.toUpperCase(),
      softDeleted: { $ne: true },
    });
    if (existing) {
      throw new Error(`Offer with code ${data.code} already exists`);
    }

    const offer = new Offer({
      ...data,
      code: data.code.toUpperCase(),
    });
    return offer.save();
  }

  async updateOffer(id: string, data: any) {
    const offer = await Offer.findOne({ _id: id, softDeleted: { $ne: true } });
    if (!offer) {
      throw new Error("Offer not found");
    }

    if (data.code && data.code.toUpperCase() !== offer.code) {
      const duplicate = await Offer.findOne({
        _id: { $ne: id },
        code: data.code.toUpperCase(),
        softDeleted: { $ne: true },
      });
      if (duplicate) {
        throw new Error(`Offer with code ${data.code} already exists`);
      }
      data.code = data.code.toUpperCase();
    }

    Object.assign(offer, data);
    return offer.save();
  }

  async deleteOffer(id: string) {
    const offer = await Offer.findOne({ _id: id, softDeleted: { $ne: true } });
    if (!offer) {
      throw new Error("Offer not found");
    }
    offer.softDeleted = true;
    return offer.save();
  }

  // 3. Payments
  async getTransactions(status?: string, method?: string, search?: string) {
    await ensurePlatformSeeded();
    const filter: any = {};
    if (status && status !== "All status") filter.status = status;
    if (method && method !== "All methods") filter.method = method;
    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { customer: { $regex: q, $options: "i" } },
        { orderId: { $regex: q, $options: "i" } },
        { txnId: { $regex: q, $options: "i" } },
      ];
    }

    const transactions = await PlatformTransaction.find(filter).sort({ createdAt: -1 });
    const capturedTotal = transactions
      .filter((t) => t.status === "Captured")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      transactions,
      summary: {
        capturedTotal,
        totalCount: transactions.length,
      },
    };
  }

  async getPayouts() {
    await ensurePlatformSeeded();
    return PlatformPayout.find().sort({ createdAt: -1 });
  }

  async getRefunds() {
    await ensurePlatformSeeded();
    return PlatformRefund.find().sort({ createdAt: -1 });
  }

  // 4. Reviews
  async getReviews(status?: string) {
    await ensurePlatformSeeded();
    const filter: any = {};
    if (status) filter.status = status;
    return PlatformReview.find(filter).sort({ createdAt: -1 });
  }

  async createReview(data: any) {
    const count = await PlatformReview.countDocuments();
    const reviewId = `RV-${550 + count + 1}`;
    const review = new PlatformReview({
      reviewId,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      ...data,
    });
    return review.save();
  }

  async updateReviewStatus(id: string, status: "Pending" | "Approved" | "Rejected") {
    const filter = Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { reviewId: id }] }
      : { reviewId: id };
    const review = await PlatformReview.findOne(filter);
    if (!review) throw new Error("Review not found");
    review.status = status;
    return review.save();
  }

  async deleteReview(id: string) {
    const filter = Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { reviewId: id }] }
      : { reviewId: id };
    const review = await PlatformReview.findOneAndDelete(filter);
    if (!review) throw new Error("Review not found");
    return review;
  }

  // 5. Support Tickets
  async getTickets(status?: string) {
    await ensurePlatformSeeded();
    const filter: any = {};
    if (status) filter.status = status;
    return SupportTicket.find(filter).sort({ createdAt: -1 });
  }

  async createTicket(data: any) {
    const count = await SupportTicket.countDocuments();
    const ticketId = `TK-${2280 + count + 1}`;
    const ticket = new SupportTicket({
      ticketId,
      age: "Just now",
      ...data,
    });
    return ticket.save();
  }

  async updateTicketStatus(id: string, status: "Open" | "In progress" | "Resolved" | "Closed") {
    const filter = Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { ticketId: id }] }
      : { ticketId: id };
    const ticket = await SupportTicket.findOne(filter);
    if (!ticket) throw new Error("Support ticket not found");
    ticket.status = status;
    return ticket.save();
  }

  async deleteTicket(id: string) {
    const filter = Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { ticketId: id }] }
      : { ticketId: id };
    const ticket = await SupportTicket.findOneAndDelete(filter);
    if (!ticket) throw new Error("Support ticket not found");
    return ticket;
  }

  // 6. Shipping Zones
  async getShippingZones() {
    await ensurePlatformSeeded();
    return ShippingZone.find({ isActive: true });
  }

  async updateShippingZones(zones: any[]) {
    await ShippingZone.deleteMany({});
    return ShippingZone.insertMany(zones);
  }
}

export default new PlatformService();
