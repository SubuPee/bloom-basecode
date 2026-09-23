import { createFileRoute } from "@tanstack/react-router";
import { StockMovementsPage } from "@/components/bloom/inventory/stock-movements-page";

export const Route = createFileRoute("/inventory/movements")({
  head: () => ({
    meta: [
      { title: "Stock Movements — Bloom Admin" },
      { name: "description", content: "Inventory movements, inward receipts, and outward dispatches." },
    ],
  }),
  component: StockMovementsPage,
});
