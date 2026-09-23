import { createFileRoute } from "@tanstack/react-router";
import { VendorRegistrationList } from "@/components/bloom/vendors/vendor-registration-list";

export const Route = createFileRoute("/vendors/list")({
  head: () => ({
    meta: [
      { title: "All Vendors — Bloom Admin" },
      { name: "description", content: "Active vendor directory and partner management." },
    ],
  }),
  component: () => <VendorRegistrationList filterApprovedOnly />,
});
