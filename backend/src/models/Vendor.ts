import mongoose, { Document, Model, Schema, Types } from "mongoose";

// =====================================================
// VENDOR DOCUMENT SUB-SCHEMA & INTERFACES
// =====================================================

export interface IVendorDocument {
  id: string;
  type: "PAN Card" | "GST Certificate" | "Business Registration" | "Address Proof" | "Bank Proof" | "Owner ID" | "Other" | string;
  documentNumber: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  uploadedDate: string;
  expiryDate?: string | null;
  status: "Pending" | "Verified" | "Rejected" | "Expired" | string;
  verifiedDate?: string | null;
  verifiedBy?: string | null;
  rejectionReason?: string | null;
  notes?: string;
  [key: string]: any;
}

export interface IVendor extends Document {
  vendorId: string;
  businessName: string;
  ownerName: string;
  businessType: "Individual" | "Partnership" | "Private Limited" | "Public Limited" | "LLP" | "Proprietorship" | string;
  email: string;
  phone: string;
  avatar?: string;
  banner?: string;
  website?: string;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  address?: string | any;
  taxInfo?: {
    gstNumber?: string;
    panNumber?: string;
    taxIdentificationNumber?: string;
    taxType?: string;
    [key: string]: any;
  };
  bankInfo?: {
    accountHolder?: string;
    accountHolderName?: string;
    accountNumber?: string;
    bankName?: string;
    branch?: string;
    branchName?: string;
    ifsc?: string;
    ifscCode?: string;
    upiId?: string;
    [key: string]: any;
  };
  status: "Pending" | "Under Review" | "Approved" | "Rejected" | "Suspended" | "Inactive" | string;
  kycStatus: "Pending" | "Under Review" | "Verified" | "Rejected" | string;
  statusReason?: string;
  kycNotes?: string;
  documentsStatus?: "Pending" | "Under Review" | "Verified" | "Rejected" | "Partial" | "Complete" | "Action Required" | string;
  commissionRate: number;
  featured: boolean;
  softDeleted: boolean;
  rating?: number;
  ratingCount?: number;
  totalOrders?: number;
  totalSales?: number;
  registrationDate?: string | Date;
  documents: IVendorDocument[];
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

const vendorDocumentSchema = new Schema<IVendorDocument>(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "PAN Card",
        "GST Certificate",
        "Business Registration",
        "Address Proof",
        "Bank Proof",
        "Owner ID",
        "Other",
      ],
    },
    documentNumber: {
      type: String,
      trim: true,
      default: "",
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: String,
      default: "0 KB",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    uploadedDate: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    expiryDate: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected", "Expired"],
      default: "Pending",
    },
    verifiedBy: {
      type: String,
      default: null,
    },
    verifiedDate: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// VENDOR MAIN SCHEMA
// =====================================================

const vendorSchema = new mongoose.Schema(
  {
    vendorId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    businessType: {
      type: String,
      enum: ["Manufacturer", "Wholesaler", "D2C Brand", "Distributor"],
      default: "Manufacturer",
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    taxInfo: {
      gstNumber: {
        type: String,
        trim: true,
        uppercase: true,
        default: "",
        index: true,
      },
      panNumber: {
        type: String,
        trim: true,
        uppercase: true,
        default: "",
        index: true,
      },
      taxType: {
        type: String,
        enum: ["Standard GST", "Composition", "Exempt", "Special Economic Zone"],
        default: "Standard GST",
      },
    },
    bankInfo: {
      accountHolder: {
        type: String,
        trim: true,
        default: "",
      },
      accountNumber: {
        type: String,
        trim: true,
        default: "",
      },
      bankName: {
        type: String,
        trim: true,
        default: "",
      },
      ifsc: {
        type: String,
        trim: true,
        uppercase: true,
        default: "",
      },
      branch: {
        type: String,
        trim: true,
        default: "",
      },
      upiId: {
        type: String,
        trim: true,
        default: "",
      },
    },
    registrationDate: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    documentsStatus: {
      type: String,
      enum: ["Complete", "Under Review", "Action Required", "Verified", "Pending"],
      default: "Pending",
      index: true,
    },
    kycStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected", "In Review"],
      default: "Pending",
      index: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Under Review", "Approved", "Rejected", "Suspended", "Inactive"],
      default: "Pending",
      index: true,
    },
    commissionRate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    notes: {
      type: String,
      default: "",
    },
    softDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    documents: [vendorDocumentSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// OPTIMIZED HIGH-PERFORMANCE INDEXES
// =====================================================

// Compound index for registration queues and status filtering
vendorSchema.index({ softDeleted: 1, status: 1, createdAt: -1 });
vendorSchema.index({ softDeleted: 1, kycStatus: 1, createdAt: -1 });
vendorSchema.index({ softDeleted: 1, businessType: 1, createdAt: -1 });

// Text search index for global vendor search
vendorSchema.index({
  businessName: "text",
  ownerName: "text",
  email: "text",
  phone: "text",
  city: "text",
});

export const Vendor: Model<IVendor> =
  (mongoose.models.Vendor as Model<IVendor>) || mongoose.model<IVendor>("Vendor", vendorSchema as any);

export default Vendor;
