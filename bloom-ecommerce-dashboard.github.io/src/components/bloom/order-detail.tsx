import { useEffect, useState } from "react";
import {
  CreditCard,
  MapPin,
  PackageCheck,
  Truck,
  UserRound,
  Printer,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Link, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { DetailShell, InfoBlock } from "./detail-shell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ordersApi, OrderDetailData } from "@/lib/orders-api";
import { productByName } from "@/lib/bloom-lookup";
import { imageForProduct } from "@/lib/product-images";

export function OrderDetail() {
  const { orderId } = useParams({ from: "/orders/$orderId" });
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadOrder() {
      try {
        setLoading(true);
        setError(null);
        const data = await ordersApi.getOrderById(orderId);
        if (isMounted) setOrder(data);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load order details");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const handleStatusChange = async (newStatus: "Processing" | "Shipped" | "Delivered" | "Returned" | "Cancelled") => {
    if (!order) return;
    try {
      setUpdating(true);
      const updated = await ordersApi.updateOrderStatus(order.id || order.orderNumber, newStatus);
      setOrder(updated);
      toast.success(`Fulfillment status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintInvoice = async () => {
    if (!order) return;
    try {
      await ordersApi.getOrderInvoice(order.id || order.orderNumber);
      window.print();
    } catch (err: any) {
      toast.error(err.message || "Failed to generate invoice");
    }
  };

  if (loading) {
    return (
      <DetailShell backTo="/orders" backLabel="orders" title="Loading Order..." subtitle="Please wait">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </DetailShell>
    );
  }

  if (error || !order) {
    return (
      <DetailShell backTo="/orders" backLabel="orders" title="Order Not Found" subtitle={`#${orderId}`}>
        <div className="bloom-card p-8 text-center">
          <p className="text-base font-medium">Unable to find order details for "#{orderId}".</p>
          <p className="mt-1 text-sm text-muted-foreground">The order may not exist or has been removed.</p>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <Link to="/orders">Back to Orders</Link>
          </Button>
        </div>
      </DetailShell>
    );
  }

  // Build line items combining real order items or catalog matches
  const lineItems =
    order.itemsList && order.itemsList.length > 0
      ? order.itemsList.map((item) => {
          const match = productByName(item.productName);
          return {
            name: item.productName,
            quantity: item.quantity || 1,
            price: item.unitPrice || (match ? match.product[4] : 0),
            sku: item.sku || (match ? match.product[0] : "PRD-ITEM"),
            category: item.category || (match ? match.product[2] : "General"),
            brand: match ? match.product[3] : "Bloom",
            stock: match ? match.product[6] : 24,
            productId: match ? match.productId : item.productId,
            index: match ? match.index : 0,
            image: item.image,
          };
        })
      : (order.products || ["Wireless Headphones"]).map((name) => {
          const match = productByName(name);
          return {
            name,
            quantity: 1,
            price: match ? match.product[4] : 2499,
            sku: match ? match.product[0] : "PRD-ITEM",
            category: match ? match.product[2] : "General",
            brand: match ? match.product[3] : "Bloom",
            stock: match ? match.product[6] : 24,
            productId: match ? match.productId : undefined,
            index: match ? match.index : 0,
            image: undefined,
          };
        });

  const subtotal =
    order.subtotal ||
    lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const displayOrderNum = order.orderNumber || order.id;

  return (
    <DetailShell
      backTo="/orders"
      backLabel="orders"
      title={`#${displayOrderNum}`}
      subtitle={`Placed ${order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Recently"} · ${order.items || `${lineItems.length} items`} · ${order.status}`}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full" onClick={handlePrintInvoice}>
            <Printer className="mr-1 size-4" />
            Invoice
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={updating}>
                {updating ? (
                  <Loader2 className="mr-1 size-4 animate-spin" />
                ) : (
                  <Truck className="mr-1 size-4" />
                )}
                Update status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl">
              {(["Processing", "Shipped", "Delivered", "Returned", "Cancelled"] as const).map(
                (st) => (
                  <DropdownMenuItem
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={order.status === st ? "font-semibold text-primary" : ""}
                  >
                    {order.status === st && <CheckCircle2 className="mr-2 size-4" />}
                    {st}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <section className="bloom-card overflow-hidden">
            <div className="flex items-center justify-between p-6">
              <h2 className="text-lg font-semibold">Items</h2>
              <span className="text-xs text-muted-foreground">{lineItems.length} products</span>
            </div>
            {lineItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 border-t p-5">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    width={816}
                    height={816}
                    loading="lazy"
                    className="size-14 rounded-2xl object-cover"
                  />
                ) : item.sku ? (
                  <img
                    src={imageForProduct(item.sku, item.index)}
                    alt={item.name}
                    width={816}
                    height={816}
                    loading="lazy"
                    className="size-14 rounded-2xl object-cover"
                  />
                ) : (
                  <span className="grid size-14 place-items-center rounded-2xl bg-blue-soft text-blue">
                    <PackageCheck />
                  </span>
                )}
                <div className="flex-1">
                  {item.productId ? (
                    <Link
                      to="/products/$productId"
                      params={{ productId: item.productId }}
                      className="font-medium hover:text-blue"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <p className="font-medium">{item.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {item.sku} · {item.category} · {item.brand} · Qty {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
                  <p className="text-xs text-muted-foreground">{item.stock} in stock</p>
                </div>
                {item.productId && (
                  <Button asChild variant="ghost" size="icon" className="bloom-icon-button">
                    <Link
                      to="/products/$productId"
                      params={{ productId: item.productId }}
                      aria-label={`View ${item.name}`}
                    >
                      <ArrowUpRight />
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </section>

          <section className="bloom-card p-6">
            <h2 className="text-lg font-semibold">Fulfillment timeline</h2>
            <div className="mt-6 space-y-5">
              {order.timeline && order.timeline.length > 0 ? (
                order.timeline.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="grid size-8 place-items-center rounded-full bg-success-soft text-success text-xs font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{step.step}</p>
                      <p className="text-xs text-muted-foreground">
                        {step.date || "18 September 2026"} · {step.time || "10:42"}
                        {step.notes ? ` — ${step.notes}` : ""}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                [
                  "Order confirmed",
                  "Payment received",
                  "Packed at Mumbai Central",
                  order.status,
                ].map((step, index) => (
                  <div key={step} className="flex gap-3">
                    <span className="grid size-8 place-items-center rounded-full bg-success-soft text-success text-xs font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{step}</p>
                      <p className="text-xs text-muted-foreground">
                        18 September 2026 · {["10:42", "10:43", "13:20", "18:05"][index]}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="bloom-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Customer</h2>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link to="/customers">
                  <UserRound className="mr-1 size-4" />
                  Profile
                </Link>
              </Button>
            </div>
            <dl className="mt-5 space-y-5">
              <InfoBlock label="Name" value={order.customer} />
              <InfoBlock label="Email" value={order.email || `${order.customer.toLowerCase().replace(/\s+/g, ".")}@example.com`} />
              <InfoBlock label="Phone" value={order.phone || "+91 98765 41082"} />
              <InfoBlock
                label="Segment"
                value={`${order.customerSegment || "VIP"} · 6 lifetime orders`}
              />
              <InfoBlock
                label="Shipping address"
                value={
                  <span className="flex gap-2">
                    <MapPin className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
                    <span>{order.shippingAddress || order.address || "Bandra West, Mumbai"}</span>
                  </span>
                }
              />
            </dl>
          </section>

          <section className="bloom-card p-6">
            <h2 className="font-semibold">Payment summary</h2>
            <dl className="mt-5 space-y-4">
              <InfoBlock
                label="Payment"
                value={
                  <span className="flex gap-2 text-success font-medium">
                    <CreditCard className="size-4" />
                    {order.payment} {order.paymentMethod ? `via ${order.paymentMethod}` : ""}
                  </span>
                }
              />
              <InfoBlock
                label="Items subtotal"
                value={`₹${subtotal.toLocaleString("en-IN")}`}
              />
              <InfoBlock
                label="Shipping"
                value={order.shippingFee ? `₹${order.shippingFee.toLocaleString("en-IN")}` : "Free"}
              />
              <InfoBlock label="Order total" value={order.total || `₹${(order.totalAmount || subtotal).toLocaleString("en-IN")}`} />
              <InfoBlock label="Fulfillment" value={order.status} />
            </dl>
          </section>
        </aside>
      </div>
    </DetailShell>
  );
}
