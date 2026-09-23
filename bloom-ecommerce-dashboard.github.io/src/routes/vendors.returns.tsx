import { createFileRoute } from "@tanstack/react-router";
import { VendorReturnsPage } from "@/components/bloom/vendors/vendor-returns-page";

export const Route = createFileRoute("/vendors/returns")({
  head: () => ({
    meta: [
      { title: "Vendor Returns — Bloom Admin" },
      { name: "description", content: "Vendor RMA returns, QA inspection, and restock disposition." },
    ],
  }),
  component: VendorReturnsPage,
});
