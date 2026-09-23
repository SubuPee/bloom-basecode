import { useEffect, useState, useTransition } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Eye,
  FileText,
  LayoutTemplate,
  Loader2,
  Megaphone,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "./app-shell";
import { PageHeader, Pagination, SearchBox, StatusBadge } from "./ui";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cmsApi, CmsEntry, CmsStats, CreateCmsPayload } from "@/lib/cms-api";
import { cn } from "@/lib/utils";

export function CmsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All content types");
  const [selectedStatus, setSelectedStatus] = useState("All statuses");

  const [entries, setEntries] = useState<CmsEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<CmsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Create content dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newContent, setNewContent] = useState<CreateCmsPayload>({
    title: "",
    type: "Content page",
    status: "Draft",
    placement: "Storefront · Standard",
    author: "Alex Morgan",
    summary: "",
    body: "",
  });

  const [, startTransition] = useTransition();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load KPI stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await cmsApi.getStats();
      setStats(data);
    } catch (err: any) {
      console.error("Failed to load CMS stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Load CMS entries
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await cmsApi.getEntries({
        search: debouncedSearch,
        type: selectedType,
        status: selectedStatus,
        limit: 50,
      });
      setEntries(data.items);
      setTotalCount(data.totalCount);
    } catch (err: any) {
      toast.error(err.message || "Failed to load CMS content entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [debouncedSearch, selectedType, selectedStatus]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.title.trim()) {
      toast.error("Please enter a title for the content entry");
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await cmsApi.createEntry(newContent);
      toast.success(`"${created.title}" created successfully!`);
      setIsCreateOpen(false);
      setNewContent({
        title: "",
        type: "Content page",
        status: "Draft",
        placement: "Storefront · Standard",
        author: "Alex Morgan",
        summary: "",
        body: "",
      });
      // Refresh list and stats
      fetchEntries();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Failed to create CMS entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entry: CmsEntry) => {
    if (!confirm(`Are you sure you want to delete "${entry.title}"?`)) return;

    try {
      await cmsApi.deleteEntry(entry.id);
      toast.success(`"${entry.title}" removed successfully`);
      startTransition(() => {
        setEntries((prev) => prev.filter((item) => item.id !== entry.id));
        setTotalCount((prev) => Math.max(0, prev - 1));
      });
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete entry");
    }
  };

  const statCards = [
    [
      "Published pages",
      stats?.publishedPages ?? (statsLoading ? "—" : "0"),
      FileText,
      "bg-blue-soft text-blue",
    ],
    [
      "Active campaigns",
      stats?.activeCampaigns ?? (statsLoading ? "—" : "0"),
      Megaphone,
      "bg-orange-soft text-orange",
    ],
    [
      "Reusable sections",
      stats?.reusableSections ?? (statsLoading ? "—" : "0"),
      LayoutTemplate,
      "bg-pink-soft text-pink",
    ],
  ] as const;

  return (
    <AppShell>
      <div className="space-y-7">
        <PageHeader
          title="CMS"
          description="Manage storefront pages, campaigns and editorial content."
          action={
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="h-11 rounded-full">
                  <Plus />
                  Create content
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <form onSubmit={handleCreateSubmit}>
                  <DialogHeader>
                    <DialogTitle>Create CMS Content</DialogTitle>
                    <DialogDescription>
                      Publish a new page, marketing campaign, or reusable storefront asset.
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
                        placeholder="e.g. Monsoon Essentials Campaign"
                        value={newContent.title}
                        onChange={(e) =>
                          setNewContent((prev) => ({ ...prev, title: e.target.value }))
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
                          value={newContent.type}
                          onChange={(e) =>
                            setNewContent((prev) => ({ ...prev, type: e.target.value }))
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
                          value={newContent.status}
                          onChange={(e) =>
                            setNewContent((prev) => ({
                              ...prev,
                              status: e.target.value as any,
                            }))
                          }
                          className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Published">Published</option>
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
                          placeholder="e.g. Discover · Featured"
                          value={newContent.placement}
                          onChange={(e) =>
                            setNewContent((prev) => ({ ...prev, placement: e.target.value }))
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
                          placeholder="Author name"
                          value={newContent.author}
                          onChange={(e) =>
                            setNewContent((prev) => ({ ...prev, author: e.target.value }))
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
                        placeholder="Brief summary visible in catalog and preview cards..."
                        value={newContent.summary}
                        onChange={(e) =>
                          setNewContent((prev) => ({ ...prev, summary: e.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase text-muted-foreground">
                        Body / Copy
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Full editorial or policy markdown content..."
                        value={newContent.body}
                        onChange={(e) =>
                          setNewContent((prev) => ({ ...prev, body: e.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <DialogFooter className="mt-6 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create content"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        {/* 3 KPI Top Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map(([label, value, Icon, tone]) => (
            <div key={label} className="bloom-card p-5">
              <span className={cn("grid size-11 place-items-center rounded-full", tone)}>
                <Icon className="size-5" />
              </span>
              <p className="mt-5 text-sm text-muted-foreground">{label}</p>
              <strong className="mt-1 block text-3xl">
                {statsLoading ? (
                  <span className="inline-block h-8 w-16 animate-pulse rounded bg-muted" />
                ) : (
                  value
                )}
              </strong>
            </div>
          ))}
        </div>

        {/* Filter bar and Content Table */}
        <div className="bloom-card overflow-hidden">
          <div className="flex flex-col gap-3 border-b p-5 lg:flex-row">
            <SearchBox
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pages and campaigns…"
            />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All content types">All content types</option>
              <option value="Content page">Content page</option>
              <option value="Campaign">Campaign</option>
              <option value="Policy page">Policy page</option>
              <option value="Homepage banner">Homepage banner</option>
              <option value="Editorial page">Editorial page</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All statuses">All statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-muted/55 text-[11px] uppercase text-muted-foreground">
                <tr>
                  {["Content", "Type", "Placement", "Author", "Updated", "Status", ""].map((h) => (
                    <th key={h} className="p-4 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-4">
                        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                        <div className="mt-2 h-3 w-64 animate-pulse rounded bg-muted/60" />
                      </td>
                      <td className="p-4">
                        <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                      </td>
                      <td className="p-4">
                        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="p-4">
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="p-4">
                        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="p-4">
                        <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                      </td>
                      <td className="p-4">
                        <div className="size-8 rounded bg-muted/50" />
                      </td>
                    </tr>
                  ))
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground">
                      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
                        <AlertCircle className="size-6 text-muted-foreground" />
                      </div>
                      <p className="mt-3 font-medium">No CMS entries found</p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search query or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="border-t transition hover:bg-muted/35">
                      <td className="p-4">
                        <Link
                          to="/cms/$contentId"
                          params={{ contentId: entry.id }}
                          className="font-medium hover:underline"
                        >
                          {entry.title}
                        </Link>
                        <p className="max-w-md truncate text-xs text-muted-foreground">
                          {entry.summary || "No summary provided."}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                          {entry.type}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{entry.placement}</td>
                      <td className="p-4">{entry.author}</td>
                      <td className="p-4 text-muted-foreground">{entry.updated}</td>
                      <td className="p-4">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to="/cms/$contentId" params={{ contentId: entry.id }}>
                                <Eye className="mr-2 size-4" />
                                View content
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(entry)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination count={totalCount || entries.length} />
        </div>
      </div>
    </AppShell>
  );
}
