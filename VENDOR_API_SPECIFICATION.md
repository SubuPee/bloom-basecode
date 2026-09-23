# Bloom Vendor Management — Backend API Specification

This document details all required REST API endpoints for the **Bloom Vendor Management** ecosystem, matching all existing UI features in the dashboard.

---

## Global Requirements

- **Base URL**: `http://localhost:5000/api` (or production API root)
- **Authentication**: JWT Bearer token in the request header:
  ```http
  Authorization: Bearer <jwt_token>
  ```
- **Standard Success Response Envelope**:
  ```json
  {
    "success": true,
    "message": "Operation completed successfully",
    "data": { ... }
  }
  ```
- **Standard Error Response Envelope**:
  ```json
  {
    "success": false,
    "message": "Detailed error message",
    "errors": []
  }
  ```

---

## 1. Vendor Onboarding & Registration Queue

### 1.1 Register New Vendor
- **Route**: `POST /api/vendors`
- **Auth**: Protected (Admin or Vendor Self-Registration)
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "businessName": "Auralink Audio Works",
    "ownerName": "Rohan Mehra",
    "businessType": "Manufacturer", // "Manufacturer" | "Wholesaler" | "D2C Brand" | "Distributor"
    "email": "rohan@auralink.in",
    "phone": "+91 98200 12345",
    "alternatePhone": "+91 98200 54321",
    "website": "https://auralinkaudio.com",
    "address": "Unit 402, Lotus Grandeur, Veera Desai Road",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "pincode": "400053",
    "commissionRate": 8, // Percentage
    "taxInfo": {
      "gstNumber": "27AABCA1234F1Z8",
      "panNumber": "AABCA1234F",
      "taxType": "Standard GST" // "Standard GST" | "Composition" | "Exempt" | "Special Economic Zone"
    },
    "bankInfo": {
      "accountHolder": "Auralink Audio Works LLP",
      "accountNumber": "50200012345678",
      "bankName": "HDFC Bank",
      "ifsc": "HDFC0000240",
      "branch": "Andheri West, Mumbai",
      "upiId": "auralink@hdfcbank"
    },
    "documents": [
      {
        "type": "GST Certificate",
        "documentNumber": "27AABCA1234F1Z8",
        "fileName": "gst_cert.pdf",
        "fileSize": "1.4 MB",
        "fileUrl": "https://storage.bloom.com/docs/gst_123.pdf"
      },
      {
        "type": "PAN Card",
        "documentNumber": "AABCA1234F",
        "fileName": "pan_card.pdf",
        "fileSize": "890 KB",
        "fileUrl": "https://storage.bloom.com/docs/pan_123.pdf"
      },
      {
        "type": "Address Proof",
        "documentNumber": "EL-BILL-99214",
        "fileName": "electricity_bill.pdf",
        "fileSize": "2.1 MB",
        "fileUrl": "https://storage.bloom.com/docs/addr_123.pdf"
      }
    ]
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Vendor registered successfully",
    "data": {
      "id": "VEN-1001",
      "businessName": "Auralink Audio Works",
      "status": "Under Review",
      "kycStatus": "Pending",
      "documentsStatus": "Under Review",
      "registrationDate": "2026-09-21"
    }
  }
  ```

---

### 1.2 Get All Vendor Registrations / List
- **Route**: `GET /api/vendors/registrations`
- **Auth**: Admin Protected
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `search` (string, businessName / ownerName / phone / email)
  - `status` (`Pending` | `Under Review` | `Approved` | `Rejected` | `Suspended` | `Inactive`)
  - `kycStatus` (`Pending` | `Verified` | `Rejected` | `In Review`)
  - `businessType` (`Manufacturer` | `Wholesaler` | `D2C Brand` | `Distributor`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "vendors": [
        {
          "id": "VEN-1001",
          "businessName": "Auralink Audio Works",
          "ownerName": "Rohan Mehra",
          "email": "rohan@auralink.in",
          "phone": "+91 98200 12345",
          "businessType": "Manufacturer",
          "city": "Mumbai",
          "state": "Maharashtra",
          "status": "Approved",
          "kycStatus": "Verified",
          "documentsStatus": "Verified",
          "rating": 4.9,
          "commissionRate": 8,
          "registrationDate": "12 May 2025",
          "documents": [ ... ]
        }
      ],
      "pagination": {
        "total": 45,
        "page": 1,
        "limit": 10,
        "totalPages": 5
      }
    }
  }
  ```

---

### 1.3 Update Vendor Application Status (Approve / Reject / Suspend)
- **Route**: `PATCH /api/vendors/:id/status`
- **Auth**: Admin Protected
- **Request Body**:
  ```json
  {
    "status": "Approved", // "Approved" | "Rejected" | "Suspended" | "Under Review" | "Inactive"
    "reason": "Documents verified and bank mandate confirmed" // Required if status is "Rejected" or "Suspended"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Vendor status updated to Approved",
    "data": {
      "id": "VEN-1001",
      "status": "Approved",
      "kycStatus": "Verified"
    }
  }
  ```

---

### 1.4 Update KYC Status
- **Route**: `PATCH /api/vendors/:id/kyc-status`
- **Auth**: Admin Protected
- **Request Body**:
  ```json
  {
    "kycStatus": "Verified", // "Pending" | "Verified" | "Rejected" | "In Review"
    "notes": "Verified against Income Tax portal"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "KYC status updated to Verified"
  }
  ```

---

## 2. Compliance Document Management (GST, PAN, Address Proof)

### 2.1 Upload Compliance Document
- **Route**: `POST /api/vendors/:id/documents`
- **Auth**: Protected
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `file`: Binary file (PDF, PNG, JPG, JPEG, WEBP; max 10MB)
  - `type`: `"GST Certificate"` | `"PAN Card"` | `"Address Proof"` | `"Bank Proof"` | `"Business Registration"` | `"Other"`
  - `documentNumber`: string (e.g. `27AABCA1234F1Z8` or `AABCA1234F`)
  - `expiryDate`: string (optional, `YYYY-MM-DD`)
  - `notes`: string (optional)
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Document uploaded successfully",
    "data": {
      "id": "DOC-9081",
      "type": "GST Certificate",
      "documentNumber": "27AABCA1234F1Z8",
      "fileName": "gst_cert.pdf",
      "fileSize": "1.4 MB",
      "fileUrl": "https://storage.bloom.com/docs/gst_cert_9081.pdf",
      "uploadedDate": "21 Sep 2026",
      "status": "Pending"
    }
  }
  ```

---

### 2.2 Get Vendor Documents
- **Route**: `GET /api/vendors/:id/documents`
- **Auth**: Protected
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "DOC-101",
        "type": "GST Certificate",
        "documentNumber": "27AABCA1234F1Z8",
        "fileName": "gst_certificate.pdf",
        "fileSize": "1.4 MB",
        "fileUrl": "https://storage.bloom.com/docs/gst_certificate.pdf",
        "uploadedDate": "12 May 2025",
        "status": "Verified",
        "verifiedBy": "Alex Morgan",
        "verifiedDate": "14 May 2025"
      }
    ]
  }
  ```

---

### 2.3 Verify or Reject Document
- **Route**: `PATCH /api/vendors/:id/documents/:docId/verify`
- **Auth**: Admin Protected
- **Request Body**:
  ```json
  {
    "status": "Verified", // "Verified" | "Rejected" | "Pending"
    "notes": "GST registration verified with active status on GSTIN portal."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Document status updated"
  }
  ```

---

### 2.4 Delete Document
- **Route**: `DELETE /api/vendors/:id/documents/:docId`
- **Auth**: Admin Protected
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Document deleted successfully"
  }
  ```

---

## 3. Vendor Profile & Details (`/vendors/:vendorId`)

### 3.1 Get Vendor Full Profile
- **Route**: `GET /api/vendors/:id`
- **Auth**: Protected
- **Response (200 OK)**: Full vendor object with contact info, tax info, masked bank details, rating, commission rate, and document summary.

---

### 3.2 Update Vendor Information
- **Route**: `PUT /api/vendors/:id`
- **Auth**: Admin Protected
- **Request Body**:
  ```json
  {
    "businessName": "Auralink Audio Works",
    "ownerName": "Rohan Mehra",
    "phone": "+91 98200 12345",
    "alternatePhone": "+91 98200 54321",
    "website": "https://auralinkaudio.com",
    "address": "Unit 402, Lotus Grandeur",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400053"
  }
  ```

---

### 3.3 Update Commission Rate
- **Route**: `PATCH /api/vendors/:id/commission`
- **Auth**: Admin Protected
- **Request Body**:
  ```json
  {
    "commissionRate": 8.5
  }
  ```

---

### 3.4 Soft Delete / Archive Vendor
- **Route**: `DELETE /api/vendors/:id`
- **Auth**: Admin Protected
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Vendor archived successfully"
  }
  ```

---

## 4. Vendor Products Catalog (`/vendors/products`)

### 4.1 Get Vendor Products
- **Route**: `GET /api/vendors/:id/products` (or `GET /api/vendor-products`)
- **Query Parameters**: `page`, `limit`, `search`, `category`, `status` (`Active` | `Inactive` | `Draft`)
- **Response (200 OK)**: Array of products with variants, stock quantities, selling prices, and purchase prices.

---

### 4.2 Create Product for Vendor
- **Route**: `POST /api/vendors/:id/products`
- **Request Body**:
  ```json
  {
    "name": "Aura X1 Noise Cancelling Headphones",
    "category": "Consumer Electronics",
    "subCategory": "Audio",
    "sellingPrice": 4999,
    "purchasePrice": 3200,
    "variants": [
      {
        "sku": "AUR-X1-BLK",
        "barcode": "8901234567890",
        "name": "Matte Black",
        "unitCode": "PCS",
        "price": 4999,
        "purchasePrice": 3200,
        "availableStock": 150,
        "minStock": 20,
        "reorderLevel": 35
      }
    ]
  }
  ```

---

## 5. Vendor Orders & Fulfillment (`/vendors/orders`)

### 5.1 Get Vendor Orders
- **Route**: `GET /api/vendors/:id/orders` (or `GET /api/vendor-orders`)
- **Query Parameters**: `status` (`New` | `Confirmed` | `Processing` | `Ready to Ship` | `Shipped` | `Delivered` | `Cancelled`), `dateRange`, `page`, `limit`
- **Response (200 OK)**: Order numbers, customer details, item quantities, gross amount, commission deduction, vendor earnings, and shipping status.

---

### 5.2 Update Vendor Order Status
- **Route**: `PATCH /api/vendor-orders/:orderId/status`
- **Request Body**:
  ```json
  {
    "status": "Shipped",
    "carrier": "BlueDart",
    "trackingNumber": "BD-88219412"
  }
  ```
- **Business Logic Trigger**:
  - `Shipped`: Releases reserved inventory and records negative stock movement.
  - `Cancelled`: Restores reserved stock back to available inventory.

---

## 6. Vendor Returns & Quality Inspection (`/vendors/returns`)

### 6.1 Get Vendor Returns
- **Route**: `GET /api/vendors/:id/returns` (or `GET /api/vendor-returns`)
- **Query Parameters**: `status` (`Requested` | `Approved` | `Inspecting` | `Approved for Refund` | `Closed`), `page`, `limit`

---

### 6.2 Inspect Return & Set Disposition
- **Route**: `PATCH /api/vendor-returns/:returnId/inspect`
- **Request Body**:
  ```json
  {
    "inspectionResult": "Good", // "Good" | "Damaged" | "Expired"
    "dispositionAction": "Restock", // "Restock" | "Scrap" | "Return to Vendor"
    "notes": "Packaging open but unit pristine and tested operational."
  }
  ```
- **Business Logic Trigger**:
  - `Good` + `Restock`: Automatically adds items back to sellable warehouse stock.
  - `Damaged` / `Scrap`: Routes items to damaged/scrap inventory.

---

## 7. Financials, Settlements & Payouts

### 7.1 Get Vendor Wallet Summary
- **Route**: `GET /api/vendors/:id/wallet`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalEarnings": 348200,
      "totalCommission": 27856,
      "totalRefunds": 8400,
      "totalWithdrawals": 260000,
      "availableBalance": 51944,
      "pendingBalance": 35000
    }
  }
  ```

---

### 7.2 List Vendor Settlements
- **Route**: `GET /api/vendors/:id/settlements` (or `GET /api/vendor-settlements`)
- **Query Parameters**: `paymentStatus` (`Pending` | `Approved` | `Processing` | `Paid` | `On Hold`), `page`, `limit`

---

### 7.3 Generate Settlement Statement
- **Route**: `POST /api/vendor-settlements/generate`
- **Request Body**:
  ```json
  {
    "vendorId": "VEN-1001",
    "period": "01 Sep 2026 - 15 Sep 2026"
  }
  ```
- **Calculation Formula**:
  - `grossSales` = Sum of all delivered orders in period
  - `commission` = `grossSales` * `vendor.commissionRate` / 100
  - `refunds` = Sum of customer returns
  - `taxes` = 18% GST on Bloom commission
  - `netPayable` = `grossSales` - `commission` - `refunds`

---

### 7.4 Approve Settlement
- **Route**: `PATCH /api/vendor-settlements/:settlementId/approve`
- **Response (200 OK)**: Marks settlement `Approved` and creates a pending disbursement entry.

---

### 7.5 Process Payout / Disbursement
- **Route**: `POST /api/vendor-payments/:paymentId/process`
- **Request Body**:
  ```json
  {
    "referenceId": "UTR-HDFC-99281746",
    "method": "NEFT", // "NEFT" | "RTGS" | "IMPS" | "UPI"
    "notes": "Disbursed from Central Corporate Account"
  }
  ```
- **Response (200 OK)**: Marks payment as `Completed` and marks linked settlement as `Paid`.

---

### 7.6 Vendor Transaction Ledger
- **Route**: `GET /api/vendors/:id/transactions`
- **Query Parameters**: `type` (`Order Sale` | `Commission` | `Vendor Settlement` | `Refund` | `Payment`), `status`, `page`, `limit`

---

## 8. Dashboard Analytics & Audit Trail

### 8.1 Vendor Dashboard Overview Stats
- **Route**: `GET /api/vendors/dashboard-stats`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalVendors": 24,
      "activeVendors": 19,
      "pendingReview": 5,
      "totalGMV": 1420500,
      "totalCommission": 113640,
      "pendingPayouts": 6
    }
  }
  ```

---

### 8.2 Activity & Audit Logs
- **Route**: `GET /api/vendors/activity-logs`
- **Query Parameters**: `vendorId`, `entity` (`Vendor` | `Document` | `Settlement` | `Order` | `Inventory`), `limit`
- **Response (200 OK)**: Chronological list of admin actions, previous values, new values, user, and timestamps.
