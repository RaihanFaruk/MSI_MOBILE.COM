"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    { id: "all", label: "All Flagships" },
    { id: "iphone", label: "Apple iPhone" },
    { id: "samsung", label: "Samsung Galaxy" },
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

            return {
              id: String(p.id),
              name: p.name,
              brand: p.brand,
              category: p.categories?.name || "Smartphones",
              image: firstImg,
              price: Number(p.price),
              originalPrice: p.discount_price ? Number(p.discount_price) : undefined,
              rating: p.rating ? Number(p.rating) : 4.9,
              reviewsCount: p.reviews_count || 12,
              specs: p.specs || undefined,
              inStock: (p.stock || 0) > 0,
              badge: p.is_featured ? { text: "OFFICIAL", type: "discount" } : undefined,
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
    <section id="smartphones" className="py-12 sm:py-16 bg-white border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4">
        {/* Luxury Section Header with Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
          <div>
            <span className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.22em] block mb-1">
              Titanium & Flagships
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-neutral-950 tracking-tight">
              Haute Mobile <span className="italic font-serif">Smartphones</span>
            </h2>
            <div className="w-12 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full mt-2" />
          </div>

          {/* Filter Tab Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-obsidian-950 text-gold-400 border border-gold-500/40 shadow-md shadow-black/10"
                    : "bg-[#FAF9F6] hover:bg-neutral-200/70 text-neutral-600 border border-neutral-200/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-xs font-medium">
            No smartphones available in this selection.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                brand={product.brand}
                image={product.image}
                price={product.price}
                originalPrice={product.originalPrice}
                rating={product.rating}
                reviewsCount={product.reviewsCount}
                specs={product.specs}
                badge={product.badge}
                isWishlisted={isInWishlist(product.id)}
                onAddToCart={() => addToCart(product)}
                onToggleWishlist={() => toggleWishlist(product.id)}
                onQuickView={() => setQuickViewProduct(product)}
              />
            ))}
          </div>
        )}

        {/* Bottom Section Link */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products?category=smartphones"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-900 border border-neutral-300 px-5 py-2.5 rounded-xl uppercase tracking-wider"
          >
            <span>All Smartphones</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
