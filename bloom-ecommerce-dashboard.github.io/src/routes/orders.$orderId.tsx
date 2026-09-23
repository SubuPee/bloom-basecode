import { createFileRoute } from "@tanstack/react-router";
import { OrderDetail } from "@/components/bloom/order-detail";
export const Route = createFileRoute("/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order Details — Bloom Admin" },
      { name: "description", content: "Review a Bloom order and fulfillment timeline." },
      { property: "og:title", content: "Order Details — Bloom Admin" },
      { property: "og:description", content: "Review a Bloom order and fulfillment timeline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderDetail,
});
