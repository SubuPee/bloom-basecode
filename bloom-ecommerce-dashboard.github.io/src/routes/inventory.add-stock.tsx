import { createFileRoute } from "@tanstack/react-router";
import { AddStockPage } from "@/components/bloom/inventory/add-stock-page";

export const Route = createFileRoute("/inventory/add-stock")({
  head: () => ({
    meta: [
      { title: "Inbound Stock Receipt — Bloom Admin" },
      { name: "description", content: "Receive and record inbound stock shipments into warehouses." },
    ],
  }),
  component: AddStockPage,
});
