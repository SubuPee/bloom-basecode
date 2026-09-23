import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Eye,
  Globe2,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { DetailShell, InfoBlock } from "./detail-shell";
import { StatusBadge } from "./ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cmsApi, CmsEntry, UpdateCmsPayload } from "@/lib/cms-api";

export function CmsDetail() {
  const { contentId } = useParams({ from: "/cms/$contentId" });
  const navigate = useNavigate();

  const [entry, setEntry] = useState<CmsEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState<UpdateCmsPayload>({});

  // Status toggle loading
  const [statusToggling, setStatusToggling] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadEntry() {
      try {
        setLoading(true);
        setError(null);
        const data = await cmsApi.getEntryById(contentId);
        if (isMounted) {
          setEntry(data);
          setEditForm({
            title: data.title,
            type: data.type,
            status: data.status,
            placement: data.placement,
            author: data.author,
            summary: data.summary,
            body: data.body || "",
          });
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load CMS content details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEntry();
    return () => {
      isMounted = false;
    };
  }, [contentId]);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;

    try {
      setIsUpdating(true);
      const updated = await cmsApi.updateEntry(entry.id, editForm);
      setEntry(updated);
      toast.success("Content updated successfully!");
      setIsEditOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update content");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!entry) return;
    const nextStatus = entry.status === "Published" ? "Draft" : "Published";

    try {
      setStatusToggling(true);
      const updated = await cmsApi.updateEntry(entry.id, { status: nextStatus });
      setEntry(updated);
      toast.success(
        nextStatus === "Published"
          ? "Page published to live storefront!"
          : "Page unpublished and moved to Draft"
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update publishing status");
    } finally {
      setStatusToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    if (!confirm(`Are you sure you want to delete "${entry.title}"?`)) return;

    try {
      await cmsApi.deleteEntry(entry.id);
      toast.success(`"${entry.title}" deleted successfully`);
      navigate({ to: "/cms" });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete content");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading CMS content…</p>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <DetailShell backTo="/cms" backLabel="CMS" title="Content Not Found">
        <div className="bloom-card p-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
            <AlertCircle className="size-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Unable to load content</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {error || "The requested CMS entry could not be found or was removed."}
          </p>
          <Button asChild className="mt-6">
            <Link to="/cms">Back to CMS Overview</Link>
          </Button>
        </div>
      </DetailShell>
    );
  }

  return (
    <DetailShell
      backTo="/cms"
      backLabel="CMS"
      title={entry.title}
      subtitle={`${entry.type} · Last updated ${entry.updated}`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Toggle Publish Status */}
          <Button
            variant="outline"
            onClick={handleToggleStatus}
            disabled={statusToggling}
            className="rounded-full"
          >
            {statusToggling ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : entry.status === "Published" ? (
              <>
                <CheckCircle2 className="mr-2 size-4 text-emerald-500" />
                Unpublish
              </>
            ) : (
              <>
                <Eye className="mr-2 size-4 text-blue" />
                Publish Live
              </>
            )}
          </Button>

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Edit3 className="mr-2 size-4" />
                Edit content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <form onSubmit={handleUpdateSubmit}>
                <DialogHeader>
                  <DialogTitle>Edit Content</DialogTitle>
                  <DialogDescription>
                    Update content copy, placement, and storefront configuration.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.title || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase text-muted-foreground">
                        Content Type
                      </label>
                      <select
                        value={editForm.type || "Content page"}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, type: e.target.value }))
                        }
                        className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="Content page">Content page</option>
                        <option value="Campaign">Campaign</option>
                        <option value="Policy page">Policy page</option>
                        <option value="Homepage banner">Homepage banner</option>
                        <option value="Editorial page">Editorial page</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase text-muted-foreground">
                        Status
                      </label>
                      <select
                        value={editForm.status || "Draft"}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            status: e.target.value as any,
                          }))
                        }
                        className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase text-muted-foreground">
                        Placement
                      </label>
                      <input
                        type="text"
                        value={editForm.placement || ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, placement: e.target.value }))
                        }
                        className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase text-muted-foreground">
                        Author
                      </label>
                      <input
                        type="text"
                        value={editForm.author || ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, author: e.target.value }))
                        }
                        className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground">
                      Summary
                    </label>
                    <textarea
                      rows={2}
                      value={editForm.summary || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, summary: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground">
                      Body Content
                    </label>
                    <textarea
                      rows={4}
                      value={editForm.body || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, body: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <DialogFooter className="mt-6 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            title="Delete Content"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="bloom-card overflow-hidden">
          <div className="grid min-h-64 place-items-center bg-blue-soft p-8 text-center">
            <div>
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-blue text-primary-foreground">
                <Globe2 className="size-7" />
              </span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-blue">
                Storefront preview
              </p>
              <h2 className="mt-2 text-3xl font-semibold">{entry.title}</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
                {entry.summary || "No summary provided for this content entry."}
              </p>
              <Button asChild variant="outline" className="mt-6 rounded-full">
                <Link to="/storefront">
                  <Eye className="mr-2 size-4" />
                  Preview on storefront
                </Link>
              </Button>
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-semibold">Content summary</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {entry.summary || entry.body || "No additional editorial copy."} This preview shows
              the current published copy and placement in the Bloom storefront experience.
            </p>
            {entry.body && entry.body !== entry.summary && (
              <div className="mt-4 rounded-lg bg-muted/30 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Editorial Body
                </h4>
                <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {entry.body}
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="bloom-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Publishing</h2>
              <StatusBadge status={entry.status} />
            </div>
            <dl className="mt-6 grid gap-5">
              <InfoBlock label="Placement" value={entry.placement || "Storefront · Default"} />
              <InfoBlock label="Author" value={entry.author || "Alex Morgan"} />
              <InfoBlock label="Content type" value={entry.type} />
              <InfoBlock
                label="Visibility"
                value={entry.visibility || "All regions · Desktop & mobile"}
              />
              <InfoBlock label="Slug" value={`/${entry.slug || entry.id}`} />
            </dl>
          </section>

          <section className="bloom-card p-6">
            <h2 className="font-semibold">Timeline</h2>
            <p className="mt-5 flex gap-3 text-sm">
              <CalendarDays className="size-4 text-muted-foreground" />
              Updated {entry.updated}
            </p>
            <p className="mt-4 flex gap-3 text-sm">
              <CalendarDays className="size-4 text-muted-foreground" />
              Created {entry.created || "2 Sep 2026"}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Version {entry.version || 1} · Last edited by {entry.author || "Alex Morgan"}
            </p>
          </section>
        </aside>
      </div>
    </DetailShell>
  );
}
