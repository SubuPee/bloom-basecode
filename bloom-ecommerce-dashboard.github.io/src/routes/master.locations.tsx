import { createFileRoute } from "@tanstack/react-router";
import { StorageLocationsPage } from "@/components/bloom/master/storage-locations-page";

export const Route = createFileRoute("/master/locations")({
  head: () => ({
    meta: [
      { title: "Storage Locations — Bloom Admin" },
      { name: "description", content: "Warehouse Zone-Rack-Shelf-Bin topographic mapping and capacity." },
    ],
  }),
  component: StorageLocationsPage,
});
