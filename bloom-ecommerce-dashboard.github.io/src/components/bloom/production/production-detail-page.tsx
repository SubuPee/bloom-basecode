import { useState, useEffect } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  Factory,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Layers,
  Building2,
  Calendar,
  Warehouse,
  ShieldCheck,
  Package,
  Plus,
  Play,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ProductionShell } from "./production-shell";
import { PageHeader } from "../ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useVendorStore, vendorStore } from "@/lib/bloom-vendor-store";
import { productionApi, ProductionOrder, ProductionBatchItem } from "@/lib/production-api";
import { cn } from "@/lib/utils";

export function ProductionDetailPage() {
  const { productionId } = useParams({ strict: false }) as { productionId?: string };
  const storeProductions = useVendorStore((s) => s.getProductions());
  const storeBatches = useVendorStore((s) => s.getBatches());

  const storeProd = storeProductions.find((p) => p.id === productionId || p.orderId === productionId);
  const storeBatch = storeBatches.find(
    (b) => b.batchNumber === storeProd?.batchNumber || b.productionId === storeProd?.id
  );

  const [liveOrder, setLiveOrder] = useState<ProductionOrder | null>(null);
  const [liveBatch, setLiveBatch] = useState<ProductionBatchItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Completion / QA Modal State
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [producedQty, setProducedQty] = useState(100);
  const [rejectedQty, setRejectedQty] = useState(0);
  const [completing, setCompleting] = useState(false);

  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Starting run state
  const [starting, setStarting] = useState(false);

  const fetchDetail = () => {
    if (!productionId) return;
    setLoading(true);
    productionApi
      .getOrderById(productionId)
      .then((res) => {
        setLiveOrder(res.order);
        setLiveBatch(res.relatedBatch);
        setProducedQty(res.order.plannedQuantity);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("API order detail error, falling back to local store:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDetail();
  }, [productionId]);

  const production = liveOrder || storeProd;
  const relatedBatch = liveBatch || storeBatch;

  if (!production) {
    return (
      <ProductionShell>
        <div className="bloom-card p-12 text-center space-y-4">
          <Factory className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <h2 className="text-xl font-bold text-foreground">Production Order Not Found</h2>
          <p className="text-xs text-muted-foreground">
            The requested production order ID "{productionId}" could not be located.
          </p>
          <Link to="/production/list">
            <Button variant="outline" size="sm">
              Back to Production Orders
            </Button>
          </Link>
        </div>
      </ProductionShell>
    );
  }

  const goodQty = Math.max(0, producedQty - rejectedQty);
  const isComplete = production.status === "Completed";
  const isCancelled = production.status === "Cancelled";
  const isPlanned = production.status === "Planned";
  const isInProgress = production.status === "In Progress";

  const handleStartOrder = async () => {
    setStarting(true);
    try {
      await productionApi.startOrder(production.id);
      toast.success(`Production run ${production.id} started (In Progress)`);
      fetchDetail();
    } catch (err: any) {
      toast.error(err.message || "Failed to start production run");
    } finally {
      setStarting(false);
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (producedQty <= 0) {
      toast.error("Produced quantity must be greater than 0");
      return;
    }

    if (rejectedQty > producedQty) {
      toast.error("Rejected quantity cannot exceed total produced units");
      return;
    }

    setCompleting(true);
    try {
      await productionApi.completeOrder(production.id, producedQty, rejectedQty);
      vendorStore.completeProduction(
        production.id,
        producedQty,
        rejectedQty,
        "Production QA Manager"
      );

      toast.success(
        `Production recorded! ${goodQty} units inwarded to inventory & Batch #${production.batchNumber} updated.`
      );
      setIsCompletionModalOpen(false);
      fetchDetail();
    } catch (err: any) {
      vendorStore.completeProduction(
        production.id,
        producedQty,
        rejectedQty,
        "Production QA Manager"
      );
      toast.success(
        `Production recorded! ${goodQty} units added to sellable stock & Batch #${production.batchNumber} created.`
      );
      setIsCompletionModalOpen(false);
      fetchDetail();
    } finally {
      setCompleting(false);
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancelling this order");
      return;
    }

    setCancelling(true);
    try {
      await productionApi.cancelOrder(production.id, cancelReason.trim());
      toast.success(`Production Order ${production.id} has been cancelled`);
      setIsCancelModalOpen(false);
      fetchDetail();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel production order");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800";
      case "In Progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-300 dark:border-blue-800";
      case "Planned":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800";
      case "Cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-300 dark:border-red-800";
      default:
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-300 dark:border-purple-800";
    }
  };

  return (
    <ProductionShell>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/production/list">
              <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{production.id}</h2>
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                    getStatusBadge(production.status)
                  )}
                >
                  {production.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Batch #{production.batchNumber} • Scheduled for {production.productionDate}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isPlanned && (
              <Button
                onClick={handleStartOrder}
                disabled={starting}
                variant="outline"
                className="gap-1.5 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40"
              >
                {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-blue-600" />}
                Start Production Run
              </Button>
            )}

            {!isComplete && !isCancelled && (
              <>
                <Button
                  onClick={() => {
                    setProducedQty(production.plannedQuantity);
                    setRejectedQty(0);
                    setIsCompletionModalOpen(true);
                  }}
                  className="gap-2 bg-bloom-sage hover:bg-bloom-sage/90 text-white font-medium"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Record QA & Complete Order
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-950/30"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Order
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Status Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bloom-card p-4 border-l-4 border-bloom-sage">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Planned Quantity</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {production.plannedQuantity} {production.unit}
            </p>
          </div>

          <div className="bloom-card p-4 border-l-4 border-blue-500">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Total Output</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {production.producedQuantity} {production.unit}
            </p>
          </div>

          <div className="bloom-card p-4 border-l-4 border-emerald-500">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Good Inwarded</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {production.goodQuantity} {production.unit}
            </p>
          </div>

          <div className="bloom-card p-4 border-l-4 border-red-500">
            <p className="text-xs text-muted-foreground uppercase font-semibold">QA Rejections</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {production.rejectedQuantity} {production.unit}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Finished Good Specifications */}
            <div className="bloom-card p-6 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2 pb-2 border-b border-border">
                <Package className="h-4 w-4 text-bloom-sage" />
                Manufactured Finished Good
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Product Title</p>
                  <p className="font-semibold text-foreground">{production.productName}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Variant & Spec</p>
                  <p className="font-semibold text-foreground">{production.variantName}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Batch Identifier</p>
                  <p className="font-mono font-bold text-foreground">{production.batchNumber}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Manufacturing Partner</p>
                  <p className="font-semibold text-foreground">{production.vendorName}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Destination Warehouse</p>
                  <p className="font-semibold text-foreground">{production.warehouseName}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Designated Storage Bin</p>
                  <p className="font-mono text-foreground font-semibold">{production.storageLocation}</p>
                </div>

                {production.actualCompletion && (
                  <div>
                    <p className="text-xs text-muted-foreground">Completion Timestamp</p>
                    <p className="font-semibold text-emerald-600">{production.actualCompletion}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bill of Materials (BOM) */}
            <div className="bloom-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-bloom-sage" />
                  Bill of Materials (BOM) Consumption
                </h3>
                <span className="text-xs text-muted-foreground">
                  {production.rawMaterials?.length || 0} line items
                </span>
              </div>

              <div className="space-y-2">
                {production.rawMaterials && production.rawMaterials.length > 0 ? (
                  production.rawMaterials.map((mat) => (
                    <div
                      key={mat.id}
                      className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-foreground">{mat.name}</p>
                        <p className="text-[11px] text-muted-foreground">Unit: {mat.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-foreground">
                          {mat.requiredQuantity} {mat.unit}
                        </p>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Allocated from stock
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Standard materials packaged per factory specification.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Batch & Traceability */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bloom-card p-6 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2 pb-2 border-b border-border">
                <Boxes className="h-4 w-4 text-bloom-sage" />
                Batch & Inventory Traceability
              </h3>

              {relatedBatch ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {relatedBatch.batchNumber}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        {relatedBatch.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Available: <strong className="text-foreground">{relatedBatch.availableQuantity} units</strong>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Location: <span className="font-mono text-foreground">{relatedBatch.location}</span>
                    </p>
                  </div>

                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p>Mfg Date: {relatedBatch.manufacturingDate}</p>
                    <p>Expiry Date: {relatedBatch.expiryDate}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-muted/40 text-center space-y-2">
                  <Boxes className="h-8 w-8 mx-auto text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    Batch record will be automatically published into the Inventory Ledger once production completion is logged.
                  </p>
                </div>
              )}

              {/* Quality Standards Alert */}
              <div className="p-4 rounded-xl bg-bloom-sage/5 border border-bloom-sage/20 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-bloom-sage">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Strict Inventory Segregation</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Only QA-approved units (Good Output = Produced - Rejected) are merged with sellable inventory. Defective units are routed to scrap inventory.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Completion & QA Modal */}
        <Dialog open={isCompletionModalOpen} onOpenChange={setIsCompletionModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5 text-bloom-sage" />
                Record Production Output & QA
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 py-2">
              <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
                <p>
                  <strong className="text-foreground">Product:</strong> {production.productName} ({production.variantName})
                </p>
                <p>
                  <strong className="text-foreground">Target Planned:</strong> {production.plannedQuantity} {production.unit}
                </p>
                <p>
                  <strong className="text-foreground">Target Batch:</strong> #{production.batchNumber}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Total Units Produced
                </label>
                <input
                  type="number"
                  min="1"
                  value={producedQty}
                  onChange={(e) => setProducedQty(parseInt(e.target.value) || 0)}
                  className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  QA Rejected / Defective Units
                </label>
                <input
                  type="number"
                  min="0"
                  max={producedQty}
                  value={rejectedQty}
                  onChange={(e) => setRejectedQty(parseInt(e.target.value) || 0)}
                  className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
                  required
                />
              </div>

              {/* Real-time Good Calculation Display */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-foreground">Good / Sellable Output:</span>
                  <span className="text-lg font-bold text-emerald-600 font-mono">
                    {goodQty} {production.unit}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Formula: Produced ({producedQty}) − Rejected ({rejectedQty}) = {goodQty} units credited to sellable inventory.
                </p>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCompletionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-bloom-sage hover:bg-bloom-sage/90 text-white gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm & Inward Stock
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Cancellation Dialog */}
        <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Cancel Production Order
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCancelSubmit} className="space-y-4 py-2">
              <p className="text-xs text-muted-foreground">
                Cancelling order <strong className="text-foreground">{production.id}</strong> will abort this run and halt finished goods batch creation. Please provide a cancellation justification.
              </p>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Reason for Cancellation *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  required
                  placeholder="e.g., Raw material shortage, defective inputs, equipment maintenance..."
                  className="w-full mt-1 bg-card border border-border rounded-lg text-sm p-3 outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCancelModalOpen(false)}
                >
                  Dismiss
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={cancelling}
                  className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
                >
                  {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Confirm Cancellation
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ProductionShell>
  );
}
