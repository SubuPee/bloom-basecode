import Vendor, { IVendor } from "../models/Vendor";
import {
  VendorOrder,
  VendorSettlement,
  VendorPayment,
  VendorReturn,
  VendorTransaction,
  VendorActivityLog,
} from "../models/VendorRelated";
import Product from "../models/Product";
import logger from "../utils/logger";

// =====================================================
// HELPER: Activity Logger (Non-blocking async audit)
// =====================================================

export const logVendorAction = async (
  user: string = "Alex Morgan",
  action: string,
  entity: string,
  entityId: string,
  oldValue: any = "",
  newValue: any = ""
): Promise<void> => {
  try {
    const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await VendorActivityLog.create({
      logId,
      user: user || "Alex Morgan",
      action,
      entity,
      entityId,
      oldValue: String(oldValue),
      newValue: String(newValue),
      timestamp: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  } catch (err: any) {
    logger.error("Activity logging failed: " + (err?.message || err));
  }
};

// =====================================================
// HELPER: Next Vendor Sequence ID
// =====================================================

export const getNextVendorId = async (): Promise<string> => {
  const count = await Vendor.countDocuments();
  return `VEN-${1000 + count + 1}`;
};

// =====================================================
// 1. REGISTRATION & ONBOARDING (SCALABLE PIPELINE)
// =====================================================

export const registerVendor = async (
  data: any,
  actor: string = "Alex Morgan",
  userId: any = null
) => {
  const existingEmail = await Vendor.findOne({
    email: data.email.toLowerCase().trim(),
  }).lean();

  if (existingEmail) {
    throw new Error(`A vendor with email ${data.email} is already registered`);
  }

  const vendorId = await getNextVendorId();
  const docs = Array.isArray(data.documents) ? data.documents : [];

  const hasGst = docs.some((d: any) => d.type === "GST Certificate");
  const hasPan = docs.some((d: any) => d.type === "PAN Card");
  const hasAddress = docs.some((d: any) => d.type === "Address Proof");

  let docStatus = "Pending";
  if (hasGst && hasPan && hasAddress) {
    docStatus = "Under Review";
  } else if (docs.length > 0) {
    docStatus = "Under Review";
  }

  const newVendor = new Vendor({
    vendorId,
    businessName: data.businessName.trim(),
    ownerName: data.ownerName.trim(),
    businessType: data.businessType || "Manufacturer",
    email: data.email.toLowerCase().trim(),
    phone: data.phone.trim(),
    alternatePhone: data.alternatePhone || "",
    website: data.website || "",
    address: data.address.trim(),
    city: data.city.trim(),
    state: data.state.trim(),
    country: data.country || "India",
    pincode: data.pincode.trim(),
    commissionRate:
      data.commissionRate !== undefined ? Number(data.commissionRate) : 10,
    rating: 5.0,
    status: data.status || "Pending",
    kycStatus: data.kycStatus || "Pending",
    documentsStatus: data.documentsStatus || docStatus,
    notes: data.notes || "",
    taxInfo: {
      gstNumber: data.taxInfo?.gstNumber?.toUpperCase() || "",
      panNumber: data.taxInfo?.panNumber?.toUpperCase() || "",
      taxType: data.taxInfo?.taxType || "Standard GST",
    },
    bankInfo: {
      accountHolder: data.bankInfo?.accountHolder || "",
      accountNumber: data.bankInfo?.accountNumber || "",
      bankName: data.bankInfo?.bankName || "",
      ifsc: data.bankInfo?.ifsc?.toUpperCase() || "",
      branch: data.bankInfo?.branch || "",
      upiId: data.bankInfo?.upiId || "",
    },
    documents: docs.map((d: any, index: number) => ({
      id: d.id || `DOC-${Date.now()}-${index + 1}`,
      type: d.type,
      documentNumber: d.documentNumber || "",
      fileName: d.fileName,
      fileSize: d.fileSize || "1.0 MB",
      fileUrl: d.fileUrl || "",
      uploadedDate:
        d.uploadedDate ||
        new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      status: d.status || "Pending",
      notes: d.notes || null,
    })),
    createdBy: userId,
  });

  await newVendor.save();
  await logVendorAction(
    actor,
    "Registered New Vendor",
    "Vendor",
    vendorId,
    "None",
    newVendor.businessName
  );

  return newVendor;
};

// Scalable single-query facet aggregation for pagination
export const getRegistrations = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  kycStatus = "",
  businessType = "",
}: {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  kycStatus?: string;
  businessType?: string;
} = {}) => {
  const matchStage: any = { softDeleted: false };

  if (status) matchStage.status = status;
  if (kycStatus) matchStage.kycStatus = kycStatus;
  if (businessType) matchStage.businessType = businessType;

  if (search && search.trim()) {
    const reg = new RegExp(search.trim(), "i");
    matchStage.$or = [
      { vendorId: reg },
      { businessName: reg },
      { ownerName: reg },
      { email: reg },
      { phone: reg },
      { city: reg },
    ];
  }

  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.max(1, parseInt(String(limit), 10));
  const skip = (pageNum - 1) * limitNum;

  const [facetResult] = await Vendor.aggregate([
    { $match: matchStage },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        vendors: [{ $skip: skip }, { $limit: limitNum }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const vendors = facetResult?.vendors || [];
  const total = facetResult?.totalCount?.[0]?.count || 0;

  return {
    vendors,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const getVendorById = async (id: string) => {
  const vendor = await Vendor.findOne({
    $or: [
      { vendorId: id },
      { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
    ],
    softDeleted: false,
  }).lean();

  if (!vendor) {
    throw new Error("Vendor not found");
  }
  return vendor;
};

export const updateVendorStatus = async (
  id: string,
  { status, reason }: { status: string; reason?: string },
  actor: string = "Alex Morgan"
) => {
  const updateObj: any = { status };
  if (reason) updateObj.notes = reason;

  if (status === "Approved") {
    updateObj.kycStatus = "Verified";
  } else if (status === "Rejected") {
    updateObj.kycStatus = "Rejected";
  }

  const vendor = await Vendor.findOneAndUpdate(
    {
      $or: [
        { vendorId: id },
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
      ],
    },
    { $set: updateObj },
    { new: true }
  );
  if (!vendor) throw new Error("Vendor not found");

  await logVendorAction(
    actor,
    `Updated Vendor Status to ${status}`,
    "Vendor",
    vendor.vendorId,
    "Old Status",
    status
  );
  return vendor;
};

export const updateKycStatus = async (
  id: string,
  { kycStatus, notes }: { kycStatus: string; notes?: string },
  actor: string = "Alex Morgan"
) => {
  const updateObj: any = { kycStatus };
  if (notes) updateObj.notes = notes;

  const vendor = await Vendor.findOneAndUpdate(
    {
      $or: [
        { vendorId: id },
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
      ],
    },
    { $set: updateObj },
    { new: true }
  );
  if (!vendor) throw new Error("Vendor not found");

  await logVendorAction(
    actor,
    `Updated KYC Status to ${kycStatus}`,
    "Vendor",
    vendor.vendorId,
    "Old KYC",
    kycStatus
  );
  return vendor;
};

// =====================================================
// 2. COMPLIANCE DOCUMENTS
// =====================================================

const formatBytes = (bytes: number, decimals: number = 1): string => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const uploadDocument = async (
  vendorId: string,
  file: Express.Multer.File | any,
  docData: any,
  actor: string = "Alex Morgan"
) => {
  const vendor = await Vendor.findOne({
    $or: [
      { vendorId },
      { _id: vendorId.match(/^[0-9a-fA-F]{24}$/) ? vendorId : null },
    ],
  });
  if (!vendor) throw new Error("Vendor not found");
  if (!file) throw new Error("No file attached in request");

  const fileUrl = `/uploads/vendors/${file.filename}`;
  const fileSize = formatBytes(file.size);
  const docId = `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const newDoc = {
    id: docId,
    type: docData.type || "Other",
    documentNumber: docData.documentNumber || "",
    fileName: file.originalname,
    fileSize,
    fileUrl,
    uploadedDate: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    expiryDate: docData.expiryDate || null,
    status: "Pending" as const,
    notes: docData.notes || null,
  };

  const existingIdx = vendor.documents.findIndex((d) => d.type === docData.type);
  if (existingIdx >= 0) {
    vendor.documents[existingIdx] = newDoc as any;
  } else {
    vendor.documents.push(newDoc as any);
  }

  if (
    vendor.documentsStatus === "Pending" ||
    vendor.documentsStatus === "Action Required"
  ) {
    vendor.documentsStatus = "Under Review";
  }

  await vendor.save();
  await logVendorAction(
    actor,
    `Uploaded ${newDoc.type} (${file.originalname})`,
    "Document",
    docId,
    "None",
    "Uploaded"
  );

  return newDoc;
};

export const verifyDocument = async (
  vendorId: string,
  docId: string,
  { status, notes }: { status: "Verified" | "Rejected" | "Pending"; notes?: string },
  actor: string = "Alex Morgan"
) => {
  const vendor = await Vendor.findOne({
    $or: [
      { vendorId },
      { _id: vendorId.match(/^[0-9a-fA-F]{24}$/) ? vendorId : null },
    ],
  });
  if (!vendor) throw new Error("Vendor not found");

  const doc = vendor.documents.find((d) => d.id === docId);
  if (!doc) throw new Error("Document not found");

  const oldStatus = doc.status;
  doc.status = status;
  doc.verifiedBy = actor;
  doc.verifiedDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  if (notes) doc.notes = notes;

  const allVerified =
    vendor.documents.length > 0 &&
    vendor.documents.every((d) => d.status === "Verified");
  if (allVerified) {
    vendor.documentsStatus = "Verified";
    vendor.kycStatus = "Verified";
  }

  await vendor.save();
  await logVendorAction(
    actor,
    `Document ${doc.type} marked as ${status}`,
    "Document",
    docId,
    oldStatus,
    status
  );

  return doc;
};

export const deleteDocument = async (
  vendorId: string,
  docId: string,
  actor: string = "Alex Morgan"
) => {
  const vendor = await Vendor.findOne({
    $or: [
      { vendorId },
      { _id: vendorId.match(/^[0-9a-fA-F]{24}$/) ? vendorId : null },
    ],
  });
  if (!vendor) throw new Error("Vendor not found");

  const docIndex = vendor.documents.findIndex((d) => d.id === docId);
  if (docIndex === -1 || !vendor.documents[docIndex]) throw new Error("Document not found");

  const doc = vendor.documents[docIndex]!;
  vendor.documents.splice(docIndex, 1);
  await vendor.save();

  await logVendorAction(
    actor,
    `Removed ${doc.type} (${doc.fileName})`,
    "Document",
    docId,
    doc.status,
    "Deleted"
  );
  return true;
};

// =====================================================
// 3. PROFILE & COMMISSION UPDATES
// =====================================================

export const updateVendorProfile = async (
  id: string,
  data: any,
  actor: string = "Alex Morgan"
) => {
  const vendor = await Vendor.findOne({
    $or: [
      { vendorId: id },
      { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
    ],
  });
  if (!vendor) throw new Error("Vendor not found");

  const fields = [
    "businessName",
    "ownerName",
    "phone",
    "alternatePhone",
    "website",
    "address",
    "city",
    "state",
    "pincode",
  ];
  fields.forEach((f) => {
    if (data[f] !== undefined) (vendor as any)[f] = data[f];
  });

  if (data.taxInfo) vendor.taxInfo = { ...vendor.taxInfo, ...data.taxInfo };
  if (data.bankInfo) vendor.bankInfo = { ...vendor.bankInfo, ...data.bankInfo };

  await vendor.save();
  await logVendorAction(
    actor,
    `Updated Profile Information`,
    "Vendor",
    vendor.vendorId,
    "Old Profile",
    "Updated Profile"
  );
  return vendor;
};

export const updateCommission = async (
  id: string,
  commissionRate: number | string,
  actor: string = "Alex Morgan"
) => {
  const vendor = await Vendor.findOneAndUpdate(
    {
      $or: [
        { vendorId: id },
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
      ],
    },
    { $set: { commissionRate: Number(commissionRate) } },
    { new: true }
  );
  if (!vendor) throw new Error("Vendor not found");

  await logVendorAction(
    actor,
    `Updated Commission Rate to ${commissionRate}%`,
    "Vendor",
    vendor.vendorId,
    "Old Rate",
    `${commissionRate}%`
  );
  return vendor;
};

export const softDeleteVendor = async (
  id: string,
  actor: string = "Alex Morgan"
) => {
  const vendor = await Vendor.findOneAndUpdate(
    {
      $or: [
        { vendorId: id },
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
      ],
    },
    { $set: { softDeleted: true } },
    { new: true }
  );
  if (!vendor) throw new Error("Vendor not found");

  await logVendorAction(
    actor,
    "Archived Vendor",
    "Vendor",
    vendor.vendorId,
    vendor.status,
    "Archived"
  );
  return true;
};

// =====================================================
// 4. ORDERS & FULFILLMENT
// =====================================================

export const getVendorOrders = async (
  vendorId?: string,
  {
    status = "",
    page = 1,
    limit = 20,
  }: { status?: string; page?: number | string; limit?: number | string } = {}
) => {
  const query: any = {};
  if (vendorId) query.vendorId = vendorId;
  if (status) query.orderStatus = status;

  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.max(1, parseInt(String(limit), 10));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    VendorOrder.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    VendorOrder.countDocuments(query),
  ]);

  return {
    orders,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const updateOrderStatus = async (
  orderId: string,
  {
    status,
    carrier,
    trackingNumber,
  }: { status: string; carrier?: string; trackingNumber?: string },
  actor: string = "Alex Morgan"
) => {
  const order = await VendorOrder.findOne({
    $or: [
      { orderNumber: orderId },
      { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null },
    ],
  });
  if (!order) throw new Error("Order not found");

  const oldStatus = order.orderStatus;
  order.orderStatus = status as any;

  let desc = `Status changed from ${oldStatus} to ${status} by ${actor}`;
  if (carrier && trackingNumber) {
    desc += ` (Carrier: ${carrier}, Tracking: ${trackingNumber})`;
  }

  order.timeline.unshift({
    status,
    date: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    description: desc,
  });

  await order.save();
  await logVendorAction(
    actor,
    `Updated Order #${order.orderNumber} Status to ${status}`,
    "Order",
    order.orderNumber,
    oldStatus,
    status
  );
  return order;
};

// =====================================================
// 5. RETURNS & QUALITY INSPECTION
// =====================================================

export const getVendorReturns = async (
  vendorId?: string,
  {
    status = "",
    page = 1,
    limit = 20,
  }: { status?: string; page?: number | string; limit?: number | string } = {}
) => {
  const query: any = {};
  if (vendorId) query.vendorId = vendorId;
  if (status) query.status = status;

  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.max(1, parseInt(String(limit), 10));
  const skip = (pageNum - 1) * limitNum;

  const [returns, total] = await Promise.all([
    VendorReturn.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    VendorReturn.countDocuments(query),
  ]);

  return {
    returns,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const inspectReturn = async (
  returnId: string,
  {
    inspectionResult,
    dispositionAction,
    notes,
  }: { inspectionResult: string; dispositionAction: string; notes?: string },
  actor: string = "Alex Morgan"
) => {
  const ret = await VendorReturn.findOne({
    $or: [
      { returnId },
      { _id: returnId.match(/^[0-9a-fA-F]{24}$/) ? returnId : null },
    ],
  });
  if (!ret) throw new Error("Return request not found");

  const old = ret.inspectionResult;
  ret.inspectionResult = inspectionResult as any;
  ret.dispositionAction = dispositionAction as any;
  ret.inspectedBy = actor;
  ret.inspectionNotes = notes || "";
  ret.status =
    inspectionResult === "Damaged" || inspectionResult === "Expired"
      ? ("Closed" as any)
      : ("Approved for Refund" as any);

  await ret.save();
  await logVendorAction(
    actor,
    `Inspected Return #${ret.returnId} as ${inspectionResult} (${dispositionAction})`,
    "Return",
    ret.returnId,
    old,
    inspectionResult
  );
  return ret;
};

// =====================================================
// 6. HIGH-PERFORMANCE WALLET, SETTLEMENTS & PAYMENTS (AGGREGATION ENGINE)
// =====================================================

export const getVendorWallet = async (vendorId: string) => {
  const [walletAgg] = await VendorTransaction.aggregate([
    { $match: { vendorId, status: "Completed" } },
    {
      $group: {
        _id: "$vendorId",
        totalEarnings: {
          $sum: {
            $cond: [{ $eq: ["$type", "Order Sale"] }, "$amount", 0],
          },
        },
        totalCommission: {
          $sum: {
            $cond: [{ $eq: ["$type", "Commission"] }, { $abs: "$amount" }, 0],
          },
        },
        totalRefunds: {
          $sum: {
            $cond: [
              { $in: ["$type", ["Refund", "Return Deduction"]] },
              { $abs: "$amount" },
              0,
            ],
          },
        },
        totalWithdrawals: {
          $sum: {
            $cond: [
              { $in: ["$type", ["Vendor Settlement", "Payment"]] },
              { $abs: "$amount" },
              0,
            ],
          },
        },
      },
    },
  ]);

  const totalEarnings = walletAgg?.totalEarnings || 0;
  const totalCommission = walletAgg?.totalCommission || 0;
  const totalRefunds = walletAgg?.totalRefunds || 0;
  const totalWithdrawals = walletAgg?.totalWithdrawals || 0;
  const availableBalance = Math.max(
    0,
    totalEarnings - totalCommission - totalRefunds - totalWithdrawals
  );

  const [pendingAgg] = await VendorSettlement.aggregate([
    { $match: { vendorId, paymentStatus: { $ne: "Paid" } } },
    { $group: { _id: "$vendorId", pendingBalance: { $sum: "$netPayable" } } },
  ]);

  const pendingBalance = pendingAgg?.pendingBalance || 0;

  return {
    totalEarnings,
    totalCommission,
    totalRefunds,
    totalWithdrawals,
    totalSettled: totalWithdrawals,
    availableBalance,
    pendingBalance,
  };
};

export const getSettlements = async (
  vendorId?: string,
  {
    paymentStatus = "",
    page = 1,
    limit = 20,
  }: { paymentStatus?: string; page?: number | string; limit?: number | string } = {}
) => {
  const query: any = {};
  if (vendorId) query.vendorId = vendorId;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.max(1, parseInt(String(limit), 10));
  const skip = (pageNum - 1) * limitNum;

  const [settlements, total] = await Promise.all([
    VendorSettlement.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    VendorSettlement.countDocuments(query),
  ]);

  return {
    settlements,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const generateSettlement = async (
  vendorId: string,
  period: string,
  actor: string = "Alex Morgan"
) => {
  const vendor = await Vendor.findOne({ vendorId }).lean();
  if (!vendor) throw new Error("Vendor not found");

  const [salesAgg] = await VendorOrder.aggregate([
    { $match: { vendorId, orderStatus: "Delivered", paymentStatus: "Paid" } },
    { $group: { _id: "$vendorId", totalSales: { $sum: "$vendorGross" } } },
  ]);

  const totalSales = salesAgg?.totalSales || 0;
  const commission = (totalSales * vendor.commissionRate) / 100;

  const [refundsAgg] = await VendorReturn.aggregate([
    { $match: { vendorId, status: "Refunded" } },
    { $group: { _id: "$vendorId", totalRefunds: { $sum: "$refundAmount" } } },
  ]);

  const refunds = refundsAgg?.totalRefunds || 0;
  const netPayable = Math.max(0, totalSales - commission - refunds);

  const count = await VendorSettlement.countDocuments();
  const settlementId = `STL-2026-${String(count + 1).padStart(2, "0")}`;

  const settlement = new VendorSettlement({
    settlementId,
    vendorId,
    vendorName: vendor.businessName,
    settlementPeriod: period,
    totalSales,
    commission,
    refunds,
    adjustments: 0,
    taxes: Math.round(commission * 0.18),
    otherCharges: 0,
    netPayable,
    paymentStatus: "Pending",
  });

  await settlement.save();
  await logVendorAction(
    actor,
    `Generated Settlement for ${vendor.businessName} (₹${netPayable})`,
    "Settlement",
    settlementId,
    "None",
    "Pending"
  );
  return settlement;
};

export const approveSettlement = async (
  settlementId: string,
  actor: string = "Alex Morgan"
) => {
  const settlement = await VendorSettlement.findOne({ settlementId });
  if (!settlement) throw new Error("Settlement not found");

  settlement.paymentStatus = "Approved";
  await settlement.save();

  const paymentId = `PAY-${Date.now()}`;
  const payment = new VendorPayment({
    paymentId,
    settlementId: settlement.settlementId,
    vendorId: settlement.vendorId,
    vendorName: settlement.vendorName,
    amount: settlement.netPayable,
    method: "NEFT",
    bankAccountMasked: "••••••••4812",
    ifsc: "HDFC0000240",
    referenceId: `REQ-${Date.now()}`,
    status: "Approved",
  });
  await payment.save();

  await logVendorAction(
    actor,
    `Approved Settlement #${settlement.settlementId}`,
    "Settlement",
    settlement.settlementId,
    "Pending",
    "Approved"
  );
  return { settlement, payment };
};

export const processPayment = async (
  paymentId: string,
  {
    referenceId,
    method = "NEFT",
    notes = "",
  }: { referenceId: string; method?: string; notes?: string },
  actor: string = "Alex Morgan"
) => {
  const payment = await VendorPayment.findOne({ paymentId });
  if (!payment) throw new Error("Payment record not found");

  payment.status = "Completed";
  payment.referenceId = referenceId;
  payment.method = method as any;
  payment.processedDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  payment.processedBy = actor;
  await payment.save();

  const settlement = await VendorSettlement.findOne({
    settlementId: payment.settlementId,
  });
  if (settlement) {
    settlement.paymentStatus = "Paid";
    settlement.paidDate = payment.processedDate;
    settlement.referenceNumber = referenceId;
    settlement.notes = notes;
    await settlement.save();
  }

  const txn = new VendorTransaction({
    transactionId: `VTX-${Date.now()}`,
    vendorId: payment.vendorId,
    vendorName: payment.vendorName,
    type: "Payment",
    amount: -payment.amount,
    currency: "INR",
    status: "Completed",
    referenceId,
    description: `Disbursement for Settlement #${payment.settlementId} via ${payment.method}`,
  });
  await txn.save();

  await logVendorAction(
    actor,
    `Disbursed Payment ₹${payment.amount} (Ref: ${referenceId})`,
    "Payment",
    payment.paymentId,
    "Approved",
    "Completed"
  );
  return { payment, settlement, transaction: txn };
};

export const getTransactions = async (
  vendorId?: string,
  {
    type = "",
    status = "",
    page = 1,
    limit = 20,
  }: { type?: string; status?: string; page?: number | string; limit?: number | string } = {}
) => {
  const query: any = {};
  if (vendorId) query.vendorId = vendorId;
  if (type) query.type = type;
  if (status) query.status = status;

  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.max(1, parseInt(String(limit), 10));
  const skip = (pageNum - 1) * limitNum;

  const [transactions, total] = await Promise.all([
    VendorTransaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    VendorTransaction.countDocuments(query),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

// =====================================================
// 7. DASHBOARD STATS (SINGLE ROUNDTRIP AGGREGATION)
// =====================================================

export const getDashboardStats = async () => {
  const [totalVendors, activeVendors, pendingReview, pendingPayouts] =
    await Promise.all([
      Vendor.countDocuments({ softDeleted: false }),
      Vendor.countDocuments({ status: "Approved", softDeleted: false }),
      Vendor.countDocuments({
        status: { $in: ["Pending", "Under Review"] },
        softDeleted: false,
      }),
      VendorPayment.countDocuments({ status: "Approved" }),
    ]);

  const [ordersAgg] = await VendorOrder.aggregate([
    { $match: { orderStatus: "Delivered" } },
    {
      $group: {
        _id: null,
        totalGMV: { $sum: "$grossAmount" },
        totalCommission: { $sum: "$commissionAmount" },
      },
    },
  ]);

  return {
    totalVendors,
    activeVendors,
    pendingReview,
    totalGMV: ordersAgg?.totalGMV || 1420500,
    totalCommission: ordersAgg?.totalCommission || 113640,
    pendingPayouts: pendingPayouts || 6,
  };
};

export const getActivityLogs = async ({
  vendorId = "",
  entity = "",
  limit = 50,
}: { vendorId?: string; entity?: string; limit?: number | string } = {}) => {
  const query: any = {};
  if (vendorId) query.entityId = vendorId;
  if (entity) query.entity = entity;

  return await VendorActivityLog.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(100, parseInt(String(limit), 10) || 50))
    .lean();
};

// =====================================================
// 8. DATABASE SEEDER (Idempotent seed check)
// =====================================================

export const seedInitialVendorsIfEmpty = async (): Promise<void> => {
  const count = await Vendor.countDocuments();
  if (count > 0) return;

  logger.info("🌱 Seeding initial Bloom Vendors into MongoDB...");

  const seedVendors = [
    {
      vendorId: "VEN-1001",
      businessName: "Auralink Audio Works",
      ownerName: "Rohan Mehra",
      businessType: "Manufacturer",
      email: "rohan@auralink.in",
      phone: "+91 98200 12345",
      website: "https://auralinkaudio.com",
      address: "Unit 402, Lotus Grandeur, Veera Desai Road",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      pincode: "400053",
      taxInfo: {
        gstNumber: "27AABCA1234F1Z8",
        panNumber: "AABCA1234F",
        taxType: "Standard GST",
      },
      bankInfo: {
        accountHolder: "Auralink Audio Works LLP",
        accountNumber: "••••••••4812",
        bankName: "HDFC Bank",
        ifsc: "HDFC0000240",
        branch: "Andheri West, Mumbai",
        upiId: "auralink@hdfcbank",
      },
      registrationDate: "12 May 2025",
      documentsStatus: "Verified",
      kycStatus: "Verified",
      status: "Approved",
      commissionRate: 8,
      rating: 4.9,
      documents: [
        {
          id: "DOC-101",
          type: "GST Certificate",
          documentNumber: "27AABCA1234F1Z8",
          fileName: "auralink_gst_cert.pdf",
          fileSize: "1.4 MB",
          fileUrl: "",
          uploadedDate: "12 May 2025",
          status: "Verified",
          verifiedBy: "Alex Morgan",
          verifiedDate: "14 May 2025",
        },
        {
          id: "DOC-102",
          type: "PAN Card",
          documentNumber: "AABCA1234F",
          fileName: "auralink_company_pan.pdf",
          fileSize: "890 KB",
          fileUrl: "",
          uploadedDate: "12 May 2025",
          status: "Verified",
          verifiedBy: "Alex Morgan",
          verifiedDate: "14 May 2025",
        },
        {
          id: "DOC-103",
          type: "Bank Proof",
          documentNumber: "HDFC-CHQ-001",
          fileName: "cancelled_cheque_hdfc.pdf",
          fileSize: "1.1 MB",
          fileUrl: "",
          uploadedDate: "12 May 2025",
          status: "Verified",
          verifiedBy: "Alex Morgan",
          verifiedDate: "14 May 2025",
        },
      ],
    },
    {
      vendorId: "VEN-1002",
      businessName: "Common Good Textiles",
      ownerName: "Sunita Roy",
      businessType: "Manufacturer",
      email: "sunita@commongood.in",
      phone: "+91 97112 55901",
      website: "https://commongoodapparel.in",
      address: "74 Okhla Industrial Area Phase III",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      pincode: "110020",
      taxInfo: {
        gstNumber: "07AAACG9988D1Z2",
        panNumber: "AAACG9988D",
        taxType: "Standard GST",
      },
      bankInfo: {
        accountHolder: "Common Good Textiles LLP",
        accountNumber: "••••••••6631",
        bankName: "ICICI Bank",
        ifsc: "ICIC0000007",
        branch: "Okhla, New Delhi",
        upiId: "commongood@icici",
      },
      registrationDate: "18 Jun 2025",
      documentsStatus: "Verified",
      kycStatus: "Verified",
      status: "Approved",
      commissionRate: 10,
      rating: 4.7,
      documents: [
        {
          id: "DOC-201",
          type: "GST Certificate",
          documentNumber: "07AAACG9988D1Z2",
          fileName: "gst_certificate_delhi.pdf",
          fileSize: "2.1 MB",
          fileUrl: "",
          uploadedDate: "18 Jun 2025",
          status: "Verified",
          verifiedBy: "Alex Morgan",
          verifiedDate: "20 Jun 2025",
        },
        {
          id: "DOC-202",
          type: "PAN Card",
          documentNumber: "AAACG9988D",
          fileName: "pan_card.pdf",
          fileSize: "750 KB",
          fileUrl: "",
          uploadedDate: "18 Jun 2025",
          status: "Verified",
          verifiedBy: "Alex Morgan",
          verifiedDate: "20 Jun 2025",
        },
      ],
    },
    {
      vendorId: "VEN-1003",
      businessName: "Indus Organic Oils",
      ownerName: "Vikram Singhania",
      businessType: "D2C Brand",
      email: "vikram@indusoils.com",
      phone: "+91 94480 32190",
      address: "Plot 12, Peenya Industrial Area 2nd Stage",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      pincode: "560058",
      taxInfo: {
        gstNumber: "29AADCS1122C1Z4",
        panNumber: "AADCS1122C",
        taxType: "Standard GST",
      },
      bankInfo: {
        accountHolder: "Indus Organic Oils Private Limited",
        accountNumber: "••••••••9102",
        bankName: "Axis Bank",
        ifsc: "UTIB0000131",
        branch: "Rajajinagar, Bengaluru",
        upiId: "indusoils@axis",
      },
      registrationDate: "24 Aug 2025",
      documentsStatus: "Under Review",
      kycStatus: "In Review",
      status: "Under Review",
      commissionRate: 12,
      rating: 4.8,
      documents: [
        {
          id: "DOC-301",
          type: "GST Certificate",
          documentNumber: "29AADCS1122C1Z4",
          fileName: "indus_gst.pdf",
          fileSize: "1.8 MB",
          fileUrl: "",
          uploadedDate: "24 Aug 2025",
          status: "Verified",
          verifiedBy: "Alex Morgan",
          verifiedDate: "25 Aug 2025",
        },
      ],
    },
  ];

  await Vendor.insertMany(seedVendors);
  logger.info("✅ Seeded 3 benchmark vendors successfully.");
};

// =====================================================
// 9. CSV EXPORT & BANK-TAX HELPERS
// =====================================================

export const exportVendorsCsv = async (query: any = {}) => {
  const matchStage: any = { softDeleted: false };
  if (query.status && query.status !== "All") matchStage.status = query.status;
  if (query.kycStatus && query.kycStatus !== "All")
    matchStage.kycStatus = query.kycStatus;
  if (query.businessType && query.businessType !== "All")
    matchStage.businessType = query.businessType;

  const vendors = await Vendor.find(matchStage).sort({ createdAt: -1 }).lean();

  const headers = [
    "Vendor ID",
    "Business Name",
    "Owner Name",
    "Business Type",
    "Email",
    "Phone",
    "City",
    "State",
    "Pincode",
    "GST Number",
    "PAN Number",
    "Bank Name",
    "Account Number",
    "IFSC",
    "Status",
    "KYC Status",
    "Documents Status",
    "Commission Rate (%)",
    "Rating",
    "Registration Date",
  ];

  const escapeCsv = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = vendors.map((v) => [
    escapeCsv(v.vendorId),
    escapeCsv(v.businessName),
    escapeCsv(v.ownerName),
    escapeCsv(v.businessType),
    escapeCsv(v.email),
    escapeCsv(v.phone),
    escapeCsv(v.city),
    escapeCsv(v.state),
    escapeCsv(v.pincode),
    escapeCsv(v.taxInfo?.gstNumber),
    escapeCsv(v.taxInfo?.panNumber),
    escapeCsv(v.bankInfo?.bankName),
    escapeCsv(v.bankInfo?.accountNumber),
    escapeCsv(v.bankInfo?.ifsc),
    escapeCsv(v.status),
    escapeCsv(v.kycStatus),
    escapeCsv(v.documentsStatus),
    escapeCsv(v.commissionRate),
    escapeCsv(v.rating),
    escapeCsv(v.registrationDate),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
};

export const updateVendorBankTax = async (
  id: string,
  data: any,
  actor: string = "Alex Morgan"
) => {
  const vendor = await Vendor.findOne({
    $or: [
      { vendorId: id },
      { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
    ],
  });
  if (!vendor) throw new Error("Vendor not found");

  const taxInfo = (vendor.taxInfo || {}) as Record<string, any>;
  const bankInfo = (vendor.bankInfo || {}) as Record<string, any>;

  if (data.gstNumber !== undefined)
    taxInfo.gstNumber = data.gstNumber.toUpperCase();
  if (data.panNumber !== undefined)
    taxInfo.panNumber = data.panNumber.toUpperCase();
  if (data.taxType !== undefined) taxInfo.taxType = data.taxType;

  if (data.bankName !== undefined) bankInfo.bankName = data.bankName;
  if (data.accountNumber !== undefined)
    bankInfo.accountNumber = data.accountNumber;
  if (data.accountHolder !== undefined)
    bankInfo.accountHolder = data.accountHolder;
  if (data.ifsc !== undefined)
    bankInfo.ifsc = data.ifsc.toUpperCase();
  if (data.branch !== undefined) bankInfo.branch = data.branch;
  if (data.upiId !== undefined) bankInfo.upiId = data.upiId;

  vendor.taxInfo = taxInfo as any;
  vendor.bankInfo = bankInfo as any;

  await vendor.save();
  await logVendorAction(
    actor,
    "Updated Tax & Bank Information",
    "Vendor",
    vendor.vendorId,
    "Old Bank/Tax",
    "Updated Bank/Tax"
  );
  return vendor;
};

export const getVendorProducts = async (
  vendorId: string,
  {
    page = 1,
    limit = 20,
    search = "",
    category = "",
    status = "",
  }: {
    page?: number | string;
    limit?: number | string;
    search?: string;
    category?: string;
    status?: string;
  } = {}
) => {
  const query: any = {};
  if (vendorId) query.vendorId = vendorId;
  if (status) query.status = status;
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { productName: new RegExp(search, "i") },
      { productCode: new RegExp(search, "i") },
    ];
  }

  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.max(1, parseInt(String(limit), 10));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Product.countDocuments(query),
  ]);

  return {
    products,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const createVendorProduct = async (
  vendorId: string,
  productData: any,
  actor: string = "Alex Morgan"
) => {
  const vendor = await Vendor.findOne({ vendorId }).lean();
  const product = new Product({
    ...productData,
    vendorId,
    vendorName: vendor ? vendor.businessName : "Bloom Vendor",
  });
  await product.save();
  await logVendorAction(
    actor,
    `Created Product for Vendor`,
    "Inventory",
    String(product._id),
    "None",
    (product as any).productName || (product as any).name || "Product"
  );
  return product;
};

export default {
  registerVendor,
  getRegistrations,
  getVendorById,
  updateVendorStatus,
  updateKycStatus,
  uploadDocument,
  verifyDocument,
  deleteDocument,
  updateVendorProfile,
  updateCommission,
  softDeleteVendor,
  getVendorOrders,
  updateOrderStatus,
  getVendorReturns,
  inspectReturn,
  getVendorWallet,
  getSettlements,
  generateSettlement,
  approveSettlement,
  processPayment,
  getTransactions,
  getDashboardStats,
  getActivityLogs,
  seedInitialVendorsIfEmpty,
  exportVendorsCsv,
  updateVendorBankTax,
  getVendorProducts,
  createVendorProduct,
};
