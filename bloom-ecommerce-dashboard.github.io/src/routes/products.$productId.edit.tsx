import { createFileRoute } from "@tanstack/react-router";
import { ProductEditor } from "@/components/bloom/product-editor";

export const Route = createFileRoute("/products/$productId/edit")({
  head: () => ({
    meta: [
      { title: "Edit Product — Bloom Admin" },
      { name: "description", content: "Edit a Bloom catalog product." },
      { property: "og:title", content: "Edit Product — Bloom Admin" },
      { property: "og:description", content: "Edit a Bloom catalog product." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: function ProductEditRoute() {
    const { productId } = Route.useParams();
    return <ProductEditor edit productId={productId} />;
  },
});
