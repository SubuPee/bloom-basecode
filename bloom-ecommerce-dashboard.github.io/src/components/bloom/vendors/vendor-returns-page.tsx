import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Package,
  Layers,
  Sparkles,
  Archive,
} from "lucide-react";
import { VendorShell } from "./vendor-shell";
import { PageHeader, Pagination, SearchBox, StatusBadge } from "../ui";
import { Button } from "@/components/ui/button";
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
  type VendorReturn,
  type ReturnInspectionResult,
} from "@/lib/bloom-vendor-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function VendorReturnsPage() {
  const returns = useVendorStore((s) => s.getReturns());
  const vendors = useVendorStore((s) => s.getVendors());

  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [inspectModal, setInspectModal] = useState<VendorReturn | null>(null);
  const [inspectionResult, setInspectionResult] = useState<ReturnInspectionResult>("Good");
  const [dispositionAction, setDispositionAction] = useState<"Restock" | "Scrap" | "Return to Vendor">("Restock");
  const [inspectionNotes, setInspectionNotes] = useState("");

  const filtered = useMemo(() => {
    return returns.filter((r) => {
      const matchSearch =
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        r.productName.toLowerCase().includes(search.toLowerCase()) ||
        r.vendorName.toLowerCase().includes(search.toLowerCase()) ||
        r.reason.toLowerCase().includes(search.toLowerCase());
      const matchVendor = vendorFilter === "All" || r.vendorId === vendorFilter;
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      return matchSearch && matchVendor && matchStatus;
    });
  }, [returns, search, vendorFilter, statusFilter]);

  function handleSaveInspection() {
    if (!inspectModal) return;
    vendorStore.inspectReturn(
      inspectModal.id,
      inspectionResult,
      dispositionAction,
      "Alex Morgan",
      inspectionNotes,
    );
    toast.success(
      `Return #${inspectModal.id} dispositioned as ${inspectionResult} (${dispositionAction}). Inventory updated accordingly.`,
    );
    setInspectModal(null);
    setInspectionNotes("");
  }

  return (
    <VendorShell>
      <div className="space-y-7">
        <PageHeader
          title="Vendor Returns & Quality Inspection"
          description="Govern customer returns, enforce mandatory condition inspection, isolate damaged goods, and restock only verified pristine units."
          action={
            <div className="flex gap-2.5">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/inventory/movements">
                  <Layers className="size-4" />
                  View Stock Movements
                </Link>
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <div className="bloom-card p-5 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <SearchBox
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Return ID, Order #, Product, or Vendor…"
            />

            <select
              aria-label="Filter by Vendor"
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm font-medium"
            >
              <option value="All">All Vendors</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.businessName}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Requested">Requested</option>
              <option value="Approved">Approved</option>
              <option value="Inspecting">Inspecting</option>
              <option value="Approved for Refund">Approved for Refund</option>
              <option value="Refunded">Refunded</option>
              <option value="Closed">Closed</option>
            </select>

            {(search || vendorFilter !== "All" || statusFilter !== "All") && (
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setSearch("");
                  setVendorFilter("All");
                  setStatusFilter("All");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Returns Table */}
        <div className="bloom-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Return ID & Order</th>
                  <th className="px-5 py-4">Vendor Partner</th>
                  <th className="px-5 py-4">Product Returned</th>
                  <th className="px-5 py-4">Customer Reason</th>
                  <th className="px-5 py-4">Inspection Result</th>
                  <th className="px-5 py-4">Inventory Disposition</th>
                  <th className="px-5 py-4">Refund Amount</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((ret) => (
                  <tr key={ret.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-5 py-4 font-mono">
                      <div className="font-bold text-xs text-primary">{ret.id}</div>
                      <div className="text-[11px] text-muted-foreground">{ret.orderNumber}</div>
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to="/vendors/$vendorId"
                        params={{ vendorId: ret.vendorId }}
                        className="font-medium hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        <Building2 className="size-3.5 text-muted-foreground" />
                        {ret.vendorName}
                      </Link>
                    </td>

                    <td className="px-5 py-4 font-medium text-xs">
                      <div>{ret.productName}</div>
                      <div className="text-muted-foreground">{ret.variantName} (Qty: {ret.quantity})</div>
                    </td>

                    <td className="px-5 py-4 text-xs text-muted-foreground max-w-xs">
                      <div>{ret.reason}</div>
                      <div className="italic text-[11px]">"{ret.customerReason}"</div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          ret.inspectionResult === "Good"
                            ? "bg-success-soft text-success"
                            : ret.inspectionResult === "Pending"
                              ? "bg-orange-soft text-orange"
                              : "bg-destructive/15 text-destructive",
                        )}
                      >
                        {ret.inspectionResult}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold">
                      {ret.dispositionAction ? (
                        <span className={ret.dispositionAction === "Restock" ? "text-success" : "text-destructive"}>
                          {ret.dispositionAction}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Pending Review</span>
                      )}
                    </td>

                    <td className="px-5 py-4 font-bold text-sm text-foreground">
                      ₹{ret.refundAmount.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={ret.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full text-xs"
                        onClick={() => {
                          setInspectModal(ret);
                          setInspectionResult(ret.inspectionResult === "Pending" ? "Good" : ret.inspectionResult);
                          setDispositionAction(ret.dispositionAction || "Restock");
                          setInspectionNotes(ret.inspectionNotes || "");
                        }}
                      >
                        Inspect & Route
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination count={filtered.length} />
        </div>
      </div>

      {/* Inspect & Disposition Modal */}
      <Dialog open={!!inspectModal} onOpenChange={(open) => !open && setInspectModal(null)}>
        <DialogContent className="rounded-3xl max-w-lg">
          <DialogHeader>
            <DialogTitle>Return Inspection & Inventory Disposition</DialogTitle>
            <DialogDescription>
              Return #{inspectModal?.id} for Order #{inspectModal?.orderNumber} ({inspectModal?.productName})
            </DialogDescription>
          </DialogHeader>

          {inspectModal && (
            <div className="space-y-4 py-2 text-sm">
              <div className="rounded-2xl border bg-muted/30 p-3.5 space-y-1 text-xs">
                <div>Customer Reason: <span className="font-semibold text-foreground">"{inspectModal.customerReason}"</span></div>
                <div>Claimed Issue: <span className="font-semibold text-foreground">{inspectModal.reason}</span></div>
                <div>Refund Amount: <span className="font-bold text-foreground">₹{inspectModal.refundAmount}</span></div>
              </div>

              <div className="space-y-2">
                <Label>Physical Inspection Result</Label>
                <select
                  aria-label="Physical Inspection Result"
                  value={inspectionResult}
                  onChange={(e) => {
                    const res = e.target.value as ReturnInspectionResult;
                    setInspectionResult(res);
                    if (res === "Good") setDispositionAction("Restock");
                    else setDispositionAction("Scrap");
                  }}
                  className="h-11 w-full rounded-2xl border bg-background px-3 font-medium"
                >
                  <option value="Good">Good (Pristine, unopened, seals intact)</option>
                  <option value="Damaged">Damaged (Broken, cracked, unusable)</option>
                  <option value="Expired">Expired (Shelf life passed)</option>
                  <option value="Missing">Missing / Wrong Item Returned</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Inventory Disposition Route</Label>
                <select
                  aria-label="Inventory Disposition Route"
                  value={dispositionAction}
                  onChange={(e) => setDispositionAction(e.target.value as any)}
                  className="h-11 w-full rounded-2xl border bg-background px-3 font-medium"
                >
                  {inspectionResult === "Good" ? (
                    <option value="Restock">Restock to Sellable Available Inventory (+ Movement Record)</option>
                  ) : (
                    <>
                      <option value="Scrap">Move to Damaged / Scrap Pool</option>
                      <option value="Return to Vendor">Return to Supplier / Vendor Chargeback</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Inspector Notes & QA Stamp</Label>
                <Textarea
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder="Record serial number check, packaging condition, or reasons..."
                  rows={3}
                />
              </div>

              <div className="rounded-2xl border border-warning/30 bg-warning/5 p-3 text-xs text-muted-foreground">
                * Critical rule: Only items inspected as <strong>Good</strong> will be placed back into available stock. Damaged items are quarantined to prevent overselling defective products.
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" className="rounded-full" onClick={() => setInspectModal(null)}>
              Cancel
            </Button>
            <Button className="rounded-full" onClick={handleSaveInspection}>
              Save Inspection Result
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </VendorShell>
  );
}
