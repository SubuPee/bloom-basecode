import { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  PlusCircle,
  Building2,
  Package,
  Layers,
  Calendar,
  Warehouse,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { InventoryShell } from "./inventory-shell";
import { PageHeader, Field } from "../ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useVendorStore, vendorStore } from "@/lib/bloom-vendor-store";
import { inventoryApi } from "@/lib/inventory-api";
import { toast } from "sonner";

export function AddStockPage() {
  const navigate = useNavigate();
  const vendors = useVendorStore((s) => s.getVendors());
  const products = useVendorStore((s) => s.getProducts());
  const storageLocations = useVendorStore((s) => s.getStorageLocations());

  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || "");
  const vendorProducts = useMemo(() => {
    return products.filter((p) => p.vendorId === selectedVendorId);
  }, [products, selectedVendorId]);

  const [selectedProductId, setSelectedProductId] = useState(vendorProducts[0]?.id || "");
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || vendorProducts[0];
  }, [products, selectedProductId, vendorProducts]);

  const [selectedVariantId, setSelectedVariantId] = useState(selectedProduct?.variants[0]?.id || "");
  const selectedVariant = useMemo(() => {
    return selectedProduct?.variants.find((v) => v.id === selectedVariantId) || selectedProduct?.variants[0];
  }, [selectedProduct, selectedVariantId]);

  const [quantity, setQuantity] = useState<number>(50);
  const [purchasePrice, setPurchasePrice] = useState<number>(selectedVariant?.purchasePrice || 500);
  const [batchNumber, setBatchNumber] = useState(`BAT-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [mfgDate, setMfgDate] = useState("2026-09-01");
  const [expiryDate, setExpiryDate] = useState("2028-09-01");
  const [warehouseName, setWarehouseName] = useState("Mumbai Central");
  const [storageLocation, setStorageLocation] = useState("Zone A · R01 · S02 · B05");
  const [supplierRef, setSupplierRef] = useState(`PO-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState("Supplier delivery inspected at inbound loading dock.");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct || !selectedVariant) {
      toast.error("Please select a valid product and variant.");
      return;
    }
    if (quantity <= 0) {
      toast.error("Quantity must be greater than zero.");
      return;
    }
    if (new Date(expiryDate) <= new Date(mfgDate)) {
      toast.error("Expiry date must be after manufacturing date.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Post to backend inventory API
      await inventoryApi
        .addStock({
          productId: selectedProduct.id,
          variantId: selectedVariant.id,
          warehouseId: "wh-1",
          vendorId: selectedVendorId,
          sku: selectedVariant.sku,
          unitCode: selectedVariant.unitCode,
          quantity: Number(quantity),
          purchasePrice: Number(purchasePrice),
          batchNumber,
          referenceId: supplierRef,
          location: storageLocation,
          notes: `${notes} (Ref: ${supplierRef})`,
        })
        .catch((err) => {
          console.warn("Backend addStock note:", err.message);
        });

      // 2. Sync client reactive vendor store
      vendorStore.addStock({
        vendorId: selectedVendorId,
        productId: selectedProduct.id,
        variantId: selectedVariant.id,
        unitCode: selectedVariant.unitCode,
        quantity: Number(quantity),
        purchasePrice: Number(purchasePrice),
        batchNumber,
        mfgDate,
        expiryDate,
        warehouseName,
        storageLocation,
        notes: `${notes} (Ref: ${supplierRef})`,
      });

      toast.success(`Successfully added ${quantity} units of ${selectedVariant.name} into inventory.`);
      navigate({ to: "/inventory/stock" });
    } catch (err: any) {
      toast.error(err.message || "Failed to add stock.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <InventoryShell>
      <div className="max-w-4xl space-y-7 mx-auto">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/inventory/stock">
              <ArrowLeft className="size-4 mr-1" />
              Back to Stock
            </Link>
          </Button>
        </div>

        <PageHeader
          title="Inbound Stock Receipt Workflow"
          description="Register physical stock arrival, link supplier purchase orders, assign warehouse storage locations, and generate audit stock movements."
        />

        <form onSubmit={handleSubmit} className="bloom-card p-6 sm:p-8 space-y-8">
          {/* Step 1: Supplier & Product Hierarchy */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs">1</span>
              Vendor & Catalog Hierarchy
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Vendor / Supplier</Label>
                <select
                  aria-label="Select Vendor"
                  value={selectedVendorId}
                  onChange={(e) => {
                    setSelectedVendorId(e.target.value);
                    const prods = products.filter((p) => p.vendorId === e.target.value);
                    if (prods[0]) {
                      setSelectedProductId(prods[0].id);
                      if (prods[0].variants[0]) {
                        setSelectedVariantId(prods[0].variants[0].id);
                        setPurchasePrice(prods[0].variants[0].purchasePrice);
                      }
                    }
                  }}
                  className="h-11 w-full rounded-2xl border bg-background px-3 text-sm font-medium"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.businessName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Select Product</Label>
                <select
                  aria-label="Select Product"
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod?.variants[0]) {
                      setSelectedVariantId(prod.variants[0].id);
                      setPurchasePrice(prod.variants[0].purchasePrice);
                    }
                  }}
                  className="h-11 w-full rounded-2xl border bg-background px-3 text-sm font-medium"
                >
                  {vendorProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Product Variant & SKU</Label>
                <select
                  aria-label="Product Variant & SKU"
                  value={selectedVariantId}
                  onChange={(e) => {
                    setSelectedVariantId(e.target.value);
                    const v = selectedProduct?.variants.find((x) => x.id === e.target.value);
                    if (v) setPurchasePrice(v.purchasePrice);
                  }}
                  className="h-11 w-full rounded-2xl border bg-background px-3 text-sm font-medium"
                >
                  {selectedProduct?.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} · {v.sku}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedVariant && (
              <div className="rounded-2xl border bg-muted/30 p-3.5 flex flex-wrap items-center justify-between text-xs">
                <div>Current Available Stock: <span className="font-bold text-success">{selectedVariant.availableStock} {selectedVariant.unitCode}</span></div>
                <div>Min Threshold: <span className="font-semibold">{selectedVariant.minStock} {selectedVariant.unitCode}</span></div>
                <div>Standard Unit: <span className="font-semibold">{selectedVariant.unitCode}</span></div>
              </div>
            )}
          </div>

          <div className="border-t pt-6 space-y-4">
            {/* Step 2: Quantity, Price & Batch */}
            <h3 className="text-base font-semibold flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs">2</span>
              Inbound Quantity & Batch Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Received Quantity ({selectedVariant?.unitCode || "Units"})</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="rounded-2xl font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Unit Purchase Cost (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="rounded-2xl font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Batch Number</Label>
                <Input
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. BAT-2026-081"
                  className="rounded-2xl font-mono uppercase"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Manufacturing Date</Label>
                <Input
                  type="date"
                  value={mfgDate}
                  onChange={(e) => setMfgDate(e.target.value)}
                  className="rounded-2xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Expiry / Best Before Date</Label>
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="rounded-2xl"
                  required
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            {/* Step 3: Warehouse & Storage */}
            <h3 className="text-base font-semibold flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs">3</span>
              Storage Location & Audit Documentation
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Target Warehouse Hub</Label>
                <select
                  aria-label="Target Warehouse Hub"
                  value={warehouseName}
                  onChange={(e) => setWarehouseName(e.target.value)}
                  className="h-11 w-full rounded-2xl border bg-background px-3 text-sm font-medium"
                >
                  <option value="Mumbai Central">Mumbai Central Fulfilment Hub</option>
                  <option value="Delhi North">Delhi North Logistics Center</option>
                  <option value="Bengaluru East">Bengaluru East Depot</option>
                  <option value="Pune Fulfilment">Pune Fulfilment Hub</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Storage Location (Zone · Rack · Bin)</Label>
                <Input
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  placeholder="e.g. Zone A · R01 · S02 · B05"
                  className="rounded-2xl font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Supplier Invoice / PO Reference</Label>
                <Input
                  value={supplierRef}
                  onChange={(e) => setSupplierRef(e.target.value)}
                  placeholder="e.g. PO-88412 or INV-9901"
                  className="rounded-2xl font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Inspection & Receiving Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="rounded-2xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button asChild variant="ghost" className="rounded-full">
              <Link to="/inventory/stock">Cancel</Link>
            </Button>
            <Button type="submit" disabled={submitting} className="rounded-full px-6">
              {submitting ? (
                <Loader2 className="size-4 mr-1.5 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4 mr-1.5" />
              )}
              {submitting ? "Processing..." : "Confirm Inbound Stock Receipt"}
            </Button>
          </div>
        </form>
      </div>
    </InventoryShell>
  );
}
