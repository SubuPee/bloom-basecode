import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Eye, Search, ShoppingBag, Sparkles, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "./app-shell";
import { PageHeader } from "./ui";
import { Button } from "@/components/ui/button";
import { imageForProduct } from "@/lib/product-images";
import { storefrontApi, type StorefrontPreviewData } from "@/lib/storefront-api";

const highlightIconMap: Record<string, any> = {
  Truck,
  Star,
  ShoppingBag,
};

export function StorefrontPage() {
  const [preview, setPreview] = useState<StorefrontPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadPreview() {
      try {
        setLoading(true);
        const data = await storefrontApi.getPreview();
        setPreview(data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load storefront preview");
      } finally {
        setLoading(false);
      }
    }
    loadPreview();
  }, []);

  const store = preview?.store || {
    name: "Bloom",
    domain: "bloom.store",
    liveUrl: "https://bloom.store",
    description: "A live preview of how your published catalog and content appear to shoppers.",
  };

  const hero = preview?.hero || {
    id: "home-banner",
    title: "Monsoon Essentials",
    type: "Homepage banner",
    summary:
      "Seasonal campaign featuring weather-ready apparel and accessories with breathable fabrics.",
    badgeText: "Homepage banner",
    ctaText: "Shop the edit",
    ctaLink: "/storefront",
    editLink: "/cms/home-banner",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  };

  const highlights = preview?.highlights || [
    { icon: "Truck", title: "Free delivery", text: "On all orders above ₹999" },
    { icon: "Star", title: "4.8 average rating", text: "Across 12,480 reviews" },
    { icon: "ShoppingBag", title: "Easy returns", text: "30-day no-questions policy" },
  ];

  const allPublished = preview?.publishedProducts || [];
  const filteredProducts = allPublished.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.productCode?.toLowerCase().includes(q)
    );
  });

  const handleOpenLiveSite = () => {
    if (typeof window !== "undefined") {
      window.open(store.liveUrl || "https://bloom.store", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Storefront"
          description="A live preview of how your published catalog and content appear to shoppers."
          action={
            <Button className="rounded-full" onClick={handleOpenLiveSite}>
              <Eye />
              Open live site
              <ArrowUpRight />
            </Button>
          }
        />

        <section className="bloom-card overflow-hidden">
          <div className="flex items-center gap-4 border-b px-6 py-4">
            <span className="text-lg font-semibold">{store.domain || "bloom.store"}</span>
            <div className="relative ml-auto hidden w-full max-w-xs md:block">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-10 w-full rounded-full border bg-muted/60 pl-11 pr-4 text-sm outline-none transition focus:border-ring focus:bg-background"
                placeholder="Search the store"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
              <ShoppingBag className="size-4" />
            </span>
          </div>
          <div className="grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
            <div className="my-auto">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-soft px-3 py-1 text-xs font-medium text-blue">
                <Sparkles className="size-3" />
                {hero.type || hero.badgeText}
              </span>
              <h2 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
                {hero.title}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                {hero.summary}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button className="h-12 rounded-full px-6">
                  {hero.ctaText || "Shop the edit"}
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-full px-6">
                  <Link to="/cms/$contentId" params={{ contentId: hero.id || "home-banner" }}>
                    Edit this banner
                  </Link>
                </Button>
              </div>
            </div>
            <img
              src={hero.imageUrl || imageForProduct("WH-1001", 0)}
              alt={hero.title}
              width={816}
              height={816}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-sm"
            />
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          {highlights.map(({ icon, title, text }) => {
            const Icon = highlightIconMap[icon] || ShoppingBag;
            return (
              <div key={title} className="bloom-card flex items-center gap-4 p-5">
                <span className="grid size-11 place-items-center rounded-full bg-orange-soft text-orange">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <section className="bloom-card p-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold">Published products</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {preview?.totalPublishedCount ?? allPublished.length} products currently visible on the storefront.
              </p>
            </div>
            <Button asChild variant="ghost" className="rounded-full">
              <Link to="/products">
                Manage catalog
                <ArrowUpRight />
              </Link>
            </Button>
          </div>

          {loading && allPublished.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading published products…
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {searchQuery ? "No products match your search query." : "No products currently published."}
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {filteredProducts.map((p, i) => (
                <Link
                  key={p.id || p.productCode || i}
                  to="/products/$productId"
                  params={{ productId: p.productCode || p.id || String(i + 1) }}
                  className="group rounded-3xl border bg-muted/20 p-3 transition hover:border-ring/50"
                >
                  <img
                    src={p.image || imageForProduct(p.productCode || "PROD", i)}
                    alt={p.name}
                    width={816}
                    height={816}
                    loading="lazy"
                    className="aspect-square w-full rounded-2xl object-cover"
                  />
                  <div className="px-2 pb-2 pt-4">
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                    <p className="mt-1 font-medium group-hover:text-blue">{p.name}</p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <strong className="text-lg">
                        {p.sellingPriceFormatted || `₹${p.sellingPrice?.toLocaleString("en-IN")}`}
                      </strong>
                      {p.hasDiscount && p.mrpFormatted && (
                        <span className="text-xs text-muted-foreground line-through">
                          {p.mrpFormatted}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
