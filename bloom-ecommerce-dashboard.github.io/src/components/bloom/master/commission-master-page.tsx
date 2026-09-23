import { useState, useMemo } from "react";
import {
  Percent,
  Plus,
  Building2,
  Tag,
  CheckCircle2,
  TrendingUp,
  Layers,
  Sparkles,
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
import { useVendorStore, vendorStore, CommissionTier } from "@/lib/bloom-vendor-store";
import { cn } from "@/lib/utils";

export function CommissionMasterPage() {
  const commissions = useVendorStore((s) => s.getCommissions());
  const vendors = useVendorStore((s) => s.getVendors());

  const [simSales, setSimSales] = useState(10000);
  const [simRate, setSimRate] = useState(10);

  const simPlatformCommission = Math.round((simSales * simRate) / 100);
  const simVendorNet = simSales - simPlatformCommission;

  // Add Tier Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ruleType, setRuleType] = useState<"Default" | "Category" | "Vendor">("Category");
  const [targetName, setTargetName] = useState("");
  const [rate, setRate] = useState(10);
  const [threshold, setThreshold] = useState(0);

  const handleCreateTier = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Commission rule for ${targetName || ruleType} (${rate}%) established`);
    setIsModalOpen(false);
    setTargetName("");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Vendor Commission & Fee Structure"
          description="Configure global default marketplace rates, category fee tiers, vendor-specific overrides, and volume slabs."
          actions={
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="gap-2 bg-bloom-sage hover:bg-bloom-sage/90 text-white font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Commission Rule
            </Button>
          }
        />

        {/* Live Simulation Calculator */}
        <div className="bloom-card p-6 border-l-4 border-bloom-sage bg-gradient-to-r from-bloom-sage/5 via-transparent to-transparent">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
            <Percent className="h-5 w-5 text-bloom-sage" />
            <h3 className="font-semibold text-foreground">Live Commission Split Simulator</h3>
            <span className="text-xs bg-bloom-sage/10 text-bloom-sage font-medium px-2 py-0.5 rounded-full ml-auto">
              Real-time Payout Forecast
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Gross Order Value (₹)
              </label>
              <input
                type="number"
                value={simSales}
                onChange={(e) => setSimSales(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Commission Rate (%)
              </label>
              <input
                type="number"
                value={simRate}
                onChange={(e) => setSimRate(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
              />
            </div>

            <div className="p-3 bg-card rounded-xl border border-border shadow-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-semibold">Platform Revenue</span>
              <p className="text-lg font-bold text-bloom-sage mt-0.5 font-mono">
                ₹{simPlatformCommission.toLocaleString()}
              </p>
            </div>

            <div className="p-3 bg-card rounded-xl border border-border shadow-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-semibold">Vendor Net Payable</span>
              <p className="text-lg font-bold text-foreground mt-0.5 font-mono">
                ₹{simVendorNet.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Active Commission Rules Table */}
        <div className="bloom-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-bloom-sage" />
              Standard Platform Commission Tiers
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              {commissions.length} active tiers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Rule Name</th>
                  <th className="py-3 px-4">Applies To</th>
                  <th className="py-3 px-4 text-center">Commission Rate</th>
                  <th className="py-3 px-4">Sales Slab Threshold</th>
                  <th className="py-3 px-4">Settlement Cycle</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {commissions.map((comm) => (
                  <tr key={comm.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {comm.name}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted font-medium">
                        <Tag className="h-3 w-3" />
                        {comm.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-xs text-bloom-sage">
                      {comm.rate}%
                    </td>

                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                      {comm.fixedFee > 0 ? `+₹${comm.fixedFee} fixed fee` : "Standard rate"}
                    </td>

                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      Weekly on Friday
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                          comm.status === "Active"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {comm.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendor Overrides Overview */}
        <div className="bloom-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-bloom-sage" />
              Vendor-Specific Rate Overrides
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              {vendors.length} vendors monitored
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="p-4 rounded-xl border border-border bg-card/60 hover:bg-card hover:shadow-xs transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{vendor.businessName}</h4>
                  <p className="text-xs text-muted-foreground">{vendor.businessType}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-base font-bold text-bloom-sage">
                    {vendor.commissionRate}%
                  </span>
                  <p className="text-[10px] text-muted-foreground">Commission</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Tier Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-bloom-sage" />
                Configure Commission Fee Tier
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateTier} className="space-y-4 py-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Rule Target Scope
                </label>
                <select
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value as any)}
                  className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
                >
                  <option value="Category">Category Rule</option>
                  <option value="Vendor">Vendor Override</option>
                  <option value="Default">Global Default</option>
                </select>
              </div>

              {ruleType !== "Default" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    {ruleType === "Category" ? "Category Name" : "Select Vendor"}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      ruleType === "Category"
                        ? "e.g. Gourmet Foods, Organic Tea"
                        : "e.g. Pure Honey Farms"
                    }
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Commission Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Volume Threshold (₹ min sales)
                </label>
                <input
                  type="number"
                  min="0"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
                  className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none"
                />
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
                  Save Commission Rule
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
