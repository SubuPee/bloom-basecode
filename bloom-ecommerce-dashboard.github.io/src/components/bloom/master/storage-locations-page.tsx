import { useState, useMemo } from "react";
import {
  Warehouse,
  Plus,
  Search,
  Building2,
  Boxes,
  CheckCircle2,
  AlertOctagon,
  Layers,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../app-shell";
import { PageHeader } from "../ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useVendorStore, vendorStore, StorageLocation } from "@/lib/bloom-vendor-store";
import { cn } from "@/lib/utils";

export function StorageLocationsPage() {
  const locations = useVendorStore((s) => s.getStorageLocations());
  const warehouses = useVendorStore((s) => s.getWarehouses());

  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || "");
  const [zone, setZone] = useState("ZA");
  const [rack, setRack] = useState("R01");
  const [shelf, setShelf] = useState("S01");
  const [bin, setBin] = useState("B01");
  const [capacity, setCapacity] = useState(250);

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchSearch =
        loc.code.toLowerCase().includes(search.toLowerCase()) ||
        loc.zone.toLowerCase().includes(search.toLowerCase()) ||
        loc.warehouseName.toLowerCase().includes(search.toLowerCase());

      const matchWarehouse =
        warehouseFilter === "All" || loc.warehouseId === warehouseFilter;

      const matchStatus =
        statusFilter === "All" || loc.status === statusFilter;

      return matchSearch && matchWarehouse && matchStatus;
    });
  }, [locations, search, warehouseFilter, statusFilter]);

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const wh = warehouses.find((w) => w.id === warehouseId);
    if (!wh) {
      toast.error("Please select a warehouse");
      return;
    }

    try {
      vendorStore.addStorageLocation({
        warehouseId: wh.id,
        warehouseName: wh.name,
        zone: zone.trim().toUpperCase(),
        rack: rack.trim().toUpperCase(),
        shelf: shelf.trim().toUpperCase(),
        bin: bin.trim().toUpperCase(),
        capacity: Number(capacity) || 100,
        status: "Available",
      });

      toast.success("Storage location bin created successfully");
      setIsModalOpen(false);
    } catch {
      toast.error("Failed to create storage location");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Warehouse Storage Locations & Bins"
          description="Hierarchical Zone-Rack-Shelf-Bin topography mapping, bin capacity utilization, and physical stock allocation."
          actions={
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="gap-2 bg-bloom-sage hover:bg-bloom-sage/90 text-white font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Storage Bin
            </Button>
          }
        />

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bloom-card p-5 border-l-4 border-bloom-sage flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Total Storage Bins</p>
              <p className="text-3xl font-bold text-foreground mt-1">{locations.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Across {warehouses.length} physical facilities</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-bloom-sage/10 text-bloom-sage flex items-center justify-center">
              <Warehouse className="h-6 w-6" />
            </div>
          </div>

          <div className="bloom-card p-5 border-l-4 border-emerald-500 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Available Bins</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">
                {locations.filter((l) => l.status === "Available").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Ready for inbound pallet storage</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          <div className="bloom-card p-5 border-l-4 border-amber-500 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Full / In-Use Bins</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">
                {locations.filter((l) => l.status === "Full").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">At maximum capacity threshold</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Boxes className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bloom-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex-1 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by location code, zone, or warehouse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
            >
              <option value="All">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Full">Full</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLocations.map((loc) => {
            const occupancyPercent =
              loc.capacity > 0 ? Math.round((loc.occupied / loc.capacity) * 100) : 0;

            return (
              <div
                key={loc.id}
                className="bloom-card p-5 space-y-3 hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                    {loc.code}
                  </span>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                      loc.status === "Available"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : loc.status === "Full"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                        : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                    )}
                  >
                    {loc.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground text-sm">{loc.warehouseName}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 font-mono">
                    <span>Zone {loc.zone}</span> • <span>Rack {loc.rack}</span> • <span>Shelf {loc.shelf}</span> • <span>Bin {loc.bin}</span>
                  </div>
                </div>

                {/* Occupancy bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Occupancy: {loc.occupied} / {loc.capacity} Units</span>
                    <span className="font-bold text-foreground">{occupancyPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        occupancyPercent >= 90
                          ? "bg-amber-500"
                          : occupancyPercent > 0
                          ? "bg-bloom-sage"
                          : "bg-muted-foreground/20"
                      )}
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Location Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-bloom-sage" />
                Configure Storage Bin Location
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateLocation} className="space-y-4 py-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Warehouse Facility
                </label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Zone (e.g. ZA)
                  </label>
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 font-mono uppercase outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Rack (e.g. R01)
                  </label>
                  <input
                    type="text"
                    value={rack}
                    onChange={(e) => setRack(e.target.value)}
                    className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 font-mono uppercase outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Shelf (e.g. S01)
                  </label>
                  <input
                    type="text"
                    value={shelf}
                    onChange={(e) => setShelf(e.target.value)}
                    className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 font-mono uppercase outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Bin (e.g. B01)
                  </label>
                  <input
                    type="text"
                    value={bin}
                    onChange={(e) => setBin(e.target.value)}
                    className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 font-mono uppercase outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Unit Storage Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 100)}
                  className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none"
                  required
                />
              </div>

              <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
                <span className="text-muted-foreground">Generated Bin Code:</span>
                <p className="font-mono font-bold text-foreground">
                  {warehouses.find((w) => w.id === warehouseId)?.name.slice(0, 3).toUpperCase()}-{zone.toUpperCase()}-{rack.toUpperCase()}-{shelf.toUpperCase()}-{bin.toUpperCase()}
                </p>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-bloom-sage hover:bg-bloom-sage/90 text-white gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Save Bin
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
