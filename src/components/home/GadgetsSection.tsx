"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/common/ProductCard";
import { ProductCardSkeleton } from "@/components/home/skeletons/HomeSkeletons";
import { useStore } from "@/context/StoreContext";
import { Product, DbProduct } from "@/types";

export const GadgetsSection: React.FC = () => {
  const [gadgets, setGadgets] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, toggleWishlist, isInWishlist, setQuickViewProduct } = useStore();

  useEffect(() => {
    async function fetchGadgets() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*, categories!inner(id, name, slug)")
          .neq("categories.slug", "smartphones")
          .neq("categories.slug", "laptops")
          .order("id", { ascending: true })
          .limit(4);

        if (data && !error) {
          const dbProds = data as unknown as DbProduct[];
          const mapped: Product[] = dbProds.map((p: DbProduct) => {
            const firstImg = Array.isArray(p.images) && p.images.length > 0
              ? p.images[0]
              : "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80";

            return {
              id: String(p.id),
              name: p.name,
              brand: p.brand,
              category: p.categories?.name || "Gadgets",
              image: firstImg,
              price: Number(p.price),
              originalPrice: p.discount_price ? Number(p.discount_price) : undefined,
              rating: p.rating ? Number(p.rating) : 4.8,
              reviewsCount: p.reviews_count || 35,
              specs: p.specs || undefined,
              inStock: (p.stock || 0) > 0,
              badge: p.is_featured ? { text: "SIGNATURE", type: "hot" } : undefined,
              description: p.description,
            };
          });
          setGadgets(mapped);
        } else {
          setGadgets([]);
        }
      } catch (err) {
        console.error("Gadgets fetch error:", err);
        setGadgets([]);
      } finally {
        setLoading(false);
      }
    }

    fetchGadgets();
  }, []);

  return (
    <section id="gadgets" className="py-12 sm:py-16 bg-white border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4">
        {/* Luxury Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <span className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.22em] block mb-1">
              Acoustic & Wearable Tech
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-neutral-950 tracking-tight">
              Curated Gadgets & <span className="italic font-serif">Horology</span>
            </h2>
            <div className="w-12 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full mt-2" />
          </div>

          <Link
            href="/products?category=gadgets"
            className="group hidden sm:inline-flex items-center gap-2 text-xs font-bold text-neutral-900 hover:text-gold-600 uppercase tracking-wider transition-colors"
          >
            <span>All Gadgets</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : gadgets.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-xs font-medium">
            No gadgets available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {gadgets.map((product) => (
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
      </div>
    </section>
  );
};
