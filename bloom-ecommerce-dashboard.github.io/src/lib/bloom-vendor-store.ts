// Bloom Vendor Management, Inventory, Production & Transactions Ecosystem Store
// Connected Business Engine with strict data consistency and auditability
import { vendorApi } from "./vendor-api";

export type VendorStatus =
  | "Pending"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Suspended"
  | "Inactive";

export type KycStatus = "Pending" | "Verified" | "Rejected" | "In Review";
export type DocumentStatus = "Pending" | "Verified" | "Rejected" | "Expired";

export type VendorDocument = {
  id: string;
  type:
    | "PAN Card"
    | "GST Certificate"
    | "Business Registration"
    | "Address Proof"
    | "Bank Proof"
    | "Owner ID"
    | "Other";
  documentNumber: string;
  fileName: string;
  fileSize: string;
  uploadedDate: string;
  expiryDate?: string | undefined;
  status: DocumentStatus;
  verifiedBy?: string | undefined;
  verifiedDate?: string | undefined;
  notes?: string | undefined;
  fileUrl?: string | undefined;
};

export type VendorBankInfo = {
  accountHolder: string;
  accountNumberMasked: string;
  bankName: string;
  ifsc: string;
  branch: string;
  upiId?: string;
};

export type VendorTaxInfo = {
  gstNumber: string;
  panNumber: string;
  taxType: "Standard GST" | "Composition" | "Exempt" | "Special Economic Zone";
};

export type Vendor = {
  id: string;
  businessName: string;
  ownerName: string;
  businessType: "Manufacturer" | "Wholesaler" | "D2C Brand" | "Distributor";
  email: string;
  phone: string;
  alternatePhone?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  taxInfo: VendorTaxInfo;
  bankInfo: VendorBankInfo;
  registrationDate: string;
  documentsStatus: "Complete" | "Under Review" | "Action Required" | "Verified" | "Pending";
  kycStatus: KycStatus;
  status: VendorStatus;
  commissionRate: number; // percentage e.g. 10 for 10%
  rating: number;
  documents: VendorDocument[];
  softDeleted?: boolean;
  notes?: string;
};

export type UnitType = "Quantity" | "Weight" | "Volume" | "Length" | "Area";

export type UnitRecord = {
  id: string;
  name: string;
  code: string;
  unitType: UnitType;
  baseUnit?: string | undefined;
  conversionValue: number; // e.g. 1 KG = 1000 Gram (base unit Gram, conversionValue 1000)
  status: "Active" | "Inactive";
};

export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  barcode: string;
  name: string;
  unitId: string;
  unitCode: string;
  quantity: number;
  price: number;
  purchasePrice: number;
  weight: string;
  dimensions: { length: number; width: number; height: number; unit: string };
  availableStock: number;
  reservedStock: number;
  damagedStock: number;
  expiredStock: number;
  inTransitStock: number;
  minStock: number;
  reorderLevel: number;
  maxStock: number;
  status: "Active" | "Inactive";
};

export type VendorProduct = {
  id: string;
  name: string;
  sku: string;
  vendorId: string;
  vendorName: string;
  category: string;
  subCategory: string;
  image: string;
  sellingPrice: number;
  purchasePrice: number;
  status: "Active" | "Inactive" | "Draft";
  createdAt: string;
  variants: ProductVariant[];
};

export type BatchStatus = "Active" | "Depleted" | "Expired" | "Blocked";

export type Batch = {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  vendorId: string;
  vendorName: string;
  productionId?: string;
  initialQuantity: number;
  availableQuantity: number;
  damagedQuantity: number;
  expiredQuantity: number;
  manufacturingDate: string;
  expiryDate: string;
  warehouseId: string;
  warehouseName: string;
  location: string; // e.g. Zone A-R01-S02-B05
  status: BatchStatus;
};

export type MovementType =
  | "Opening Stock"
  | "Purchase"
  | "Production"
  | "Order"
  | "Order Cancellation"
  | "Return"
  | "Damage"
  | "Expiry"
  | "Adjustment"
  | "Transfer"
  | "Manual Addition"
  | "Manual Deduction";

export type StockMovement = {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  vendorId: string;
  vendorName: string;
  batchNumber: string;
  unit: string;
  quantity: number; // positive or negative
  movementType: MovementType;
  referenceId: string;
  previousStock: number;
  newStock: number;
  warehouse: string;
  location?: string;
  createdBy: string;
  createdDate: string;
  sku?: string | undefined;
  notes?: string | undefined;
};

export type StockAdjustmentReason =
  | "Damaged"
  | "Lost"
  | "Expired"
  | "Counting Error"
  | "Manual Correction"
  | "Other";

export type ProductionStatus =
  | "Planned"
  | "In Progress"
  | "Completed"
  | "Partially Completed"
  | "Cancelled";

export type RawMaterialItem = {
  id: string;
  name: string;
  requiredQuantity: number;
  unit: string;
  availableStock: number;
};

export type ProductionOrder = {
  id: string;
  vendorId: string;
  vendorName: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  unit: string;
  batchNumber: string;
  plannedQuantity: number;
  producedQuantity: number;
  rejectedQuantity: number;
  goodQuantity: number; // Produced - Rejected
  remainingQuantity: number;
  rawMaterials: RawMaterialItem[];
  productionDate: string;
  expectedCompletion: string;
  actualCompletion?: string | undefined;
  warehouseId: string;
  warehouseName: string;
  storageLocation: string;
  status: ProductionStatus;
  notes?: string | undefined;
  createdBy: string;
};

export type StorageLocation = {
  id: string;
  warehouseId: string;
  warehouseName: string;
  zone: string;
  rack: string;
  shelf: string;
  bin: string;
  code: string; // e.g. WH1-ZA-R01-S02-B05
  capacity: number;
  occupied: number;
  status: "Available" | "Full" | "Maintenance";
};

export type StockTransferStatus = "Requested" | "Approved" | "In Transit" | "Received" | "Cancelled";

export type StockTransfer = {
  id: string;
  sourceWarehouse: string;
  destinationWarehouse: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  batchNumber: string;
  unit: string;
  quantity: number;
  status: StockTransferStatus;
  requestedBy: string;
  requestedDate: string;
  dispatchedDate?: string;
  receivedDate?: string;
  notes?: string;
};

export type VendorOrderStatus =
  | "New"
  | "Confirmed"
  | "Processing"
  | "Ready to Ship"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"
  | "Returned"
  | "Refunded";

export type OrderItem = {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vendorId: string;
};

export type VendorOrder = {
  id: string;
  orderNumber: string; // e.g. BLM-10482
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  billingAddress: string;
  vendorId: string;
  vendorName: string;
  items: OrderItem[];
  totalQuantity: number;
  grossAmount: number;
  discount: number;
  tax: number;
  shippingFee: number;
  netAmount: number;
  vendorGross: number;
  commissionAmount: number;
  vendorEarnings: number;
  paymentStatus: "Paid" | "Pending" | "Refunded" | "Failed";
  orderStatus: VendorOrderStatus;
  date: string;
  timeline: Array<{ status: string; date: string; description: string }>;
};

export type TransactionType =
  | "Order Sale"
  | "Commission"
  | "Vendor Settlement"
  | "Refund"
  | "Return Deduction"
  | "Shipping Charge"
  | "Tax"
  | "Adjustment"
  | "Withdrawal"
  | "Payment";

export type TransactionStatus =
  | "Pending"
  | "Processing"
  | "Completed"
  | "Failed"
  | "Cancelled"
  | "Reversed";

export type VendorTransaction = {
  id: string;
  vendorId: string;
  vendorName: string;
  orderId?: string;
  orderNumber?: string;
  type: TransactionType;
  amount: number;
  currency: "INR";
  status: TransactionStatus;
  referenceId: string;
  description: string;
  createdDate: string;
};

export type SettlementStatus =
  | "Pending"
  | "Approved"
  | "Processing"
  | "Paid"
  | "Failed"
  | "On Hold";

export type VendorSettlement = {
  id: string;
  vendorId: string;
  vendorName: string;
  settlementPeriod: string;
  totalSales: number;
  commission: number;
  refunds: number;
  adjustments: number;
  taxes: number;
  otherCharges: number;
  netPayable: number;
  paymentStatus: SettlementStatus;
  settlementDate: string;
  paidDate?: string;
  referenceNumber?: string;
  notes?: string;
};

export type VendorPayment = {
  id: string;
  settlementId: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  method: "NEFT" | "RTGS" | "IMPS" | "UPI";
  bankAccountMasked: string;
  ifsc: string;
  referenceId: string; // UTR Number
  status: "Pending" | "Approved" | "Processing" | "Completed" | "Failed" | "On Hold";
  requestedDate: string;
  processedDate?: string;
  processedBy?: string;
  failureReason?: string;
};

export type ReturnStatus =
  | "Requested"
  | "Approved"
  | "Pickup"
  | "Received"
  | "Inspecting"
  | "Approved for Refund"
  | "Rejected"
  | "Refunded"
  | "Closed";

export type ReturnInspectionResult =
  | "Pending"
  | "Good"
  | "Damaged"
  | "Expired"
  | "Missing"
  | "Needs Inspection";

export type VendorReturn = {
  id: string;
  orderNumber: string;
  vendorId: string;
  vendorName: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  quantity: number;
  reason: string;
  customerReason: string;
  inspectionResult: ReturnInspectionResult;
  dispositionAction?: "Restock" | "Scrap" | "Return to Vendor";
  refundAmount: number;
  status: ReturnStatus;
  date: string;
  inspectedBy?: string | undefined;
  inspectionNotes?: string | undefined;
};

export type VendorActivityLog = {
  id: string;
  user: string;
  action: string;
  entity: "Vendor" | "Inventory" | "Production" | "Order" | "Settlement" | "Payment" | "Return" | "Document";
  entityId: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  ip?: string;
};

export type CommissionTier = {
  id: string;
  name: string;
  category: string;
  rate: number; // percentage
  fixedFee: number;
  status: "Active" | "Inactive";
};

// ==========================================
// SEED DATA
// ==========================================

const SEED_VENDORS: Vendor[] = [
  {
    id: "VEN-1001",
    businessName: "Auralink Audio Labs",
    ownerName: "Devendra Patel",
    businessType: "Manufacturer",
    email: "devendra@auralink.com",
    phone: "+91 98201 44321",
    alternatePhone: "+91 22 2847 1100",
    website: "https://auralinkaudio.com",
    address: "Plot 42, Electronic Zone, MIDC Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "400093",
    taxInfo: {
      gstNumber: "27AABCA1234F1Z8",
      panNumber: "AABCA1234F",
      taxType: "Standard GST",
    },
    bankInfo: {
      accountHolder: "Auralink Audio Labs Pvt Ltd",
      accountNumberMasked: "••••••••4812",
      bankName: "HDFC Bank",
      ifsc: "HDFC0000240",
      branch: "Andheri East, Mumbai",
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
        uploadedDate: "12 May 2025",
        status: "Verified",
        verifiedBy: "Alex Morgan",
        verifiedDate: "14 May 2025",
      },
    ],
  },
  {
    id: "VEN-1002",
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
      accountNumberMasked: "••••••••6631",
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
        uploadedDate: "18 Jun 2025",
        status: "Verified",
        verifiedBy: "Alex Morgan",
        verifiedDate: "20 Jun 2025",
      },
    ],
  },
  {
    id: "VEN-1003",
    businessName: "Vera Botanics & Skincare",
    ownerName: "Dr. Ananya Sen",
    businessType: "D2C Brand",
    email: "ananya@veraskincare.com",
    phone: "+91 98450 19283",
    website: "https://veraskincare.com",
    address: "18 Koramangala 4th Block, 80 Feet Road",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    pincode: "560034",
    taxInfo: {
      gstNumber: "29AABCV5544K1ZP",
      panNumber: "AABCV5544K",
      taxType: "Standard GST",
    },
    bankInfo: {
      accountHolder: "Vera Botanics Private Limited",
      accountNumberMasked: "••••••••9902",
      bankName: "Axis Bank",
      ifsc: "UTIB0000131",
      branch: "Koramangala, Bengaluru",
      upiId: "verabotanics@axisbank",
    },
    registrationDate: "04 Aug 2025",
    documentsStatus: "Verified",
    kycStatus: "Verified",
    status: "Approved",
    commissionRate: 12,
    rating: 4.8,
    documents: [
      {
        id: "DOC-301",
        type: "GST Certificate",
        documentNumber: "29AABCV5544K1ZP",
        fileName: "vera_gst_cert.pdf",
        fileSize: "1.2 MB",
        uploadedDate: "04 Aug 2025",
        status: "Verified",
        verifiedBy: "Alex Morgan",
        verifiedDate: "06 Aug 2025",
      },
    ],
  },
  {
    id: "VEN-1004",
    businessName: "Luma Home & Living",
    ownerName: "Raghav Mehra",
    businessType: "Wholesaler",
    email: "raghav@lumaliving.in",
    phone: "+91 99203 11849",
    website: "https://lumahome.in",
    address: "22 Senapati Bapat Marg, Lower Parel",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "400013",
    taxInfo: {
      gstNumber: "27AABCL3322P1Z0",
      panNumber: "AABCL3322P",
      taxType: "Standard GST",
    },
    bankInfo: {
      accountHolder: "Luma Living LLP",
      accountNumberMasked: "••••••••1144",
      bankName: "Kotak Mahindra Bank",
      ifsc: "KKBK0000642",
      branch: "Lower Parel, Mumbai",
    },
    registrationDate: "15 Jan 2026",
    documentsStatus: "Complete",
    kycStatus: "In Review",
    status: "Under Review",
    commissionRate: 10,
    rating: 4.5,
    documents: [
      {
        id: "DOC-401",
        type: "GST Certificate",
        documentNumber: "27AABCL3322P1Z0",
        fileName: "luma_gst.pdf",
        fileSize: "980 KB",
        uploadedDate: "15 Jan 2026",
        status: "Pending",
      },
      {
        id: "DOC-402",
        type: "PAN Card",
        documentNumber: "AABCL3322P",
        fileName: "luma_pan.pdf",
        fileSize: "640 KB",
        uploadedDate: "15 Jan 2026",
        status: "Pending",
      },
    ],
  },
  {
    id: "VEN-1005",
    businessName: "Orbit Wireless Technologies",
    ownerName: "Karan Johar",
    businessType: "Manufacturer",
    email: "karan@orbitgear.tech",
    phone: "+91 98190 28410",
    address: "Sector 18, Udyog Vihar Phase IV",
    city: "Gurugram",
    state: "Haryana",
    country: "India",
    pincode: "122015",
    taxInfo: {
      gstNumber: "06AABCO4411Q1Z4",
      panNumber: "AABCO4411Q",
      taxType: "Standard GST",
    },
    bankInfo: {
      accountHolder: "Orbit Wireless Tech Pvt Ltd",
      accountNumberMasked: "••••••••8732",
      bankName: "State Bank of India",
      ifsc: "SBIN0004033",
      branch: "Udyog Vihar, Gurugram",
    },
    registrationDate: "10 Feb 2026",
    documentsStatus: "Pending",
    kycStatus: "Pending",
    status: "Pending",
    commissionRate: 8,
    rating: 0,
    documents: [
      {
        id: "DOC-501",
        type: "Business Registration",
        documentNumber: "U72900HR2022PTC104",
        fileName: "orbit_incorporation.pdf",
        fileSize: "1.8 MB",
        uploadedDate: "10 Feb 2026",
        status: "Pending",
      },
    ],
  },
  {
    id: "VEN-1006",
    businessName: "Kanso Ceramics Studio",
    ownerName: "Meenakshi Sundaram",
    businessType: "D2C Brand",
    email: "meenakshi@kansohome.com",
    phone: "+91 98840 92314",
    address: "44 Besant Nagar Beach Road",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    pincode: "600090",
    taxInfo: {
      gstNumber: "33AABCK8877L1Z9",
      panNumber: "AABCK8877L",
      taxType: "Standard GST",
    },
    bankInfo: {
      accountHolder: "Kanso Crafts Studio",
      accountNumberMasked: "••••••••3421",
      bankName: "Indian Overseas Bank",
      ifsc: "IOBA0000122",
      branch: "Besant Nagar, Chennai",
    },
    registrationDate: "24 Aug 2025",
    documentsStatus: "Action Required",
    kycStatus: "Rejected",
    status: "Rejected",
    commissionRate: 15,
    rating: 3.8,
    notes: "Bank proof expired and address document was illegible.",
    documents: [
      {
        id: "DOC-601",
        type: "Bank Proof",
        documentNumber: "IOB-STMT-99",
        fileName: "bank_statement.pdf",
        fileSize: "3.2 MB",
        uploadedDate: "24 Aug 2025",
        status: "Rejected",
        notes: "Statement is older than 3 months.",
      },
    ],
  },
  {
    id: "VEN-1007",
    businessName: "Rove Athletic Footwear",
    ownerName: "Gaurav Chopra",
    businessType: "Wholesaler",
    email: "gaurav@rovefootwear.com",
    phone: "+91 98205 77123",
    address: "Industrial Area B, Cheema Chowk",
    city: "Ludhiana",
    state: "Punjab",
    country: "India",
    pincode: "141003",
    taxInfo: {
      gstNumber: "03AABCR1122M1Z1",
      panNumber: "AABCR1122M",
      taxType: "Standard GST",
    },
    bankInfo: {
      accountHolder: "Rove Shoes India",
      accountNumberMasked: "••••••••5519",
      bankName: "Punjab National Bank",
      ifsc: "PUNB0024400",
      branch: "Cheema Chowk, Ludhiana",
    },
    registrationDate: "12 Jul 2025",
    documentsStatus: "Verified",
    kycStatus: "Verified",
    status: "Suspended",
    commissionRate: 10,
    rating: 3.1,
    notes: "Suspended temporarily due to multiple delayed shipments and counterfeit dispute.",
    documents: [],
  },
];

const SEED_UNITS: UnitRecord[] = [
  { id: "UNT-01", name: "Piece", code: "PCS", unitType: "Quantity", conversionValue: 1, status: "Active" },
  { id: "UNT-02", name: "Kilogram", code: "KG", unitType: "Weight", baseUnit: "Gram", conversionValue: 1000, status: "Active" },
  { id: "UNT-03", name: "Gram", code: "G", unitType: "Weight", baseUnit: "Gram", conversionValue: 1, status: "Active" },
  { id: "UNT-04", name: "Liter", code: "L", unitType: "Volume", baseUnit: "Milliliter", conversionValue: 1000, status: "Active" },
  { id: "UNT-05", name: "Milliliter", code: "ML", unitType: "Volume", baseUnit: "Milliliter", conversionValue: 1, status: "Active" },
  { id: "UNT-06", name: "Bottle", code: "BTL", unitType: "Quantity", conversionValue: 1, status: "Active" },
  { id: "UNT-07", name: "Box", code: "BOX", unitType: "Quantity", conversionValue: 1, status: "Active" },
  { id: "UNT-08", name: "Pack", code: "PK", unitType: "Quantity", conversionValue: 1, status: "Active" },
  { id: "UNT-09", name: "Carton", code: "CTN", unitType: "Quantity", baseUnit: "Piece", conversionValue: 24, status: "Active" },
  { id: "UNT-10", name: "Dozen", code: "DOZ", unitType: "Quantity", baseUnit: "Piece", conversionValue: 12, status: "Active" },
];

const SEED_PRODUCTS: VendorProduct[] = [
  {
    id: "VP-01",
    name: "Wireless Headphones Studio Pro",
    sku: "WH-1001",
    vendorId: "VEN-1001",
    vendorName: "Auralink Audio Labs",
    category: "Electronics",
    subCategory: "Audio & Accessories",
    image: "/placeholder-audio.jpg",
    sellingPrice: 8999,
    purchasePrice: 5200,
    status: "Active",
    createdAt: "15 May 2025",
    variants: [
      {
        id: "VAR-01-BLK",
        productId: "VP-01",
        sku: "WH-1001-BLK",
        barcode: "890123456701",
        name: "Matte Black · Standard",
        unitId: "UNT-01",
        unitCode: "PCS",
        quantity: 1,
        price: 8999,
        purchasePrice: 5200,
        weight: "250g",
        dimensions: { length: 20, width: 18, height: 8, unit: "cm" },
        availableStock: 24,
        reservedStock: 4,
        damagedStock: 1,
        expiredStock: 0,
        inTransitStock: 0,
        minStock: 10,
        reorderLevel: 15,
        maxStock: 150,
        status: "Active",
      },
      {
        id: "VAR-01-WHT",
        productId: "VP-01",
        sku: "WH-1001-WHT",
        barcode: "890123456702",
        name: "Glacier White · Standard",
        unitId: "UNT-01",
        unitCode: "PCS",
        quantity: 1,
        price: 9299,
        purchasePrice: 5300,
        weight: "250g",
        dimensions: { length: 20, width: 18, height: 8, unit: "cm" },
        availableStock: 12,
        reservedStock: 2,
        damagedStock: 0,
        expiredStock: 0,
        inTransitStock: 5,
        minStock: 8,
        reorderLevel: 12,
        maxStock: 100,
        status: "Active",
      },
    ],
  },
  {
    id: "VP-02",
    name: "Organic Cotton Relaxed T-Shirt",
    sku: "TS-2041",
    vendorId: "VEN-1002",
    vendorName: "Common Good Textiles",
    category: "Apparel",
    subCategory: "Men's Clothing",
    image: "/placeholder-shirt.jpg",
    sellingPrice: 1299,
    purchasePrice: 550,
    status: "Active",
    createdAt: "22 Jun 2025",
    variants: [
      {
        id: "VAR-02-M",
        productId: "VP-02",
        sku: "TS-2041-M-NVY",
        barcode: "890123456710",
        name: "Navy Blue · Medium",
        unitId: "UNT-01",
        unitCode: "PCS",
        quantity: 1,
        price: 1299,
        purchasePrice: 550,
        weight: "180g",
        dimensions: { length: 30, width: 25, height: 2, unit: "cm" },
        availableStock: 54,
        reservedStock: 6,
        damagedStock: 2,
        expiredStock: 0,
        inTransitStock: 0,
        minStock: 20,
        reorderLevel: 30,
        maxStock: 300,
        status: "Active",
      },
      {
        id: "VAR-02-L",
        productId: "VP-02",
        sku: "TS-2041-L-NVY",
        barcode: "890123456711",
        name: "Navy Blue · Large",
        unitId: "UNT-01",
        unitCode: "PCS",
        quantity: 1,
        price: 1299,
        purchasePrice: 550,
        weight: "190g",
        dimensions: { length: 30, width: 25, height: 2, unit: "cm" },
        availableStock: 32,
        reservedStock: 3,
        damagedStock: 0,
        expiredStock: 0,
        inTransitStock: 0,
        minStock: 20,
        reorderLevel: 30,
        maxStock: 300,
        status: "Active",
      },
    ],
  },
  {
    id: "VP-03",
    name: "Vitamin C Radiance Face Serum",
    sku: "SK-5102",
    vendorId: "VEN-1003",
    vendorName: "Vera Botanics & Skincare",
    category: "Beauty",
    subCategory: "Skincare",
    image: "/placeholder-serum.jpg",
    sellingPrice: 1099,
    purchasePrice: 420,
    status: "Active",
    createdAt: "10 Aug 2025",
    variants: [
      {
        id: "VAR-03-30ML",
        productId: "VP-03",
        sku: "SK-5102-30ML",
        barcode: "890123456720",
        name: "30ml Dropper Bottle",
        unitId: "UNT-06",
        unitCode: "BTL",
        quantity: 1,
        price: 1099,
        purchasePrice: 420,
        weight: "95g",
        dimensions: { length: 12, width: 4, height: 4, unit: "cm" },
        availableStock: 42,
        reservedStock: 5,
        damagedStock: 1,
        expiredStock: 0,
        inTransitStock: 10,
        minStock: 15,
        reorderLevel: 25,
        maxStock: 250,
        status: "Active",
      },
      {
        id: "VAR-03-50ML",
        productId: "VP-03",
        sku: "SK-5102-50ML",
        barcode: "890123456721",
        name: "50ml Refill Pack",
        unitId: "UNT-06",
        unitCode: "BTL",
        quantity: 1,
        price: 1599,
        purchasePrice: 610,
        weight: "140g",
        dimensions: { length: 15, width: 5, height: 5, unit: "cm" },
        availableStock: 5, // LOW STOCK
        reservedStock: 1,
        damagedStock: 0,
        expiredStock: 0,
        inTransitStock: 0,
        minStock: 10,
        reorderLevel: 15,
        maxStock: 150,
        status: "Active",
      },
    ],
  },
  {
    id: "VP-04",
    name: "Arc Sculptural Table Lamp",
    sku: "LM-3010",
    vendorId: "VEN-1004",
    vendorName: "Luma Home & Living",
    category: "Home & Kitchen",
    subCategory: "Lighting",
    image: "/placeholder-lamp.jpg",
    sellingPrice: 4499,
    purchasePrice: 2100,
    status: "Active",
    createdAt: "20 Jan 2026",
    variants: [
      {
        id: "VAR-04-STD",
        productId: "VP-04",
        sku: "LM-3010-BRS",
        barcode: "890123456730",
        name: "Brushed Brass · Warm LED",
        unitId: "UNT-01",
        unitCode: "PCS",
        quantity: 1,
        price: 4499,
        purchasePrice: 2100,
        weight: "1.8kg",
        dimensions: { length: 35, width: 25, height: 45, unit: "cm" },
        availableStock: 7, // LOW STOCK
        reservedStock: 2,
        damagedStock: 0,
        expiredStock: 0,
        inTransitStock: 0,
        minStock: 8,
        reorderLevel: 10,
        maxStock: 50,
        status: "Active",
      },
    ],
  },
  {
    id: "VP-05",
    name: "Portable Bluetooth Speaker Mini",
    sku: "SP-4022",
    vendorId: "VEN-1005",
    vendorName: "Orbit Wireless Technologies",
    category: "Electronics",
    subCategory: "Audio",
    image: "/placeholder-speaker.jpg",
    sellingPrice: 5999,
    purchasePrice: 3200,
    status: "Active",
    createdAt: "12 Feb 2026",
    variants: [
      {
        id: "VAR-05-GRY",
        productId: "VP-05",
        sku: "SP-4022-GRY",
        barcode: "890123456740",
        name: "Storm Grey · Waterproof",
        unitId: "UNT-01",
        unitCode: "PCS",
        quantity: 1,
        price: 5999,
        purchasePrice: 3200,
        weight: "420g",
        dimensions: { length: 15, width: 10, height: 8, unit: "cm" },
        availableStock: 0, // OUT OF STOCK
        reservedStock: 0,
        damagedStock: 0,
        expiredStock: 0,
        inTransitStock: 15,
        minStock: 10,
        reorderLevel: 15,
        maxStock: 100,
        status: "Active",
      },
    ],
  },
  {
    id: "VP-06",
    name: "Handcrafted Ceramic Cookware Set",
    sku: "CK-7008",
    vendorId: "VEN-1006",
    vendorName: "Kanso Ceramics Studio",
    category: "Home & Kitchen",
    subCategory: "Cookware",
    image: "/placeholder-pot.jpg",
    sellingPrice: 10999,
    purchasePrice: 6500,
    status: "Active",
    createdAt: "28 Aug 2025",
    variants: [
      {
        id: "VAR-06-3PC",
        productId: "VP-06",
        sku: "CK-7008-3PC",
        barcode: "890123456750",
        name: "3-Piece Earth Stoneware Set",
        unitId: "UNT-07",
        unitCode: "BOX",
        quantity: 1,
        price: 10999,
        purchasePrice: 6500,
        weight: "4.2kg",
        dimensions: { length: 40, width: 35, height: 25, unit: "cm" },
        availableStock: 5, // LOW STOCK
        reservedStock: 1,
        damagedStock: 1,
        expiredStock: 0,
        inTransitStock: 0,
        minStock: 8,
        reorderLevel: 12,
        maxStock: 40,
        status: "Active",
      },
    ],
  },
];

const SEED_BATCHES: Batch[] = [
  {
    id: "BAT-101",
    batchNumber: "BAT-2026-081",
    productId: "VP-01",
    productName: "Wireless Headphones Studio Pro",
    variantId: "VAR-01-BLK",
    variantName: "Matte Black · Standard",
    vendorId: "VEN-1001",
    vendorName: "Auralink Audio Labs",
    productionId: "PRD-2026-01",
    initialQuantity: 100,
    availableQuantity: 24,
    damagedQuantity: 1,
    expiredQuantity: 0,
    manufacturingDate: "05 Jan 2026",
    expiryDate: "05 Jan 2029",
    warehouseId: "WH-01",
    warehouseName: "Mumbai Central",
    location: "Zone A · R01 · S02 · B05",
    status: "Active",
  },
  {
    id: "BAT-102",
    batchNumber: "BAT-2026-094",
    productId: "VP-02",
    productName: "Organic Cotton Relaxed T-Shirt",
    variantId: "VAR-02-M",
    variantName: "Navy Blue · Medium",
    vendorId: "VEN-1002",
    vendorName: "Common Good Textiles",
    productionId: "PRD-2026-02",
    initialQuantity: 250,
    availableQuantity: 54,
    damagedQuantity: 2,
    expiredQuantity: 0,
    manufacturingDate: "12 Dec 2025",
    expiryDate: "31 Dec 2030",
    warehouseId: "WH-02",
    warehouseName: "Delhi North",
    location: "Zone B · R04 · S01 · B12",
    status: "Active",
  },
  {
    id: "BAT-103",
    batchNumber: "BAT-2026-112",
    productId: "VP-03",
    productName: "Vitamin C Radiance Face Serum",
    variantId: "VAR-03-30ML",
    variantName: "30ml Dropper Bottle",
    vendorId: "VEN-1003",
    vendorName: "Vera Botanics & Skincare",
    productionId: "PRD-2026-03",
    initialQuantity: 150,
    availableQuantity: 42,
    damagedQuantity: 1,
    expiredQuantity: 0,
    manufacturingDate: "10 Jan 2026",
    expiryDate: "10 Jul 2027",
    warehouseId: "WH-03",
    warehouseName: "Bengaluru East",
    location: "Zone C · R02 · S03 · B01",
    status: "Active",
  },
];

const SEED_PRODUCTIONS: ProductionOrder[] = [
  {
    id: "PRD-2026-01",
    vendorId: "VEN-1001",
    vendorName: "Auralink Audio Labs",
    productId: "VP-01",
    productName: "Wireless Headphones Studio Pro",
    variantId: "VAR-01-BLK",
    variantName: "Matte Black · Standard",
    unit: "PCS",
    batchNumber: "BAT-2026-081",
    plannedQuantity: 100,
    producedQuantity: 98,
    rejectedQuantity: 2,
    goodQuantity: 96,
    remainingQuantity: 2,
    rawMaterials: [
      { id: "RM-01", name: "40mm Titanium Drivers", requiredQuantity: 200, unit: "PCS", availableStock: 850 },
      { id: "RM-02", name: "Bluetooth 5.3 SoC PCB", requiredQuantity: 100, unit: "PCS", availableStock: 420 },
      { id: "RM-03", name: "600mAh Li-Po Battery", requiredQuantity: 100, unit: "PCS", availableStock: 310 },
    ],
    productionDate: "05 Jan 2026",
    expectedCompletion: "10 Jan 2026",
    actualCompletion: "09 Jan 2026",
    warehouseId: "WH-01",
    warehouseName: "Mumbai Central",
    storageLocation: "Zone A · R01 · S02 · B05",
    status: "Completed",
    createdBy: "Alex Morgan",
    notes: "Audio drivers QA calibrated within +/- 0.5dB.",
  },
  {
    id: "PRD-2026-04",
    vendorId: "VEN-1003",
    vendorName: "Vera Botanics & Skincare",
    productId: "VP-03",
    productName: "Vitamin C Radiance Face Serum",
    variantId: "VAR-03-50ML",
    variantName: "50ml Refill Pack",
    unit: "BTL",
    batchNumber: "BAT-2026-140",
    plannedQuantity: 300,
    producedQuantity: 150,
    rejectedQuantity: 4,
    goodQuantity: 146,
    remainingQuantity: 150,
    rawMaterials: [
      { id: "RM-10", name: "L-Ascorbic Acid USP", requiredQuantity: 15, unit: "KG", availableStock: 45 },
      { id: "RM-11", name: "Hyaluronic Acid Solution", requiredQuantity: 30, unit: "L", availableStock: 120 },
      { id: "RM-12", name: "Amber Glass Dropper Bottles", requiredQuantity: 300, unit: "PCS", availableStock: 600 },
    ],
    productionDate: "15 Sep 2026",
    expectedCompletion: "25 Sep 2026",
    warehouseId: "WH-03",
    warehouseName: "Bengaluru East",
    storageLocation: "Zone C · R02 · S03 · B02",
    status: "In Progress",
    createdBy: "Alex Morgan",
    notes: "Filling batch 1 in clean room station 4.",
  },
  {
    id: "PRD-2026-05",
    vendorId: "VEN-1002",
    vendorName: "Common Good Textiles",
    productId: "VP-02",
    productName: "Organic Cotton Relaxed T-Shirt",
    variantId: "VAR-02-L",
    variantName: "Navy Blue · Large",
    unit: "PCS",
    batchNumber: "BAT-2026-155",
    plannedQuantity: 500,
    producedQuantity: 0,
    rejectedQuantity: 0,
    goodQuantity: 0,
    remainingQuantity: 500,
    rawMaterials: [
      { id: "RM-20", name: "GOTS Combed Cotton Yarn", requiredQuantity: 120, unit: "KG", availableStock: 450 },
      { id: "RM-21", name: "Natural Indigo Dye", requiredQuantity: 18, unit: "KG", availableStock: 80 },
    ],
    productionDate: "22 Sep 2026",
    expectedCompletion: "02 Oct 2026",
    warehouseId: "WH-02",
    warehouseName: "Delhi North",
    storageLocation: "Zone B · R04 · S01 · B15",
    status: "Planned",
    createdBy: "Alex Morgan",
  },
];

const SEED_MOVEMENTS: StockMovement[] = [
  {
    id: "MOV-9001",
    productId: "VP-01",
    productName: "Wireless Headphones Studio Pro",
    variantId: "VAR-01-BLK",
    variantName: "Matte Black · Standard",
    vendorId: "VEN-1001",
    vendorName: "Auralink Audio Labs",
    batchNumber: "BAT-2026-081",
    unit: "PCS",
    quantity: 96,
    movementType: "Production",
    referenceId: "PRD-2026-01",
    previousStock: 0,
    newStock: 96,
    warehouse: "Mumbai Central",
    location: "Zone A · R01 · S02 · B05",
    createdBy: "Alex Morgan",
    createdDate: "09 Jan 2026, 17:30",
    notes: "Production batch completed with 2 rejected units.",
  },
  {
    id: "MOV-9002",
    productId: "VP-01",
    productName: "Wireless Headphones Studio Pro",
    variantId: "VAR-01-BLK",
    variantName: "Matte Black · Standard",
    vendorId: "VEN-1001",
    vendorName: "Auralink Audio Labs",
    batchNumber: "BAT-2026-081",
    unit: "PCS",
    quantity: -1,
    movementType: "Order",
    referenceId: "BLM-10482",
    previousStock: 25,
    newStock: 24,
    warehouse: "Mumbai Central",
    createdBy: "Checkout System",
    createdDate: "18 Sep 2026, 10:42",
    notes: "Dispatched to customer Aarav Mehta",
  },
  {
    id: "MOV-9003",
    productId: "VP-03",
    productName: "Vitamin C Radiance Face Serum",
    variantId: "VAR-03-30ML",
    variantName: "30ml Dropper Bottle",
    vendorId: "VEN-1003",
    vendorName: "Vera Botanics & Skincare",
    batchNumber: "BAT-2026-112",
    unit: "BTL",
    quantity: 50,
    movementType: "Purchase",
    referenceId: "PO-7740",
    previousStock: 0,
    newStock: 50,
    warehouse: "Bengaluru East",
    createdBy: "Alex Morgan",
    createdDate: "10 Jan 2026, 11:20",
    notes: "Initial inventory restock from supplier.",
  },
  {
    id: "MOV-9004",
    productId: "VP-02",
    productName: "Organic Cotton Relaxed T-Shirt",
    variantId: "VAR-02-M",
    variantName: "Navy Blue · Medium",
    vendorId: "VEN-1002",
    vendorName: "Common Good Textiles",
    batchNumber: "BAT-2026-094",
    unit: "PCS",
    quantity: -2,
    movementType: "Damage",
    referenceId: "ADJ-501",
    previousStock: 56,
    newStock: 54,
    warehouse: "Delhi North",
    createdBy: "Alex Morgan",
    createdDate: "16 Sep 2026, 14:15",
    notes: "Water staining discovered during shelf audit.",
  },
];

const SEED_STORAGE_LOCATIONS: StorageLocation[] = [
  { id: "LOC-01", warehouseId: "WH-01", warehouseName: "Mumbai Central", zone: "Zone A", rack: "R01", shelf: "S02", bin: "B05", code: "WH1-ZA-R01-S02-B05", capacity: 200, occupied: 125, status: "Available" },
  { id: "LOC-02", warehouseId: "WH-01", warehouseName: "Mumbai Central", zone: "Zone A", rack: "R02", shelf: "S01", bin: "B02", code: "WH1-ZA-R02-S01-B02", capacity: 150, occupied: 45, status: "Available" },
  { id: "LOC-03", warehouseId: "WH-02", warehouseName: "Delhi North", zone: "Zone B", rack: "R04", shelf: "S01", bin: "B12", code: "WH2-ZB-R04-S01-B12", capacity: 300, occupied: 220, status: "Available" },
  { id: "LOC-04", warehouseId: "WH-03", warehouseName: "Bengaluru East", zone: "Zone C", rack: "R02", shelf: "S03", bin: "B01", code: "WH3-ZC-R02-S03-B01", capacity: 250, occupied: 85, status: "Available" },
];

const SEED_VENDOR_ORDERS: VendorOrder[] = [
  {
    id: "VORD-101",
    orderNumber: "BLM-10482",
    customerId: "CUS-2048",
    customerName: "Aarav Mehta",
    customerEmail: "aarav@example.com",
    customerPhone: "+91 98765 41082",
    shippingAddress: "Bandra West, Mumbai 400050",
    billingAddress: "Bandra West, Mumbai 400050",
    vendorId: "VEN-1001",
    vendorName: "Auralink Audio Labs",
    items: [
      {
        productId: "VP-01",
        productName: "Wireless Headphones Studio Pro",
        variantId: "VAR-01-BLK",
        variantName: "Matte Black · Standard",
        sku: "WH-1001-BLK",
        quantity: 1,
        unitPrice: 8999,
        totalPrice: 8999,
        vendorId: "VEN-1001",
      },
    ],
    totalQuantity: 1,
    grossAmount: 8999,
    discount: 500,
    tax: 1529,
    shippingFee: 0,
    netAmount: 8499,
    vendorGross: 8499,
    commissionAmount: 679.92, // 8%
    vendorEarnings: 7819.08,
    paymentStatus: "Paid",
    orderStatus: "Processing",
    date: "18 Sep 2026, 10:42",
    timeline: [
      { status: "New", date: "18 Sep, 10:42", description: "Order received via Bloom Storefront" },
      { status: "Confirmed", date: "18 Sep, 10:45", description: "Payment verified by Razorpay" },
      { status: "Processing", date: "18 Sep, 11:00", description: "Allocated to Mumbai Central warehouse" },
    ],
  },
  {
    id: "VORD-102",
    orderNumber: "BLM-10481",
    customerId: "CUS-2047",
    customerName: "Meera Iyer",
    customerEmail: "meera@example.com",
    customerPhone: "+91 98670 33891",
    shippingAddress: "Indiranagar, Bengaluru 560038",
    billingAddress: "Indiranagar, Bengaluru 560038",
    vendorId: "VEN-1004",
    vendorName: "Luma Home & Living",
    items: [
      {
        productId: "VP-04",
        productName: "Arc Sculptural Table Lamp",
        variantId: "VAR-04-STD",
        variantName: "Brushed Brass · Warm LED",
        sku: "LM-3010-BRS",
        quantity: 1,
        unitPrice: 4499,
        totalPrice: 4499,
        vendorId: "VEN-1004",
      },
    ],
    totalQuantity: 1,
    grossAmount: 4499,
    discount: 0,
    tax: 809,
    shippingFee: 0,
    netAmount: 4499,
    vendorGross: 4499,
    commissionAmount: 449.9, // 10%
    vendorEarnings: 4049.1,
    paymentStatus: "Paid",
    orderStatus: "Shipped",
    date: "18 Sep 2026, 09:18",
    timeline: [
      { status: "New", date: "18 Sep, 09:18", description: "Order placed" },
      { status: "Processing", date: "18 Sep, 10:00", description: "Packed at Mumbai Central" },
      { status: "Shipped", date: "18 Sep, 12:30", description: "In transit with Blue Dart AWB #88921" },
    ],
  },
  {
    id: "VORD-103",
    orderNumber: "BLM-10478",
    customerId: "CUS-2044",
    customerName: "Rohan Kapoor",
    customerEmail: "rohan@example.com",
    customerPhone: "+91 98231 61547",
    shippingAddress: "Koregaon Park, Pune 411001",
    billingAddress: "Koregaon Park, Pune 411001",
    vendorId: "VEN-1006",
    vendorName: "Kanso Ceramics Studio",
    items: [
      {
        productId: "VP-06",
        productName: "Handcrafted Ceramic Cookware Set",
        variantId: "VAR-06-3PC",
        variantName: "3-Piece Earth Stoneware Set",
        sku: "CK-7008-3PC",
        quantity: 1,
        unitPrice: 10999,
        totalPrice: 10999,
        vendorId: "VEN-1006",
      },
    ],
    totalQuantity: 1,
    grossAmount: 10999,
    discount: 1000,
    tax: 1800,
    shippingFee: 0,
    netAmount: 9999,
    vendorGross: 9999,
    commissionAmount: 1499.85, // 15%
    vendorEarnings: 8499.15,
    paymentStatus: "Refunded",
    orderStatus: "Returned",
    date: "17 Sep 2026, 12:11",
    timeline: [
      { status: "Delivered", date: "15 Sep", description: "Customer received shipment" },
      { status: "Returned", date: "17 Sep", description: "Return requested due to chipped lid" },
      { status: "Refunded", date: "17 Sep, 16:30", description: "Refund issued to customer" },
    ],
  },
];

const SEED_TRANSACTIONS: VendorTransaction[] = [
  {
    id: "VTX-8801",
    vendorId: "VEN-1001",
    vendorName: "Auralink Audio Labs",
    orderId: "VORD-101",
    orderNumber: "BLM-10482",
    type: "Order Sale",
    amount: 8499,
    currency: "INR",
    status: "Completed",
    referenceId: "RAZOR-991204",
    description: "Credit for order sale #BLM-10482",
    createdDate: "18 Sep 2026, 10:42",
  },
  {
    id: "VTX-8802",
    vendorId: "VEN-1001",
    vendorName: "Auralink Audio Labs",
    orderId: "VORD-101",
    orderNumber: "BLM-10482",
    type: "Commission",
    amount: -679.92,
    currency: "INR",
    status: "Completed",
    referenceId: "COMM-8801",
    description: "Bloom 8% platform commission deduction",
    createdDate: "18 Sep 2026, 10:42",
  },
  {
    id: "VTX-8803",
    vendorId: "VEN-1001",
    vendorName: "Auralink Audio Labs",
    type: "Vendor Settlement",
    amount: -124500,
    currency: "INR",
    status: "Completed",
    referenceId: "STL-2026-37",
    description: "Payout for settlement period 04 – 10 Sep 2026",
    createdDate: "12 Sep 2026, 11:00",
  },
  {
    id: "VTX-8804",
    vendorId: "VEN-1006",
    vendorName: "Kanso Ceramics Studio",
    orderId: "VORD-103",
    orderNumber: "BLM-10478",
    type: "Refund",
    amount: -8499.15,
    currency: "INR",
    status: "Completed",
    referenceId: "RET-501",
    description: "Return deduction for chipped cookware set #BLM-10478",
    createdDate: "17 Sep 2026, 16:30",
  },
];

const SEED_SETTLEMENTS: VendorSettlement[] = [
  {
    id: "STL-2026-38",
    vendorId: "VEN-1001",
    vendorName: "Auralink Audio Labs",
    settlementPeriod: "11 – 17 Sep 2026",
    totalSales: 168400,
    commission: 13472,
    refunds: 0,
    adjustments: 0,
    taxes: 2424,
    otherCharges: 500,
    netPayable: 152004,
    paymentStatus: "Approved",
    settlementDate: "18 Sep 2026",
    notes: "Regular weekly settlement.",
  },
  {
    id: "STL-2026-37",
    vendorId: "VEN-1001",
    vendorName: "Auralink Audio Labs",
    settlementPeriod: "04 – 10 Sep 2026",
    totalSales: 142000,
    commission: 11360,
    refunds: 4200,
    adjustments: 0,
    taxes: 1940,
    otherCharges: 0,
    netPayable: 124500,
    paymentStatus: "Paid",
    settlementDate: "11 Sep 2026",
    paidDate: "12 Sep 2026",
    referenceNumber: "UTR/HDFC/99248102",
  },
  {
    id: "STL-2026-39",
    vendorId: "VEN-1002",
    vendorName: "Common Good Textiles",
    settlementPeriod: "11 – 17 Sep 2026",
    totalSales: 86400,
    commission: 8640,
    refunds: 2598,
    adjustments: 0,
    taxes: 1240,
    otherCharges: 0,
    netPayable: 73922,
    paymentStatus: "Pending",
    settlementDate: "18 Sep 2026",
  },
];

const SEED_PAYMENTS: VendorPayment[] = [
  {
    id: "PAY-1001",
    settlementId: "STL-2026-37",
    vendorId: "VEN-1001",
    vendorName: "Auralink Audio Labs",
    amount: 124500,
    method: "NEFT",
    bankAccountMasked: "••••••••4812",
    ifsc: "HDFC0000240",
    referenceId: "UTR/HDFC/99248102",
    status: "Completed",
    requestedDate: "11 Sep 2026",
    processedDate: "12 Sep 2026",
    processedBy: "Alex Morgan",
  },
  {
    id: "PAY-1002",
    settlementId: "STL-2026-38",
    vendorId: "VEN-1001",
    vendorName: "Auralink Audio Labs",
    amount: 152004,
    method: "NEFT",
    bankAccountMasked: "••••••••4812",
    ifsc: "HDFC0000240",
    referenceId: "QUEUED-TXN-49",
    status: "Approved",
    requestedDate: "18 Sep 2026",
  },
  {
    id: "PAY-1003",
    settlementId: "STL-2026-39",
    vendorId: "VEN-1002",
    vendorName: "Common Good Textiles",
    amount: 73922,
    method: "RTGS",
    bankAccountMasked: "••••••••6631",
    ifsc: "ICIC0000007",
    referenceId: "REQ-9921",
    status: "Pending",
    requestedDate: "18 Sep 2026",
  },
];

const SEED_RETURNS: VendorReturn[] = [
  {
    id: "RET-501",
    orderNumber: "BLM-10478",
    vendorId: "VEN-1006",
    vendorName: "Kanso Ceramics Studio",
    productId: "VP-06",
    productName: "Handcrafted Ceramic Cookware Set",
    variantId: "VAR-06-3PC",
    variantName: "3-Piece Earth Stoneware Set",
    quantity: 1,
    reason: "Damaged in transit",
    customerReason: "The casserole pot lid arrived with a crack on the edge.",
    inspectionResult: "Damaged",
    dispositionAction: "Scrap",
    refundAmount: 9999,
    status: "Refunded",
    date: "17 Sep 2026",
    inspectedBy: "Alex Morgan",
    inspectionNotes: "Confirmed crack along rim. Unsuitable for resale. Scrapped and recorded.",
  },
  {
    id: "RET-502",
    orderNumber: "BLM-10465",
    vendorId: "VEN-1002",
    vendorName: "Common Good Textiles",
    productId: "VP-02",
    productName: "Organic Cotton Relaxed T-Shirt",
    variantId: "VAR-02-L",
    variantName: "Navy Blue · Large",
    quantity: 1,
    reason: "Wrong size fit",
    customerReason: "Too loose, exchanged for Medium.",
    inspectionResult: "Good",
    dispositionAction: "Restock",
    refundAmount: 1299,
    status: "Approved for Refund",
    date: "16 Sep 2026",
    inspectedBy: "Alex Morgan",
    inspectionNotes: "Tags intact, pristine condition. Re-packaged and returned to available inventory.",
  },
];

const SEED_ACTIVITY_LOGS: VendorActivityLog[] = [
  {
    id: "LOG-01",
    user: "Alex Morgan",
    action: "Approved Vendor Registration",
    entity: "Vendor",
    entityId: "VEN-1001",
    oldValue: "Pending",
    newValue: "Approved",
    timestamp: "14 May 2025, 15:30",
  },
  {
    id: "LOG-02",
    user: "Alex Morgan",
    action: "Verified KYC Documents",
    entity: "Document",
    entityId: "DOC-101",
    oldValue: "Pending",
    newValue: "Verified",
    timestamp: "14 May 2025, 15:35",
  },
  {
    id: "LOG-03",
    user: "Alex Morgan",
    action: "Completed Production Order",
    entity: "Production",
    entityId: "PRD-2026-01",
    oldValue: "In Progress",
    newValue: "Completed (96 good, 2 rejected)",
    timestamp: "09 Jan 2026, 17:30",
  },
  {
    id: "LOG-04",
    user: "Alex Morgan",
    action: "Approved Weekly Settlement",
    entity: "Settlement",
    entityId: "STL-2026-38",
    oldValue: "Pending",
    newValue: "Approved (₹1,52,004)",
    timestamp: "18 Sep 2026, 11:15",
  },
];

const SEED_COMMISSIONS: CommissionTier[] = [
  { id: "COM-01", name: "Standard Electronics", category: "Electronics", rate: 8, fixedFee: 20, status: "Active" },
  { id: "COM-02", name: "Apparel & Fashion", category: "Apparel", rate: 10, fixedFee: 15, status: "Active" },
  { id: "COM-03", name: "Beauty & Personal Care", category: "Beauty", rate: 12, fixedFee: 10, status: "Active" },
  { id: "COM-04", name: "Home & Kitchen Goods", category: "Home & Kitchen", rate: 10, fixedFee: 25, status: "Active" },
  { id: "COM-05", name: "Artisanal & Ceramics", category: "Home & Kitchen", rate: 15, fixedFee: 30, status: "Active" },
];

// ==========================================
// STORE CLASS WITH LOCALSTORAGE PERSISTENCE
// ==========================================

class BloomVendorStore {
  private vendors: Vendor[] = [];
  private products: VendorProduct[] = [];
  private units: UnitRecord[] = [];
  private batches: Batch[] = [];
  private movements: StockMovement[] = [];
  private productions: ProductionOrder[] = [];
  private storageLocations: StorageLocation[] = [];
  private orders: VendorOrder[] = [];
  private transactions: VendorTransaction[] = [];
  private settlements: VendorSettlement[] = [];
  private payments: VendorPayment[] = [];
  private returns: VendorReturn[] = [];
  private activityLogs: VendorActivityLog[] = [];
  private commissions: CommissionTier[] = [];
  private listeners: Set<() => void> = new Set();
  private version = 0;
  private isSyncing = false;

  public getVersion(): number {
    return this.version;
  }

  constructor() {
    this.loadState();
  }

  public async syncFromBackend(): Promise<void> {
    if (typeof window === "undefined" || this.isSyncing) return;
    this.isSyncing = true;
    try {
      const [regs, orders, settlements, returns, txns, logs] = await Promise.allSettled([
        vendorApi.getRegistrations({ limit: 100 }),
        vendorApi.getOrders(),
        vendorApi.getSettlements(),
        vendorApi.getReturns(),
        vendorApi.getTransactions(),
        vendorApi.getActivityLogs(),
      ]);

      if (regs.status === "fulfilled" && regs.value.vendors?.length) {
        const backendVendors: Vendor[] = regs.value.vendors.map((bv: any) => ({
          id: bv.vendorId || bv.id || bv._id,
          businessName: bv.businessName || "Vendor",
          ownerName: bv.ownerName || "Owner",
          businessType: bv.businessType || "Manufacturer",
          email: bv.email || "",
          phone: bv.phone || "",
          alternatePhone: bv.alternatePhone || "",
          website: bv.website || "",
          address: bv.address || "",
          city: bv.city || "",
          state: bv.state || "",
          country: bv.country || "India",
          pincode: bv.pincode || "",
          taxInfo: bv.taxInfo || { gstNumber: "", panNumber: "", taxType: "Standard GST" },
          bankInfo: bv.bankInfo || { accountHolder: "", accountNumberMasked: "", bankName: "", ifsc: "", branch: "" },
          registrationDate: bv.registrationDate || new Date(bv.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          documentsStatus: bv.documentsStatus || "Pending",
          kycStatus: bv.kycStatus || "Pending",
          status: bv.status || "Pending",
          commissionRate: bv.commissionRate ?? 10,
          rating: bv.rating ?? 5.0,
          documents: (bv.documents || []).map((d: any) => ({
            id: d.id || d._id || `DOC-${Date.now()}`,
            type: d.type || "Other",
            documentNumber: d.documentNumber || "",
            fileName: d.fileName || "document.pdf",
            fileSize: d.fileSize || "1.2 MB",
            uploadedDate: d.uploadedDate || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            expiryDate: d.expiryDate,
            status: d.status || "Pending",
            verifiedBy: d.verifiedBy,
            verifiedDate: d.verifiedDate,
            notes: d.notes,
            fileUrl: d.fileUrl,
          })),
          softDeleted: bv.softDeleted ?? false,
          notes: bv.notes,
        }));

        this.vendors = backendVendors;
      }

      if (orders.status === "fulfilled" && orders.value?.length) {
        this.orders = orders.value;
      }

      if (settlements.status === "fulfilled" && settlements.value?.length) {
        this.settlements = settlements.value;
      }

      if (returns.status === "fulfilled" && returns.value?.length) {
        this.returns = returns.value;
      }

      if (txns.status === "fulfilled" && txns.value?.length) {
        this.transactions = txns.value;
      }

      if (logs.status === "fulfilled" && logs.value?.length) {
        this.activityLogs = logs.value;
      }

      this.notify();
    } catch (err) {
      console.error("VendorStore syncFromBackend error:", err);
    } finally {
      this.isSyncing = false;
    }
  }

  private safeParse<T>(key: string, fallback: T[]): T[] {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return [...fallback];
      const parsed = JSON.parse(item);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return [...fallback];
    } catch {
      return [...fallback];
    }
  }

  private loadState() {
    if (typeof window === "undefined") {
      this.initSeed();
      return;
    }

    try {
      this.vendors = this.safeParse("bloom_vendors_v2", SEED_VENDORS);
      this.products = this.safeParse("bloom_vendor_products_v2", SEED_PRODUCTS);
      this.units = this.safeParse("bloom_units_v2", SEED_UNITS);
      this.batches = this.safeParse("bloom_batches_v2", SEED_BATCHES);
      this.movements = this.safeParse("bloom_movements_v2", SEED_MOVEMENTS);
      this.productions = this.safeParse("bloom_productions_v2", SEED_PRODUCTIONS);
      this.storageLocations = this.safeParse("bloom_locations_v2", SEED_STORAGE_LOCATIONS);
      this.orders = this.safeParse("bloom_vendor_orders_v2", SEED_VENDOR_ORDERS);
      this.transactions = this.safeParse("bloom_vendor_txns_v2", SEED_TRANSACTIONS);
      this.settlements = this.safeParse("bloom_settlements_v2", SEED_SETTLEMENTS);
      this.payments = this.safeParse("bloom_payments_v2", SEED_PAYMENTS);
      this.returns = this.safeParse("bloom_returns_v2", SEED_RETURNS);
      this.activityLogs = this.safeParse("bloom_activity_logs_v2", SEED_ACTIVITY_LOGS);
      this.commissions = this.safeParse("bloom_commissions_v2", SEED_COMMISSIONS);
      
      setTimeout(() => {
        this.syncFromBackend();
      }, 50);
      return;
    } catch {
      // fallback
    }

    this.initSeed();
    this.saveState();
    setTimeout(() => {
      this.syncFromBackend();
    }, 50);
  }

  private initSeed() {
    this.vendors = [...SEED_VENDORS];
    this.products = [...SEED_PRODUCTS];
    this.units = [...SEED_UNITS];
    this.batches = [...SEED_BATCHES];
    this.movements = [...SEED_MOVEMENTS];
    this.productions = [...SEED_PRODUCTIONS];
    this.storageLocations = [...SEED_STORAGE_LOCATIONS];
    this.orders = [...SEED_VENDOR_ORDERS];
    this.transactions = [...SEED_TRANSACTIONS];
    this.settlements = [...SEED_SETTLEMENTS];
    this.payments = [...SEED_PAYMENTS];
    this.returns = [...SEED_RETURNS];
    this.activityLogs = [...SEED_ACTIVITY_LOGS];
    this.commissions = [...SEED_COMMISSIONS];
  }

  private saveState() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("bloom_vendors_v2", JSON.stringify(this.vendors));
      window.localStorage.setItem("bloom_vendor_products_v2", JSON.stringify(this.products));
      window.localStorage.setItem("bloom_units_v2", JSON.stringify(this.units));
      window.localStorage.setItem("bloom_batches_v2", JSON.stringify(this.batches));
      window.localStorage.setItem("bloom_movements_v2", JSON.stringify(this.movements));
      window.localStorage.setItem("bloom_productions_v2", JSON.stringify(this.productions));
      window.localStorage.setItem("bloom_locations_v2", JSON.stringify(this.storageLocations));
      window.localStorage.setItem("bloom_vendor_orders_v2", JSON.stringify(this.orders));
      window.localStorage.setItem("bloom_vendor_txns_v2", JSON.stringify(this.transactions));
      window.localStorage.setItem("bloom_settlements_v2", JSON.stringify(this.settlements));
      window.localStorage.setItem("bloom_payments_v2", JSON.stringify(this.payments));
      window.localStorage.setItem("bloom_returns_v2", JSON.stringify(this.returns));
      window.localStorage.setItem("bloom_activity_logs_v2", JSON.stringify(this.activityLogs));
      window.localStorage.setItem("bloom_commissions_v2", JSON.stringify(this.commissions));
    } catch {
      // storage quota or error
    }
  }

  private notify() {
    this.version++;
    this.saveState();
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  // --- LOGGING ---
  public logAction(
    user: string,
    action: string,
    entity: VendorActivityLog["entity"],
    entityId: string,
    oldValue: string,
    newValue: string,
  ) {
    const log: VendorActivityLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user,
      action,
      entity,
      entityId,
      oldValue,
      newValue,
      timestamp: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    this.activityLogs.unshift(log);
    this.notify();
  }

  // --- VENDORS ---
  public getVendors(): Vendor[] {
    return this.vendors.filter((v) => !v.softDeleted);
  }

  public getVendor(id: string): Vendor | undefined {
    return this.vendors.find((v) => v.id === id);
  }

  public updateVendorStatus(vendorId: string, status: VendorStatus, actor = "Alex Morgan", reason?: string) {
    const vendor = this.getVendor(vendorId);
    if (!vendor) return;
    const oldStatus = vendor.status;
    vendor.status = status;
    if (reason) vendor.notes = reason;
    if (status === "Approved") vendor.kycStatus = "Verified";
    if (status === "Rejected") vendor.kycStatus = "Rejected";
    this.logAction(actor, `Updated Vendor Status to ${status}`, "Vendor", vendorId, oldStatus, status);
    this.notify();
    vendorApi.updateStatus(vendorId, status, reason).catch((err) =>
      console.error("Failed to persist vendor status:", err)
    );
  }

  public verifyKyc(vendorId: string, kycStatus: KycStatus, actor = "Alex Morgan", notes?: string) {
    const vendor = this.getVendor(vendorId);
    if (!vendor) return;
    const oldKyc = vendor.kycStatus;
    vendor.kycStatus = kycStatus;
    if (notes) vendor.notes = notes;
    this.logAction(actor, `Updated KYC Status to ${kycStatus}`, "Vendor", vendorId, oldKyc, kycStatus);
    this.notify();
    vendorApi.updateKycStatus(vendorId, kycStatus, notes).catch((err) =>
      console.error("Failed to persist KYC status:", err)
    );
  }

  public updateCommission(vendorId: string, commissionRate: number, actor = "Alex Morgan") {
    const vendor = this.getVendor(vendorId);
    if (!vendor) return;
    const old = vendor.commissionRate;
    vendor.commissionRate = commissionRate;
    this.logAction(actor, `Updated Commission Rate to ${commissionRate}%`, "Vendor", vendorId, `${old}%`, `${commissionRate}%`);
    this.notify();
    vendorApi.updateCommission(vendorId, commissionRate).catch((err) =>
      console.error("Failed to persist commission update:", err)
    );
  }

  public verifyDocument(vendorId: string, docId: string, status: DocumentStatus, actor = "Alex Morgan", notes?: string) {
    const vendor = this.getVendor(vendorId);
    if (!vendor) return;
    const doc = vendor.documents.find((d) => d.id === docId);
    if (!doc) return;
    const old = doc.status;
    doc.status = status;
    doc.verifiedBy = actor;
    doc.verifiedDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    if (notes) doc.notes = notes;

    const allVerified = vendor.documents.length > 0 && vendor.documents.every((d) => d.status === "Verified");
    if (allVerified) {
      vendor.documentsStatus = "Verified";
      vendor.kycStatus = "Verified";
    }

    this.logAction(actor, `Document ${doc.type} marked as ${status}`, "Document", docId, old, status);
    this.notify();
    vendorApi.verifyDocument(vendorId, docId, status, notes).catch((err) =>
      console.error("Failed to persist document verification:", err)
    );
  }

  public addVendor(
    vendorData: Omit<Vendor, "id" | "registrationDate" | "rating" | "documents"> & {
      documents?: VendorDocument[] | undefined;
    },
    actor = "Alex Morgan",
  ): Vendor {
    const id = `VEN-${1000 + this.vendors.length + 1}`;
    const docs = vendorData.documents || [];
    const hasGst = docs.some((d) => d.type === "GST Certificate");
    const hasPan = docs.some((d) => d.type === "PAN Card");
    const hasAddress = docs.some((d) => d.type === "Address Proof");

    let docStatus: Vendor["documentsStatus"] = "Pending";
    if (hasGst && hasPan && hasAddress) {
      docStatus = "Under Review";
    } else if (docs.length > 0) {
      docStatus = "Under Review";
    }

    const newVendor: Vendor = {
      ...vendorData,
      id,
      registrationDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      rating: 5.0,
      documents: docs,
      documentsStatus: vendorData.documentsStatus || docStatus,
      kycStatus: vendorData.kycStatus || "Pending",
      status: vendorData.status || "Pending",
    };
    this.vendors.unshift(newVendor);
    this.logAction(actor, "Registered New Vendor", "Vendor", id, "None", newVendor.businessName);
    this.notify();

    vendorApi
      .registerVendor({
        businessName: vendorData.businessName,
        ownerName: vendorData.ownerName,
        email: vendorData.email,
        phone: vendorData.phone,
        alternatePhone: vendorData.alternatePhone,
        website: vendorData.website,
        address: vendorData.address,
        city: vendorData.city,
        state: vendorData.state,
        pincode: vendorData.pincode,
        country: vendorData.country,
        businessType: vendorData.businessType,
        commissionRate: vendorData.commissionRate,
        taxInfo: vendorData.taxInfo,
        bankInfo: vendorData.bankInfo,
      })
      .then((created) => {
        if (created?.id) {
          newVendor.id = created.id;
          this.notify();
        }
      })
      .catch((err) => console.error("Failed to register vendor on backend:", err));

    return newVendor;
  }

  public addDocumentToVendor(
    vendorId: string,
    docData: {
      type: VendorDocument["type"];
      documentNumber: string;
      fileName: string;
      fileSize: string;
      fileUrl?: string | undefined;
      notes?: string | undefined;
      expiryDate?: string | undefined;
      status?: DocumentStatus | undefined;
      file?: File | null;
    },
    actor = "Alex Morgan",
  ): VendorDocument | undefined {
    const vendor = this.getVendor(vendorId);
    if (!vendor) return undefined;

    const newDoc: VendorDocument = {
      id: `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: docData.type,
      documentNumber: docData.documentNumber,
      fileName: docData.fileName,
      fileSize: docData.fileSize,
      fileUrl: docData.fileUrl,
      uploadedDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      status: docData.status || "Pending",
      notes: docData.notes,
      expiryDate: docData.expiryDate,
    };

    const existingIndex = vendor.documents.findIndex((d) => d.type === docData.type);
    if (existingIndex >= 0) {
      vendor.documents[existingIndex] = newDoc;
    } else {
      vendor.documents.push(newDoc);
    }

    if (vendor.documentsStatus === "Pending" || vendor.documentsStatus === "Action Required") {
      vendor.documentsStatus = "Under Review";
    }

    this.logAction(actor, `Uploaded ${docData.type} (${docData.fileName})`, "Document", newDoc.id, "None", "Uploaded");
    this.notify();

    if (docData.file) {
      const formData = new FormData();
      formData.append("file", docData.file);
      formData.append("type", docData.type);
      formData.append("documentNumber", docData.documentNumber);
      if (docData.notes) formData.append("notes", docData.notes);
      if (docData.expiryDate) formData.append("expiryDate", docData.expiryDate);

      vendorApi.uploadDocument(vendorId, formData).catch((err) =>
        console.error("Failed to upload document file:", err)
      );
    }

    return newDoc;
  }

  public deleteDocumentFromVendor(vendorId: string, docId: string, actor = "Alex Morgan"): boolean {
    const vendor = this.getVendor(vendorId);
    if (!vendor) return false;
    const docIndex = vendor.documents.findIndex((d) => d.id === docId);
    if (docIndex === -1 || !vendor.documents[docIndex]) return false;
    const doc = vendor.documents[docIndex]!;
    vendor.documents.splice(docIndex, 1);
    this.logAction(actor, `Removed ${doc.type} (${doc.fileName})`, "Document", docId, doc.status, "Deleted");
    this.notify();
    vendorApi.deleteDocument(vendorId, docId).catch((err) =>
      console.error("Failed to persist document deletion:", err)
    );
    return true;
  }

  public softDeleteVendor(vendorId: string, actor = "Alex Morgan") {
    const vendor = this.getVendor(vendorId);
    if (!vendor) return;
    vendor.softDeleted = true;
    this.logAction(actor, "Archived Vendor", "Vendor", vendorId, vendor.status, "Archived");
    this.notify();
    vendorApi.softDeleteVendor(vendorId).catch((err) =>
      console.error("Failed to persist vendor soft delete:", err)
    );
  }

  // --- PRODUCTS & VARIANTS ---
  public getProducts(): VendorProduct[] {
    return this.products;
  }

  public getProduct(id: string): VendorProduct | undefined {
    return this.products.find((p) => p.id === id);
  }

  public getProductsByVendor(vendorId: string): VendorProduct[] {
    return this.products.filter((p) => p.vendorId === vendorId);
  }

  public getVariant(variantId: string): ProductVariant | undefined {
    for (const p of this.products) {
      const v = p.variants.find((x) => x.id === variantId);
      if (v) return v;
    }
    return undefined;
  }

  // --- UNITS & UNIT CONVERSIONS ---
  public getUnits(): UnitRecord[] {
    return this.units;
  }

  public addUnit(unit: Omit<UnitRecord, "id">, actor = "Alex Morgan"): UnitRecord {
    const id = `UNT-${String(this.units.length + 1).padStart(2, "0")}`;
    const newUnit: UnitRecord = { ...unit, id };
    this.units.push(newUnit);
    this.logAction(actor, `Created Unit ${newUnit.name}`, "Inventory", id, "None", newUnit.code);
    this.notify();
    return newUnit;
  }

  public convertUnits(value: number, fromUnitCode: string, toUnitCode: string): number {
    if (fromUnitCode === toUnitCode) return value;
    const from = this.units.find((u) => u.code === fromUnitCode);
    const to = this.units.find((u) => u.code === toUnitCode);
    if (!from || !to) return value;

    if (from.baseUnit === to.baseUnit && from.conversionValue && to.conversionValue) {
      const inBase = value * from.conversionValue;
      return inBase / to.conversionValue;
    }
    return value;
  }

  // --- INVENTORY, STOCKS & BATCHES ---
  public getBatches(): Batch[] {
    return this.batches;
  }

  public getMovements(): StockMovement[] {
    return this.movements;
  }

  public addStock(
    payload: {
      vendorId: string;
      productId: string;
      variantId: string;
      unitCode: string;
      quantity: number;
      purchasePrice: number;
      batchNumber: string;
      mfgDate: string;
      expiryDate: string;
      warehouseName: string;
      storageLocation: string;
      notes?: string;
    },
    actor = "Alex Morgan",
  ) {
    const product = this.getProduct(payload.productId);
    const variant = this.getVariant(payload.variantId);
    const vendor = this.getVendor(payload.vendorId);
    if (!product || !variant) throw new Error("Product variant not found");

    if (new Date(payload.expiryDate) <= new Date(payload.mfgDate)) {
      throw new Error("Expiry date must be after manufacturing date");
    }

    const prevStock = variant.availableStock;
    variant.availableStock += payload.quantity;

    // Create or update batch
    let batch = this.batches.find((b) => b.batchNumber === payload.batchNumber);
    if (batch) {
      batch.availableQuantity += payload.quantity;
      batch.initialQuantity += payload.quantity;
    } else {
      batch = {
        id: `BAT-${Date.now()}`,
        batchNumber: payload.batchNumber,
        productId: product.id,
        productName: product.name,
        variantId: variant.id,
        variantName: variant.name,
        vendorId: payload.vendorId,
        vendorName: vendor ? vendor.businessName : "Bloom Direct",
        initialQuantity: payload.quantity,
        availableQuantity: payload.quantity,
        damagedQuantity: 0,
        expiredQuantity: 0,
        manufacturingDate: payload.mfgDate,
        expiryDate: payload.expiryDate,
        warehouseId: "WH-01",
        warehouseName: payload.warehouseName,
        location: payload.storageLocation,
        status: "Active",
      };
      this.batches.unshift(batch);
    }

    // Record Movement
    const movement: StockMovement = {
      id: `MOV-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      variantName: variant.name,
      vendorId: payload.vendorId,
      vendorName: vendor ? vendor.businessName : "Bloom Direct",
      batchNumber: payload.batchNumber,
      unit: payload.unitCode,
      quantity: payload.quantity,
      movementType: "Purchase",
      referenceId: payload.batchNumber,
      previousStock: prevStock,
      newStock: variant.availableStock,
      warehouse: payload.warehouseName,
      location: payload.storageLocation,
      createdBy: actor,
      createdDate: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      notes: payload.notes || "Inbound stock receipt",
    };
    this.movements.unshift(movement);

    this.logAction(
      actor,
      `Added ${payload.quantity} units of ${variant.name}`,
      "Inventory",
      variant.id,
      `${prevStock}`,
      `${variant.availableStock}`,
    );
    this.notify();
  }

  public adjustStock(
    payload: {
      variantId: string;
      type: "Increase" | "Decrease";
      quantity: number;
      reason: StockAdjustmentReason;
      notes: string;
      batchNumber?: string;
      warehouseName?: string;
    },
    actor = "Alex Morgan",
  ) {
    const variant = this.getVariant(payload.variantId);
    if (!variant) throw new Error("Variant not found");
    const product = this.getProduct(variant.productId);

    const prevStock = variant.availableStock;
    let newStock = prevStock;

    if (payload.type === "Decrease") {
      if (variant.availableStock < payload.quantity) {
        throw new Error(`Insufficient stock. Available: ${variant.availableStock}, requested decrease: ${payload.quantity}`);
      }
      variant.availableStock -= payload.quantity;
      if (payload.reason === "Damaged") {
        variant.damagedStock += payload.quantity;
      } else if (payload.reason === "Expired") {
        variant.expiredStock += payload.quantity;
      }
      newStock = variant.availableStock;
    } else {
      variant.availableStock += payload.quantity;
      newStock = variant.availableStock;
    }

    const movement: StockMovement = {
      id: `MOV-${Date.now()}`,
      productId: product?.id || "",
      productName: product?.name || variant.name,
      variantId: variant.id,
      variantName: variant.name,
      vendorId: product?.vendorId || "VEN-1001",
      vendorName: product?.vendorName || "Bloom",
      batchNumber: payload.batchNumber || "ADJ-DEFAULT",
      unit: variant.unitCode,
      quantity: payload.type === "Decrease" ? -payload.quantity : payload.quantity,
      movementType: "Adjustment",
      referenceId: `ADJ-${Date.now()}`,
      previousStock: prevStock,
      newStock,
      warehouse: payload.warehouseName || "Mumbai Central",
      createdBy: actor,
      createdDate: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      notes: `Adjustment (${payload.type} ${payload.quantity}): ${payload.reason} - ${payload.notes}`,
    };
    this.movements.unshift(movement);

    this.logAction(
      actor,
      `Stock Adjustment (${payload.type} ${payload.quantity}) - ${payload.reason}`,
      "Inventory",
      variant.id,
      `${prevStock}`,
      `${newStock}`,
    );
    this.notify();
  }

  // --- PRODUCTION ---
  public getProductions(): ProductionOrder[] {
    return this.productions;
  }

  public getProduction(id: string): ProductionOrder | undefined {
    return this.productions.find((p) => p.id === id);
  }

  public createProduction(
    payload: {
      vendorId: string;
      productId: string;
      variantId: string;
      unit: string;
      plannedQuantity: number;
      rawMaterials: RawMaterialItem[];
      productionDate: string;
      expectedCompletion: string;
      warehouseName: string;
      storageLocation: string;
      batchNumber: string;
      notes?: string;
    },
    actor = "Alex Morgan",
  ): ProductionOrder {
    const product = this.getProduct(payload.productId);
    const variant = this.getVariant(payload.variantId);
    const vendor = this.getVendor(payload.vendorId);
    if (!product || !variant) throw new Error("Product variant not found");

    const id = `PRD-2026-${String(this.productions.length + 1).padStart(2, "0")}`;
    const order: ProductionOrder = {
      id,
      vendorId: payload.vendorId,
      vendorName: vendor ? vendor.businessName : "Bloom Direct",
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      variantName: variant.name,
      unit: payload.unit,
      batchNumber: payload.batchNumber,
      plannedQuantity: payload.plannedQuantity,
      producedQuantity: 0,
      rejectedQuantity: 0,
      goodQuantity: 0,
      remainingQuantity: payload.plannedQuantity,
      rawMaterials: payload.rawMaterials,
      productionDate: payload.productionDate,
      expectedCompletion: payload.expectedCompletion,
      warehouseId: "WH-01",
      warehouseName: payload.warehouseName,
      storageLocation: payload.storageLocation,
      status: "Planned",
      notes: payload.notes,
      createdBy: actor,
    };

    this.productions.unshift(order);
    this.logAction(actor, `Created Production Plan for ${payload.plannedQuantity} ${payload.unit}`, "Production", id, "None", "Planned");
    this.notify();
    return order;
  }

  public completeProduction(
    productionId: string,
    producedQuantity: number,
    rejectedQuantity: number,
    actor = "Alex Morgan",
  ) {
    const production = this.getProduction(productionId);
    if (!production) throw new Error("Production order not found");

    if (rejectedQuantity > producedQuantity) {
      throw new Error("Rejected Quantity cannot be greater than Produced Quantity");
    }

    const goodQuantity = producedQuantity - rejectedQuantity;
    const remainingQuantity = Math.max(0, production.plannedQuantity - producedQuantity);

    production.producedQuantity = producedQuantity;
    production.rejectedQuantity = rejectedQuantity;
    production.goodQuantity = goodQuantity;
    production.remainingQuantity = remainingQuantity;
    production.actualCompletion = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    production.status = remainingQuantity === 0 ? "Completed" : "Partially Completed";

    // Auto-create/update Batch
    const batch: Batch = {
      id: `BAT-${Date.now()}`,
      batchNumber: production.batchNumber,
      productId: production.productId,
      productName: production.productName,
      variantId: production.variantId,
      variantName: production.variantName,
      vendorId: production.vendorId,
      vendorName: production.vendorName,
      productionId: production.id,
      initialQuantity: goodQuantity,
      availableQuantity: goodQuantity,
      damagedQuantity: rejectedQuantity,
      expiredQuantity: 0,
      manufacturingDate: production.actualCompletion,
      expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 2).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      warehouseId: production.warehouseId,
      warehouseName: production.warehouseName,
      location: production.storageLocation,
      status: "Active",
    };
    this.batches.unshift(batch);

    // Update variant inventory
    const variant = this.getVariant(production.variantId);
    if (variant) {
      const prevStock = variant.availableStock;
      variant.availableStock += goodQuantity;
      variant.damagedStock += rejectedQuantity;

      // Stock Movement for Good Stock
      const goodMovement: StockMovement = {
        id: `MOV-${Date.now()}`,
        productId: production.productId,
        productName: production.productName,
        variantId: production.variantId,
        variantName: production.variantName,
        vendorId: production.vendorId,
        vendorName: production.vendorName,
        batchNumber: production.batchNumber,
        unit: production.unit,
        quantity: goodQuantity,
        movementType: "Production",
        referenceId: production.id,
        previousStock: prevStock,
        newStock: variant.availableStock,
        warehouse: production.warehouseName,
        location: production.storageLocation,
        createdBy: actor,
        createdDate: new Date().toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        notes: `Production completed: ${goodQuantity} good units received into sellable inventory.`,
      };
      this.movements.unshift(goodMovement);
    }

    this.logAction(
      actor,
      `Completed Production Order (${goodQuantity} good, ${rejectedQuantity} rejected)`,
      "Production",
      production.id,
      "In Progress",
      production.status,
    );
    this.notify();
  }

  // --- ORDERS & INVENTORY RESERVATION ---
  public getVendorOrders(): VendorOrder[] {
    return this.orders;
  }

  public getVendorOrder(id: string): VendorOrder | undefined {
    return this.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public updateOrderStatus(orderId: string, status: VendorOrderStatus, actor = "Alex Morgan") {
    const order = this.getVendorOrder(orderId);
    if (!order) return;
    const oldStatus = order.orderStatus;
    order.orderStatus = status;
    order.timeline.unshift({
      status,
      date: "Just now",
      description: `Status changed from ${oldStatus} to ${status} by ${actor}`,
    });

    // INVENTORY & ORDER INTEGRATION LOGIC:
    // When order is Confirmed/Processing: reserved stock should be maintained.
    // When order is Shipped: reserved stock is deducted, total stock reduced.
    // When order is Cancelled: reserved stock is released back to available.
    if (oldStatus !== "Shipped" && status === "Shipped") {
      for (const item of order.items) {
        const variant = this.getVariant(item.variantId);
        if (variant) {
          variant.reservedStock = Math.max(0, variant.reservedStock - item.quantity);
          const prev = variant.availableStock;
          const movement: StockMovement = {
            id: `MOV-${Date.now()}-${item.variantId}`,
            productId: item.productId,
            productName: item.productName,
            variantId: item.variantId,
            variantName: item.variantName,
            vendorId: item.vendorId,
            vendorName: order.vendorName,
            batchNumber: "ORDER-FULFILL",
            unit: "PCS",
            quantity: -item.quantity,
            movementType: "Order",
            referenceId: order.orderNumber,
            previousStock: prev,
            newStock: variant.availableStock,
            warehouse: "Mumbai Central",
            createdBy: actor,
            createdDate: new Date().toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            notes: `Shipped order #${order.orderNumber}`,
          };
          this.movements.unshift(movement);
        }
      }
    } else if (status === "Cancelled" && oldStatus !== "Cancelled") {
      for (const item of order.items) {
        const variant = this.getVariant(item.variantId);
        if (variant) {
          variant.reservedStock = Math.max(0, variant.reservedStock - item.quantity);
          variant.availableStock += item.quantity;
          const movement: StockMovement = {
            id: `MOV-${Date.now()}-${item.variantId}`,
            productId: item.productId,
            productName: item.productName,
            variantId: item.variantId,
            variantName: item.variantName,
            vendorId: item.vendorId,
            vendorName: order.vendorName,
            batchNumber: "ORDER-CANCEL",
            unit: "PCS",
            quantity: item.quantity,
            movementType: "Order Cancellation",
            referenceId: order.orderNumber,
            previousStock: variant.availableStock - item.quantity,
            newStock: variant.availableStock,
            warehouse: "Mumbai Central",
            createdBy: actor,
            createdDate: new Date().toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            notes: `Order cancellation released reserved stock #${order.orderNumber}`,
          };
          this.movements.unshift(movement);
        }
      }
    }

    this.logAction(actor, `Updated Order #${order.orderNumber} Status to ${status}`, "Order", order.id, oldStatus, status);
    this.notify();
    vendorApi.updateOrderStatus(orderId, status).catch((err) =>
      console.error("Failed to persist order status:", err)
    );
  }

  // --- RETURNS & INSPECTION ---
  public getReturns(): VendorReturn[] {
    return this.returns;
  }

  public inspectReturn(
    returnId: string,
    result: ReturnInspectionResult,
    disposition: "Restock" | "Scrap" | "Return to Vendor",
    actor = "Alex Morgan",
    notes?: string,
  ) {
    const ret = this.returns.find((r) => r.id === returnId);
    if (!ret) return;
    const old = ret.inspectionResult;
    ret.inspectionResult = result;
    ret.dispositionAction = disposition;
    ret.inspectedBy = actor;
    ret.inspectionNotes = notes;
    ret.status = result === "Damaged" || result === "Expired" ? "Closed" : "Approved for Refund";

    // ONLY GOOD PRODUCTS RETURN TO SELLABLE STOCK!
    const variant = this.getVariant(ret.variantId);
    if (variant) {
      const prev = variant.availableStock;
      if (result === "Good" && disposition === "Restock") {
        variant.availableStock += ret.quantity;
        const mov: StockMovement = {
          id: `MOV-${Date.now()}`,
          productId: ret.productId,
          productName: ret.productName,
          variantId: ret.variantId,
          variantName: ret.variantName,
          vendorId: ret.vendorId,
          vendorName: ret.vendorName,
          batchNumber: "RET-RESTOCK",
          unit: "PCS",
          quantity: ret.quantity,
          movementType: "Return",
          referenceId: ret.orderNumber,
          previousStock: prev,
          newStock: variant.availableStock,
          warehouse: "Mumbai Central",
          createdBy: actor,
          createdDate: new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          notes: `Return #${ret.id} inspected Good — restored to available sellable stock.`,
        };
        this.movements.unshift(mov);
      } else if (result === "Damaged") {
        variant.damagedStock += ret.quantity;
        const mov: StockMovement = {
          id: `MOV-${Date.now()}`,
          productId: ret.productId,
          productName: ret.productName,
          variantId: ret.variantId,
          variantName: ret.variantName,
          vendorId: ret.vendorId,
          vendorName: ret.vendorName,
          batchNumber: "RET-DAMAGED",
          unit: "PCS",
          quantity: ret.quantity,
          movementType: "Damage",
          referenceId: ret.orderNumber,
          previousStock: prev,
          newStock: prev,
          warehouse: "Mumbai Central",
          createdBy: actor,
          createdDate: new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          notes: `Return #${ret.id} inspected Damaged — routed to scrap inventory.`,
        };
        this.movements.unshift(mov);
      }
    }

    this.logAction(actor, `Inspected Return #${ret.id} as ${result} (${disposition})`, "Return", ret.id, old, result);
    this.notify();
    vendorApi.inspectReturn(returnId, { passed: result === "Good", notes }).catch((err) =>
      console.error("Failed to persist return inspection:", err)
    );
  }

  // --- TRANSACTIONS, WALLET & SETTLEMENTS ---
  public getTransactions(): VendorTransaction[] {
    return this.transactions;
  }

  public getVendorTransactions(vendorId: string): VendorTransaction[] {
    return this.transactions.filter((t) => t.vendorId === vendorId);
  }

  public getSettlements(): VendorSettlement[] {
    return this.settlements;
  }

  public getPayments(): VendorPayment[] {
    return this.payments;
  }

  public getVendorWallet(vendorId: string) {
    const txns = this.getVendorTransactions(vendorId);
    let totalEarnings = 0;
    let totalCommission = 0;
    let totalRefunds = 0;
    let totalWithdrawals = 0;

    for (const t of txns) {
      if (t.status === "Completed") {
        if (t.type === "Order Sale") totalEarnings += t.amount;
        if (t.type === "Commission") totalCommission += Math.abs(t.amount);
        if (t.type === "Refund" || t.type === "Return Deduction") totalRefunds += Math.abs(t.amount);
        if (t.type === "Vendor Settlement" || t.type === "Payment") totalWithdrawals += Math.abs(t.amount);
      }
    }

    const availableBalance = Math.max(0, totalEarnings - totalCommission - totalRefunds - totalWithdrawals);
    const pendingSettlements = this.settlements
      .filter((s) => s.vendorId === vendorId && s.paymentStatus !== "Paid")
      .reduce((acc, curr) => acc + curr.netPayable, 0);

    return {
      totalEarnings,
      totalCommission,
      totalRefunds,
      totalWithdrawals,
      totalSettled: totalWithdrawals,
      availableBalance,
      pendingBalance: pendingSettlements,
    };
  }

  public generateSettlement(
    vendorId: string,
    period: string,
    actor = "Alex Morgan",
  ): VendorSettlement {
    const vendor = this.getVendor(vendorId);
    if (!vendor) throw new Error("Vendor not found");

    const orders = this.orders.filter(
      (o) => o.vendorId === vendorId && o.orderStatus === "Delivered" && o.paymentStatus === "Paid",
    );

    const totalSales = orders.reduce((acc, curr) => acc + curr.vendorGross, 0);
    const commission = (totalSales * vendor.commissionRate) / 100;
    const refunds = this.returns
      .filter((r) => r.vendorId === vendorId && r.status === "Refunded")
      .reduce((acc, curr) => acc + curr.refundAmount, 0);

    const netPayable = Math.max(0, totalSales - commission - refunds);

    const settlement: VendorSettlement = {
      id: `STL-2026-${String(this.settlements.length + 1).padStart(2, "0")}`,
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
      settlementDate: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };

    this.settlements.unshift(settlement);
    this.logAction(actor, `Generated Settlement for ${vendor.businessName} (₹${netPayable})`, "Settlement", settlement.id, "None", "Pending");
    this.notify();
    vendorApi.generateSettlement(vendorId, period).catch((err) =>
      console.error("Failed to persist settlement generation:", err)
    );
    return settlement;
  }

  public approveSettlement(settlementId: string, actor = "Alex Morgan") {
    const s = this.settlements.find((x) => x.id === settlementId);
    if (!s) return;
    s.paymentStatus = "Approved";

    // Auto-create payout entry
    const payment: VendorPayment = {
      id: `PAY-${Date.now()}`,
      settlementId: s.id,
      vendorId: s.vendorId,
      vendorName: s.vendorName,
      amount: s.netPayable,
      method: "NEFT",
      bankAccountMasked: "••••••••4812",
      ifsc: "HDFC0000240",
      referenceId: `REQ-${Date.now()}`,
      status: "Approved",
      requestedDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    };
    this.payments.unshift(payment);

    this.logAction(actor, `Approved Settlement #${s.id}`, "Settlement", s.id, "Pending", "Approved");
    this.notify();
    vendorApi.approveSettlement(settlementId).catch((err) =>
      console.error("Failed to persist settlement approval:", err)
    );
  }

  public processPayment(paymentId: string, referenceId: string, actor = "Alex Morgan") {
    const p = this.payments.find((x) => x.id === paymentId);
    if (!p) return;
    p.status = "Completed";
    p.referenceId = referenceId;
    p.processedDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    p.processedBy = actor;

    const s = this.settlements.find((x) => x.id === p.settlementId);
    if (s) {
      s.paymentStatus = "Paid";
      s.paidDate = p.processedDate;
      s.referenceNumber = referenceId;
    }

    // Record vendor withdrawal transaction
    const txn: VendorTransaction = {
      id: `VTX-${Date.now()}`,
      vendorId: p.vendorId,
      vendorName: p.vendorName,
      type: "Payment",
      amount: -p.amount,
      currency: "INR",
      status: "Completed",
      referenceId,
      description: `Disbursement for Settlement #${p.settlementId} via ${p.method}`,
      createdDate: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    this.transactions.unshift(txn);

    this.logAction(actor, `Disbursed Payment ₹${p.amount} (Ref: ${referenceId})`, "Payment", p.id, "Approved", "Completed");
    this.notify();
    vendorApi.processPayment(paymentId, { referenceId }).catch((err) =>
      console.error("Failed to persist payment disbursement:", err)
    );
  }

  // --- STORAGE LOCATIONS ---
  public getStorageLocations(): StorageLocation[] {
    return this.storageLocations;
  }

  public addStorageLocation(loc: Omit<StorageLocation, "id" | "code" | "occupied">, actor = "Alex Morgan"): StorageLocation {
    const id = `LOC-${String(this.storageLocations.length + 1).padStart(2, "0")}`;
    const code = `${loc.warehouseName.slice(0, 3).toUpperCase()}-${loc.zone}-${loc.rack}-${loc.shelf}-${loc.bin}`;
    const newLoc: StorageLocation = { ...loc, id, code, occupied: 0 };
    this.storageLocations.push(newLoc);
    this.logAction(actor, `Added Storage Bin ${code}`, "Inventory", id, "None", code);
    this.notify();
    return newLoc;
  }

  // --- COMMISSIONS ---
  public getCommissions(): CommissionTier[] {
    return this.commissions;
  }

  // --- ACTIVITY LOGS ---
  public getActivityLogs(): VendorActivityLog[] {
    return this.activityLogs;
  }

  // --- BATCH HELPERS ---
  public getBatch(id: string): Batch | undefined {
    return this.batches.find((b) => b.id === id || b.batchNumber === id);
  }

  public updateBatchStatus(batchId: string, status: BatchStatus, actor = "Alex Morgan") {
    const batch = this.batches.find((b) => b.id === batchId);
    if (!batch) return;
    const oldStatus = batch.status;
    batch.status = status;
    this.logAction(actor, `Updated Batch #${batch.batchNumber} status to ${status}`, "Inventory", batch.id, oldStatus, status);
    this.notify();
  }

  // --- WAREHOUSES ---
  public getWarehouses() {
    return [
      { id: "wh-1", code: "WH-MUM-01", name: "Central Fulfillment Hub", city: "Mumbai", state: "Maharashtra" },
      { id: "wh-2", code: "WH-BLR-02", name: "South Regional Hub", city: "Bengaluru", state: "Karnataka" },
      { id: "wh-3", code: "WH-DEL-03", name: "North Distribution Center", city: "Delhi NCR", state: "Haryana" },
    ];
  }
}

export const vendorStore = new BloomVendorStore();

import { useSyncExternalStore } from "react";

export function useVendorStore<T>(selector: (store: BloomVendorStore) => T): T {
  useSyncExternalStore(
    (onStoreChange) => vendorStore.subscribe(onStoreChange),
    () => vendorStore.getVersion(),
    () => 0,
  );
  return selector(vendorStore);
}
