import { createFileRoute } from "@tanstack/react-router";
import { CustomersPage } from "@/components/bloom/customers-page";
export const Route = createFileRoute("/customers/")({
  head: () => ({
    meta: [
      { title: "Customers — Bloom Admin" },
      { name: "description", content: "Manage Bloom customer relationships." },
      { property: "og:title", content: "Customers — Bloom Admin" },
      { property: "og:description", content: "Manage Bloom customer relationships." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CustomersPage,
});
