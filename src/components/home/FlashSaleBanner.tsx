"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/common/ProductCard";
import { ProductCardSkeleton } from "@/components/home/skeletons/HomeSkeletons";
import { useStore } from "@/context/StoreContext";
import { Product, DbProduct } from "@/types";

export const FlashSaleBanner: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, toggleWishlist, isInWishlist, setQuickViewProduct } = useStore();

  // Initial countdown state: 12 hours, 45 mins, 30 secs
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 24, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchFlashDeals() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*, categories(id, name, slug)")
          .not("discount_price", "is", null)
          .order("id", { ascending: true })
          .limit(4);

        if (data && !error) {
          const dbProds = data as unknown as DbProduct[];
          const mapped: Product[] = dbProds.map((p: DbProduct, idx: number) => {
            const firstImg = Array.isArray(p.images) && p.images.length > 0
              ? p.images[0]
              : "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80";

            return {
              id: String(p.id),
              name: p.name,
              brand: p.brand,
              category: p.categories?.name || "Smartphones",
              image: firstImg,
              price: Number(p.price),
              originalPrice: p.discount_price ? Number(p.discount_price) : undefined,
              rating: p.rating ? Number(p.rating) : 4.9,
              reviewsCount: p.reviews_count || 50,
              specs: p.specs || undefined,
              inStock: (p.stock || 0) > 0,
              stockPercentage: [78, 62, 88, 45][idx % 4],
              badge: { text: "LIMITED DROP", type: "discount" },
              description: p.description,
            };
          });
          setProducts(mapped);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Flash sale fetch error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFlashDeals();
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <section id="flash-sale" className="py-10 sm:py-14 bg-white border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4">
        {/* Luxury Flash Sale Header Strip */}
        <div className="bg-obsidian-950 border border-gold-500/30 rounded-2xl p-4 sm:p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 relative overflow-hidden">
          {/* Subtle gold halo glow behind banner */}
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left: Title & Countdown */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-7 text-center sm:text-left z-10">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 shadow-inner">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h2 className="text-lg sm:text-2xl font-serif tracking-tight text-white">
                    Limited Opportunity <span className="text-gold-400 font-serif italic">Vault</span>
                  </h2>
                </div>
                <span className="text-xs text-neutral-400 font-light tracking-wide">
                  Rare allocations at privilege pricing
                </span>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-widest hidden md:inline">
                Window Closes:
              </span>
              <div className="flex items-center gap-1.5">
                <div className="bg-obsidian-900 border border-amber-500/30 text-white rounded-lg px-2.5 py-1 text-center shadow-xs">
                  <span className="font-extrabold text-sm sm:text-base font-mono text-gold-300">
                    {formatNumber(timeLeft.hours)}
                  </span>
                  <span className="block text-[8px] text-neutral-500 uppercase font-bold">Hrs</span>
                </div>
                <span className="text-gold-500 font-bold">:</span>
                <div className="bg-obsidian-900 border border-amber-500/30 text-white rounded-lg px-2.5 py-1 text-center shadow-xs">
                  <span className="font-extrabold text-sm sm:text-base font-mono text-gold-300">
                    {formatNumber(timeLeft.minutes)}
                  </span>
                  <span className="block text-[8px] text-neutral-500 uppercase font-bold">Min</span>
                </div>
                <span className="text-gold-500 font-bold">:</span>
                <div className="bg-obsidian-900 border border-amber-500/30 text-white rounded-lg px-2.5 py-1 text-center shadow-xs">
                  <span className="font-extrabold text-sm sm:text-base font-mono text-gold-400 animate-pulse">
                    {formatNumber(timeLeft.seconds)}
                  </span>
                  <span className="block text-[8px] text-gold-500 uppercase font-bold">Sec</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: View All Button */}
          <Link
            href="/products?sort=discount"
            className="z-10 group inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-obsidian-950 font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md shadow-gold-500/20 transition-all cursor-pointer"
          >
            <span>View All Allocations</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : products.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  isWishlisted={isInWishlist(product.id)}
                  onAddToCart={() => addToCart(product)}
                  onToggleWishlist={() => toggleWishlist(product.id)}
                  onQuickView={() => setQuickViewProduct(product)}
                />
              ))}
        </div>
      </div>
    </section>
  );
};
