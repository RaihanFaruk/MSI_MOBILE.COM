"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/common/ProductCard";
import { ProductCardSkeleton } from "@/components/home/skeletons/HomeSkeletons";
import { useStore } from "@/context/StoreContext";
import { Product, DbProduct } from "@/types";

export const TrendingNow: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, toggleWishlist, isInWishlist, setQuickViewProduct } = useStore();

  useEffect(() => {
    async function fetchTrending() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*, categories(id, name, slug)")
          .order("reviews_count", { ascending: false })
          .limit(4);

        if (data && !error) {
          const dbProds = data as unknown as DbProduct[];
          const mapped: Product[] = dbProds.map((p: DbProduct) => {
            const firstImg = Array.isArray(p.images) && p.images.length > 0
              ? p.images[0]
              : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80";

            const regularPrice = Number(p.price) || 0;
            const discountPrice = p.discount_price ? Number(p.discount_price) : null;
            const hasValidDiscount = discountPrice !== null && discountPrice > 0 && discountPrice < regularPrice;
            const sellingPrice = hasValidDiscount ? discountPrice : regularPrice;
            const originalPrice = hasValidDiscount ? regularPrice : undefined;
            const discountPct = hasValidDiscount ? Math.round(((regularPrice - discountPrice) / regularPrice) * 100) : null;
            const stock = p.stock !== undefined && p.stock !== null ? Number(p.stock) : 0;

            return {
              id: String(p.id),
              slug: p.slug,
              name: p.name,
              brand: p.brand,
              category: p.categories?.name || "Smartphones",
              image: firstImg,
              price: sellingPrice,
              originalPrice,
              rating: p.rating ? Number(p.rating) : 4.9,
              reviewsCount: p.reviews_count || 100,
              specs: p.specs || undefined,
              inStock: stock > 0,
              stock,
              badge: hasValidDiscount
                ? { text: `${discountPct}% OFF`, type: "discount" }
                : { text: "TRENDING", type: "hot" },
              description: p.description,
            };
          });
          setProducts(mapped);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Trending fetch error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTrending();
  }, []);

  return (
    <section id="trending" className="py-8 sm:py-12 bg-bg-light border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="p-1.5 sm:p-2 rounded-xl bg-rose-100/80 text-rose-600">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-600" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg sm:text-2xl font-extrabold text-navy-dark tracking-tight">
                  Trending Now 🔥
                </h2>
              </div>
              <p className="text-[11px] sm:text-sm text-slate-500">
                Most viewed & ordered devices in Bangladesh this week
              </p>
            </div>
          </div>

          <Link
            href="/products?sort=popular"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-primary hover:text-brand-primary-dark transition-colors shrink-0"
          >
            <span className="hidden xs:inline">View All</span>
            <span className="xs:hidden">All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            No trending products found.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                slug={product.slug}
                name={product.name}
                brand={product.brand}
                image={product.image}
                price={product.price}
                originalPrice={product.originalPrice}
                rating={product.rating}
                reviewsCount={product.reviewsCount}
                specs={product.specs}
                badge={product.badge}
                inStock={product.inStock}
                stock={product.stock}
                isWishlisted={isInWishlist(product.id)}
                onAddToCart={() => addToCart(product)}
                onToggleWishlist={() => toggleWishlist(product.id)}
                onQuickView={() => setQuickViewProduct(product)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
