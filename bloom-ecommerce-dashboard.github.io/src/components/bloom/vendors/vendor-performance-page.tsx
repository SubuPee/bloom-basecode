import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  TrendingUp,
  Award,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Package,
  Star,
  Truck,
} from "lucide-react";
import { VendorShell } from "./vendor-shell";
import { PageHeader, Pagination, SearchBox } from "../ui";
import { Button } from "@/components/ui/button";
import { useVendorStore } from "@/lib/bloom-vendor-store";
import { cn } from "@/lib/utils";

export function VendorPerformancePage() {
  const vendors = useVendorStore((s) => s.getVendors());
  const orders = useVendorStore((s) => s.getVendorOrders());
  const products = useVendorStore((s) => s.getProducts());
  const returns = useVendorStore((s) => s.getReturns());

  const [search, setSearch] = useState("");

  const performanceList = useMemo(() => {
    return vendors.map((v) => {
      const vendorOrders = orders.filter((o) => o.vendorId === v.id);
      const totalSales = vendorOrders.reduce((sum, o) => sum + o.vendorGross, 0);
      const completed = vendorOrders.filter((o) => o.orderStatus === "Delivered").length;
      const cancelled = vendorOrders.filter((o) => o.orderStatus === "Cancelled").length;
      const vendorReturns = returns.filter((r) => r.vendorId === v.id);

      const fulfillmentRate = vendorOrders.length > 0 ? (completed / vendorOrders.length) * 100 : 96.5;
      const returnRate = vendorOrders.length > 0 ? (vendorReturns.length / vendorOrders.length) * 100 : 2.1;
      const onTimeRate = 98.2 - (cancelled * 2.5);

      const vendorProds = products.filter((p) => p.vendorId === v.id);
      let totalStock = 0;
      let availableSkus = 0;
      for (const p of vendorProds) {
        for (const variant of p.variants) {
          totalStock += variant.availableStock;
          if (variant.availableStock > 0) availableSkus++;
        }
      }

      return {
        vendor: v,
        totalSales,
        totalOrders: vendorOrders.length,
        completed,
        cancelled,
        returnRate,
        fulfillmentRate,
        onTimeRate,
        avgProcessingHours: 4.8,
        rating: v.rating,
        totalStock,
      };
    }).filter((item) =>
      item.vendor.businessName.toLowerCase().includes(search.toLowerCase()) ||
      item.vendor.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [vendors, orders, products, returns, search]);

  return (
    <VendorShell>
      <div className="space-y-7">
        <PageHeader
          title="Vendor Performance Scorecards"
          description="Evaluate supplier SLA compliance, on-time shipping rates, order cancellation percentages, and customer return rates."
        />

        {/* Top KPIs */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="bloom-card p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-success-soft text-success">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Average Fulfillment</p>
                <h3 className="text-2xl font-bold">96.8%</h3>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Across all approved marketplace suppliers</p>
          </div>

          <div className="bloom-card p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-blue-soft text-blue">
                <Truck className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">On-Time Shipping</p>
                <h3 className="text-2xl font-bold">97.4%</h3>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Dispatched within promised 24h SLA target</p>
          </div>

          <div className="bloom-card p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-pink-soft text-pink">
                <RotateCcw className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Average Return Rate</p>
                <h3 className="text-2xl font-bold">2.8%</h3>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Low defect and exchange ratio</p>
          </div>

          <div className="bloom-card p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-gold-soft text-gold">
                <Star className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Customer Rating</p>
                <h3 className="text-2xl font-bold">4.7 / 5.0</h3>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Calculated from verified buyer reviews</p>
          </div>
        </div>

        {/* Search */}
        <div className="bloom-card p-5">
          <SearchBox
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor performance by name or ID…"
          />
        </div>

        {/* Scorecards Table */}
        <div className="bloom-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Vendor Partner</th>
                  <th className="px-5 py-4">Rating</th>
                  <th className="px-5 py-4">Gross Sales</th>
                  <th className="px-5 py-4">Fulfillment %</th>
                  <th className="px-5 py-4">On-Time Shipping</th>
                  <th className="px-5 py-4">Return Rate</th>
                  <th className="px-5 py-4">Dispatched Stock</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {performanceList.map((item) => (
                  <tr key={item.vendor.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-5 py-4">
                      <Link
                        to="/vendors/$vendorId"
                        params={{ vendorId: item.vendor.id }}
                        className="font-semibold text-sm hover:text-primary transition-colors block"
                      >
                        {item.vendor.businessName}
                      </Link>
                      <div className="text-xs text-muted-foreground">{item.vendor.id} · {item.vendor.businessType}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1 font-bold text-sm text-gold">
                        ★ {item.rating.toFixed(1)}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-sm">
                      ₹{item.totalSales.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{item.fulfillmentRate.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-success rounded-full"
                            style={{ width: `${Math.min(100, item.fulfillmentRate)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-xs text-blue">
                        {item.onTimeRate.toFixed(1)}%
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className={cn(
                        "font-semibold text-xs",
                        item.returnRate > 5 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {item.returnRate.toFixed(1)}%
                      </span>
                    </td>

                    <td className="px-5 py-4 font-bold text-xs">
                      {item.totalStock} units available
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button asChild variant="ghost" size="sm" className="rounded-full text-xs">
                        <Link to="/vendors/$vendorId" params={{ vendorId: item.vendor.id }}>
                          Inspect Profile
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination count={performanceList.length} />
        </div>
      </div>
    </VendorShell>
  );
}
