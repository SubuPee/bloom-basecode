import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  MoreHorizontal,
  Plus,
  Trash2,
  Pencil,
  Eye,
  SlidersHorizontal,
  X,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "./app-shell";
import { Field, LoadingButton, PageHeader, Pagination, SearchBox, StatusBadge } from "./ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { masterConfig, type MasterKey, type MasterRow } from "@/lib/bloom-data";
import { masterApi } from "@/lib/master-api";

export function MasterPage({ kind }: { kind: MasterKey }) {
  const config = masterConfig[kind];
  const [rows, setRows] = useState<MasterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Drawer / Form state
  const [editing, setEditing] = useState<MasterRow | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");
  const [extraField1, setExtraField1] = useState("");
  const [extraField2, setExtraField2] = useState("");
  const [attrValues, setAttrValues] = useState<string[]>(["Black", "White"]);
  const [deleting, setDeleting] = useState<MasterRow | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const res = await masterApi.getItems(kind, {
        page,
        limit: 20,
        search: search.trim() || undefined,
        status: status !== "All" ? status : undefined,
      });

      setRows(res.items);
      setTotalCount(res.pagination.total);
    } catch (err: any) {
      console.error(`Failed to load ${kind}:`, err);
      toast.error(err.message || `Failed to load ${config.title}`);
    } finally {
      setLoading(false);
    }
  }, [kind, page, search, status, config.title]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchRecords]);

  function open(row?: MasterRow) {
    setEditing(row || null);
    setCode(row?.code || `${kind.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`);
    setName(row?.name || "");
    setActive(row?.status !== "Inactive");
    setError("");
    setExtraField1("");
    setExtraField2("");
    setDrawer(true);
  }

  async function save() {
    if (!code.trim() || !name.trim()) {
      setError("Code and name are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload: any = {
        code: code.trim(),
        name: name.trim(),
        status: active ? "active" : "inactive",
      };

      if (kind === "units") {
        payload.symbol = extraField1 || name.slice(0, 3).toLowerCase();
        payload.unitType = extraField2 || "quantity";
      } else if (kind === "taxes") {
        payload.taxRate = Number(extraField1 || 18);
        payload.taxType = extraField2 || "percentage";
      } else if (kind === "warehouses") {
        payload.city = extraField1 || "Mumbai";
        payload.addressLine1 = "Central Logistics Hub";
        payload.state = "Maharashtra";
        payload.country = "India";
        payload.postalCode = "400001";
        payload.contactPerson = "Warehouse Manager";
        payload.contactPhone = "+91 98765 00000";
      } else if (kind === "attributes") {
        payload.displayType = extraField1 || "dropdown";
        payload.values = attrValues.map((v, i) => ({ value: v, isDefault: i === 0 }));
      }

      if (editing) {
        await masterApi.updateItem(kind, String(editing.id), payload);
        toast.success(`${config.singular} updated successfully`);
      } else {
        await masterApi.createItem(kind, payload);
        toast.success(`${config.singular} created successfully`);
      }

      setDrawer(false);
      fetchRecords();
    } catch (err: any) {
      setError(err.message || "Failed to save record");
      toast.error(err.message || "Failed to save record");
    } finally {
      setSaving(false);
    }
  }

  const handleToggleStatus = async (row: MasterRow) => {
    const nextStatus = row.status === "Active" ? "inactive" : "active";
    try {
      await masterApi.updateStatus(kind, String(row.id), nextStatus);
      toast.success(`${config.singular} marked as ${nextStatus}`);
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    try {
      await masterApi.deleteItem(kind, String(deleting.id));
      toast.success(`${config.singular} deleted`);
      setDeleting(null);
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete record");
    }
  };

  const handleBulkStatus = async (targetStatus: "active" | "inactive") => {
    if (selected.length === 0) return;
    try {
      await Promise.all(selected.map((id) => masterApi.updateStatus(kind, id, targetStatus)));
      toast.success(`Updated status for ${selected.length} record(s)`);
      setSelected([]);
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message || "Bulk status update failed");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selected.length} record(s)?`)) return;
    try {
      await Promise.all(selected.map((id) => masterApi.deleteItem(kind, id)));
      toast.success(`Deleted ${selected.length} record(s)`);
      setSelected([]);
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message || "Bulk delete failed");
    }
  };

  const allSelected =
    rows.length > 0 && rows.every((r) => selected.includes(String(r.id)));

  return (
    <AppShell>
      <div className="space-y-7">
        <PageHeader
          title={config.title}
          description={config.description}
          action={
            <Button className="h-11 rounded-full px-5" onClick={() => open()}>
              <Plus />
              Add {config.singular}
            </Button>
          }
        />
        <div className="bloom-card overflow-hidden">
          <div className="flex flex-col gap-3 border-b p-5 lg:flex-row lg:items-center">
            <SearchBox
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={`Search ${config.title.toLowerCase()}...`}
            />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {(search || status !== "All") && (
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setSearch("");
                  setStatus("All");
                  setPage(1);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>

          {selected.length > 0 && (
            <div className="flex items-center gap-3 border-b bg-blue-soft px-5 py-3 text-sm">
              <strong>{selected.length} selected</strong>
              <Button size="sm" variant="outline" onClick={() => handleBulkStatus("active")}>
                Set active
              </Button>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="mr-1 size-3.5" />
                Delete
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="sticky top-0 bg-muted/55 text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="w-12 p-4">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(v) =>
                        setSelected(v ? rows.map((r) => String(r.id)) : [])
                      }
                    />
                  </th>
                  {[
                    `${config.singular} Code`,
                    `${config.singular} Name`,
                    config.detailLabel,
                    "Status",
                    "Created By",
                    "Updated At",
                    "",
                  ].map((h) => (
                    <th key={h} className="whitespace-nowrap p-4 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t">
                      <td colSpan={8} className="p-4">
                        <div className="h-8 animate-pulse rounded-xl bg-muted" />
                      </td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-blue-soft">
                        <SlidersHorizontal className="text-blue size-5" />
                      </div>
                      <h3 className="font-semibold">No {config.title.toLowerCase()} found</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Try adjusting your filters or create a new record.
                      </p>
                      <Button className="mt-4" onClick={() => open()}>
                        <Plus className="mr-1 size-4" />
                        Add {config.singular}
                      </Button>
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const rowId = String(r.id);
                    const isSelected = selected.includes(rowId);
                    return (
                      <tr key={rowId} className="border-t transition-colors hover:bg-muted/35">
                        <td className="p-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(v) =>
                              setSelected((s) =>
                                v ? [...s, rowId] : s.filter((x) => x !== rowId)
                              )
                            }
                          />
                        </td>
                        <td className="p-4">
                          <code className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-semibold">
                            {r.code}
                          </code>
                        </td>
                        <td className="p-4 font-medium">{r.name}</td>
                        <td className="p-4">
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                            {r.detail}
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="p-4 text-muted-foreground">{r.createdBy}</td>
                        <td className="p-4 text-muted-foreground">{r.updated}</td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl">
                              <DropdownMenuItem asChild>
                                <Link
                                  to="/master/$kind/$itemId"
                                  params={{ kind, itemId: rowId }}
                                >
                                  <Eye className="mr-2 size-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => open(r)}>
                                <Pencil className="mr-2 size-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(r)}>
                                <SlidersHorizontal className="mr-2 size-4" />
                                Toggle status
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleting(r)}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination count={totalCount || rows.length} />
        </div>
      </div>

      {/* Slide-out Sheet for Add / Edit */}
      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent className="flex w-full flex-col p-0 sm:max-w-xl">
          <SheetHeader className="border-b p-6">
            <SheetTitle className="text-xl">
              {editing ? "Edit" : "Add"} {config.singular}
            </SheetTitle>
            <SheetDescription>
              {editing
                ? "Update this record’s details."
                : `Create a new ${config.singular.toLowerCase()} for your catalog.`}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-5 overflow-y-auto p-6">
            <Field label={`${config.singular} Code`} helper="Must be unique." error={error}>
              <Input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError("");
                }}
                placeholder="Enter unique code"
              />
            </Field>

            <Field label={`${config.singular} Name`} error={error && !name ? "Name is required" : undefined}>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder={`Enter ${config.singular.toLowerCase()} name`}
              />
            </Field>

            {/* Kind-specific form fields */}
            {kind === "units" && (
              <>
                <Field label="Symbol">
                  <Input
                    value={extraField1}
                    onChange={(e) => setExtraField1(e.target.value)}
                    placeholder="e.g. pc, kg, bx"
                  />
                </Field>
                <Field label="Unit Type">
                  <select
                    value={extraField2 || "quantity"}
                    onChange={(e) => setExtraField2(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-muted/55 px-3 text-sm"
                  >
                    <option value="quantity">Quantity</option>
                    <option value="weight">Weight</option>
                    <option value="volume">Volume</option>
                    <option value="length">Length</option>
                    <option value="area">Area</option>
                  </select>
                </Field>
              </>
            )}

            {kind === "taxes" && (
              <>
                <Field label="Tax Rate (%)">
                  <Input
                    type="number"
                    value={extraField1}
                    onChange={(e) => setExtraField1(e.target.value)}
                    placeholder="e.g. 18"
                  />
                </Field>
                <Field label="Tax Type">
                  <select
                    value={extraField2 || "percentage"}
                    onChange={(e) => setExtraField2(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-muted/55 px-3 text-sm"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </Field>
              </>
            )}

            {kind === "warehouses" && (
              <Field label="City">
                <Input
                  value={extraField1}
                  onChange={(e) => setExtraField1(e.target.value)}
                  placeholder="e.g. Mumbai, Delhi, Bengaluru"
                />
              </Field>
            )}

            {kind === "attributes" && (
              <div className="space-y-3 rounded-2xl border p-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Attribute Values</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const nextVal = prompt("Enter attribute value:");
                      if (nextVal) setAttrValues((prev) => [...prev, nextVal.trim()]);
                    }}
                  >
                    <Plus className="mr-1 size-3.5" />
                    Add Value
                  </Button>
                </div>
                {attrValues.map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={v}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAttrValues((prev) =>
                          prev.map((item, idx) => (idx === i ? val : item))
                        );
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setAttrValues((prev) => prev.filter((_, idx) => idx !== i))
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between rounded-2xl border bg-muted/25 p-4">
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-xs text-muted-foreground">
                  Available for use across the catalog.
                </p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          </div>

          <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-card/95 p-4 backdrop-blur">
            <Button variant="ghost" onClick={() => setDrawer(false)}>
              Cancel
            </Button>
            <LoadingButton loading={saving} onClick={save}>
              Save {config.singular}
            </LoadingButton>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog for Delete */}
      {deleting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="bloom-card w-full max-w-md p-6">
            <h2 className="text-lg font-semibold">Delete this {config.singular.toLowerCase()}?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete "{deleting.name}" ({deleting.code})? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
