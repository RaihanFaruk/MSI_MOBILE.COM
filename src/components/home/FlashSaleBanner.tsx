"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/common/ProductCard";
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
              badge: { text: "FLASH DEAL", type: "discount" },
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
    <section id="flash-sale" className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Flash Sale Header Strip */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 rounded-2xl p-4 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          {/* Left: Title & Countdown */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300 animate-bounce" />
              </span>
              <div>
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider">
                    FLASH SALE
                  </h2>
                  <span className="text-[10px] bg-white text-rose-600 font-extrabold px-1.5 py-0.5 rounded">
                    HOT
                  </span>
                </div>
                <span className="text-xs text-rose-100 font-medium">Limited Stock Deals</span>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-100 font-semibold uppercase tracking-wider hidden md:inline">
                Ending In:
              </span>
              <div className="flex items-center gap-1.5">
                <div className="bg-white text-slate-900 rounded-lg px-2.5 py-1 text-center shadow-xs">
                  <span className="font-extrabold text-sm sm:text-base font-mono">
                    {formatNumber(timeLeft.hours)}
                  </span>
                  <span className="block text-[8px] text-slate-400 uppercase font-bold">Hrs</span>
                </div>
                <span className="text-white font-bold">:</span>
                <div className="bg-white text-slate-900 rounded-lg px-2.5 py-1 text-center shadow-xs">
                  <span className="font-extrabold text-sm sm:text-base font-mono">
                    {formatNumber(timeLeft.minutes)}
                  </span>
                  <span className="block text-[8px] text-slate-400 uppercase font-bold">Min</span>
                </div>
                <span className="text-white font-bold">:</span>
                <div className="bg-white text-slate-900 rounded-lg px-2.5 py-1 text-center shadow-xs">
                  <span className="font-extrabold text-sm sm:text-base font-mono text-rose-600">
                    {formatNumber(timeLeft.seconds)}
                  </span>
                  <span className="block text-[8px] text-slate-400 uppercase font-bold">Sec</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: View All Offers Link */}
          <Link
            href="/products?sort=discount"
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white text-white hover:text-rose-600 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold backdrop-blur-sm transition-all duration-200 shadow-xs active:scale-95"
          >
            <span className="hidden sm:inline">VIEW ALL OFFERS</span>
            <span className="sm:hidden">VIEW ALL</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <span className="text-xs font-semibold">Loading flash sale items...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            No flash sale deals active right now.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
                stockPercentage={product.stockPercentage}
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
