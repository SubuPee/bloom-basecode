import { useState, useMemo } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  Factory,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Package,
  Layers,
  ArrowLeft,
  Warehouse,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ProductionShell } from "./production-shell";
import { PageHeader } from "../ui";
import { Button } from "@/components/ui/button";
import { useVendorStore, vendorStore, RawMaterialItem } from "@/lib/bloom-vendor-store";
import { productionApi } from "@/lib/production-api";

export function CreateProductionPage() {
  const navigate = useNavigate();
  const vendors = useVendorStore((s) => s.getVendors());
  const products = useVendorStore((s) => s.getProducts());
  const warehouses = useVendorStore((s) => s.getWarehouses());
  const locations = useVendorStore((s) => s.getStorageLocations());

  // Form states
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || "");
  const vendorProducts = useMemo(
    () => products.filter((p) => p.vendorId === selectedVendorId),
    [products, selectedVendorId]
  );

  const [selectedProductId, setSelectedProductId] = useState(
    vendorProducts[0]?.id || products[0]?.id || ""
  );

  const currentProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId),
    [products, selectedProductId]
  );

  const [selectedVariantId, setSelectedVariantId] = useState(
    currentProduct?.variants[0]?.id || ""
  );

  const currentVariant = useMemo(
    () => currentProduct?.variants.find((v) => v.id === selectedVariantId),
    [currentProduct, selectedVariantId]
  );

  const [plannedQty, setPlannedQty] = useState(100);
  const [batchNumber, setBatchNumber] = useState(
    `BAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [productionDate, setProductionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [expectedCompletion, setExpectedCompletion] = useState(
    new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  );
  const [warehouseName, setWarehouseName] = useState(
    warehouses[0]?.name || "Central Fulfillment Hub"
  );
  const [storageLocation, setStorageLocation] = useState(
    locations[0]?.code || "A-01-S1-B01"
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Bill of Materials / Raw Materials
  const [rawMaterials, setRawMaterials] = useState<RawMaterialItem[]>([
    {
      id: "mat-1",
      name: "Primary Raw Packaging",
      requiredQuantity: 100,
      unit: "PCS",
      availableStock: 500,
    },
    {
      id: "mat-2",
      name: "Standard Glass / Poly Container",
      requiredQuantity: 100,
      unit: "PCS",
      availableStock: 800,
    },
    {
      id: "mat-3",
      name: "Tamper Proof Quality Seal",
      requiredQuantity: 100,
      unit: "PCS",
      availableStock: 1200,
    },
  ]);

  const [newMatName, setNewMatName] = useState("");
  const [newMatQty, setNewMatQty] = useState(50);
  const [newMatUnit, setNewMatUnit] = useState("PCS");

  const handleVendorChange = (vId: string) => {
    setSelectedVendorId(vId);
    const prods = products.filter((p) => p.vendorId === vId);
    if (prods.length > 0) {
      setSelectedProductId(prods[0]!.id);
      if (prods[0]!.variants.length > 0) {
        setSelectedVariantId(prods[0]!.variants[0]!.id);
      }
    }
  };

  const handleProductChange = (pId: string) => {
    setSelectedProductId(pId);
    const p = products.find((x) => x.id === pId);
    if (p && p.variants.length > 0) {
      setSelectedVariantId(p.variants[0]!.id);
    }
  };

  const addRawMaterial = () => {
    if (!newMatName.trim()) {
      toast.error("Enter raw material description");
      return;
    }
    const newItem: RawMaterialItem = {
      id: `mat-${Date.now()}`,
      name: newMatName.trim(),
      requiredQuantity: newMatQty,
      unit: newMatUnit,
      availableStock: newMatQty * 3,
    };
    setRawMaterials([...rawMaterials, newItem]);
    setNewMatName("");
    setNewMatQty(50);
  };

  const removeRawMaterial = (id: string) => {
    setRawMaterials(rawMaterials.filter((m) => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedVariantId) {
      toast.error("Please select a valid product and variant");
      return;
    }

    if (plannedQty <= 0) {
      toast.error("Planned quantity must be greater than 0");
      return;
    }

    const matchedWarehouse = warehouses.find((w) => w.name === warehouseName);
    const targetWarehouseId = matchedWarehouse?.id || "WH-01";

    setSubmitting(true);
    try {
      const order = await productionApi.createOrder({
        vendorId: selectedVendorId,
        productId: selectedProductId,
        variantId: selectedVariantId,
        unit: currentVariant?.unitCode || "PCS",
        plannedQuantity: plannedQty,
        rawMaterials: rawMaterials.map((m) => ({
          name: m.name,
          requiredQuantity: m.requiredQuantity,
          unit: m.unit,
        })),
        warehouseId: targetWarehouseId,
        storageLocation,
        batchNumber,
        expectedCompletion,
        notes,
      });

      // Synchronize in local memory store
      vendorStore.createProduction({
        vendorId: selectedVendorId,
        productId: selectedProductId,
        variantId: selectedVariantId,
        unit: currentVariant?.unitCode || "PCS",
        plannedQuantity: plannedQty,
        rawMaterials,
        productionDate,
        expectedCompletion,
        warehouseName,
        storageLocation,
        batchNumber,
        notes,
      });

      toast.success(
        `Production Order ${order.id} scheduled for ${plannedQty} ${order.unit}`
      );

      navigate({
        to: "/production/$productionId",
        params: { productionId: order.id },
      });
    } catch (err: any) {
      console.warn("Backend order creation error, using local store:", err);
      const localOrder = vendorStore.createProduction({
        vendorId: selectedVendorId,
        productId: selectedProductId,
        variantId: selectedVariantId,
        unit: currentVariant?.unitCode || "PCS",
        plannedQuantity: plannedQty,
        rawMaterials,
        productionDate,
        expectedCompletion,
        warehouseName,
        storageLocation,
        batchNumber,
        notes,
      });

      toast.success(
        `Production Order ${localOrder.id} scheduled for ${plannedQty} ${localOrder.unit}`
      );

      navigate({
        to: "/production/$productionId",
        params: { productionId: localOrder.id },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProductionShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/production/list">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Orders
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Schedule Production Work Order
            </h2>
            <p className="text-xs text-muted-foreground">
              Plan and configure raw material requirements, finished goods allocation, and batch tracing.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Work Order Configuration */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bloom-card p-6 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2 pb-2 border-b border-border">
                  <Factory className="h-4 w-4 text-bloom-sage" />
                  Manufacturing Order Setup
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Manufacturing Vendor
                    </label>
                    <select
                      value={selectedVendorId}
                      onChange={(e) => handleVendorChange(e.target.value)}
                      className="w-full mt-1.5 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
                    >
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.businessName} ({v.businessType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Product to Manufacture
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full mt-1.5 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
                    >
                      {vendorProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      SKU Variant & Spec
                    </label>
                    <select
                      value={selectedVariantId}
                      onChange={(e) => setSelectedVariantId(e.target.value)}
                      className="w-full mt-1.5 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
                    >
                      {currentProduct?.variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.sku}) — Available: {v.availableStock} {v.unitCode}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Planned Quantity ({currentVariant?.unitCode || "Units"})
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={plannedQty}
                      onChange={(e) => setPlannedQty(parseInt(e.target.value) || 0)}
                      className="w-full mt-1.5 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Target Batch Number
                    </label>
                    <input
                      type="text"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      className="w-full mt-1.5 bg-card border border-border rounded-lg text-sm px-3 py-2 font-mono outline-none focus:ring-1 focus:ring-bloom-sage"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Run Start Date
                    </label>
                    <input
                      type="date"
                      value={productionDate}
                      onChange={(e) => setProductionDate(e.target.value)}
                      className="w-full mt-1.5 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      value={expectedCompletion}
                      onChange={(e) => setExpectedCompletion(e.target.value)}
                      className="w-full mt-1.5 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Production Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Special festive packaging batch"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full mt-1.5 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
                    />
                  </div>
                </div>
              </div>

              {/* Bill of Materials / Raw Materials */}
              <div className="bloom-card p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4 text-bloom-sage" />
                    Bill of Materials (BOM) & Material Reservations
                  </h3>
                  <span className="text-xs text-muted-foreground font-medium">
                    {rawMaterials.length} components
                  </span>
                </div>

                <div className="space-y-2">
                  {rawMaterials.map((mat) => (
                    <div
                      key={mat.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
                    >
                      <div>
                        <p className="text-xs font-semibold text-foreground">{mat.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Available: {mat.availableStock} {mat.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-foreground">
                          {mat.requiredQuantity} {mat.unit} required
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRawMaterial(mat.id)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Material Row */}
                <div className="pt-2 border-t border-border flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Component / Material name"
                    value={newMatName}
                    onChange={(e) => setNewMatName(e.target.value)}
                    className="flex-1 bg-card border border-border rounded-lg text-xs px-3 py-2 outline-none"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={newMatQty}
                    onChange={(e) => setNewMatQty(parseInt(e.target.value) || 0)}
                    className="w-20 bg-card border border-border rounded-lg text-xs px-3 py-2 outline-none"
                  />
                  <select
                    value={newMatUnit}
                    onChange={(e) => setNewMatUnit(e.target.value)}
                    className="bg-card border border-border rounded-lg text-xs px-3 py-2 outline-none"
                  >
                    <option value="PCS">PCS</option>
                    <option value="KG">KG</option>
                    <option value="LTR">LTR</option>
                    <option value="BOX">BOX</option>
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRawMaterial}
                    className="h-8 gap-1 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Component
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Storage Allocation & Summary */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bloom-card p-6 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2 pb-2 border-b border-border">
                  <Warehouse className="h-4 w-4 text-bloom-sage" />
                  Finished Goods Allocation
                </h3>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Receiving Warehouse
                  </label>
                  <select
                    value={warehouseName}
                    onChange={(e) => setWarehouseName(e.target.value)}
                    className="w-full mt-1.5 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.name} ({w.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Storage Bin Location
                  </label>
                  <select
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    className="w-full mt-1.5 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.code}>
                        {l.code} ({l.zone})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Target:</span>
                    <strong className="text-foreground">{plannedQty} {currentVariant?.unitCode || "Units"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Batch Number:</span>
                    <strong className="font-mono text-foreground">{batchNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Destination:</span>
                    <strong className="text-foreground">{warehouseName} ({storageLocation})</strong>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-bloom-sage hover:bg-bloom-sage/90 text-white font-medium gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Scheduling Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Schedule Production Order
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </ProductionShell>
  );
}
