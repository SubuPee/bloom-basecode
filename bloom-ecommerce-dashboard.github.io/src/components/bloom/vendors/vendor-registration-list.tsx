import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileQuestion,
  PauseCircle,
  PlayCircle,
  Trash2,
  Download,
  Building2,
  Clock,
  ChevronDown,
  FileText,
  ShieldCheck,
  UserCheck,
  X,
  Plus,
  UploadCloud,
  Check,
  ExternalLink,
} from "lucide-react";
import { VendorShell } from "./vendor-shell";
import { PageHeader, Pagination, SearchBox, StatusBadge } from "../ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useVendorStore,
  vendorStore,
  type Vendor,
  type VendorStatus,
  type KycStatus,
  type VendorDocument,
} from "@/lib/bloom-vendor-store";
import { VendorOnboardingDialog } from "./vendor-onboarding-dialog";
import { VendorUploadDocDialog } from "./vendor-upload-doc-dialog";
import { DocumentPreviewDialog } from "./document-preview-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function VendorRegistrationList({ filterApprovedOnly = false }: { filterApprovedOnly?: boolean }) {
  useEffect(() => {
    vendorStore.syncFromBackend();
  }, []);

  const vendors = useVendorStore((s) => s.getVendors());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(filterApprovedOnly ? "Approved" : "All");
  const [kycFilter, setKycFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [stateFilter, setStateFilter] = useState<string>("All");

  // Modal dialog states
  const [activeVendor, setActiveVendor] = useState<Vendor | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [docReqModalOpen, setDocReqModalOpen] = useState(false);
  const [docReqNotes, setDocReqNotes] = useState("");

  // Document management modals
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState<VendorDocument["type"]>("GST Certificate");
  const [viewDocsModalOpen, setViewDocsModalOpen] = useState(false);
  const [previewDocOpen, setPreviewDocOpen] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | undefined>(undefined);
  const [previewDocTitle, setPreviewDocTitle] = useState("");
  const [previewDocNumber, setPreviewDocNumber] = useState<string | undefined>(undefined);

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      if (filterApprovedOnly && v.status !== "Approved") return false;

      const matchesSearch =
        v.businessName.toLowerCase().includes(search.toLowerCase()) ||
        v.ownerName.toLowerCase().includes(search.toLowerCase()) ||
        v.id.toLowerCase().includes(search.toLowerCase()) ||
        v.taxInfo.gstNumber.toLowerCase().includes(search.toLowerCase()) ||
        v.taxInfo.panNumber.toLowerCase().includes(search.toLowerCase()) ||
        v.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "All" || v.status === statusFilter;
      const matchesKyc = kycFilter === "All" || v.kycStatus === kycFilter;
      const matchesType = typeFilter === "All" || v.businessType === typeFilter;
      const matchesState = stateFilter === "All" || v.state === stateFilter;

      return matchesSearch && matchesStatus && matchesKyc && matchesType && matchesState;
    });
  }, [vendors, search, statusFilter, kycFilter, typeFilter, stateFilter, filterApprovedOnly]);

  const states = Array.from(new Set(vendors.map((v) => v.state)));

  function handleApprove(vendor: Vendor) {
    vendorStore.updateVendorStatus(vendor.id, "Approved");
    toast.success(`${vendor.businessName} approved as authorized vendor.`);
  }

  function handleRejectSubmit() {
    if (!activeVendor) return;
    vendorStore.updateVendorStatus(activeVendor.id, "Rejected", "Alex Morgan", rejectReason || "Documents non-compliant");
    toast.error(`${activeVendor.businessName} registration rejected.`);
    setRejectModalOpen(false);
    setRejectReason("");
  }

  function handleSuspendSubmit() {
    if (!activeVendor) return;
    vendorStore.updateVendorStatus(activeVendor.id, "Suspended", "Alex Morgan", suspendReason || "Under audit investigation");
    toast.warning(`${activeVendor.businessName} has been suspended.`);
    setSuspendModalOpen(false);
    setSuspendReason("");
  }

  function handleActivate(vendor: Vendor) {
    vendorStore.updateVendorStatus(vendor.id, "Approved");
    toast.success(`${vendor.businessName} reactivated.`);
  }

  function handleRequestDocs() {
    if (!activeVendor) return;
    vendorStore.logAction(
      "Alex Morgan",
      `Requested additional compliance documents: ${docReqNotes}`,
      "Vendor",
      activeVendor.id,
      activeVendor.documentsStatus,
      "Action Required",
    );
    toast.info(`Document request dispatched to ${activeVendor.email}`);
    setDocReqModalOpen(false);
    setDocReqNotes("");
  }

  function handleSoftDelete(vendor: Vendor) {
    if (confirm(`Are you sure you want to archive ${vendor.businessName}? Existing transaction history will be preserved.`)) {
      vendorStore.softDeleteVendor(vendor.id);
      toast.success(`${vendor.businessName} archived.`);
    }
  }

  function handleOpenDocPreview(doc: VendorDocument, vendor: Vendor) {
    setPreviewDocUrl(doc.fileUrl);
    setPreviewDocTitle(`${vendor.businessName} — ${doc.type}`);
    setPreviewDocNumber(doc.documentNumber);
    setPreviewDocOpen(true);
  }

  return (
    <VendorShell>
      <div className="space-y-7">
        <PageHeader
          title={filterApprovedOnly ? "All Registered Vendors" : "Vendor Registration & Compliance"}
          description={
            filterApprovedOnly
              ? "Directory of active, verified vendors operating on the Bloom marketplace platform."
              : "Review incoming vendor onboarding applications, verify PAN/GST credentials, and govern KYC status."
          }
          action={
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/reports">
                  <Download className="size-4" />
                  Export Directory
                </Link>
              </Button>
              <Button
                onClick={() => setOnboardingModalOpen(true)}
                className="rounded-full shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-4 mr-1.5" />
                Register Vendor
              </Button>
            </div>
          }
        />

        {/* Filters Bar */}
        <div className="bloom-card p-5 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <SearchBox
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Business Name, Owner, Vendor ID, GST or PAN…"
            />

            <select
              aria-label="Filter by Vendor Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm font-medium"
            >
              <option value="All">Status: All</option>
              <option value="Pending">Status: Pending</option>
              <option value="Under Review">Status: Under Review</option>
              <option value="Approved">Status: Approved</option>
              <option value="Rejected">Status: Rejected</option>
              <option value="Suspended">Status: Suspended</option>
              <option value="Inactive">Status: Inactive</option>
            </select>

            <select
              aria-label="Filter by KYC Status"
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm font-medium"
            >
              <option value="All">KYC: All</option>
              <option value="Pending">KYC: Pending</option>
              <option value="In Review">KYC: In Review</option>
              <option value="Verified">KYC: Verified</option>
              <option value="Rejected">KYC: Rejected</option>
            </select>

            <select
              aria-label="Filter by Business Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm font-medium"
            >
              <option value="All">Type: All</option>
              <option value="Manufacturer">Manufacturer</option>
              <option value="Wholesaler">Wholesaler</option>
              <option value="D2C Brand">D2C Brand</option>
              <option value="Distributor">Distributor</option>
            </select>

            <select
              aria-label="Filter by State"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm font-medium"
            >
              <option value="All">State: All</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {(search || statusFilter !== "All" || kycFilter !== "All" || typeFilter !== "All" || stateFilter !== "All") && (
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setKycFilter("All");
                  setTypeFilter("All");
                  setStateFilter("All");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Vendors Table */}
        <div className="bloom-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Vendor ID</th>
                  <th className="px-5 py-4">Business & Owner</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Tax / Compliance</th>
                  <th className="px-5 py-4">Docs (GST/PAN/Addr)</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                      No vendors match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((vendor) => {
                    const gstDoc = vendor.documents.find((d) => d.type === "GST Certificate");
                    const panDoc = vendor.documents.find((d) => d.type === "PAN Card");
                    const addrDoc = vendor.documents.find((d) => d.type === "Address Proof");

                    return (
                      <tr key={vendor.id} className="hover:bg-accent/40 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs font-semibold text-primary">
                          {vendor.id}
                          <div className="text-[11px] font-normal text-muted-foreground mt-0.5">
                            {vendor.registrationDate}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <Link
                            to="/vendors/$vendorId"
                            params={{ vendorId: vendor.id }}
                            className="font-semibold hover:text-primary transition-colors block text-sm"
                          >
                            {vendor.businessName}
                          </Link>
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span className="rounded bg-muted px-1.5 py-0.2 text-[11px]">
                              {vendor.businessType}
                            </span>
                            · {vendor.ownerName}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-xs">
                          <div className="font-medium">{vendor.email}</div>
                          <div className="text-muted-foreground">{vendor.phone}</div>
                        </td>

                        <td className="px-5 py-4 text-xs">
                          <div className="font-medium">{vendor.city}</div>
                          <div className="text-muted-foreground">{vendor.state}</div>
                        </td>

                        <td className="px-5 py-4 text-xs font-mono">
                          <div>
                            GST: <span className="font-semibold">{vendor.taxInfo.gstNumber}</span>
                          </div>
                          <div className="text-muted-foreground">PAN: {vendor.taxInfo.panNumber}</div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 text-xs font-medium",
                                vendor.kycStatus === "Verified"
                                  ? "text-success"
                                  : vendor.kycStatus === "In Review"
                                    ? "text-orange"
                                    : "text-destructive",
                              )}
                            >
                              <ShieldCheck className="size-3.5" />
                              KYC: {vendor.kycStatus}
                            </span>

                            {/* Document Proof Badges */}
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {/* GST Badge */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (gstDoc) {
                                    handleOpenDocPreview(gstDoc, vendor);
                                  } else {
                                    setActiveVendor(vendor);
                                    setUploadDocType("GST Certificate");
                                    setUploadDocModalOpen(true);
                                  }
                                }}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer",
                                  gstDoc
                                    ? "bg-success/15 text-success hover:bg-success/25"
                                    : "bg-muted/80 text-muted-foreground border border-dashed border-border hover:border-primary/50 hover:text-primary",
                                )}
                                title={gstDoc ? "GST Uploaded (Click to preview)" : "Missing GST (Click to upload)"}
                              >
                                {gstDoc ? <Check className="size-2.5" /> : "+"} GST
                              </button>

                              {/* PAN Badge */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (panDoc) {
                                    handleOpenDocPreview(panDoc, vendor);
                                  } else {
                                    setActiveVendor(vendor);
                                    setUploadDocType("PAN Card");
                                    setUploadDocModalOpen(true);
                                  }
                                }}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer",
                                  panDoc
                                    ? "bg-success/15 text-success hover:bg-success/25"
                                    : "bg-muted/80 text-muted-foreground border border-dashed border-border hover:border-primary/50 hover:text-primary",
                                )}
                                title={panDoc ? "PAN Uploaded (Click to preview)" : "Missing PAN (Click to upload)"}
                              >
                                {panDoc ? <Check className="size-2.5" /> : "+"} PAN
                              </button>

                              {/* Address Proof Badge */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (addrDoc) {
                                    handleOpenDocPreview(addrDoc, vendor);
                                  } else {
                                    setActiveVendor(vendor);
                                    setUploadDocType("Address Proof");
                                    setUploadDocModalOpen(true);
                                  }
                                }}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer",
                                  addrDoc
                                    ? "bg-success/15 text-success hover:bg-success/25"
                                    : "bg-muted/80 text-muted-foreground border border-dashed border-border hover:border-primary/50 hover:text-primary",
                                )}
                                title={addrDoc ? "Address Proof Uploaded (Click to preview)" : "Missing Address Proof (Click to upload)"}
                              >
                                {addrDoc ? <Check className="size-2.5" /> : "+"} Addr
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={vendor.status} />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button asChild variant="ghost" size="sm" className="rounded-full">
                              <Link to="/vendors/$vendorId" params={{ vendorId: vendor.id }}>
                                <Eye className="size-4" />
                              </Link>
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="rounded-full px-2.5">
                                  Actions
                                  <ChevronDown className="size-3.5 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52 rounded-2xl">
                                <DropdownMenuLabel>Vendor Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link to="/vendors/$vendorId" params={{ vendorId: vendor.id }}>
                                    <Eye className="size-4 mr-2" />
                                    View Full Profile
                                  </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => {
                                    setActiveVendor(vendor);
                                    setUploadDocType("GST Certificate");
                                    setUploadDocModalOpen(true);
                                  }}
                                >
                                  <UploadCloud className="size-4 mr-2 text-primary" />
                                  Upload Documents
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => {
                                    setActiveVendor(vendor);
                                    setViewDocsModalOpen(true);
                                  }}
                                >
                                  <FileText className="size-4 mr-2 text-blue" />
                                  Documents Vault ({vendor.documents.length})
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {vendor.status !== "Approved" && (
                                  <DropdownMenuItem onClick={() => handleApprove(vendor)}>
                                    <CheckCircle2 className="size-4 mr-2 text-success" />
                                    Approve Vendor
                                  </DropdownMenuItem>
                                )}

                                {vendor.status !== "Rejected" && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setActiveVendor(vendor);
                                      setRejectModalOpen(true);
                                    }}
                                  >
                                    <XCircle className="size-4 mr-2 text-destructive" />
                                    Reject Registration
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem
                                  onClick={() => {
                                    setActiveVendor(vendor);
                                    setDocReqModalOpen(true);
                                  }}
                                >
                                  <FileQuestion className="size-4 mr-2 text-orange" />
                                  Request Documents
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {vendor.status === "Suspended" ? (
                                  <DropdownMenuItem onClick={() => handleActivate(vendor)}>
                                    <PlayCircle className="size-4 mr-2 text-success" />
                                    Reactivate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setActiveVendor(vendor);
                                      setSuspendModalOpen(true);
                                    }}
                                  >
                                    <PauseCircle className="size-4 mr-2 text-warning" />
                                    Suspend Vendor
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleSoftDelete(vendor)}
                                >
                                  <Trash2 className="size-4 mr-2" />
                                  Archive Vendor
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination count={filtered.length} />
        </div>
      </div>

      {/* Onboarding Dialog */}
      <VendorOnboardingDialog
        open={onboardingModalOpen}
        onOpenChange={setOnboardingModalOpen}
      />

      {/* Upload Document Dialog */}
      <VendorUploadDocDialog
        open={uploadDocModalOpen}
        onOpenChange={setUploadDocModalOpen}
        vendor={activeVendor}
        defaultType={uploadDocType}
      />

      {/* Document Vault List Modal for Active Vendor */}
      <Dialog open={viewDocsModalOpen} onOpenChange={setViewDocsModalOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-6 sm:p-7">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold">
                  Compliance Documents — {activeVendor?.businessName}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  KYC Vault: {activeVendor?.documents.length} verified/pending legal proofs
                </DialogDescription>
              </div>
              <Button
                size="sm"
                className="rounded-full text-xs"
                onClick={() => {
                  setViewDocsModalOpen(false);
                  setUploadDocModalOpen(true);
                }}
              >
                <UploadCloud className="size-3.5 mr-1.5" />
                Upload New Doc
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
            {!activeVendor?.documents || activeVendor.documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="size-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No documents uploaded yet</p>
                <p className="text-xs mt-1">Upload GST, PAN, or Address proof to complete KYC compliance.</p>
              </div>
            ) : (
              activeVendor.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border bg-card/60 p-3.5 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate text-foreground">{doc.type}</p>
                        <StatusBadge status={doc.status} />
                      </div>
                      <p className="text-xs font-mono text-muted-foreground truncate mt-0.5">
                        {doc.documentNumber}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {doc.fileName} · {doc.fileSize} · Uploaded: {doc.uploadedDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs"
                      onClick={() => {
                        if (activeVendor) {
                          handleOpenDocPreview(doc, activeVendor);
                        }
                      }}
                    >
                      <Eye className="size-3.5 mr-1" />
                      Preview
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (activeVendor && confirm(`Remove ${doc.type} (${doc.fileName})?`)) {
                          vendorStore.deleteDocumentFromVendor(activeVendor.id, doc.id);
                          toast.success(`${doc.type} removed.`);
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Global Document Preview Dialog */}
      <DocumentPreviewDialog
        open={previewDocOpen}
        onOpenChange={setPreviewDocOpen}
        title={previewDocTitle}
        fileUrl={previewDocUrl}
        documentNumber={previewDocNumber}
      />

      {/* Reject Reason Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Vendor Registration</DialogTitle>
            <DialogDescription>
              Provide an official compliance reason for rejecting {activeVendor?.businessName}. This will be communicated to the vendor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Rejection Reason</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. GST certificate mismatch or invalid bank proof..."
              rows={3}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectSubmit}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Vendor Modal */}
      <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>Suspend Vendor Account</DialogTitle>
            <DialogDescription>
              Suspending {activeVendor?.businessName} will temporarily hold pending payouts and pause their catalog from active listing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Suspension Justification</Label>
            <Textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g. Audit inquiry, SLA violations, or counterfeit dispute..."
              rows={3}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setSuspendModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspendSubmit}>
              Suspend Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Additional Documents Modal */}
      <Dialog open={docReqModalOpen} onOpenChange={setDocReqModalOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>Request Compliance Documents</DialogTitle>
            <DialogDescription>
              Notify {activeVendor?.businessName} ({activeVendor?.email}) to upload revised or missing verification proofs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Required Documents & Instructions</Label>
            <Textarea
              value={docReqNotes}
              onChange={(e) => setDocReqNotes(e.target.value)}
              placeholder="e.g. Please upload your latest 3-month bank statement with clear bank stamp..."
              rows={3}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDocReqModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestDocs}>
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </VendorShell>
  );
}
