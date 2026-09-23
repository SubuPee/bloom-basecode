import { createFileRoute } from "@tanstack/react-router";
import { ProductEditor } from "@/components/bloom/product-editor";
export const Route = createFileRoute("/products/new")({
  head: () => ({
    meta: [
      { title: "Add Product — Bloom Admin" },
      { name: "description", content: "Create a product in Bloom." },
      { property: "og:title", content: "Add Product — Bloom Admin" },
      { property: "og:description", content: "Create a product in Bloom." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ProductEditor />,
});
