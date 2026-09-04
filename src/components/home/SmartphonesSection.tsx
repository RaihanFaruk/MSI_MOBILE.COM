"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Smartphone, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/common/ProductCard";
import { ProductCardSkeleton } from "@/components/home/skeletons/HomeSkeletons";
import { useStore } from "@/context/StoreContext";
import { Product, DbProduct } from "@/types";

export const SmartphonesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, toggleWishlist, isInWishlist, setQuickViewProduct } = useStore();

  const TABS = [
    { id: "all", label: "All" },
    { id: "samsung", label: "Samsung" },
    { id: "iphone", label: "Apple" },
    { id: "xiaomi", label: "Xiaomi" },
    { id: "oneplus", label: "OnePlus" },
  ];

  useEffect(() => {
    async function fetchSmartphones() {
      setLoading(true);
      try {
        let query = supabase
          .from("products")
          .select("*, categories!inner(id, name, slug)")
          .eq("categories.slug", "smartphones")
          .order("id", { ascending: true })
          .limit(8);

        if (activeTab === "samsung") {
          query = query.ilike("brand", "%samsung%");
        } else if (activeTab === "iphone") {
          query = query.ilike("brand", "%apple%");
        } else if (activeTab === "xiaomi") {
          query = query.ilike("brand", "%xiaomi%");
        } else if (activeTab === "oneplus") {
          query = query.ilike("brand", "%oneplus%");
        }

        const { data, error } = await query;
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
              reviewsCount: p.reviews_count || 12,
              specs: p.specs || undefined,
              inStock: stock > 0,
              stock,
              badge: hasValidDiscount
                ? { text: `${discountPct}% OFF`, type: "discount" }
                : p.is_featured
                ? { text: "OFFICIAL", type: "discount" }
                : undefined,
              description: p.description,
            };
          });
          setProducts(mapped);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Smartphones fetch error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSmartphones();
  }, [activeTab]);

  return (
    <section id="smartphones" className="py-8 sm:py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header with Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4 mb-5 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="p-1.5 sm:p-2 rounded-xl bg-blue-100/80 text-brand-primary">
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-navy-dark tracking-tight">
                Latest Smartphones
              </h2>
              <p className="text-[11px] sm:text-sm text-slate-500">
                Official global & TRCS verified devices with BTRC approval
              </p>
            </div>
          </div>

          {/* Filter Tab Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap active:scale-95 min-h-[36px] ${
                  activeTab === tab.id
                    ? "bg-brand-primary text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            No smartphones available in this category.
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

        {/* Bottom Link */}
        <div className="mt-8 text-center">
          <Link
            href="/products?category=smartphones"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-primary hover:text-brand-primary-dark bg-blue-50 hover:bg-blue-100/80 px-6 py-2.5 rounded-xl transition-all"
          >
            <span>Explore All Smartphones</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
