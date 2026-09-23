import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  Building2,
  Package,
  ShoppingCart,
  Receipt,
  Banknote,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Factory,
  History,
  Lock,
  Eye,
  Download,
  Check,
  X,
  CreditCard,
  Building,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Edit,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  UploadCloud,
  Trash2,
} from "lucide-react";
import { DetailShell, InfoBlock } from "../detail-shell";
import { StatusBadge, Field } from "../ui";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useVendorStore,
  vendorStore,
  type Vendor,
  type VendorDocument,
  type DocumentStatus,
} from "@/lib/bloom-vendor-store";
import { VendorUploadDocDialog } from "./vendor-upload-doc-dialog";
import { DocumentPreviewDialog } from "./document-preview-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function VendorDetailsPage() {
  const params = useParams({ strict: false }) as { vendorId?: string };
  const vendorId = params.vendorId || "VEN-1001";

  useEffect(() => {
    vendorStore.syncFromBackend();
  }, []);

  const vendor = useVendorStore((s) => s.getVendor(vendorId)) || useVendorStore((s) => s.getVendors()[0]);
  const allProducts = useVendorStore((s) => s.getProductsByVendor(vendor?.id || ""));
  const allOrders = useVendorStore((s) => s.getVendorOrders().filter((o) => o.vendorId === vendor?.id));
  const allTransactions = useVendorStore((s) => s.getVendorTransactions(vendor?.id || ""));
  const allSettlements = useVendorStore((s) => s.getSettlements().filter((s) => s.vendorId === vendor?.id));
  const allPayments = useVendorStore((s) => s.getPayments().filter((p) => p.vendorId === vendor?.id));
  const allReturns = useVendorStore((s) => s.getReturns().filter((r) => r.vendorId === vendor?.id));
  const allProductions = useVendorStore((s) => s.getProductions().filter((p) => p.vendorId === vendor?.id));
  const allActivity = useVendorStore((s) =>
    s.getActivityLogs().filter((a) => a.entityId === vendor?.id || a.entity === "Vendor"),
  );
  const wallet = useVendorStore((s) => (vendor ? s.getVendorWallet(vendor.id) : null));

  // Modal States
  const [verifyDocModal, setVerifyDocModal] = useState<VendorDocument | null>(null);
  const [docNotes, setDocNotes] = useState("");
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);
  const [previewDocOpen, setPreviewDocOpen] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | undefined>(undefined);
  const [previewDocTitle, setPreviewDocTitle] = useState("");
  const [previewDocNumber, setPreviewDocNumber] = useState<string | undefined>(undefined);

  if (!vendor) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Vendor Not Found</h2>
        <Button asChild className="mt-4 rounded-full">
          <Link to="/vendors/list">Back to Vendors</Link>
        </Button>
      </div>
    );
  }

  // Calculate metrics
  let totalVariants = 0;
  let totalStockUnits = 0;
  let lowStockUnits = 0;
  let outOfStockUnits = 0;

  for (const p of allProducts) {
    for (const v of p.variants) {
      totalVariants++;
      totalStockUnits += v.availableStock;
      if (v.availableStock <= v.minStock && v.availableStock > 0) lowStockUnits++;
      if (v.availableStock === 0) outOfStockUnits++;
    }
  }

  const completedOrders = allOrders.filter((o) => o.orderStatus === "Delivered").length;
  const pendingOrders = allOrders.filter((o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled" && o.orderStatus !== "Returned").length;
  const cancelledOrders = allOrders.filter((o) => o.orderStatus === "Cancelled").length;
  const grossSales = allOrders.reduce((acc, curr) => acc + curr.vendorGross, 0);

  function handleVerifyDocument(status: DocumentStatus) {
    if (!verifyDocModal || !vendor) return;
    vendorStore.verifyDocument(vendor.id, verifyDocModal.id, status, "Alex Morgan", docNotes);
    toast.success(`Document ${verifyDocModal.type} updated to ${status}`);
    setVerifyDocModal(null);
    setDocNotes("");
  }

  return (
    <DetailShell
      backTo="/vendors/list"
      backLabel="vendors directory"
      title={vendor.businessName}
      subtitle={`${vendor.id} · Registered ${vendor.registrationDate} · ${vendor.city}, ${vendor.state}`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {vendor.status !== "Approved" && (
            <Button
              className="rounded-full bg-success text-success-foreground hover:bg-success/90"
              onClick={() => {
                vendorStore.updateVendorStatus(vendor.id, "Approved");
                toast.success(`${vendor.businessName} approved.`);
              }}
            >
              <CheckCircle2 className="size-4" />
              Approve Vendor
            </Button>
          )}

          {vendor.status === "Approved" && (
            <Button
              variant="outline"
              className="rounded-full text-warning border-warning/40 hover:bg-warning/10"
              onClick={() => {
                vendorStore.updateVendorStatus(vendor.id, "Suspended");
                toast.warning(`${vendor.businessName} suspended.`);
              }}
            >
              <PauseCircle className="size-4" />
              Suspend
            </Button>
          )}

          {vendor.status === "Suspended" && (
            <Button
              variant="outline"
              className="rounded-full text-success border-success/40 hover:bg-success/10"
              onClick={() => {
                vendorStore.updateVendorStatus(vendor.id, "Approved");
                toast.success(`${vendor.businessName} reactivated.`);
              }}
            >
              <PlayCircle className="size-4" />
              Reactivate
            </Button>
          )}

          <Button asChild variant="outline" className="rounded-full">
            <Link to={`/vendors/settlements`}>
              <Banknote className="size-4" />
              Generate Settlement
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Profile Card */}
        <div className="bloom-card p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-blue-soft text-blue">
                <Building2 className="size-8" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl font-bold">{vendor.businessName}</h2>
                  <StatusBadge status={vendor.status} />
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">
                    {vendor.businessType}
                  </span>
                  <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-semibold text-gold">
                    ★ {vendor.rating.toFixed(1)} Rating
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Owner: <span className="font-medium text-foreground">{vendor.ownerName}</span> · Commission Tier:{" "}
                  <span className="font-semibold text-primary">{vendor.commissionRate}% Take-Rate</span>
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="size-3.5" />
                    {vendor.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="size-3.5" />
                    {vendor.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {vendor.city}, {vendor.state}
                  </span>
                  {vendor.website && (
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="size-3.5" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Wallet Quick Summary */}
            {wallet && (
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-muted/40 p-3.5 sm:gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Available Wallet</p>
                  <p className="text-xl font-bold text-success">
                    ₹{wallet.availableBalance.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="h-8 w-px bg-border/80" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Pending Settlement</p>
                  <p className="text-xl font-bold text-orange">
                    ₹{wallet.pendingBalance.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comprehensive 12-Tab System */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="overflow-x-auto no-scrollbar">
            <TabsList className="h-11 rounded-full bg-card border p-1 inline-flex w-auto gap-1">
              <TabsTrigger value="overview" className="rounded-full px-3.5 text-xs font-medium">Overview</TabsTrigger>
              <TabsTrigger value="products" className="rounded-full px-3.5 text-xs font-medium">Products ({allProducts.length})</TabsTrigger>
              <TabsTrigger value="orders" className="rounded-full px-3.5 text-xs font-medium">Orders ({allOrders.length})</TabsTrigger>
              <TabsTrigger value="inventory" className="rounded-full px-3.5 text-xs font-medium">Inventory ({totalStockUnits})</TabsTrigger>
              <TabsTrigger value="production" className="rounded-full px-3.5 text-xs font-medium">Production ({allProductions.length})</TabsTrigger>
              <TabsTrigger value="transactions" className="rounded-full px-3.5 text-xs font-medium">Transactions ({allTransactions.length})</TabsTrigger>
              <TabsTrigger value="payments" className="rounded-full px-3.5 text-xs font-medium">Payments ({allPayments.length})</TabsTrigger>
              <TabsTrigger value="settlements" className="rounded-full px-3.5 text-xs font-medium">Settlements ({allSettlements.length})</TabsTrigger>
              <TabsTrigger value="returns" className="rounded-full px-3.5 text-xs font-medium">Returns ({allReturns.length})</TabsTrigger>
              <TabsTrigger value="documents" className="rounded-full px-3.5 text-xs font-medium">Documents ({vendor.documents.length})</TabsTrigger>
              <TabsTrigger value="activity" className="rounded-full px-3.5 text-xs font-medium">Activity</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-full px-3.5 text-xs font-medium">Settings & Bank</TabsTrigger>
            </TabsList>
          </div>

          {/* 1. OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="bloom-card p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total Catalog</p>
                <h3 className="mt-2 text-2xl font-bold">{allProducts.length} Products</h3>
                <p className="mt-1 text-xs text-muted-foreground">{totalVariants} active product variants</p>
              </div>

              <div className="bloom-card p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Stock Health</p>
                <h3 className="mt-2 text-2xl font-bold">{totalStockUnits} Units</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="text-orange font-semibold">{lowStockUnits} low</span> ·{" "}
                  <span className="text-destructive font-semibold">{outOfStockUnits} out of stock</span>
                </p>
              </div>

              <div className="bloom-card p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Orders Fulfilled</p>
                <h3 className="mt-2 text-2xl font-bold">{allOrders.length} Orders</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {completedOrders} completed · {pendingOrders} processing · {cancelledOrders} cancelled
                </p>
              </div>

              <div className="bloom-card p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Gross Sales Volume</p>
                <h3 className="mt-2 text-2xl font-bold">₹{grossSales.toLocaleString("en-IN")}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Commission generated: ₹{((grossSales * vendor.commissionRate) / 100).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Business Overview */}
              <div className="bloom-card p-6 space-y-4">
                <h3 className="text-base font-semibold">Business Profile & Verification</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <InfoBlock label="Business Type" value={vendor.businessType} />
                  <InfoBlock label="KYC Status" value={<StatusBadge status={vendor.kycStatus} />} />
                  <InfoBlock label="GST Number" value={<span className="font-mono">{vendor.taxInfo.gstNumber}</span>} />
                  <InfoBlock label="PAN Number" value={<span className="font-mono">{vendor.taxInfo.panNumber}</span>} />
                  <InfoBlock label="Address" value={`${vendor.address}, ${vendor.city}, ${vendor.state} - ${vendor.pincode}`} />
                  <InfoBlock label="Country" value={vendor.country} />
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="bloom-card p-6 space-y-4">
                <h3 className="text-base font-semibold">Financial & Payout Ledger</h3>
                {wallet && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Total Cumulative Earnings</span>
                      <span className="font-bold">₹{wallet.totalEarnings.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Platform Commission Deducted</span>
                      <span className="font-medium text-destructive">-₹{wallet.totalCommission.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Customer Refunds & Deductions</span>
                      <span className="font-medium text-destructive">-₹{wallet.totalRefunds.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Disbursed Withdrawals & Payouts</span>
                      <span className="font-medium text-muted-foreground">₹{wallet.totalSettled.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between py-1 pt-2">
                      <span className="font-semibold">Current Available Balance</span>
                      <span className="font-bold text-success text-base">₹{wallet.availableBalance.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 2. PRODUCTS TAB */}
          <TabsContent value="products" className="space-y-4">
            <div className="bloom-card overflow-hidden">
              <div className="p-5 border-b flex justify-between items-center">
                <div>
                  <h3 className="text-base font-semibold">Assigned Vendor Catalog</h3>
                  <p className="text-xs text-muted-foreground">Products manufactured or supplied by {vendor.businessName}</p>
                </div>
                <Button asChild size="sm" className="rounded-full">
                  <Link to="/inventory/add-stock">Add Stock to Catalog</Link>
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Product</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Variants</th>
                      <th className="px-5 py-3.5">Selling Price</th>
                      <th className="px-5 py-3.5">Purchase Cost</th>
                      <th className="px-5 py-3.5">Available Stock</th>
                      <th className="px-5 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {allProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-accent/40">
                        <td className="px-5 py-4 font-medium">
                          <Link to="/products" className="hover:text-primary">
                            {p.name}
                          </Link>
                          <div className="text-xs text-muted-foreground font-mono">{p.sku}</div>
                        </td>
                        <td className="px-5 py-4 text-xs">{p.category} · {p.subCategory}</td>
                        <td className="px-5 py-4 text-xs font-semibold">{p.variants.length} options</td>
                        <td className="px-5 py-4 font-semibold">₹{p.sellingPrice.toLocaleString("en-IN")}</td>
                        <td className="px-5 py-4 text-muted-foreground">₹{p.purchasePrice.toLocaleString("en-IN")}</td>
                        <td className="px-5 py-4">
                          <span className={cn(
                            "font-bold",
                            p.variants.reduce((acc, v) => acc + v.availableStock, 0) <= 10 ? "text-orange" : "text-foreground"
                          )}>
                            {p.variants.reduce((acc, v) => acc + v.availableStock, 0)} units
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={p.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* 3. ORDERS TAB */}
          <TabsContent value="orders" className="space-y-4">
            <div className="bloom-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Order #</th>
                      <th className="px-5 py-3.5">Customer</th>
                      <th className="px-5 py-3.5">Items</th>
                      <th className="px-5 py-3.5">Gross Total</th>
                      <th className="px-5 py-3.5">Commission</th>
                      <th className="px-5 py-3.5">Vendor Net</th>
                      <th className="px-5 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {allOrders.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders recorded for this vendor.</td></tr>
                    ) : (
                      allOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-accent/40">
                          <td className="px-5 py-4 font-mono font-semibold text-primary">{o.orderNumber}</td>
                          <td className="px-5 py-4">{o.customerName}</td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">{o.items.map((i) => i.productName).join(", ")}</td>
                          <td className="px-5 py-4 font-medium">₹{o.vendorGross.toLocaleString("en-IN")}</td>
                          <td className="px-5 py-4 text-xs text-destructive">-₹{o.commissionAmount.toFixed(2)}</td>
                          <td className="px-5 py-4 font-bold text-success">₹{o.vendorEarnings.toFixed(2)}</td>
                          <td className="px-5 py-4"><StatusBadge status={o.orderStatus} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* 4. INVENTORY TAB */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="bloom-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Variant</th>
                      <th className="px-5 py-3.5">SKU / Barcode</th>
                      <th className="px-5 py-3.5">Unit</th>
                      <th className="px-5 py-3.5">Available Stock</th>
                      <th className="px-5 py-3.5">Reserved Stock</th>
                      <th className="px-5 py-3.5">Damaged / Expired</th>
                      <th className="px-5 py-3.5">Total Inventory</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {allProducts.flatMap((p) => p.variants).map((v) => (
                      <tr key={v.id} className="hover:bg-accent/40">
                        <td className="px-5 py-4 font-medium">{v.name}</td>
                        <td className="px-5 py-4 text-xs font-mono">{v.sku}</td>
                        <td className="px-5 py-4 text-xs">{v.unitCode}</td>
                        <td className="px-5 py-4 font-bold text-success">{v.availableStock}</td>
                        <td className="px-5 py-4 text-muted-foreground">{v.reservedStock}</td>
                        <td className="px-5 py-4 text-destructive">{v.damagedStock + v.expiredStock}</td>
                        <td className="px-5 py-4 font-bold">{v.availableStock + v.reservedStock + v.damagedStock + v.expiredStock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* 5. PRODUCTION TAB */}
          <TabsContent value="production" className="space-y-4">
            <div className="bloom-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Production ID</th>
                      <th className="px-5 py-3.5">Product & Variant</th>
                      <th className="px-5 py-3.5">Batch #</th>
                      <th className="px-5 py-3.5">Planned Qty</th>
                      <th className="px-5 py-3.5">Good Qty</th>
                      <th className="px-5 py-3.5">Rejected Qty</th>
                      <th className="px-5 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {allProductions.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No production orders on file.</td></tr>
                    ) : (
                      allProductions.map((p) => (
                        <tr key={p.id} className="hover:bg-accent/40">
                          <td className="px-5 py-4 font-mono font-semibold text-primary">{p.id}</td>
                          <td className="px-5 py-4 font-medium">{p.productName} - {p.variantName}</td>
                          <td className="px-5 py-4 font-mono text-xs">{p.batchNumber}</td>
                          <td className="px-5 py-4">{p.plannedQuantity} {p.unit}</td>
                          <td className="px-5 py-4 font-bold text-success">{p.goodQuantity} {p.unit}</td>
                          <td className="px-5 py-4 text-destructive">{p.rejectedQuantity} {p.unit}</td>
                          <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* 6. TRANSACTIONS TAB */}
          <TabsContent value="transactions" className="space-y-4">
            <div className="bloom-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Txn ID</th>
                      <th className="px-5 py-3.5">Type</th>
                      <th className="px-5 py-3.5">Order Ref</th>
                      <th className="px-5 py-3.5">Description</th>
                      <th className="px-5 py-3.5">Amount</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {allTransactions.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No ledger transactions.</td></tr>
                    ) : (
                      allTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-accent/40">
                          <td className="px-5 py-4 font-mono text-xs font-semibold text-primary">{t.id}</td>
                          <td className="px-5 py-4 text-xs font-medium">{t.type}</td>
                          <td className="px-5 py-4 font-mono text-xs">{t.orderNumber || "—"}</td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">{t.description}</td>
                          <td className={cn("px-5 py-4 font-semibold", t.amount >= 0 ? "text-success" : "text-destructive")}>
                            {t.amount >= 0 ? `+₹${t.amount.toLocaleString("en-IN")}` : `-₹${Math.abs(t.amount).toLocaleString("en-IN")}`}
                          </td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">{t.createdDate}</td>
                          <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* 7. PAYMENTS TAB */}
          <TabsContent value="payments" className="space-y-4">
            <div className="bloom-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Payment ID</th>
                      <th className="px-5 py-3.5">Settlement Ref</th>
                      <th className="px-5 py-3.5">Disbursed Amount</th>
                      <th className="px-5 py-3.5">Payment Method</th>
                      <th className="px-5 py-3.5">UTR / Ref #</th>
                      <th className="px-5 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {allPayments.length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No payment records found.</td></tr>
                    ) : (
                      allPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-accent/40">
                          <td className="px-5 py-4 font-mono text-xs font-semibold text-primary">{p.id}</td>
                          <td className="px-5 py-4 text-xs font-mono">{p.settlementId}</td>
                          <td className="px-5 py-4 font-bold">₹{p.amount.toLocaleString("en-IN")}</td>
                          <td className="px-5 py-4 text-xs">{p.method} ({p.bankAccountMasked})</td>
                          <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{p.referenceId}</td>
                          <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* 8. SETTLEMENTS TAB */}
          <TabsContent value="settlements" className="space-y-4">
            <div className="bloom-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Settlement ID</th>
                      <th className="px-5 py-3.5">Period</th>
                      <th className="px-5 py-3.5">Gross Sales</th>
                      <th className="px-5 py-3.5">Commission</th>
                      <th className="px-5 py-3.5">Refunds</th>
                      <th className="px-5 py-3.5">Net Payable</th>
                      <th className="px-5 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {allSettlements.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No settlements created yet.</td></tr>
                    ) : (
                      allSettlements.map((s) => (
                        <tr key={s.id} className="hover:bg-accent/40">
                          <td className="px-5 py-4 font-mono text-xs font-semibold text-primary">{s.id}</td>
                          <td className="px-5 py-4 text-xs font-medium">{s.settlementPeriod}</td>
                          <td className="px-5 py-4">₹{s.totalSales.toLocaleString("en-IN")}</td>
                          <td className="px-5 py-4 text-xs text-destructive">-₹{s.commission.toLocaleString("en-IN")}</td>
                          <td className="px-5 py-4 text-xs text-destructive">-₹{s.refunds.toLocaleString("en-IN")}</td>
                          <td className="px-5 py-4 font-bold text-success">₹{s.netPayable.toLocaleString("en-IN")}</td>
                          <td className="px-5 py-4"><StatusBadge status={s.paymentStatus} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* 9. RETURNS TAB */}
          <TabsContent value="returns" className="space-y-4">
            <div className="bloom-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Return ID</th>
                      <th className="px-5 py-3.5">Order Ref</th>
                      <th className="px-5 py-3.5">Product</th>
                      <th className="px-5 py-3.5">Customer Reason</th>
                      <th className="px-5 py-3.5">Inspection Result</th>
                      <th className="px-5 py-3.5">Disposition</th>
                      <th className="px-5 py-3.5">Refund</th>
                      <th className="px-5 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {allReturns.length === 0 ? (
                      <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No returns requested.</td></tr>
                    ) : (
                      allReturns.map((r) => (
                        <tr key={r.id} className="hover:bg-accent/40">
                          <td className="px-5 py-4 font-mono text-xs font-semibold text-primary">{r.id}</td>
                          <td className="px-5 py-4 font-mono text-xs">{r.orderNumber}</td>
                          <td className="px-5 py-4 font-medium">{r.productName} ({r.quantity}x)</td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">{r.customerReason}</td>
                          <td className="px-5 py-4">
                            <span className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-semibold",
                              r.inspectionResult === "Good" ? "bg-success-soft text-success" : "bg-destructive/15 text-destructive"
                            )}>
                              {r.inspectionResult}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs font-medium">{r.dispositionAction || "Pending"}</td>
                          <td className="px-5 py-4 font-bold text-destructive">₹{r.refundAmount.toLocaleString("en-IN")}</td>
                          <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* 10. DOCUMENTS TAB */}
          <TabsContent value="documents" className="space-y-4">
            <div className="bloom-card p-6 space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h3 className="text-base font-semibold">Vendor KYC & Compliance Documents</h3>
                  <p className="text-xs text-muted-foreground">Review legal registrations, tax certificates, and verified bank credentials.</p>
                </div>
                <Button
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => setUploadDocModalOpen(true)}
                >
                  <UploadCloud className="size-3.5 mr-1.5" />
                  Upload Document
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {vendor.documents.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
                    <FileText className="size-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No documents uploaded yet</p>
                    <p className="text-xs mt-1">Upload GST certificate, PAN card, or Address proof to complete KYC compliance.</p>
                    <Button
                      size="sm"
                      className="rounded-full text-xs mt-4"
                      onClick={() => setUploadDocModalOpen(true)}
                    >
                      <UploadCloud className="size-3.5 mr-1.5" />
                      Upload First Document
                    </Button>
                  </div>
                ) : (
                  vendor.documents.map((doc) => (
                    <div key={doc.id} className="rounded-2xl border bg-card/60 p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                          <FileText className="size-5" />
                        </div>
                        <StatusBadge status={doc.status} />
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm">{doc.type}</h4>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{doc.documentNumber}</p>
                        <p className="text-xs text-muted-foreground mt-1">Uploaded: {doc.uploadedDate} · {doc.fileSize}</p>
                        {doc.verifiedBy && (
                          <p className="text-[11px] text-success mt-1">Verified by {doc.verifiedBy} on {doc.verifiedDate}</p>
                        )}
                        {doc.notes && (
                          <p className="text-[11px] text-destructive mt-1 bg-destructive/10 p-1.5 rounded-lg">{doc.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-full text-xs"
                          onClick={() => {
                            setPreviewDocUrl(doc.fileUrl);
                            setPreviewDocTitle(`${vendor.businessName} — ${doc.type}`);
                            setPreviewDocNumber(doc.documentNumber);
                            setPreviewDocOpen(true);
                          }}
                        >
                          <Eye className="size-3.5 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          className="rounded-full text-xs px-3"
                          onClick={() => setVerifyDocModal(doc)}
                        >
                          Verify
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-full text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (confirm(`Remove ${doc.type} (${doc.fileName})?`)) {
                              vendorStore.deleteDocumentFromVendor(vendor.id, doc.id);
                              toast.success(`${doc.type} removed.`);
                            }
                          }}
                          title="Delete Document"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* 11. ACTIVITY TAB */}
          <TabsContent value="activity" className="space-y-4">
            <div className="bloom-card p-6">
              <h3 className="text-base font-semibold mb-4">Audit Trail & Activity Log</h3>
              <div className="space-y-4">
                {allActivity.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm pb-3 border-b last:border-b-0">
                    <div className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                      <History className="size-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        Actor: {log.user} · Entity: {log.entity} ({log.entityId}) · {log.timestamp}
                      </p>
                      {log.oldValue && log.newValue && (
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                          {log.oldValue} → <span className="font-semibold text-foreground">{log.newValue}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 12. SETTINGS & BANK TAB */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Bank Credentials with Masking */}
              <div className="bloom-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Sensitive Financial & Bank Details</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={() => setShowBankDetails(!showBankDetails)}
                  >
                    <Lock className="size-3.5 mr-1.5" />
                    {showBankDetails ? "Hide Details" : "Reveal Credentials"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Encrypted payout details used for weekly settlement disbursements.
                </p>

                <div className="space-y-3 rounded-2xl border bg-muted/40 p-4 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Account Holder</span>
                    <span className="font-semibold">{vendor.bankInfo.accountHolder}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Bank Name</span>
                    <span className="font-medium">{vendor.bankInfo.bankName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Account Number</span>
                    <span className="font-mono font-bold">
                      {showBankDetails ? "50200049184812" : vendor.bankInfo.accountNumberMasked}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">IFSC Code</span>
                    <span className="font-mono font-semibold">{vendor.bankInfo.ifsc}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Branch</span>
                    <span>{vendor.bankInfo.branch}</span>
                  </div>
                  {vendor.bankInfo.upiId && (
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">UPI ID</span>
                      <span className="font-mono">{vendor.bankInfo.upiId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tax & Legal Info */}
              <div className="bloom-card p-6 space-y-4">
                <h3 className="text-base font-semibold">Tax Compliance Information</h3>
                <div className="space-y-3 rounded-2xl border bg-muted/40 p-4 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Tax Registration Type</span>
                    <span className="font-medium">{vendor.taxInfo.taxType}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">GST Identification Number</span>
                    <span className="font-mono font-bold">{vendor.taxInfo.gstNumber}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Permanent Account Number (PAN)</span>
                    <span className="font-mono font-bold">{vendor.taxInfo.panNumber}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">TDS Rate Applicable</span>
                    <span className="font-medium">1% Section 194-O (E-commerce)</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Document Verification Modal */}
      <Dialog open={!!verifyDocModal} onOpenChange={(open) => !open && setVerifyDocModal(null)}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>Verify {verifyDocModal?.type}</DialogTitle>
            <DialogDescription>
              Confirm whether the submitted {verifyDocModal?.fileName} meets legal KYC validation criteria.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="rounded-2xl border bg-muted/30 p-3 text-xs space-y-1">
              <div>Document Number: <span className="font-mono font-bold">{verifyDocModal?.documentNumber}</span></div>
              <div>File Name: <span className="font-medium">{verifyDocModal?.fileName}</span> ({verifyDocModal?.fileSize})</div>
            </div>

            <Label>Audit Notes</Label>
            <Textarea
              value={docNotes}
              onChange={(e) => setDocNotes(e.target.value)}
              placeholder="e.g. Cross-verified with GST portal / bank passbook..."
              rows={3}
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => handleVerifyDocument("Rejected")}
            >
              <X className="size-4 mr-1" />
              Reject Document
            </Button>
            <Button
              className="bg-success text-success-foreground hover:bg-success/90"
              onClick={() => handleVerifyDocument("Verified")}
            >
              <Check className="size-4 mr-1" />
              Mark as Verified
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <VendorUploadDocDialog
        open={uploadDocModalOpen}
        onOpenChange={setUploadDocModalOpen}
        vendor={vendor}
      />

      {/* Document Preview Dialog */}
      <DocumentPreviewDialog
        open={previewDocOpen}
        onOpenChange={setPreviewDocOpen}
        title={previewDocTitle}
        fileUrl={previewDocUrl}
        documentNumber={previewDocNumber}
      />
    </DetailShell>
  );
}
