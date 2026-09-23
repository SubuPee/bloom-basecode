import { createFileRoute } from "@tanstack/react-router";
import { ProductsPage } from "@/components/bloom/products-page";
export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Products — Bloom Admin" },
      { name: "description", content: "Manage the Bloom product catalog." },
      { property: "og:title", content: "Products — Bloom Admin" },
      { property: "og:description", content: "Manage the Bloom product catalog." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
});
