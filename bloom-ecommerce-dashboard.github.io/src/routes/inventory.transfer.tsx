import { createFileRoute } from "@tanstack/react-router";
import { StockTransferPage } from "@/components/bloom/inventory/stock-transfer-page";

export const Route = createFileRoute("/inventory/transfer")({
  head: () => ({
    meta: [
      { title: "Stock Transfers — Bloom Admin" },
      { name: "description", content: "Inter-warehouse and inter-bin stock transfers and in-transit tracking." },
    ],
  }),
  component: StockTransferPage,
});
