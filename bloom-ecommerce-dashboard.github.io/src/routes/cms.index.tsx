import { createFileRoute } from "@tanstack/react-router";
import { CmsPage } from "@/components/bloom/cms-page";
export const Route = createFileRoute("/cms/")({
  head: () => ({
    meta: [
      { title: "CMS — Bloom Admin" },
      { name: "description", content: "Manage Bloom storefront content and campaigns." },
      { property: "og:title", content: "CMS — Bloom Admin" },
      { property: "og:description", content: "Manage Bloom storefront content and campaigns." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CmsPage,
});
