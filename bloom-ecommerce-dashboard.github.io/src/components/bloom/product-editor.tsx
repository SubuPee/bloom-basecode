import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Plus,
  Star,
  Trash2,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "./app-shell";
import { Field, LoadingButton } from "./ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { productApi, ProductItem, MasterOption } from "@/lib/product-api";

const SelectBox = ({
  children,
  value,
  onChange,
  disabled = false,
}: {
  children: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}) => (
  <select
    disabled={disabled}
    value={value}
    onChange={onChange}
    className="h-10 w-full rounded-xl border bg-muted/55 px-3 text-sm disabled:opacity-50"
  >
    {children}
  </select>
);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="bloom-card">
      <Button
        variant="ghost"
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-auto w-full justify-between rounded-[1.3rem] p-5 text-left font-semibold"
      >
        {title}
        {open ? <ChevronUp /> : <ChevronDown />}
      </Button>
      {open && <div className="grid gap-5 border-t p-5 sm:grid-cols-2">{children}</div>}
    </section>
  );
}

export function ProductEditor({
  edit = false,
  productId,
}: {
  edit?: boolean;
  productId?: string;
}) {
  const navigate = useNavigate();

  // Basic Information
  const [code, setCode] = useState(edit ? "WH-1001" : "");
  const [name, setName] = useState(edit ? "Wireless Headphones" : "");
  const [type, setType] = useState<"Simple" | "Variable" | "Digital" | "Service">(
    edit ? "Variable" : "Simple"
  );
  const [category, setCategory] = useState(edit ? "Electronics" : "");
  const [subCategory, setSubCategory] = useState(edit ? "Headphones" : "");
  const [brand, setBrand] = useState(edit ? "Auralink" : "");
  const [unit, setUnit] = useState(edit ? "Piece" : "");
  const [hsnCode, setHsnCode] = useState(edit ? "85183000" : "");
  const [barcode, setBarcode] = useState(edit ? "8901234567890" : "");
  const [shortDesc, setShortDesc] = useState(
    edit ? "Premium wireless over-ear headphones" : ""
  );
  const [description, setDescription] = useState(
    edit ? "Immersive sound with active noise cancellation and all-day comfort." : ""
  );

  // Pricing & Tax
  const [purchase, setPurchase] = useState(edit ? "4200" : "");
  const [selling, setSelling] = useState(edit ? "6999" : "");
  const [mrp, setMrp] = useState(edit ? "8999" : "");
  const [tax, setTax] = useState(edit ? "GST 18%" : "");

  // Inventory
  const [reorderLevel, setReorderLevel] = useState(edit ? "10" : "");

  // Images
  const [images, setImages] = useState<Array<{ url: string; isPrimary?: boolean }>>([
    { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", isPrimary: true },
  ]);

  // Variants (Variable Products)
  const [variantsList, setVariantsList] = useState([
    { sku: "WH-001", values: "Black / M", barcode: "890123456780", selling: "6999", mrp: "8999", status: true },
    { sku: "WH-002", values: "Black / L", barcode: "890123456781", selling: "6999", mrp: "8999", status: true },
    { sku: "WH-003", values: "White / M", barcode: "890123456782", selling: "6999", mrp: "8999", status: true },
    { sku: "WH-004", values: "White / L", barcode: "890123456783", selling: "6999", mrp: "8999", status: true },
  ]);

  // SEO
  const [slug, setSlug] = useState(edit ? "wireless-headphones" : "");
  const [metaTitle, setMetaTitle] = useState(edit ? "Wireless Headphones | Bloom" : "");
  const [metaDesc, setMetaDesc] = useState("");
  const [keywords, setKeywords] = useState(["wireless", "audio"]);

  // Storefront & Shipping
  const [tags, setTags] = useState(edit ? "audio, premium, wireless" : "");
  const [shipping, setShipping] = useState(true);
  const [weight, setWeight] = useState("285");
  const [weightUnit, setWeightUnit] = useState("g");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [dimUnit, setDimUnit] = useState("cm");

  // Status & Publish
  const [isActive, setIsActive] = useState(true);
  const [isPublished, setIsPublished] = useState(edit);
  const [isFeatured, setIsFeatured] = useState(false);

  // States & Master Options
  const [masterData, setMasterData] = useState<{
    categories: MasterOption[];
    brands: MasterOption[];
    units: MasterOption[];
    taxes: MasterOption[];
  }>({
    categories: [],
    brands: [],
    units: [],
    taxes: [],
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(edit && Boolean(productId));

  // Load Master Options
  useEffect(() => {
    async function loadMasters() {
      const masters = await productApi.getMasterOptions();
      setMasterData(masters);
    }
    loadMasters();
  }, []);

  // Load Existing Product if Edit mode
  useEffect(() => {
    if (!edit || !productId) return;

    let isMounted = true;
    async function loadProduct() {
      try {
        setLoadingInitial(true);
        const prod = await productApi.getProductById(productId!);
        if (!isMounted || !prod) return;

        setCode(prod.productCode || "");
        setName(prod.productName || "");
        if (prod.productType) {
          const typeStr =
            prod.productType.charAt(0).toUpperCase() + prod.productType.slice(1);
          setType(typeStr as any);
        }
        setCategory(
          typeof prod.category === "object"
            ? prod.category?.categoryName || prod.category?._id || ""
            : prod.category || ""
        );
        setSubCategory(
          typeof prod.subCategory === "object"
            ? prod.subCategory?.subCategoryName || prod.subCategory?._id || ""
            : prod.subCategory || ""
        );
        setBrand(
          typeof prod.brand === "object"
            ? prod.brand?.brandName || prod.brand?._id || ""
            : prod.brand || ""
        );
        setUnit(
          typeof prod.unit === "object"
            ? prod.unit?.unitName || prod.unit?._id || "Piece"
            : prod.unit || "Piece"
        );
        setHsnCode(prod.hsnSacCode || "");
        setBarcode(prod.barcode || "");
        setShortDesc(prod.shortDescription || "");
        setDescription(prod.description || "");

        setPurchase(prod.purchasePrice !== undefined ? String(prod.purchasePrice) : "");
        setSelling(prod.sellingPrice !== undefined ? String(prod.sellingPrice) : "");
        setMrp(prod.mrp !== undefined ? String(prod.mrp) : "");
        setTax(
          typeof prod.tax === "object"
            ? prod.tax?.taxName || ""
            : prod.tax || ""
        );

        setReorderLevel(
          prod.reorderLevel !== undefined ? String(prod.reorderLevel) : ""
        );

        if (prod.images && prod.images.length > 0) {
          setImages(prod.images.map((im) => ({ url: im.url, isPrimary: im.isPrimary })));
        }

        setSlug(prod.slug || "");
        setMetaTitle(prod.metaTitle || "");
        setMetaDesc(prod.metaDescription || "");
        if (Array.isArray(prod.metaKeywords)) {
          setKeywords(prod.metaKeywords);
        }
        if (Array.isArray(prod.tags)) {
          setTags(prod.tags.join(", "));
        }

        setShipping(prod.requiresShipping ?? true);
        if (prod.weight !== undefined) setWeight(String(prod.weight));
        if (prod.weightUnit) setWeightUnit(prod.weightUnit);
        if (prod.length !== undefined) setLength(String(prod.length));
        if (prod.width !== undefined) setWidth(String(prod.width));
        if (prod.height !== undefined) setHeight(String(prod.height));
        if (prod.dimensionUnit) setDimUnit(prod.dimensionUnit);

        setIsActive(prod.status !== "inactive" && prod.status !== "archived");
        setIsPublished(Boolean(prod.isPublished));
        setIsFeatured(Boolean(prod.isFeatured));
      } catch (err: any) {
        toast.error(err.message || "Failed to load product details");
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    }

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [edit, productId]);

  const margin = useMemo(
    () => Number(selling || 0) - Number(purchase || 0),
    [selling, purchase]
  );

  async function saveProduct(andAddAnother: boolean = false) {
    if (!name || !selling || !mrp || Number(mrp) < Number(selling)) {
      setError(true);
      document.getElementById("basic")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setError(false);
    setSaving(true);

    const payload: Partial<ProductItem> = {
      productCode: code.trim() || undefined,
      productName: name.trim(),
      productType: type.toLowerCase() as any,
      category: category || "General",
      subCategory: subCategory || undefined,
      brand: brand || undefined,
      unit: unit || "Piece",
      hsnSacCode: hsnCode.trim() || undefined,
      barcode: barcode.trim() || undefined,
      shortDescription: shortDesc.trim() || undefined,
      description: description.trim() || undefined,
      purchasePrice: Number(purchase || 0),
      sellingPrice: Number(selling),
      mrp: Number(mrp),
      tax: tax || undefined,
      reorderLevel: Number(reorderLevel || 0),
      slug: slug.trim() || undefined,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDesc.trim() || undefined,
      metaKeywords: keywords,
      tags: tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      requiresShipping: shipping,
      weight: Number(weight || 0),
      weightUnit,
      length: length ? Number(length) : undefined,
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      dimensionUnit: dimUnit,
      status: isActive ? "active" : "inactive",
      isPublished,
      isFeatured,
      images: images.length > 0 ? images.map((img, i) => ({ url: img.url, isPrimary: i === 0 })) : [],
    };

    try {
      if (edit && productId) {
        await productApi.updateProduct(productId, payload);
        toast.success("Product updated successfully");
      } else {
        await productApi.createProduct(payload);
        toast.success("Product created successfully");
      }

      if (andAddAnother) {
        // Reset form for next product
        setName("");
        setCode("");
        setSelling("");
        setPurchase("");
        setMrp("");
        setSlug("");
        setKeywords([]);
        setShortDesc("");
        setDescription("");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate({ to: "/products" });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  if (loadingInitial) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="sticky top-20 z-20 -mx-4 flex flex-col gap-3 border-b bg-background/90 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs text-muted-foreground">
              <Link to="/products">Products</Link> / {edit ? "Edit Product" : "Add Product"}
            </p>
            <h1 className="mt-1 text-3xl font-semibold">{edit ? "Edit Product" : "Add Product"}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs text-success">All changes saved</span>
            <Button asChild variant="ghost">
              <Link to="/products">Cancel</Link>
            </Button>
            {!edit && (
              <Button
                variant="outline"
                disabled={saving}
                onClick={() => saveProduct(true)}
              >
                Save & Add Another
              </Button>
            )}
            <LoadingButton loading={saving} onClick={() => saveProduct(false)}>
              Save Product
            </LoadingButton>
          </div>
        </div>

        {error && (
          <div className="flex gap-3 rounded-2xl border border-destructive/20 bg-danger-soft p-4 text-sm text-destructive">
            <AlertCircle className="size-5" />
            <div>
              <strong>Please fix the highlighted fields</strong>
              <p>Product name, valid selling price, and MRP (&ge; selling price) are required.</p>
            </div>
          </div>
        )}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="space-y-5">
            <div id="basic">
              <Section title="Basic Information">
                <Field label="Product Code" helper="Uppercase and unique">
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WH-1001"
                  />
                </Field>
                <Field
                  label="Product Name"
                  error={error && !name ? "Product name is required." : undefined}
                >
                  <Input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!edit || !slug) {
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, "")
                        );
                      }
                    }}
                    placeholder="e.g. Wireless Headphones"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Product Type</label>
                  <div className="grid grid-cols-4 rounded-xl border bg-muted/30 p-1">
                    {(["Simple", "Variable", "Digital", "Service"] as const).map((x) => (
                      <Button
                        key={x}
                        type="button"
                        variant={type === x ? "secondary" : "ghost"}
                        onClick={() => setType(x)}
                      >
                        {x}
                      </Button>
                    ))}
                  </div>
                </div>
                <Field label="Category">
                  <SelectBox
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select category</option>
                    {masterData.categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    {masterData.categories.length === 0 && (
                      <>
                        <option>Electronics</option>
                        <option>Apparel</option>
                        <option>Home & Kitchen</option>
                        <option>Audio</option>
                      </>
                    )}
                  </SelectBox>
                </Field>
                <Field label="Sub-Category">
                  <SelectBox
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    disabled={!category}
                  >
                    <option value="">{category ? "Choose sub-category" : "Choose category first"}</option>
                    <option value="Headphones">Headphones</option>
                    <option value="Smartphones">Smartphones</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Speakers">Speakers</option>
                  </SelectBox>
                </Field>
                <Field label="Brand (optional)">
                  <SelectBox
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  >
                    <option value="">Select brand</option>
                    {masterData.brands.map((b) => (
                      <option key={b._id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                    {masterData.brands.length === 0 && (
                      <>
                        <option>Auralink</option>
                        <option>Orbit</option>
                        <option>Common Good</option>
                      </>
                    )}
                  </SelectBox>
                </Field>
                <Field label="Unit">
                  <SelectBox
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    {masterData.units.map((u) => (
                      <option key={u._id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                    {masterData.units.length === 0 && (
                      <>
                        <option>Piece</option>
                        <option>Pair</option>
                        <option>Box</option>
                        <option>Kilogram</option>
                      </>
                    )}
                  </SelectBox>
                </Field>
                <Field label="HSN/SAC Code">
                  <Input
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    placeholder="e.g. 85183000"
                  />
                </Field>
                <Field label="Barcode">
                  <Input
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="e.g. 8901234567890"
                  />
                </Field>
                <Field label="Short Description">
                  <Input
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    placeholder="Summary for catalog card"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Description">
                    <textarea
                      className="min-h-28 w-full rounded-lg border bg-background p-3 text-sm"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detailed product specifications and details."
                    />
                  </Field>
                </div>
              </Section>
            </div>

            <Section title="Pricing & Tax">
              <Field label="Purchase Price">
                <Input
                  type="number"
                  value={purchase}
                  onChange={(e) => setPurchase(e.target.value)}
                  placeholder="0"
                />
              </Field>
              <Field
                label="Selling Price"
                helper={
                  margin > 0
                    ? `Margin ₹${margin.toLocaleString("en-IN")} · ${Math.round(
                        (margin / (Number(selling) || 1)) * 100
                      )}%`
                    : undefined
                }
              >
                <Input
                  type="number"
                  value={selling}
                  onChange={(e) => setSelling(e.target.value)}
                  placeholder="0"
                />
              </Field>
              <Field
                label="MRP"
                error={
                  Number(mrp) < Number(selling)
                    ? "MRP must be greater than or equal to selling price."
                    : undefined
                }
              >
                <Input
                  type="number"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  placeholder="0"
                />
              </Field>
              <Field label="Tax">
                <SelectBox
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                >
                  <option value="">Select tax</option>
                  {masterData.taxes.map((t) => (
                    <option key={t._id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                  {masterData.taxes.length === 0 && (
                    <>
                      <option>GST 18%</option>
                      <option>GST 12%</option>
                      <option>GST 5%</option>
                      <option>GST 0%</option>
                    </>
                  )}
                </SelectBox>
              </Field>
            </Section>

            <Section title="Inventory">
              <Field
                label="Reorder Level"
                helper="Get notified when stock falls below this level"
              >
                <Input
                  type="number"
                  value={reorderLevel}
                  onChange={(e) => setReorderLevel(e.target.value)}
                  placeholder="10"
                />
              </Field>
            </Section>

            <Section title="Product Images">
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    const sample = "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800";
                    setImages((prev) => [...prev, { url: sample }]);
                    toast.info("Image added");
                  }}
                  className="grid w-full place-items-center rounded-2xl border border-dashed bg-muted/20 p-10 text-center text-sm text-muted-foreground transition hover:bg-muted/30"
                >
                  <ImagePlus className="mb-3 size-7 text-primary" />
                  <strong className="text-foreground">Click to add sample product photo</strong>
                  <span>PNG, JPG or WebP up to 5MB</span>
                </button>
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className={`group relative grid aspect-square place-items-center overflow-hidden rounded-lg border ${
                          i === 0 ? "border-2 border-primary bg-accent" : "bg-muted"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt="preview"
                          className="size-full object-cover"
                        />
                        {i === 0 && (
                          <span className="absolute bottom-2 rounded-full bg-primary px-2 py-1 text-[10px] text-primary-foreground">
                            <Star className="mr-1 inline size-3" />
                            Primary
                          </span>
                        )}
                        <Button
                          size="icon"
                          type="button"
                          variant="destructive"
                          onClick={() =>
                            setImages((prev) => prev.filter((_, idx) => idx !== i))
                          }
                          className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>

            {type === "Variable" && (
              <Section title="Variants">
                <div className="sm:col-span-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-accent px-3 py-1 text-sm text-primary">
                      Color <X className="inline size-3 cursor-pointer" />
                    </span>
                    <span className="rounded-full bg-accent px-3 py-1 text-sm text-primary">
                      Size <X className="inline size-3 cursor-pointer" />
                    </span>
                    <Button type="button" variant="outline">
                      <Plus className="mr-1 size-4" />
                      Select attribute
                    </Button>
                    <Button type="button" className="ml-auto">
                      Generate Variants
                    </Button>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-sm">
                      <thead className="bg-muted">
                        <tr>
                          {["SKU", "Values", "Barcode", "Selling", "MRP", "Status", ""].map(
                            (x) => (
                              <th key={x} className="p-3 font-medium">
                                {x}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {variantsList.map((v, i) => (
                          <tr key={v.sku} className="border-t">
                            <td className="p-2">
                              <Input
                                value={v.sku}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setVariantsList((prev) =>
                                    prev.map((item, idx) =>
                                      idx === i ? { ...item, sku: val } : item
                                    )
                                  );
                                }}
                              />
                            </td>
                            <td className="p-2">
                              <span className="rounded bg-muted px-2 py-1 text-xs">{v.values}</span>
                            </td>
                            <td className="p-2">
                              <Input
                                value={v.barcode}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setVariantsList((prev) =>
                                    prev.map((item, idx) =>
                                      idx === i ? { ...item, barcode: val } : item
                                    )
                                  );
                                }}
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={v.selling}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setVariantsList((prev) =>
                                    prev.map((item, idx) =>
                                      idx === i ? { ...item, selling: val } : item
                                    )
                                  );
                                }}
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={v.mrp}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setVariantsList((prev) =>
                                    prev.map((item, idx) =>
                                      idx === i ? { ...item, mrp: val } : item
                                    )
                                  );
                                }}
                              />
                            </td>
                            <td className="p-2">
                              <Switch
                                checked={v.status}
                                onCheckedChange={(chk) => {
                                  setVariantsList((prev) =>
                                    prev.map((item, idx) =>
                                      idx === i ? { ...item, status: chk } : item
                                    )
                                  );
                                }}
                              />
                            </td>
                            <td>
                              <Button
                                size="icon"
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                  setVariantsList((prev) => prev.filter((_, idx) => idx !== i))
                                }
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Section>
            )}

            <Section title="SEO">
              <Field label="Slug" helper={`yoursite.com/products/${slug || "slug"}`}>
                <Input
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  placeholder="e.g. wireless-headphones"
                />
              </Field>
              <Field label="Meta Title">
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="e.g. Wireless Headphones | Bloom"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Meta Description" helper={`${metaDesc.length}/160`}>
                  <textarea
                    className="min-h-24 w-full rounded-lg border bg-background p-3 text-sm"
                    value={metaDesc}
                    onChange={(e) => setMetaDesc(e.target.value)}
                    placeholder="Brief description for search engine snippets."
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Meta Keywords">
                  <div className="flex min-h-10 flex-wrap gap-2 rounded-lg border p-2">
                    {keywords.map((x) => (
                      <span key={x} className="rounded bg-muted px-2 py-1 text-xs">
                        {x}{" "}
                        <button
                          type="button"
                          onClick={() => setKeywords((v) => v.filter((k) => k !== x))}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      className="min-w-24 flex-1 bg-transparent text-sm outline-none"
                      placeholder="Type and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const v = e.currentTarget.value.trim();
                          if (v && !keywords.includes(v)) setKeywords((k) => [...k, v]);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                  </div>
                </Field>
              </div>
            </Section>

            <Section title="Storefront">
              <Field label="Tags" helper="Separate tags with commas">
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="audio, premium, wireless"
                />
              </Field>
            </Section>

            <Section title="Shipping">
              <div className="sm:col-span-2 flex items-center justify-between rounded-lg border p-4">
                <span className="font-medium">Requires Shipping</span>
                <Switch checked={shipping} onCheckedChange={setShipping} />
              </div>
              {shipping && (
                <>
                  <Field label="Weight">
                    <div className="flex gap-2">
                      <Input
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="285"
                      />
                      <SelectBox
                        value={weightUnit}
                        onChange={(e) => setWeightUnit(e.target.value)}
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="lb">lb</option>
                      </SelectBox>
                    </div>
                  </Field>
                  <Field label="Dimensions (L × W × H)">
                    <div className="grid grid-cols-4 gap-2">
                      <Input
                        placeholder="L"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                      />
                      <Input
                        placeholder="W"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                      />
                      <Input
                        placeholder="H"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                      />
                      <SelectBox
                        value={dimUnit}
                        onChange={(e) => setDimUnit(e.target.value)}
                      >
                        <option value="cm">cm</option>
                        <option value="m">m</option>
                      </SelectBox>
                    </div>
                  </Field>
                </>
              )}
            </Section>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-40">
            <div className="bloom-card p-5">
              <h3 className="font-semibold">Status</h3>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span>Active</span>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>
            <div className="bloom-card p-5">
              <h3 className="font-semibold">Publish</h3>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span>Published</span>
                <Switch checked={isPublished} onCheckedChange={setIsPublished} />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span>Featured</span>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
            </div>
            <div className="bloom-card p-5">
              <h3 className="font-semibold">Organize</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Category</dt>
                  <dd className="font-medium">{category || "Not selected"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Sub-Category</dt>
                  <dd className="font-medium">{subCategory || "Not selected"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Brand</dt>
                  <dd className="font-medium">{brand || "Not selected"}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
