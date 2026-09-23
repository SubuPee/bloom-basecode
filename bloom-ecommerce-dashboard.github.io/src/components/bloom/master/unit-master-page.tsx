import { useState, useMemo } from "react";
import {
  Scale,
  Plus,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Edit2,
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
import { useVendorStore, vendorStore, UnitRecord, UnitType } from "@/lib/bloom-vendor-store";
import { cn } from "@/lib/utils";

export function UnitMasterPage() {
  const units = useVendorStore((s) => s.getUnits());

  // Interactive Calculator State
  const [calcValue, setCalcValue] = useState(1);
  const [calcFrom, setCalcFrom] = useState("KG");
  const [calcTo, setCalcTo] = useState("Gram");

  const calcResult = useMemo(() => {
    return vendorStore.convertUnits(calcValue, calcFrom, calcTo);
  }, [calcValue, calcFrom, calcTo, units]);

  // Modal State for Add Unit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [unitType, setUnitType] = useState<UnitType>("Weight");
  const [baseUnit, setBaseUnit] = useState("Gram");
  const [conversionValue, setConversionValue] = useState(1000);

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim() || !unitCode.trim()) {
      toast.error("Unit name and code are required");
      return;
    }

    try {
      vendorStore.addUnit(
        {
          name: unitName.trim(),
          code: unitCode.trim().toUpperCase(),
          unitType,
          baseUnit: baseUnit.trim() || undefined,
          conversionValue: Number(conversionValue) || 1,
          status: "Active",
        },
        "Catalog Admin"
      );

      toast.success(`Unit ${unitCode.toUpperCase()} (${unitName}) created successfully`);
      setIsModalOpen(false);
      setUnitName("");
      setUnitCode("");
      setConversionValue(1);
    } catch {
      toast.error("Failed to create unit");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Unit Master & Conversion Matrix"
          description="Standardized measurement units, multi-tier base unit ratios, conversion rules, and real-time calculation engine."
          actions={
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="gap-2 bg-bloom-sage hover:bg-bloom-sage/90 text-white font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Measurement Unit
            </Button>
          }
        />

        {/* Live Conversion Calculator */}
        <div className="bloom-card p-6 border-l-4 border-bloom-sage bg-gradient-to-r from-bloom-sage/5 via-transparent to-transparent">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
            <Calculator className="h-5 w-5 text-bloom-sage" />
            <h3 className="font-semibold text-foreground">Interactive Unit Conversion Engine</h3>
            <span className="text-xs bg-bloom-sage/10 text-bloom-sage font-medium px-2 py-0.5 rounded-full ml-auto">
              Real-time Formula Test
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Value to Convert</label>
              <input
                type="number"
                value={calcValue}
                onChange={(e) => setCalcValue(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">From Unit</label>
              <select
                value={calcFrom}
                onChange={(e) => setCalcFrom(e.target.value)}
                className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.code}>
                    {u.name} ({u.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">To Unit</label>
              <select
                value={calcTo}
                onChange={(e) => setCalcTo(e.target.value)}
                className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.code}>
                    {u.name} ({u.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-card rounded-xl border border-border shadow-xs flex flex-col justify-center">
              <span className="text-[11px] text-muted-foreground uppercase font-semibold">Calculated Result</span>
              <p className="text-lg font-bold text-foreground mt-0.5 font-mono">
                {calcResult.toLocaleString()} <span className="text-bloom-sage text-sm font-sans">{calcTo}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Units Matrix Table */}
        <div className="bloom-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Scale className="h-4 w-4 text-bloom-sage" />
              Registered Catalog & Production Units
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              {units.length} defined units
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Unit Name</th>
                  <th className="py-3 px-4">Code / Symbol</th>
                  <th className="py-3 px-4">Dimension Type</th>
                  <th className="py-3 px-4">Base Unit</th>
                  <th className="py-3 px-4 text-center">Conversion Multiplier</th>
                  <th className="py-3 px-4">Equivalence Formula</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {unit.name}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-muted rounded border border-border">
                        {unit.code}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-xs text-muted-foreground font-medium">
                        {unit.unitType}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                      {unit.baseUnit || "Standard Base"}
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-semibold text-xs">
                      {unit.conversionValue}
                    </td>

                    <td className="py-3 px-4 text-xs text-muted-foreground font-mono">
                      {unit.baseUnit && unit.baseUnit !== unit.code ? (
                        <span>
                          1 {unit.code} = {unit.conversionValue} {unit.baseUnit}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">1 : 1 Primary Reference</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                          unit.status === "Active"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {unit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Unit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-bloom-sage" />
                Define Measurement Unit
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateUnit} className="space-y-4 py-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Unit Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kilogram, Metric Tonne"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Unit Code / Symbol
                </label>
                <input
                  type="text"
                  placeholder="e.g. KG, MT, LTR"
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                  className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 font-mono uppercase outline-none focus:ring-1 focus:ring-bloom-sage"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Dimension Category
                </label>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value as UnitType)}
                  className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none"
                >
                  <option value="Weight">Weight</option>
                  <option value="Volume">Volume</option>
                  <option value="Quantity">Quantity / Discrete Count</option>
                  <option value="Length">Length</option>
                  <option value="Area">Area</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Base Reference Unit
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gram for Weight, ML for Volume"
                  value={baseUnit}
                  onChange={(e) => setBaseUnit(e.target.value)}
                  className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Conversion Value (in base units)
                </label>
                <input
                  type="number"
                  min="0.0001"
                  step="any"
                  value={conversionValue}
                  onChange={(e) => setConversionValue(parseFloat(e.target.value) || 1)}
                  className="w-full mt-1 bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none"
                  required
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  e.g. If 1 {unitCode || "Unit"} = 1000 {baseUnit || "Base"}, enter 1000.
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
                  Save Unit
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
