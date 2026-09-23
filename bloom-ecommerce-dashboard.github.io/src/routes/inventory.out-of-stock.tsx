import { createFileRoute } from "@tanstack/react-router";
import { OutOfStockPage } from "@/components/bloom/inventory/out-of-stock-page";

export const Route = createFileRoute("/inventory/out-of-stock")({
  head: () => ({
    meta: [
      { title: "Out of Stock Items — Bloom Admin" },
      { name: "description", content: "Zero inventory items requiring immediate reorder or production." },
    ],
  }),
  component: OutOfStockPage,
});
