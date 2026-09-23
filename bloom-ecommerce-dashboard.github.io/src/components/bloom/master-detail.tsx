import { useEffect, useState } from "react";
import { Edit3, Fingerprint, History, Loader2, UserRound } from "lucide-react";
import { Link, useParams } from "@tanstack/react-router";
import { DetailShell, InfoBlock } from "./detail-shell";
import { StatusBadge } from "./ui";
import { Button } from "@/components/ui/button";
import { masterConfig, type MasterKey, type MasterRow } from "@/lib/bloom-data";
import { masterApi } from "@/lib/master-api";

export function MasterDetail() {
  const { kind, itemId } = useParams({ from: "/master/$kind/$itemId" });
  const safeKind = (kind in masterConfig ? kind : "categories") as MasterKey;
  const config = masterConfig[safeKind];

  const [row, setRow] = useState<MasterRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadItem() {
      try {
        setLoading(true);
        setError(null);
        const item = await masterApi.getItemById(safeKind, itemId);
        if (isMounted) setRow(item);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Record not found");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadItem();
    return () => {
      isMounted = false;
    };
  }, [safeKind, itemId]);

  if (loading) {
    return (
      <DetailShell
        backTo={`/${safeKind}`}
        backLabel={config.title.toLowerCase()}
        title={`Loading ${config.singular}...`}
        subtitle="Please wait"
      >
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </DetailShell>
    );
  }

  if (error || !row) {
    return (
      <DetailShell
        backTo={`/${safeKind}`}
        backLabel={config.title.toLowerCase()}
        title={`${config.singular} not found`}
        subtitle={`No ${config.singular.toLowerCase()} matches "${itemId}".`}
      >
        <div className="bloom-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            This record may have been deleted, or the ID is invalid. Go back to{" "}
            {config.title.toLowerCase()} to select a record.
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <Link to={`/${safeKind}`}>Back to {config.title}</Link>
          </Button>
        </div>
      </DetailShell>
    );
  }

  return (
    <DetailShell
      backTo={`/${safeKind}`}
      backLabel={config.title.toLowerCase()}
      title={row.name}
      subtitle={`${config.singular} record · ${row.code}`}
      actions={
        <Button asChild>
          <Link to={`/${safeKind}`}>
            <Edit3 className="mr-1 size-4" />
            Manage {config.singular}
          </Link>
        </Button>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className="bloom-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Record details</h2>
            <StatusBadge status={row.status} />
          </div>
          <dl className="mt-7 grid gap-6 sm:grid-cols-2">
            <InfoBlock label={`${config.singular} code`} value={row.code} />
            <InfoBlock label={`${config.singular} name`} value={row.name} />
            <InfoBlock label={config.detailLabel} value={row.detail} />
            <InfoBlock label="Status" value={row.status} />
            <InfoBlock
              label="Linked products"
              value={`${((String(row.id).charCodeAt(0) * 3) % 40) + 3} products`}
            />
            <InfoBlock
              label="Visible on storefront"
              value={row.status === "Active" ? "Yes" : "No"}
            />
          </dl>
        </section>
        <aside className="space-y-5">
          <section className="bloom-card p-6">
            <h2 className="font-semibold">Record activity</h2>
            <div className="mt-5 space-y-4">
              <p className="flex gap-3 text-sm">
                <UserRound className="size-4 text-blue" />
                Created by {row.createdBy || "Admin"}
              </p>
              <p className="flex gap-3 text-sm">
                <History className="size-4 text-orange" />
                Updated {row.updated || "Recently"}
              </p>
              <p className="flex gap-3 text-sm">
                <Fingerprint className="size-4 text-pink" />
                Internal ID {String(row.id)}
              </p>
              <p className="flex gap-3 text-sm">
                <History className="size-4 text-blue" />
                Created {row.updated || "Recently"}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </DetailShell>
  );
}
