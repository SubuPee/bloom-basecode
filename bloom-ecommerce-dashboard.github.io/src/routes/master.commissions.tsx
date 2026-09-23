import { createFileRoute } from "@tanstack/react-router";
import { CommissionMasterPage } from "@/components/bloom/master/commission-master-page";

export const Route = createFileRoute("/master/commissions")({
  head: () => ({
    meta: [
      { title: "Commission Master — Bloom Admin" },
      { name: "description", content: "Platform fee rules, category commission tiers, and vendor overrides." },
    ],
  }),
  component: CommissionMasterPage,
});
