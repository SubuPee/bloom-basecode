import { createFileRoute } from "@tanstack/react-router";
import { ProductStockPage } from "@/components/bloom/inventory/product-stock-page";

export const Route = createFileRoute("/inventory/stock")({
  head: () => ({
    meta: [
      { title: "Product Stock Management — Bloom Admin" },
      { name: "description", content: "SKU variant stock levels, warehouse allocation, and batch tracing." },
    ],
  }),
  component: ProductStockPage,
});
