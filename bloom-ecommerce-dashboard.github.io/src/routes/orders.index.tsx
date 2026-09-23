import { createFileRoute } from "@tanstack/react-router";
import { OrdersPage } from "@/components/bloom/orders-page";
export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "Orders — Bloom Admin" },
      { name: "description", content: "Track and manage Bloom orders." },
      { property: "og:title", content: "Orders — Bloom Admin" },
      { property: "og:description", content: "Track and manage Bloom orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersPage,
});
