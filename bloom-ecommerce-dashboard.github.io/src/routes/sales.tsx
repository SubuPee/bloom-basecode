import { createFileRoute } from "@tanstack/react-router";
import { SalesPage } from "@/components/bloom/sales-page";

export const Route = createFileRoute("/sales")({
  head: () => ({
    meta: [
      { title: "Sales — Bloom Admin" },
      { name: "description", content: "Review Bloom sales and revenue performance." },
      { property: "og:title", content: "Sales — Bloom Admin" },
      { property: "og:description", content: "Review Bloom sales and revenue performance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SalesPage,
});
