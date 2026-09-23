import { useEffect, useState, useTransition, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, Eye, Grid2X2, List, Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "./app-shell";
import { PageHeader, Pagination, SearchBox, StatusBadge } from "./ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { productApi, ProductItem } from "@/lib/product-api";
import { imageForProduct } from "@/lib/product-images";

export function ProductsPage() {
  const [search, setSearch] = useState("");
  const [grid, setGrid] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [publishedFilter, setPublishedFilter] = useState("All");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // Dynamic filter options from catalog
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productApi.getProducts({
        page,
        limit: 12,
        search: search.trim() || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        category: categoryFilter !== "All" ? categoryFilter : undefined,
        brand: brandFilter !== "All" ? brandFilter : undefined,
        productType: typeFilter !== "All" ? typeFilter : undefined,
        isPublished:
          publishedFilter === "Published"
            ? true
            : publishedFilter === "Unpublished"
              ? false
              : undefined,
        isFeatured: featuredOnly ? true : undefined,
      });

      setProductsList(res.products);
      setTotalCount(res.pagination.total);

      // Collect unique categories and brands for filter dropdowns if not yet set
      if (categories.length === 0 || brands.length === 0) {
        const catSet = new Set<string>();
        const brandSet = new Set<string>();
        res.products.forEach((p) => {
          const catName = typeof p.category === "object" ? p.category?.categoryName : p.category;
          const brandName = typeof p.brand === "object" ? p.brand?.brandName : p.brand;
          if (catName) catSet.add(catName);
          if (brandName) brandSet.add(brandName);
        });
        if (catSet.size > 0) setCategories(Array.from(catSet));
        if (brandSet.size > 0) setBrands(Array.from(brandSet));
      }
    } catch (err: any) {
      console.error("Failed to load products:", err);
      toast.error(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    search,
    statusFilter,
    categoryFilter,
    brandFilter,
    typeFilter,
    publishedFilter,
    featuredOnly,
    categories.length,
    brands.length,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setCategoryFilter("All");
    setBrandFilter("All");
    setTypeFilter("All");
    setPublishedFilter("All");
    setFeaturedOnly(false);
    setPage(1);
    setSelected([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(productsList.map((p) => p._id || p.id || p.productCode));
    } else {
      setSelected([]);
    }
  };

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));
  };

  // Bulk Actions
  const handleBulkStatus = async (status: string) => {
    if (selected.length === 0) return;
    try {
      await productApi.bulkUpdateStatus(selected, status);
      toast.success(`Updated status to ${status} for ${selected.length} product(s)`);
      setSelected([]);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Bulk status update failed");
    }
  };

  const handleBulkPublish = async (isPublished: boolean) => {
    if (selected.length === 0) return;
    try {
      await productApi.bulkUpdatePublish(selected, isPublished);
      toast.success(`Updated publish state for ${selected.length} product(s)`);
      setSelected([]);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Bulk publish update failed");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selected.length} product(s)?`)) return;
    try {
      await productApi.bulkDelete(selected);
      toast.success(`Deleted ${selected.length} product(s) successfully`);
      setSelected([]);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Bulk delete failed");
    }
  };

  // Row Actions
  const handleDuplicate = async (id: string) => {
    try {
      const cloned = await productApi.duplicateProduct(id);
      toast.success(`Product duplicated as "${cloned.productName}"`);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to duplicate product");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await productApi.deleteProduct(id);
      toast.success(`Product "${name}" deleted`);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  const allSelected =
    productsList.length > 0 &&
    productsList.every((p) => selected.includes(p._id || p.id || p.productCode));

  return (
    <AppShell>
      <div className="space-y-7">
        <PageHeader
          title="Products"
          description="Manage your product catalog."
          action={
            <Button asChild className="h-11 rounded-full px-5">
              <Link to="/products/new">
                <Plus />
                Add Product
              </Link>
            </Button>
          }
        />
        <div className="bloom-card overflow-hidden">
          <div className="space-y-4 border-b p-5">
            <div className="flex flex-col gap-3 lg:flex-row">
              <SearchBox
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search code, name, barcode or tags…"
              />

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-full border bg-muted/50 px-4 text-sm"
              >
                <option value="All">Status: All</option>
                <option value="active">Status: Active</option>
                <option value="inactive">Status: Inactive</option>
                <option value="draft">Status: Draft</option>
                <option value="archived">Status: Archived</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-full border bg-muted/50 px-4 text-sm"
              >
                <option value="All">Category: All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Brand Filter */}
              <select
                value={brandFilter}
                onChange={(e) => {
                  setBrandFilter(e.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-full border bg-muted/50 px-4 text-sm"
              >
                <option value="All">Brand: All</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-full border bg-muted/50 px-4 text-sm"
              >
                <option value="All">Type: All</option>
                <option value="simple">Simple</option>
                <option value="variable">Variable</option>
                <option value="digital">Digital</option>
                <option value="service">Service</option>
              </select>

              {/* Published Filter */}
              <select
                value={publishedFilter}
                onChange={(e) => {
                  setPublishedFilter(e.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-full border bg-muted/50 px-4 text-sm"
              >
                <option value="All">Published: All</option>
                <option value="Published">Published</option>
                <option value="Unpublished">Unpublished</option>
              </select>

              <Button
                variant="ghost"
                className="rounded-full"
                onClick={handleClearFilters}
              >
                Clear
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch
                  checked={featuredOnly}
                  onCheckedChange={(checked) => {
                    setFeaturedOnly(checked);
                    setPage(1);
                  }}
                />
                Featured only
              </label>
              <div className="flex rounded-full border bg-muted/40 p-1">
                <Button
                  size="icon"
                  variant={grid ? "ghost" : "secondary"}
                  onClick={() => setGrid(false)}
                >
                  <List />
                </Button>
                <Button
                  size="icon"
                  variant={grid ? "secondary" : "ghost"}
                  onClick={() => setGrid(true)}
                >
                  <Grid2X2 />
                </Button>
              </div>
            </div>
          </div>

          {selected.length > 0 && (
            <div className="flex items-center gap-3 border-b bg-blue-soft p-3 text-sm">
              <strong>{selected.length} selected</strong>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatus("active")}
              >
                Set active
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkPublish(true)}
              >
                Publish
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
              >
                Delete
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="mt-3 text-sm">Loading product catalog…</p>
            </div>
          ) : productsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <p className="text-base font-semibold">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search query or filters.
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={handleClearFilters}
              >
                Reset Filters
              </Button>
            </div>
          ) : grid ? (
            <div className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {productsList.map((p, i) => {
                const prodId = p._id || p.id || p.productCode;
                const catName =
                  typeof p.category === "object"
                    ? p.category?.categoryName || "General"
                    : p.category || "General";
                const sellingPrice = p.sellingPrice ?? 0;
                const statusCapitalized =
                  p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : "Active";
                const imgUrl =
                  p.images && p.images.length > 0
                    ? p.images[0].url
                    : imageForProduct(p.productCode, i);

                return (
                  <div
                    className="overflow-hidden rounded-2xl border bg-muted/20 transition hover:border-foreground/15 hover:bg-muted/35"
                    key={prodId}
                  >
                    <img
                      src={imgUrl}
                      alt={p.productName}
                      width={816}
                      height={816}
                      loading="lazy"
                      className="aspect-[4/2.25] w-full object-cover"
                    />
                    <div className="p-4">
                      <div className="flex justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">{p.productName}</h3>
                          <p className="text-xs text-muted-foreground">
                            {p.productCode} · {catName}
                          </p>
                        </div>
                        <StatusBadge status={statusCapitalized} />
                      </div>
                      <div className="mt-4 flex items-end justify-between">
                        <p className="font-semibold">₹{sellingPrice.toLocaleString("en-IN")}</p>
                        <Button asChild variant="outline" size="sm">
                          <Link to="/products/$productId/edit" params={{ productId: prodId }}>
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] text-left text-sm">
                <thead className="bg-muted/55 text-[11px] uppercase text-muted-foreground">
                  <tr>
                    <th className="p-4">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={(v) => handleSelectAll(Boolean(v))}
                      />
                    </th>
                    {[
                      "Product",
                      "Category",
                      "Brand",
                      "Price",
                      "Stock",
                      "Type",
                      "Status",
                      "Published",
                      "",
                    ].map((h) => (
                      <th className="p-4 font-medium" key={h}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productsList.map((p, i) => {
                    const prodId = p._id || p.id || p.productCode;
                    const catName =
                      typeof p.category === "object"
                        ? p.category?.categoryName || "General"
                        : p.category || "General";
                    const brandName =
                      typeof p.brand === "object"
                        ? p.brand?.brandName || "—"
                        : p.brand || "—";
                    const sellingPrice = p.sellingPrice ?? 0;
                    const mrp = p.mrp ?? sellingPrice;
                    const stock = p.stock ?? p.stockQuantity ?? 0;
                    const prodType =
                      p.productType
                        ? p.productType.charAt(0).toUpperCase() + p.productType.slice(1)
                        : "Simple";
                    const statusCapitalized =
                      p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : "Active";
                    const isPublished = p.isPublished ?? true;
                    const isSelected = selected.includes(prodId);
                    const imgUrl =
                      p.images && p.images.length > 0
                        ? p.images[0].url
                        : imageForProduct(p.productCode, i);

                    return (
                      <tr key={prodId} className="border-t transition hover:bg-muted/35">
                        <td className="p-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(v) => handleToggleSelect(prodId, Boolean(v))}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={imgUrl}
                              alt=""
                              width={816}
                              height={816}
                              loading="lazy"
                              className="size-11 rounded-xl object-cover"
                            />
                            <div>
                              <p className="font-medium">{p.productName}</p>
                              <p className="text-xs text-muted-foreground">
                                {p.productCode}
                                {p.hasVariants || prodType === "Variable"
                                  ? ` · +${p.variants?.length || 3} variants`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{catName}</td>
                        <td className="p-4">{brandName}</td>
                        <td className="p-4">
                          <strong>₹{sellingPrice.toLocaleString("en-IN")}</strong>
                          {sellingPrice !== mrp && (
                            <del className="ml-2 text-xs text-muted-foreground">
                              ₹{mrp.toLocaleString("en-IN")}
                            </del>
                          )}
                        </td>
                        <td className={stock < 10 ? "p-4 text-orange" : "p-4"}>
                          {stock} units
                        </td>
                        <td className="p-4">
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                            {prodType}
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={statusCapitalized} />
                        </td>
                        <td className="p-4">
                          <Eye
                            className={
                              isPublished ? "size-4 text-blue" : "size-4 text-muted-foreground"
                            }
                          />
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl">
                              <DropdownMenuItem asChild>
                                <Link to="/products/$productId" params={{ productId: prodId }}>
                                  <Eye className="mr-2 size-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  to="/products/$productId/edit"
                                  params={{ productId: prodId }}
                                >
                                  <Pencil className="mr-2 size-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(prodId)}>
                                <Copy className="mr-2 size-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(prodId, p.productName)}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <Pagination count={totalCount || productsList.length} />
        </div>
      </div>
    </AppShell>
  );
}
