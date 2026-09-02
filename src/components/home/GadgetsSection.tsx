"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Headphones, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/common/ProductCard";
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
              badge: p.is_featured ? { text: "POPULAR", type: "hot" } : undefined,
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
    <section id="gadgets" className="py-8 sm:py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-100/80 text-purple-600">
              <Headphones className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-navy-dark tracking-tight">
                Gadgets & Accessories
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Premium audio, fast chargers, power banks and lifestyle gear
              </p>
            </div>
          </div>

          <Link
            href="/products?category=gadgets"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-primary hover:text-brand-primary-dark transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            <span className="text-xs font-semibold">Loading gadgets...</span>
          </div>
        ) : gadgets.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            No gadgets available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
