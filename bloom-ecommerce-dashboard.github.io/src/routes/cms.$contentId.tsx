import { createFileRoute } from "@tanstack/react-router";
import { CmsDetail } from "@/components/bloom/cms-detail";
export const Route = createFileRoute("/cms/$contentId")({
  head: () => ({
    meta: [
      { title: "Content Details — Bloom Admin" },
      { name: "description", content: "Review Bloom storefront content." },
      { property: "og:title", content: "Content Details — Bloom Admin" },
      { property: "og:description", content: "Review Bloom storefront content." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CmsDetail,
});
