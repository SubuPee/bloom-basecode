import { useEffect, useState } from "react";
import {
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  CalendarDays,
  Star,
  Truck,
  Loader2,
} from "lucide-react";
import { Link, useParams } from "@tanstack/react-router";
import { DetailShell, InfoBlock } from "./detail-shell";
import { StatusBadge } from "./ui";
import { Button } from "@/components/ui/button";
import {
  customerApi,
  CustomerDetailData,
  CustomerOrderSummary,
} from "@/lib/customer-api";

export function CustomerDetail() {
  const { customerId } = useParams({ from: "/customers/$customerId" });
  const [customer, setCustomer] = useState<CustomerDetailData | null>(null);
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadCustomer() {
      try {
        setLoading(true);
        setError(null);
        const [custData, ordersData] = await Promise.allSettled([
          customerApi.getCustomerById(customerId),
          customerApi.getCustomerOrders(customerId),
        ]);

        if (!isMounted) return;

        if (custData.status === "fulfilled" && custData.value) {
          setCustomer(custData.value);
        } else {
          setError("Customer not found");
        }

        if (ordersData.status === "fulfilled" && Array.isArray(ordersData.value)) {
          setOrders(ordersData.value);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load customer profile");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCustomer();
    return () => {
      isMounted = false;
    };
  }, [customerId]);

  if (loading) {
    return (
      <DetailShell
        backTo="/customers"
        backLabel="customers"
        title="Loading Customer..."
        subtitle="Please wait"
      >
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </DetailShell>
    );
  }

  if (error || !customer) {
    return (
      <DetailShell
        backTo="/customers"
        backLabel="customers"
        title="Customer Not Found"
        subtitle={`ID: ${customerId}`}
      >
        <div className="bloom-card p-8 text-center">
          <p className="text-base font-medium">Unable to find customer details for "{customerId}".</p>
          <p className="mt-1 text-sm text-muted-foreground">The customer may not exist or has been removed.</p>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <Link to="/customers">Back to Customers</Link>
          </Button>
        </div>
      </DetailShell>
    );
  }

  const initials = customer.name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const history =
    orders.length > 0
      ? orders
      : customer.orderHistory && customer.orderHistory.length > 0
        ? customer.orderHistory
        : [];

  return (
    <DetailShell
      backTo="/customers"
      backLabel="customers"
      title={customer.name}
      subtitle={`${customer.id} · Customer since ${customer.joined}`}
      actions={
        <div className="flex items-center gap-3">
          <StatusBadge status={customer.status} />
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              window.location.href = `mailto:${customer.email}`;
            }}
          >
            <Mail className="mr-1 size-4" />
            Email customer
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_1.6fr]">
        <div className="space-y-5">
          <section className="bloom-card p-6">
            <div className="grid size-16 place-items-center rounded-full bg-blue-soft text-xl font-semibold text-blue">
              {initials}
            </div>
            <h2 className="mt-4 text-xl font-semibold">Contact details</h2>
            <div className="mt-5 space-y-4 text-sm">
              <p className="flex gap-3">
                <Mail className="size-4 text-muted-foreground" />
                {customer.email}
              </p>
              <p className="flex gap-3">
                <Phone className="size-4 text-muted-foreground" />
                {customer.phone || "+91 98765 41082"}
              </p>
              <p className="flex gap-3">
                <MapPin className="size-4 text-muted-foreground" />
                {customer.city ? `${customer.city}, India` : "India"}
              </p>
              <p className="flex gap-3">
                <CalendarDays className="size-4 text-muted-foreground" />
                Joined {customer.joined}
              </p>
            </div>
          </section>

          <section className="bloom-card p-6">
            <h2 className="text-lg font-semibold">Customer value</h2>
            <dl className="mt-5 grid grid-cols-2 gap-5">
              <InfoBlock label="Total spent" value={customer.spent} />
              <InfoBlock label="Orders" value={customer.orders} />
              <InfoBlock label="Segment" value={customer.segment} />
              <InfoBlock label="Average order" value={customer.averageOrderValue || "—"} />
            </dl>
          </section>

          <section className="bloom-card p-6">
            <h2 className="text-lg font-semibold">Preferences</h2>
            <div className="mt-5 space-y-4 text-sm">
              <p className="flex gap-3">
                <Truck className="size-4 text-muted-foreground" />
                {customer.preferences?.delivery || "Prefers standard delivery"}
              </p>
              <p className="flex gap-3">
                <Star className="size-4 text-muted-foreground" />
                Left {customer.preferences?.reviewsCount ?? 4} product reviews
              </p>
              <p className="flex gap-3">
                <ShoppingBag className="size-4 text-muted-foreground" />
                Favourite category: {customer.preferences?.favouriteCategory || "Electronics"}
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="bloom-card overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold">Order history</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Recent purchases and fulfillment status
              </p>
            </div>
            {history.length ? (
              history.map((o) => {
                const orderNum = o.orderNumber || o.id;
                return (
                  <Link
                    key={orderNum}
                    to="/orders/$orderId"
                    params={{ orderId: orderNum }}
                    className="grid grid-cols-[40px_1fr_auto] items-center gap-3 border-t p-4 transition hover:bg-accent/40"
                  >
                    <span className="grid size-10 place-items-center rounded-full bg-orange-soft text-orange">
                      <ShoppingBag className="size-4" />
                    </span>
                    <div>
                      <p className="font-medium">#{orderNum}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.date} · {o.items}
                        {o.products && o.products.length > 0 ? ` · ${o.products.join(", ")}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <strong className="text-sm">{o.total}</strong>
                      <p className="text-xs text-success">{o.status}</p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="border-t p-6 text-sm text-muted-foreground">
                No recent orders found for this customer.
              </p>
            )}
          </section>

          <section className="bloom-card p-6">
            <h2 className="text-lg font-semibold">Addresses</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <InfoBlock
                label="Shipping address"
                value={
                  <span className="text-sm font-normal leading-6 text-muted-foreground">
                    {customer.shippingAddress || customer.address || `${customer.city || "Mumbai"}, India`}
                    <br />
                    India
                  </span>
                }
              />
              <InfoBlock
                label="Billing address"
                value={
                  <span className="text-sm font-normal leading-6 text-muted-foreground">
                    {customer.billingAddress || customer.shippingAddress || customer.address || "Same as shipping address"}
                  </span>
                }
              />
            </div>
          </section>
        </div>
      </div>
    </DetailShell>
  );
}
