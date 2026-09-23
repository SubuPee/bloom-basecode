import { createFileRoute } from "@tanstack/react-router";
import { VendorDetailsPage } from "@/components/bloom/vendors/vendor-details-page";

export const Route = createFileRoute("/vendors/$vendorId")({
  head: () => ({
    meta: [
      { title: "Vendor Details — Bloom Admin" },
      { name: "description", content: "Vendor profile, documents, orders, products, and settlements." },
    ],
  }),
  component: VendorDetailsPage,
});
