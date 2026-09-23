import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/components/bloom/reports/reports-page";

export const Route = createFileRoute("/reports/orders")({
  head: () => ({
    meta: [
      { title: "Vendor Orders Report — Bloom Admin" },
      { name: "description", content: "Vendor fulfillment orders, order items, and status tracking." },
    ],
  }),
  component: () => <ReportsPage category="orders" />,
});
