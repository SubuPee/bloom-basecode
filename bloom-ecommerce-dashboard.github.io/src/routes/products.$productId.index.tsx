import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/bloom/product-detail";
export const Route = createFileRoute("/products/$productId/")({
  head: () => ({
    meta: [
      { title: "Product Details — Bloom Admin" },
      { name: "description", content: "Review a Bloom catalog product." },
      { property: "og:title", content: "Product Details — Bloom Admin" },
      { property: "og:description", content: "Review a Bloom catalog product." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductDetail,
});
