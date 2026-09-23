import { createFileRoute } from "@tanstack/react-router";
import { MasterPage } from "@/components/bloom/master-page";
export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Brands — Bloom Admin" },
      { name: "description", content: "Manage Bloom brands." },
      { property: "og:title", content: "Brands — Bloom Admin" },
      { property: "og:description", content: "Manage Bloom brands." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <MasterPage kind="brands" />,
});
