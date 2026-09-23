import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ShoppingCart,
  Truck,
  Eye,
  CheckCircle2,
  Clock,
  RotateCcw,
  Building2,
  MapPin,
  Calendar,
  Layers,
  ChevronDown,
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
import {
  useVendorStore,
  vendorStore,
  type VendorOrder,
  type VendorOrderStatus,
} from "@/lib/bloom-vendor-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ALL_STATUSES: VendorOrderStatus[] = [
  "New",
  "Confirmed",
  "Processing",
  "Ready to Ship",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
  "Refunded",
];

export function VendorOrdersPage() {
  const orders = useVendorStore((s) => s.getVendorOrders());
  const vendors = useVendorStore((s) => s.getVendors());

  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [inspectOrder, setInspectOrder] = useState<VendorOrder | null>(null);
  const [newStatus, setNewStatus] = useState<VendorOrderStatus>("Confirmed");

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.vendorName.toLowerCase().includes(search.toLowerCase());
      const matchVendor = vendorFilter === "All" || o.vendorId === vendorFilter;
      const matchStatus = statusFilter === "All" || o.orderStatus === statusFilter;
      return matchSearch && matchVendor && matchStatus;
    });
  }, [orders, search, vendorFilter, statusFilter]);

  function handleStatusUpdate() {
    if (!inspectOrder) return;
    vendorStore.updateOrderStatus(inspectOrder.id, newStatus);
    toast.success(`Order #${inspectOrder.orderNumber} status updated to ${newStatus}. Inventory adjusted.`);
    setInspectOrder(null);
  }

  return (
    <VendorShell>
      <div className="space-y-7">
        <PageHeader
          title="Vendor Order Allocation & Fulfillment"
          description="Manage supplier-assigned orders, track reserved inventory, and supervise delivery milestones."
          action={
            <div className="flex gap-2.5">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/vendors/returns">
                  <RotateCcw className="size-4" />
                  Return Requests
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
              placeholder="Search by Order #, Customer, or Vendor Name…"
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
              <option value="All">All Order Statuses</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
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

        {/* Orders Table */}
        <div className="bloom-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Order # & Date</th>
                  <th className="px-5 py-4">Customer Details</th>
                  <th className="px-5 py-4">Vendor Partner</th>
                  <th className="px-5 py-4">Products / Qty</th>
                  <th className="px-5 py-4">Total Amount</th>
                  <th className="px-5 py-4">Vendor Net</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-5 py-4 font-mono">
                      <div className="font-bold text-primary text-sm">{order.orderNumber}</div>
                      <div className="text-xs text-muted-foreground">{order.date}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-sm">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.shippingAddress}</div>
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to="/vendors/$vendorId"
                        params={{ vendorId: order.vendorId }}
                        className="font-medium text-xs hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        <Building2 className="size-3.5 text-muted-foreground" />
                        {order.vendorName}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-xs">
                      <div className="font-medium">
                        {order.items.map((i) => i.productName).join(", ")}
                      </div>
                      <div className="text-muted-foreground mt-0.5">
                        {order.totalQuantity} items total
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold text-sm">
                      ₹{order.grossAmount.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 font-bold text-success text-sm">
                      ₹{order.vendorEarnings.toFixed(2)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          order.paymentStatus === "Paid"
                            ? "bg-success-soft text-success"
                            : order.paymentStatus === "Pending"
                              ? "bg-orange-soft text-orange"
                              : "bg-destructive/15 text-destructive",
                        )}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={order.orderStatus} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-xs"
                        onClick={() => {
                          setInspectOrder(order);
                          setNewStatus(order.orderStatus);
                        }}
                      >
                        Manage Status
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

      {/* Order Details & Status Updater Modal */}
      <Dialog open={!!inspectOrder} onOpenChange={(open) => !open && setInspectOrder(null)}>
        <DialogContent className="rounded-3xl max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order #{inspectOrder?.orderNumber} · Status & Inventory Impact</DialogTitle>
            <DialogDescription>
              Placed on {inspectOrder?.date} · Assigned to {inspectOrder?.vendorName}
            </DialogDescription>
          </DialogHeader>

          {inspectOrder && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-4 rounded-2xl border bg-muted/30 p-4">
                <div>
                  <p className="text-xs uppercase text-muted-foreground font-semibold">Customer Details</p>
                  <p className="font-semibold text-sm mt-1">{inspectOrder.customerName}</p>
                  <p className="text-xs text-muted-foreground">{inspectOrder.customerEmail}</p>
                  <p className="text-xs text-muted-foreground">{inspectOrder.customerPhone}</p>
                  <p className="text-xs text-muted-foreground mt-1">{inspectOrder.shippingAddress}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground font-semibold">Financial Breakdown</p>
                  <div className="text-xs space-y-1 mt-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Total:</span>
                      <span className="font-semibold">₹{inspectOrder.grossAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform Fee:</span>
                      <span className="text-destructive">-₹{inspectOrder.commissionAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 font-bold">
                      <span>Vendor Payable:</span>
                      <span className="text-success">₹{inspectOrder.vendorEarnings.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase text-muted-foreground font-semibold mb-2">Order Line Items</p>
                <div className="space-y-2">
                  {inspectOrder.items.map((item) => (
                    <div key={item.sku} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold">{item.productName}</span>
                        <span className="text-muted-foreground font-mono ml-2">({item.sku})</span>
                      </div>
                      <div>
                        {item.quantity} × ₹{item.unitPrice} = <span className="font-bold">₹{item.totalPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update Control */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                <p className="font-semibold text-xs uppercase text-primary">Transition Order Lifecycle Status</p>
                <div className="flex items-center gap-3">
                  <select
                    aria-label="Order Lifecycle Status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as VendorOrderStatus)}
                    className="h-10 rounded-xl border bg-background px-3 text-sm flex-1 font-medium"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  * Note: Advancing to <strong>Shipped</strong> automatically deducts reserved warehouse inventory and creates immutable stock movements. Marking as <strong>Cancelled</strong> restores available stock.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setInspectOrder(null)}>
              Cancel
            </Button>
            <Button className="rounded-full" onClick={handleStatusUpdate}>
              Save Status Transition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </VendorShell>
  );
}
