import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  FileText,
  CreditCard,
  Home,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import {
  DocumentUploadCard,
  type UploadedDocState,
} from "./document-upload-card";
import { DocumentPreviewDialog } from "./document-preview-dialog";
import {
  vendorStore,
  type Vendor,
  type VendorDocument,
} from "@/lib/bloom-vendor-store";
import { toast } from "sonner";

interface VendorOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVendorRegistered?: (vendor: Vendor) => void;
}

const initialDocState: UploadedDocState = {
  file: null,
  fileName: "",
  fileSize: "",
  fileUrl: undefined,
  documentNumber: "",
};

export function VendorOnboardingDialog({
  open,
  onOpenChange,
  onVendorRegistered,
}: VendorOnboardingDialogProps) {
  // Business details
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [businessType, setBusinessType] = useState<Vendor["businessType"]>("Wholesaler");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [pincode, setPincode] = useState("");

  // Tax & Bank details
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");

  // Document upload states
  const [gstDoc, setGstDoc] = useState<UploadedDocState>(initialDocState);
  const [panDoc, setPanDoc] = useState<UploadedDocState>(initialDocState);
  const [addressProofDoc, setAddressProofDoc] = useState<UploadedDocState>(initialDocState);
  const [addressProofType, setAddressProofType] = useState("Electricity Bill");
  const [bankProofDoc, setBankProofDoc] = useState<UploadedDocState>(initialDocState);

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [previewTitle, setPreviewTitle] = useState("");

interface FormErrors {
  businessName?: string | undefined;
  ownerName?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  gstNumber?: string | undefined;
  panNumber?: string | undefined;
  city?: string | undefined;
  pincode?: string | undefined;
  gstDoc?: string | undefined;
  panDoc?: string | undefined;
  addressProofDoc?: string | undefined;
}

  // Validation errors
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync GST and PAN document numbers with form tax inputs
  function handleGstNumberChange(val: string) {
    const uppercaseVal = val.toUpperCase().trim();
    setGstNumber(uppercaseVal);
    setGstDoc((prev) => ({ ...prev, documentNumber: uppercaseVal }));
  }

  function handlePanNumberChange(val: string) {
    const uppercaseVal = val.toUpperCase().trim();
    setPanNumber(uppercaseVal);
    setPanDoc((prev) => ({ ...prev, documentNumber: uppercaseVal }));
  }

  function openPreview(url: string, title: string) {
    setPreviewUrl(url);
    setPreviewTitle(title);
    setPreviewOpen(true);
  }

  function resetForm() {
    setBusinessName("");
    setOwnerName("");
    setBusinessType("Wholesaler");
    setEmail("");
    setPhone("");
    setAddress("");
    setCity("");
    setState("Maharashtra");
    setPincode("");
    setGstNumber("");
    setPanNumber("");
    setBankName("");
    setAccountNumber("");
    setIfsc("");
    setGstDoc(initialDocState);
    setPanDoc(initialDocState);
    setAddressProofDoc(initialDocState);
    setBankProofDoc(initialDocState);
    setErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!businessName.trim()) newErrors.businessName = "Business Name is required";
    if (!ownerName.trim()) newErrors.ownerName = "Owner Name is required";
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Valid email is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!gstNumber.trim()) newErrors.gstNumber = "GSTIN is required";
    if (!panNumber.trim()) newErrors.panNumber = "PAN is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!pincode.trim()) newErrors.pincode = "Pincode is required";

    // Validate documents
    if (!gstDoc.fileName) newErrors.gstDoc = "GST Certificate document upload is required";
    if (!panDoc.fileName) newErrors.panDoc = "PAN Card document upload is required";
    if (!addressProofDoc.fileName) newErrors.addressProofDoc = "Address Proof document upload is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill in all required fields and upload compliance documents.");
      return;
    }

    setIsSubmitting(true);

    const documents: VendorDocument[] = [];

    // GST Document
    if (gstDoc.fileName) {
      documents.push({
        id: `DOC-GST-${Date.now()}`,
        type: "GST Certificate",
        documentNumber: gstDoc.documentNumber || gstNumber,
        fileName: gstDoc.fileName,
        fileSize: gstDoc.fileSize,
        fileUrl: gstDoc.fileUrl,
        uploadedDate: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: "Pending",
      });
    }

    // PAN Document
    if (panDoc.fileName) {
      documents.push({
        id: `DOC-PAN-${Date.now()}`,
        type: "PAN Card",
        documentNumber: panDoc.documentNumber || panNumber,
        fileName: panDoc.fileName,
        fileSize: panDoc.fileSize,
        fileUrl: panDoc.fileUrl,
        uploadedDate: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: "Pending",
      });
    }

    // Address Proof Document
    if (addressProofDoc.fileName) {
      documents.push({
        id: `DOC-ADDR-${Date.now()}`,
        type: "Address Proof",
        documentNumber: addressProofDoc.documentNumber || `ADDR-${pincode}`,
        fileName: addressProofDoc.fileName,
        fileSize: addressProofDoc.fileSize,
        fileUrl: addressProofDoc.fileUrl,
        notes: `Type: ${addressProofType}`,
        uploadedDate: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: "Pending",
      });
    }

    // Bank Proof Document
    if (bankProofDoc.fileName) {
      documents.push({
        id: `DOC-BANK-${Date.now()}`,
        type: "Bank Proof",
        documentNumber: bankProofDoc.documentNumber || (accountNumber ? `••••${accountNumber.slice(-4)}` : "BANK-PROOF"),
        fileName: bankProofDoc.fileName,
        fileSize: bankProofDoc.fileSize,
        fileUrl: bankProofDoc.fileUrl,
        uploadedDate: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: "Pending",
      });
    }

    const maskedAccount = accountNumber
      ? `•••• •••• ${accountNumber.slice(-4)}`
      : "•••• •••• 1234";

    const newVendor = vendorStore.addVendor({
      businessName,
      ownerName,
      businessType,
      email,
      phone,
      website: `https://${businessName.toLowerCase().replace(/[^a-z0-9]/g, "")}.in`,
      address: address || "Industrial Area",
      city,
      state,
      country: "India",
      pincode,
      taxInfo: {
        gstNumber,
        panNumber,
        taxType: "Standard GST",
      },
      bankInfo: {
        accountHolder: ownerName,
        accountNumberMasked: maskedAccount,
        bankName: bankName || "HDFC Bank",
        ifsc: ifsc || "HDFC0001234",
        branch: city || "Main Branch",
      },
      commissionRate: 10,
      documentsStatus: "Under Review",
      kycStatus: "In Review",
      status: "Under Review",
      documents,
    });

    toast.success(`${businessName} registered successfully with compliance documents!`);
    setIsSubmitting(false);
    resetForm();
    onOpenChange(false);
    if (onVendorRegistered) {
      onVendorRegistered(newVendor);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                <Building2 className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Register New Vendor</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Onboard a new seller with business identity, tax credentials, and mandatory compliance documents.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 pt-3">
            {/* Section 1: Business Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <FileCheck2 className="size-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  1. Business Identity & Contact
                </h3>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Business / Trade Name *</Label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Acme Textiles Pvt Ltd"
                    className="h-10 text-sm"
                  />
                  {errors.businessName && <p className="text-[11px] text-destructive">{errors.businessName}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Authorized Owner Name *</Label>
                  <Input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="h-10 text-sm"
                  />
                  {errors.ownerName && <p className="text-[11px] text-destructive">{errors.ownerName}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Business Type</Label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as Vendor["businessType"])}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
                  >
                    <option value="Manufacturer">Manufacturer</option>
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="D2C Brand">D2C Brand</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Official Email *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="compliance@acme.com"
                    className="h-10 text-sm"
                  />
                  {errors.email && <p className="text-[11px] text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Phone Number *</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-10 text-sm"
                  />
                  {errors.phone && <p className="text-[11px] text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Address Line</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Plot 42, MIDC Phase 2"
                    className="h-10 text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">City *</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mumbai"
                      className="h-10 text-sm"
                    />
                    {errors.city && <p className="text-[11px] text-destructive">{errors.city}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">State *</Label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Maharashtra"
                      className="h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Pincode *</Label>
                    <Input
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="400001"
                      className="h-10 text-sm"
                    />
                    {errors.pincode && <p className="text-[11px] text-destructive">{errors.pincode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Tax & Banking Credentials */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <CreditCard className="size-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  2. Tax & Bank Credentials
                </h3>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">GSTIN (15 Digits) *</Label>
                  <Input
                    value={gstNumber}
                    onChange={(e) => handleGstNumberChange(e.target.value)}
                    placeholder="27AAACA1234A1Z5"
                    className="h-10 text-sm font-mono uppercase"
                  />
                  {errors.gstNumber && <p className="text-[11px] text-destructive">{errors.gstNumber}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Company PAN (10 Digits) *</Label>
                  <Input
                    value={panNumber}
                    onChange={(e) => handlePanNumberChange(e.target.value)}
                    placeholder="AAACA1234A"
                    className="h-10 text-sm font-mono uppercase"
                  />
                  {errors.panNumber && <p className="text-[11px] text-destructive">{errors.panNumber}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Bank Name</Label>
                  <Input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="HDFC Bank"
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Bank Account Number</Label>
                  <Input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="50100234567890"
                    className="h-10 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium">Bank IFSC Code</Label>
                  <Input
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    placeholder="HDFC0001234"
                    className="h-10 text-sm font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Document Uploads */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                    3. Compliance Documents Upload
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">PDF, PNG, JPG (Max 10 MB each)</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* 1. GST Certificate */}
                <div className="space-y-1.5">
                  <DocumentUploadCard
                    title="GST Certificate"
                    description="Upload government-issued GSTIN registration certificate"
                    docNumberLabel="GSTIN Number"
                    docNumberPlaceholder="27AAACA1234A1Z5"
                    required
                    state={gstDoc}
                    onChange={setGstDoc}
                    onPreview={openPreview}
                  />
                  {errors.gstDoc && <p className="text-xs text-destructive">{errors.gstDoc}</p>}
                </div>

                {/* 2. PAN Card */}
                <div className="space-y-1.5">
                  <DocumentUploadCard
                    title="PAN Card"
                    description="Upload company or proprietor PAN card proof"
                    docNumberLabel="PAN Number"
                    docNumberPlaceholder="AAACA1234A"
                    required
                    state={panDoc}
                    onChange={setPanDoc}
                    onPreview={openPreview}
                  />
                  {errors.panDoc && <p className="text-xs text-destructive">{errors.panDoc}</p>}
                </div>

                {/* 3. Address Proof */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Address Proof Type</Label>
                    <select
                      value={addressProofType}
                      onChange={(e) => setAddressProofType(e.target.value)}
                      className="h-8 rounded-lg border bg-background px-2.5 text-xs"
                    >
                      <option value="Electricity Bill">Electricity Bill</option>
                      <option value="Rent Agreement">Rent Agreement</option>
                      <option value="Trade License">Trade License</option>
                      <option value="Shop & Establishment">Shop & Establishment</option>
                      <option value="Telephone Bill">Telephone Bill</option>
                    </select>
                  </div>
                  <DocumentUploadCard
                    title="Address Proof"
                    description={`Upload latest official ${addressProofType}`}
                    docNumberLabel="Document / Bill Ref #"
                    docNumberPlaceholder="e.g. ELEC-98213"
                    required
                    state={addressProofDoc}
                    onChange={setAddressProofDoc}
                    onPreview={openPreview}
                  />
                  {errors.addressProofDoc && (
                    <p className="text-xs text-destructive">{errors.addressProofDoc}</p>
                  )}
                </div>

                {/* 4. Bank Proof */}
                <div className="space-y-1.5">
                  <DocumentUploadCard
                    title="Bank Proof / Cancelled Cheque"
                    description="Upload cancelled cheque or latest bank statement"
                    docNumberLabel="Account / Cheque Ref"
                    docNumberPlaceholder="e.g. CHQ-100234"
                    required={false}
                    state={bankProofDoc}
                    onChange={setBankProofDoc}
                    onPreview={openPreview}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full px-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting Registration..." : "Complete Registration"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reusable File Preview Dialog */}
      <DocumentPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={previewTitle}
        fileUrl={previewUrl}
      />
    </>
  );
}
