import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "./index";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Bloom Admin" },
      { name: "description", content: "Sign in to manage Bloom ecommerce operations." },
      { property: "og:title", content: "Sign in — Bloom Admin" },
      { property: "og:description", content: "Sign in to manage Bloom ecommerce operations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});
