import { useState, useMemo } from "react";
import { History, Search, Shield, UserRound, Filter, Calendar } from "lucide-react";
import { VendorShell } from "./vendor-shell";
import { PageHeader, Pagination, SearchBox } from "../ui";
import { Button } from "@/components/ui/button";
import { useVendorStore, type VendorActivityLog } from "@/lib/bloom-vendor-store";
import { cn } from "@/lib/utils";

export function VendorActivityLogsPage() {
  const logs = useVendorStore((s) => s.getActivityLogs());

  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("All");

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.user.toLowerCase().includes(search.toLowerCase()) ||
        l.entityId.toLowerCase().includes(search.toLowerCase()) ||
        l.entity.toLowerCase().includes(search.toLowerCase());
      const matchEntity = entityFilter === "All" || l.entity === entityFilter;
      return matchSearch && matchEntity;
    });
  }, [logs, search, entityFilter]);

  return (
    <VendorShell>
      <div className="space-y-7">
        <PageHeader
          title="Vendor Governance & Audit Trail"
          description="Immutable, tamper-evident log of all admin operations, KYC document verifications, status modifications, and settlement transactions."
        />

        {/* Filters */}
        <div className="bloom-card p-5 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <SearchBox
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit actions, user actors, entity IDs…"
            />

            <select
              aria-label="Filter by Entity"
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm font-medium"
            >
              <option value="All">All Entities</option>
              <option value="Vendor">Vendor Profile</option>
              <option value="Document">KYC Document</option>
              <option value="Inventory">Inventory & Stock</option>
              <option value="Production">Production Run</option>
              <option value="Order">Order Allocation</option>
              <option value="Settlement">Settlement Calculation</option>
              <option value="Payment">Disbursement Payment</option>
              <option value="Return">Customer Return</option>
            </select>

            {(search || entityFilter !== "All") && (
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setSearch("");
                  setEntityFilter("All");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bloom-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Timestamp</th>
                  <th className="px-5 py-4">Actor</th>
                  <th className="px-5 py-4">Action Event</th>
                  <th className="px-5 py-4">Entity & Reference ID</th>
                  <th className="px-5 py-4">State Transition (Old → New)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-sm flex items-center gap-1.5">
                        <UserRound className="size-3.5 text-muted-foreground" />
                        {log.user}
                      </div>
                      <span className="text-[11px] text-muted-foreground">Bloom Administrator</span>
                    </td>

                    <td className="px-5 py-4 font-medium text-sm">
                      {log.action}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold mr-2">
                        {log.entity}
                      </span>
                      <span className="font-mono text-xs font-medium text-primary">
                        {log.entityId}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs">
                      {log.oldValue && log.newValue ? (
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-muted-foreground line-through">{log.oldValue}</span>
                          <span>→</span>
                          <span className="font-bold text-foreground">{log.newValue}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination count={filtered.length} />
        </div>
      </div>
    </VendorShell>
  );
}
