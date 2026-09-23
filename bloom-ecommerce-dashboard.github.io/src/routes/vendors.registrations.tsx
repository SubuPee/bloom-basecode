import { createFileRoute } from "@tanstack/react-router";
import { VendorRegistrationList } from "@/components/bloom/vendors/vendor-registration-list";

export const Route = createFileRoute("/vendors/registrations")({
  head: () => ({
    meta: [
      { title: "Vendor Registrations — Bloom Admin" },
      { name: "description", content: "Manage vendor onboarding registrations and approvals." },
    ],
  }),
  component: () => <VendorRegistrationList />,
});
