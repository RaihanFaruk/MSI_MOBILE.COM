"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { useStore } from "@/context/StoreContext";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/common/ProductCard";
import { Product, DbProduct } from "@/types";
import { Heart, ShoppingBag, ArrowRight, Loader2, Trash2 } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, clearWishlist, addToCart, toggleWishlist, setQuickViewProduct } = useStore();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlistProducts = useCallback(async () => {
    if (wishlist.length === 0) {
      setWishlistProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .in("id", wishlist);

      if (data && !error) {
        const dbProds = data as unknown as DbProduct[];
        const mapped: Product[] = dbProds.map((p) => {
          const firstImg = Array.isArray(p.images) && p.images.length > 0
            ? p.images[0]
            : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80";

          return {
            id: String(p.id),
            name: p.name,
            brand: p.brand,
            category: p.categories?.name || "Tech",
            image: firstImg,
            price: Number(p.price),
            originalPrice: p.discount_price ? Number(p.discount_price) : undefined,
            rating: p.rating ? Number(p.rating) : 5,
            reviewsCount: p.reviews_count || 10,
            specs: p.specs,
            inStock: (p.stock || 0) > 0,
            badge: p.is_featured ? { text: "Hot", type: "hot" } : undefined,
          };
        });

        setWishlistProducts(mapped);
      }
    } catch (err) {
      console.error("Fetch wishlist error:", err);
    } finally {
      setLoading(false);
    }
  }, [wishlist]);

  useEffect(() => {
    fetchWishlistProducts();
  }, [fetchWishlistProducts]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 text-rose-500 font-extrabold text-xs uppercase tracking-wider">
                <Heart className="w-4 h-4 fill-rose-500" />
                <span>My Saved Items</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Your Wishlist ({wishlist.length})
              </h1>
            </div>

            {wishlist.length > 0 && (
              <button
                onClick={clearWishlist}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Wishlist</span>
              </button>
            )}
          </div>

          {/* Body */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
              <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
              <p className="text-sm font-semibold">Loading saved products...</p>
            </div>
          ) : wishlistProducts.length === 0 ? (
            /* Empty State */
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs max-w-lg mx-auto space-y-5">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">Your wishlist is empty</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Explore our collection of flagship smartphones, laptops, and smart gadgets to save your favorites for later!
                </p>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-500/20"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          ) : (
            /* Products Grid */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {wishlistProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  {...prod}
                  isWishlisted={true}
                  onAddToCart={(p) => addToCart(p)}
                  onToggleWishlist={(id) => toggleWishlist(String(id))}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
