import { createFileRoute } from "@tanstack/react-router";
import { InventoryOverview } from "@/components/bloom/inventory/inventory-overview";

export const Route = createFileRoute("/inventory/")({
  head: () => ({
    meta: [
      { title: "Inventory Overview — Bloom Admin" },
      { name: "description", content: "Inventory management dashboard, stock health, and analytics." },
    ],
  }),
  component: InventoryOverview,
});
