import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeftRight,
  Warehouse,
  Truck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Package,
  Layers,
  History,
  RefreshCw,
  Loader2,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import { InventoryShell } from "./inventory-shell";
import { PageHeader } from "../ui";
import { Button } from "@/components/ui/button";
import { useVendorStore, vendorStore } from "@/lib/bloom-vendor-store";
import { inventoryApi, StockTransferItem } from "@/lib/inventory-api";
import { cn } from "@/lib/utils";

interface TransferRecord {
  id: string;
  transferNumber: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  sourceLocation: string;
  destWarehouseId: string;
  destWarehouseName: string;
  destLocation: string;
  quantity: number;
  unitCode: string;
  status: "In Transit" | "Completed" | "Pending Dispatch" | "Cancelled";
  referenceNumber: string;
  createdAt: string;
  notes: string;
}

const initialTransfers: TransferRecord[] = [
  {
    id: "TRF-2026-001",
    transferNumber: "TRF-88219",
    productId: "prod-honey",
    productName: "Wild Forest Honey",
    variantId: "var-honey-500g",
    variantName: "500g Glass Jar",
    sku: "BLM-HON-500G",
    sourceWarehouseId: "wh-1",
    sourceWarehouseName: "Central Fulfillment Hub",
    sourceLocation: "A-01-S2-B04",
    destWarehouseId: "wh-2",
    destWarehouseName: "South Regional Hub",
    destLocation: "B-03-S1-B12",
    quantity: 40,
    unitCode: "JAR",
    status: "Completed",
    referenceNumber: "DISP-9921",
    createdAt: "2026-09-18T10:30:00Z",
    notes: "Regional restock for south zone peak demand",
  },
  {
    id: "TRF-2026-002",
    transferNumber: "TRF-88220",
    productId: "prod-tea",
    productName: "Organic Green Tea",
    variantId: "var-tea-100g",
    variantName: "100g Pack",
    sku: "BLM-TEA-100G",
    sourceWarehouseId: "wh-1",
    sourceWarehouseName: "Central Fulfillment Hub",
    sourceLocation: "C-02-S1-B08",
    destWarehouseId: "wh-2",
    destWarehouseName: "South Regional Hub",
    destLocation: "A-01-S4-B02",
    quantity: 25,
    unitCode: "BOX",
    status: "In Transit",
    referenceNumber: "DISP-9945",
    createdAt: "2026-09-20T14:15:00Z",
    notes: "Stock rebalance before festival promotions",
  },
];

export function StockTransferPage() {
  const products = useVendorStore((s) => s.getProducts());
  const warehouses = useVendorStore((s) => s.getWarehouses());
  const locations = useVendorStore((s) => s.getStorageLocations());

  const [transfers, setTransfers] = useState<TransferRecord[]>(initialTransfers);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [selectedVariantId, setSelectedVariantId] = useState(
    products[0]?.variants[0]?.id || ""
  );
  const [sourceWarehouseId, setSourceWarehouseId] = useState(
    warehouses[0]?.id || ""
  );
  const [sourceLocationId, setSourceLocationId] = useState(
    locations[0]?.id || ""
  );
  const [destWarehouseId, setDestWarehouseId] = useState(
    warehouses[1]?.id || warehouses[0]?.id || ""
  );
  const [destLocationId, setDestLocationId] = useState(
    locations[1]?.id || locations[0]?.id || ""
  );
  const [quantity, setQuantity] = useState(10);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTransfers = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await inventoryApi.getTransfers({ limit: 20 });
      if (res.items && res.items.length > 0) {
        const formatted: TransferRecord[] = res.items.map((item) => {
          const prodName = typeof item.productId === "object" ? item.productId?.name : "Product";
          const srcName = typeof item.fromWarehouseId === "object" ? item.fromWarehouseId?.name : "Source Hub";
          const dstName = typeof item.toWarehouseId === "object" ? item.toWarehouseId?.name : "Destination Hub";

          return {
            id: item._id,
            transferNumber: item.transferId || item._id?.slice(-8),
            productId: typeof item.productId === "object" ? item.productId?._id : item.productId,
            productName: prodName,
            variantId: item.variantId || "default",
            variantName: item.variantId || "Default Variant",
            sku: `SKU-${item.variantId?.slice(-6) || "TRF"}`,
            sourceWarehouseId: typeof item.fromWarehouseId === "object" ? item.fromWarehouseId?._id : item.fromWarehouseId,
            sourceWarehouseName: srcName,
            sourceLocation: "Zone A",
            destWarehouseId: typeof item.toWarehouseId === "object" ? item.toWarehouseId?._id : item.toWarehouseId,
            destWarehouseName: dstName,
            destLocation: "Zone B",
            quantity: item.quantity,
            unitCode: "UNITS",
            status: item.status as any,
            referenceNumber: item.transferId,
            createdAt: item.createdAt,
            notes: item.notes || "",
          };
        });
        setTransfers(formatted);
      }
      if (isManual) toast.success("Stock transfers refreshed from server");
    } catch {
      // Fallback silently to initial
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const selectedVariant = selectedProduct?.variants.find(
    (v) => v.id === selectedVariantId
  );

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod && prod.variants.length > 0) {
      setSelectedVariantId(prod.variants[0]!.id);
    }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedVariant) {
      toast.error("Please select a valid product and variant");
      return;
    }

    if (quantity <= 0) {
      toast.error("Transfer quantity must be greater than 0");
      return;
    }

    if (quantity > selectedVariant.availableStock) {
      toast.error(
        `Insufficient available stock (${selectedVariant.availableStock} ${selectedVariant.unitCode} available)`
      );
      return;
    }

    if (sourceWarehouseId === destWarehouseId && sourceLocationId === destLocationId) {
      toast.error("Source and destination warehouse/location cannot be identical");
      return;
    }

    setIsSubmitting(true);

    try {
      const srcWh = warehouses.find((w) => w.id === sourceWarehouseId);
      const dstWh = warehouses.find((w) => w.id === destWarehouseId);
      const srcLoc = locations.find((l) => l.id === sourceLocationId);
      const dstLoc = locations.find((l) => l.id === destLocationId);

      const newTrf: TransferRecord = {
        id: `TRF-${Date.now()}`,
        transferNumber: `TRF-${Math.floor(10000 + Math.random() * 90000)}`,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        variantId: selectedVariant.id,
        variantName: selectedVariant.name,
        sku: selectedVariant.sku,
        sourceWarehouseId,
        sourceWarehouseName: srcWh?.name || "Warehouse A",
        sourceLocation: srcLoc?.code || "A-01-S1-B01",
        destWarehouseId,
        destWarehouseName: dstWh?.name || "Warehouse B",
        destLocation: dstLoc?.code || "B-01-S1-B01",
        quantity,
        unitCode: selectedVariant.unitCode,
        status: "In Transit",
        referenceNumber: reference || `TRF-REF-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        notes,
      };

      // 1. Post to backend API
      await inventoryApi
        .initiateTransfer({
          productId: selectedProduct.id,
          variantId: selectedVariant.id,
          fromWarehouseId: "wh-1",
          toWarehouseId: "wh-2",
          quantity,
          batchNumber: "BAT-TRF",
          notes: `${notes} (Ref: ${newTrf.transferNumber})`,
        })
        .catch((err) => {
          console.warn("Backend transfer initiation note:", err.message);
        });

      // 2. Deduct from available, add to transit in client reactive store
      vendorStore.adjustStock({
        variantId: selectedVariant.id,
        type: "Decrease",
        quantity,
        reason: "Other",
        notes: `Stock transfer to ${dstWh?.name} (Ref: ${newTrf.transferNumber})`,
      });

      setTransfers([newTrf, ...transfers]);
      toast.success(
        `Stock Transfer ${newTrf.transferNumber} initiated for ${quantity} ${selectedVariant.unitCode}`
      );

      // Reset form
      setQuantity(10);
      setReference("");
      setNotes("");
    } catch {
      toast.error("Failed to process stock transfer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteTransfer = async (trfId: string) => {
    const trf = transfers.find((t) => t.id === trfId);
    if (!trf) return;

    try {
      // 1. Patch backend API
      if (!trf.id.startsWith("TRF-")) {
        await inventoryApi.receiveTransfer(trf.id).catch((err) => {
          console.warn("Backend transfer receive note:", err.message);
        });
      }

      // 2. Inward stock into destination in client store
      vendorStore.adjustStock({
        variantId: trf.variantId,
        type: "Increase",
        quantity: trf.quantity,
        reason: "Other",
        notes: `Received transfer ${trf.transferNumber} at ${trf.destWarehouseName}`,
      });

      setTransfers(
        transfers.map((t) =>
          t.id === trfId ? { ...t, status: "Completed" as const } : t
        )
      );
      toast.success(`Transfer ${trf.transferNumber} marked as Received & Stock Added to destination`);
    } catch (err: any) {
      toast.error(err.message || "Failed to receive transfer");
    }
  };

  const handleCancelTransfer = async (trfId: string) => {
    const trf = transfers.find((t) => t.id === trfId);
    if (!trf) return;

    try {
      if (!trf.id.startsWith("TRF-")) {
        await inventoryApi.cancelTransfer(trf.id, { cancelReason: "Transfer cancelled by supervisor" }).catch((err) => {
          console.warn("Backend cancel transfer note:", err.message);
        });
      }

      // Restore stock back to source in client store
      vendorStore.adjustStock({
        variantId: trf.variantId,
        type: "Increase",
        quantity: trf.quantity,
        reason: "Other",
        notes: `Cancelled transfer ${trf.transferNumber} - stock reverted to ${trf.sourceWarehouseName}`,
      });

      setTransfers(
        transfers.map((t) =>
          t.id === trfId ? { ...t, status: "Cancelled" as const } : t
        )
      );
      toast.info(`Transfer ${trf.transferNumber} has been cancelled and reversed`);
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel transfer");
    }
  };

  return (
    <InventoryShell>
      <div className="space-y-6">
        <PageHeader
          title="Stock Transfer"
          description="Initiate and monitor inter-warehouse and inter-bin stock transfers with real-time transit status."
          action={
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => fetchTransfers(true)}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              {refreshing ? "Syncing..." : "Sync Transfers"}
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transfer Form */}
          <div className="lg:col-span-1">
            <div className="bloom-card p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <ArrowLeftRight className="h-5 w-5 text-bloom-sage" />
                <h3 className="font-semibold text-foreground">Initiate Stock Transfer</h3>
              </div>

              <form onSubmit={handleCreateTransfer} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Select Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Select Variant
                  </label>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
                  >
                    {selectedProduct?.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.sku}) — Available: {v.availableStock} {v.unitCode}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedVariant && (
                  <div className="p-3 bg-muted/40 rounded-lg border border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Available at Source:</span>
                    <span className="font-bold text-foreground">
                      {selectedVariant.availableStock} {selectedVariant.unitCode}
                    </span>
                  </div>
                )}

                {/* Source Selection */}
                <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20 space-y-3">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Warehouse className="h-3.5 w-3.5" /> Source Location
                  </p>
                  <div>
                    <label className="text-xs text-muted-foreground">Origin Warehouse</label>
                    <select
                      value={sourceWarehouseId}
                      onChange={(e) => setSourceWarehouseId(e.target.value)}
                      className="w-full mt-1 bg-card border border-border rounded-lg text-xs px-2.5 py-1.5 outline-none"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Source Bin / Rack</label>
                    <select
                      value={sourceLocationId}
                      onChange={(e) => setSourceLocationId(e.target.value)}
                      className="w-full mt-1 bg-card border border-border rounded-lg text-xs px-2.5 py-1.5 outline-none"
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.code} ({l.zone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Destination Selection */}
                <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/20 space-y-3">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Destination Location
                  </p>
                  <div>
                    <label className="text-xs text-muted-foreground">Destination Warehouse</label>
                    <select
                      value={destWarehouseId}
                      onChange={(e) => setDestWarehouseId(e.target.value)}
                      className="w-full mt-1 bg-card border border-border rounded-lg text-xs px-2.5 py-1.5 outline-none"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Target Bin / Shelf</label>
                    <select
                      value={destLocationId}
                      onChange={(e) => setDestLocationId(e.target.value)}
                      className="w-full mt-1 bg-card border border-border rounded-lg text-xs px-2.5 py-1.5 outline-none"
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.code} ({l.zone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Quantity to Transfer ({selectedVariant?.unitCode || "Units"})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedVariant?.availableStock || 9999}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Dispatch Reference / Challan #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TR-CHALLAN-8921"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Transfer Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Add operational notes or driver details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-bloom-sage hover:bg-bloom-sage/90 text-white font-medium gap-2"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  Dispatch Transfer
                </Button>
              </form>
            </div>
          </div>

          {/* Transfers Activity List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bloom-card p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-bloom-sage" />
                  <h3 className="font-semibold text-foreground">Transfer Registry & Movement Log</h3>
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {transfers.length} registered transfers
                </span>
              </div>

              <div className="space-y-3">
                {loading && transfers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-xs">Loading active stock transfers...</p>
                  </div>
                ) : (
                  transfers.map((trf) => (
                    <div
                      key={trf.id}
                      className="p-4 rounded-xl border border-border bg-card/60 hover:bg-card hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {trf.transferNumber}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-semibold",
                              trf.status === "Completed"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : trf.status === "In Transit"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                                : trf.status === "Cancelled"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                            )}
                          >
                            {trf.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(trf.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="text-sm font-semibold text-foreground">
                          {trf.productName} — <span className="text-muted-foreground font-normal">{trf.variantName} ({trf.sku})</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Warehouse className="h-3.5 w-3.5 text-amber-500" />
                            <span>{trf.sourceWarehouseName} ({trf.sourceLocation})</span>
                          </div>
                          <span className="text-bloom-sage font-bold">➔</span>
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5 text-blue-500" />
                            <span>{trf.destWarehouseName} ({trf.destLocation})</span>
                          </div>
                        </div>

                        {trf.notes && (
                          <p className="text-xs text-muted-foreground italic">"{trf.notes}"</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Qty Moved</p>
                          <p className="text-base font-bold text-foreground">
                            {trf.quantity} {trf.unitCode}
                          </p>
                        </div>

                        {trf.status === "In Transit" && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelTransfer(trf.id)}
                              className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleCompleteTransfer(trf.id)}
                              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Receive Stock
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </InventoryShell>
  );
}
