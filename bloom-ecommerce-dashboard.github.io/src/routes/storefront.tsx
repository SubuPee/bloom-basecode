import { createFileRoute } from "@tanstack/react-router";
import { StorefrontPage } from "@/components/bloom/storefront-page";
export const Route = createFileRoute("/storefront")({
  head: () => ({
    meta: [
      { title: "Storefront Preview — Bloom Admin" },
      { name: "description", content: "Preview the published Bloom storefront experience." },
      { property: "og:title", content: "Storefront Preview — Bloom Admin" },
      { property: "og:description", content: "Preview the published Bloom storefront experience." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StorefrontPage,
});
