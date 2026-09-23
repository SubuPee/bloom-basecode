import { createFileRoute } from "@tanstack/react-router";
import { MasterPage } from "@/components/bloom/master-page";
export const Route = createFileRoute("/warehouses")({
  head: () => ({
    meta: [
      { title: "Warehouses — Bloom Admin" },
      { name: "description", content: "Manage Bloom inventory locations." },
      { property: "og:title", content: "Warehouses — Bloom Admin" },
      { property: "og:description", content: "Manage Bloom inventory locations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <MasterPage kind="warehouses" />,
});
