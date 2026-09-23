import { useEffect, useState } from "react";
import { Edit3, Eye, Loader2, ShoppingBag, Warehouse } from "lucide-react";
import { Link, useParams } from "@tanstack/react-router";
import { DetailShell, InfoBlock } from "./detail-shell";
import { StatusBadge } from "./ui";
import { Button } from "@/components/ui/button";
import { productApi, ProductItem, ProductOrder } from "@/lib/product-api";
import { imageForProduct } from "@/lib/product-images";

export function ProductDetail() {
  const { productId } = useParams({ from: "/products/$productId/" });
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [prodData, ordersData] = await Promise.allSettled([
          productApi.getProductById(productId),
          productApi.getProductOrders(productId),
        ]);

        if (!isMounted) return;

        if (prodData.status === "fulfilled" && prodData.value) {
          setProduct(prodData.value);
        } else {
          setError("Product not found");
        }

        if (ordersData.status === "fulfilled" && Array.isArray(ordersData.value)) {
          setOrders(ordersData.value);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load product details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <DetailShell backTo="/products" backLabel="products" title="Loading Product..." subtitle="Please wait">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </DetailShell>
    );
  }

  if (error || !product) {
    return (
      <DetailShell backTo="/products" backLabel="products" title="Product Not Found" subtitle={`ID: ${productId}`}>
        <div className="bloom-card p-8 text-center">
          <p className="text-base font-medium">Unable to find product details for "{productId}".</p>
          <p className="mt-1 text-sm text-muted-foreground">The product may have been deleted or archived.</p>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <Link to="/products">Back to Catalog</Link>
          </Button>
        </div>
      </DetailShell>
    );
  }

  const prodCode = product.productCode || "PROD";
  const catName =
    typeof product.category === "object"
      ? product.category?.categoryName || "General"
      : product.category || "General";
  const brandName =
    typeof product.brand === "object"
      ? product.brand?.brandName || "—"
      : product.brand || "—";
  const unitName =
    typeof product.unit === "object"
      ? product.unit?.unitName || "Piece"
      : product.unit || "Piece";
  const sellingPrice = product.sellingPrice ?? 0;
  const mrp = product.mrp ?? sellingPrice;
  const stock = product.stock ?? product.stockQuantity ?? 0;
  const prodType =
    product.productType
      ? product.productType.charAt(0).toUpperCase() + product.productType.slice(1)
      : "Simple";
  const statusCapitalized =
    product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : "Active";
  const margin = Math.max(
    0,
    Math.round(((mrp - sellingPrice) / (mrp || 1)) * 100)
  );

  const imgUrl =
    product.images && product.images.length > 0
      ? product.images[0].url
      : imageForProduct(prodCode, 0);

  const editId = product._id || product.id || productId;

  return (
    <DetailShell
      backTo="/products"
      backLabel="products"
      title={product.productName}
      subtitle={`${prodCode} · ${catName} · ${brandName}`}
      actions={
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/storefront">
              <Eye />
              View on store
            </Link>
          </Button>
          <Button asChild>
            <Link to="/products/$productId/edit" params={{ productId: editId }}>
              <Edit3 />
              Edit product
            </Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <div className="space-y-5">
          <section className="bloom-card overflow-hidden">
            <img
              src={imgUrl}
              alt={product.productName}
              width={816}
              height={816}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Product overview</h2>
                <StatusBadge status={statusCapitalized} />
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {product.description ||
                  product.shortDescription ||
                  `Premium ${product.productName.toLowerCase()} from ${brandName}, prepared for storefront publication and inventory tracking.`}
              </p>
              <dl className="mt-6 grid gap-5 sm:grid-cols-3">
                <InfoBlock label="SKU" value={prodCode} />
                <InfoBlock label="Product type" value={prodType} />
                <InfoBlock
                  label="Tax class"
                  value={
                    typeof product.tax === "object"
                      ? product.tax?.taxName || "GST Standard · 18%"
                      : product.tax || "GST Standard · 18%"
                  }
                />
              </dl>
            </div>
          </section>
          <section className="bloom-card overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold">Recent orders with this product</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Linked directly to their order records
              </p>
            </div>
            {orders.length ? (
              orders.map((o) => (
                <Link
                  key={o.id}
                  to="/orders/$orderId"
                  params={{ orderId: o.id }}
                  className="grid grid-cols-[40px_1fr_auto] items-center gap-3 border-t p-4 transition hover:bg-accent/40"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-blue-soft text-blue">
                    <ShoppingBag className="size-4" />
                  </span>
                  <div>
                    <p className="font-medium">#{o.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.customer} · {o.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <strong className="text-sm">{o.total}</strong>
                    <p className="text-xs text-muted-foreground">{o.status}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="border-t p-6 text-sm text-muted-foreground">
                No orders yet for this product.
              </p>
            )}
          </section>
        </div>
        <aside className="space-y-5">
          <section className="bloom-card p-6">
            <h2 className="font-semibold">Pricing</h2>
            <p className="mt-4 text-3xl font-semibold">₹{sellingPrice.toLocaleString("en-IN")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              MRP ₹{mrp.toLocaleString("en-IN")}
              {margin > 0 && ` · ${margin}% off`}
            </p>
          </section>
          <section className="bloom-card p-6">
            <h2 className="font-semibold">Catalog details</h2>
            <dl className="mt-5 grid grid-cols-2 gap-5">
              <InfoBlock label="Category" value={catName} />
              <InfoBlock label="Brand" value={brandName} />
              <InfoBlock label="Type" value={prodType} />
              <InfoBlock label="Published" value={product.isPublished ? "Yes" : "No"} />
              <InfoBlock label="Unit" value={unitName} />
              <InfoBlock label="Warehouse" value="Mumbai Central" />
            </dl>
          </section>
          <section className="bloom-card p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-orange-soft text-orange">
                <Warehouse />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Available stock</p>
                <p className="text-xl font-semibold">{stock} units</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {stock < 10
                ? "Low stock — reorder recommended."
                : "Healthy stock level across warehouses."}
            </p>
          </section>
          <section className="bloom-card p-6">
            <h2 className="font-semibold">Search listing</h2>
            <p className="mt-4 text-sm font-medium text-blue">
              {product.metaTitle || `${product.productName} — Bloom`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              bloom.store/products/{(product.slug || prodCode).toLowerCase()}
            </p>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              {product.metaDescription ||
                `Shop the ${product.productName.toLowerCase()} by ${brandName} with free delivery and easy returns.`}
            </p>
          </section>
        </aside>
      </div>
    </DetailShell>
  );
}
