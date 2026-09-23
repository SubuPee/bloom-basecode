import { createFileRoute } from "@tanstack/react-router";
import { LowStockPage } from "@/components/bloom/inventory/low-stock-page";

export const Route = createFileRoute("/inventory/low-stock")({
  head: () => ({
    meta: [
      { title: "Low Stock Alerts — Bloom Admin" },
      { name: "description", content: "Low inventory alerts and replenishment reorder levels." },
    ],
  }),
  component: LowStockPage,
});
