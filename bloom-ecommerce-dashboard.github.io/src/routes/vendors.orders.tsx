import { createFileRoute } from "@tanstack/react-router";
import { VendorOrdersPage } from "@/components/bloom/vendors/vendor-orders-page";

export const Route = createFileRoute("/vendors/orders")({
  head: () => ({
    meta: [
      { title: "Vendor Orders — Bloom Admin" },
      { name: "description", content: "Vendor fulfillment orders and line items." },
    ],
  }),
  component: VendorOrdersPage,
});
