import { createFileRoute } from "@tanstack/react-router";
import { StockAdjustmentPage } from "@/components/bloom/inventory/stock-adjustment-page";

export const Route = createFileRoute("/inventory/adjustment")({
  head: () => ({
    meta: [
      { title: "Stock Adjustment — Bloom Admin" },
      { name: "description", content: "Adjust inventory counts for damages, expiry, and discrepancies." },
    ],
  }),
  component: StockAdjustmentPage,
});
