"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LaptopCard } from "@/components/common/LaptopCard";
import { useStore } from "@/context/StoreContext";
import { LaptopProduct, DbProduct } from "@/types";

export const PowerfulLaptops: React.FC = () => {
  const [laptops, setLaptops] = useState<LaptopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, toggleWishlist, isInWishlist, setQuickViewProduct } = useStore();

  useEffect(() => {
    async function fetchLaptops() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*, categories!inner(id, name, slug)")
          .eq("categories.slug", "laptops")
          .order("id", { ascending: true })
          .limit(4);

        if (data && !error) {
          const dbProds = data as unknown as DbProduct[];
          const mapped: LaptopProduct[] = dbProds.map((p: DbProduct) => {
            const specs = p.specs || "";
            const parts = specs.split("•").map((s: string) => s.trim());
            const firstImg = Array.isArray(p.images) && p.images.length > 0
              ? p.images[0]
              : "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80";

            return {
              id: String(p.id),
              name: p.name,
              brand: p.brand,
              category: "laptops",
              image: firstImg,
              price: Number(p.price),
              originalPrice: p.discount_price ? Number(p.discount_price) : undefined,
              rating: p.rating ? Number(p.rating) : 4.9,
              reviewsCount: p.reviews_count || 15,
              processor: parts[0] || "Intel Core i9-14900HX",
              graphics: parts[1] || "NVIDIA RTX 4080 12GB",
              ram: parts[2] || "32GB DDR5",
              storage: parts[3] || "1TB NVMe SSD",
              display: parts[4] || '16" 240Hz Display',
              specs: p.specs,
              badge: p.is_featured ? { text: "MASTERWORK", type: "hot" } : undefined,
              description: p.description,
            };
          });
          setLaptops(mapped);
        } else {
          setLaptops([]);
        }
      } catch (err) {
        console.error("Laptops fetch error:", err);
        setLaptops([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLaptops();
  }, []);

  return (
    <section id="laptops" className="py-12 sm:py-16 bg-[#FAF9F6] border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4">
        {/* Luxury Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <span className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.22em] block mb-1">
              Engineering Excellence
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-neutral-950 tracking-tight">
              Elite Workstations & <span className="italic font-serif">Gaming Rig</span>
            </h2>
            <div className="w-12 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full mt-2" />
          </div>

          <Link
            href="/products?category=laptops"
            className="group hidden sm:inline-flex items-center gap-2 text-xs font-bold text-neutral-900 hover:text-gold-600 uppercase tracking-wider transition-colors"
          >
            <span>All Workstations</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Wide Laptop Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-neutral-200/80 p-5 flex flex-col sm:flex-row items-center gap-6 animate-pulse"
              >
                <div className="w-full sm:w-48 aspect-video bg-neutral-100 rounded-xl" />
                <div className="flex-1 w-full space-y-3">
                  <div className="w-20 h-3 bg-neutral-200 rounded-full" />
                  <div className="w-3/4 h-5 bg-neutral-200 rounded-md" />
                  <div className="w-1/2 h-3.5 bg-neutral-100 rounded-md" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="w-28 h-6 bg-neutral-200 rounded-md" />
                    <div className="w-24 h-9 bg-neutral-200 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : laptops.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-xs font-medium">
            No laptop models available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {laptops.map((laptop) => (
              <LaptopCard
                key={laptop.id}
                laptop={laptop}
                isWishlisted={isInWishlist(laptop.id)}
                onAddToCart={() => addToCart(laptop)}
                onToggleWishlist={() => toggleWishlist(laptop.id)}
                onQuickView={() => setQuickViewProduct(laptop)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
