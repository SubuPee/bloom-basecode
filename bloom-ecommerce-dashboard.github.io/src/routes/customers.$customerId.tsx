import { createFileRoute } from "@tanstack/react-router";
import { CustomerDetail } from "@/components/bloom/customer-detail";
export const Route = createFileRoute("/customers/$customerId")({
  head: () => ({
    meta: [
      { title: "Customer Details — Bloom Admin" },
      { name: "description", content: "Review a Bloom customer profile and order history." },
      { property: "og:title", content: "Customer Details — Bloom Admin" },
      { property: "og:description", content: "Review a Bloom customer profile and order history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CustomerDetail,
});
