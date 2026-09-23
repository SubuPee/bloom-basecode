import { createFileRoute } from "@tanstack/react-router";
import { VendorProductsPage } from "@/components/bloom/vendors/vendor-products-page";

export const Route = createFileRoute("/vendors/products")({
  head: () => ({
    meta: [
      { title: "Vendor Products — Bloom Admin" },
      { name: "description", content: "Multi-vendor catalog items and stock levels." },
    ],
  }),
  component: VendorProductsPage,
});
