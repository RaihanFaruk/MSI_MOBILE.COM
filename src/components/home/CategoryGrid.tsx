"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Headset,
  Volume2,
  Zap,
  Shield,
  Gamepad2,
  Camera,
  Cpu,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Category, DbCategory } from "@/types";

const getCategoryIcon = (iconName?: string) => {
  const cls = "w-5 h-5 sm:w-6 sm:h-6 text-gold-500 group-hover:scale-110 transition-transform duration-300";
  switch (iconName) {
    case "Smartphone":
      return <Smartphone className={cls} />;
    case "Laptop":
      return <Laptop className={cls} />;
    case "Tablet":
      return <Tablet className={cls} />;
    case "Watch":
      return <Watch className={cls} />;
    case "Headphones":
      return <Headphones className={cls} />;
    case "Headset":
      return <Headset className={cls} />;
    case "Volume2":
      return <Volume2 className={cls} />;
    case "Zap":
      return <Zap className={cls} />;
    case "Shield":
      return <Shield className={cls} />;
    case "Gamepad2":
      return <Gamepad2 className={cls} />;
    case "Camera":
      return <Camera className={cls} />;
    case "Cpu":
    default:
      return <Cpu className={cls} />;
  }
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Smartphones", slug: "smartphones", itemCount: 142, icon: "Smartphone" },
  { id: "2", name: "Laptops", slug: "laptops", itemCount: 89, icon: "Laptop" },
  { id: "3", name: "Tablets", slug: "tablets", itemCount: 44, icon: "Tablet" },
  { id: "4", name: "Smart Watches", slug: "smart-watches", itemCount: 65, icon: "Watch" },
  { id: "5", name: "Earbuds", slug: "earbuds", itemCount: 72, icon: "Headphones" },
  { id: "6", name: "Headphones", slug: "headphones", itemCount: 38, icon: "Headset" },
  { id: "7", name: "Speakers", slug: "speakers", itemCount: 49, icon: "Volume2" },
  { id: "8", name: "Chargers & Power Banks", slug: "chargers", itemCount: 55, icon: "Zap" },
  { id: "9", name: "Cases & Covers", slug: "cases", itemCount: 110, icon: "Shield" },
  { id: "10", name: "Gaming", slug: "gaming", itemCount: 29, icon: "Gamepad2" },
  { id: "11", name: "Cameras", slug: "cameras", itemCount: 25, icon: "Camera" },
  { id: "12", name: "Smart Gadgets", slug: "smart-gadgets", itemCount: 44, icon: "Cpu" },
];

export const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [showAllMobile, setShowAllMobile] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug, icon, description")
          .order("id", { ascending: true });

        if (data && data.length > 0 && !error) {
          const mapped: Category[] = data.map((c: DbCategory) => ({
            id: String(c.id),
            name: c.name,
            slug: c.slug,
            itemCount: 20,
            icon: c.icon || "Cpu",
          }));
          setCategories(mapped);
        }
      } catch (err) {
        console.error("Categories fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-[#FAF9F6] border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4">
        {/* Luxury Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <span className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.22em] block mb-1">
              Curated Departments
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-neutral-950 tracking-tight">
              Explore by <span className="italic font-serif">Category</span>
            </h2>
            <div className="w-12 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full mt-2" />
          </div>

          <Link
            href="/products"
            className="group hidden sm:inline-flex items-center gap-2 text-xs font-bold text-neutral-900 hover:text-gold-600 uppercase tracking-wider transition-colors"
          >
            <span>All Collections</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Categories Grid */}
        {loading && categories.length === 0 ? (
          <div className="py-12 flex items-center justify-center gap-2 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-gold-500" />
            <span className="text-xs font-medium">Loading collections...</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {categories.map((cat, index) => {
              const isHiddenOnMobile = !showAllMobile && index >= 8;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.slug)}`}
                  className={`group flex flex-col items-center text-center p-3.5 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 hover:border-gold-500/50 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 ${
                    isHiddenOnMobile ? "hidden md:flex" : "flex"
                  }`}
                >
                  {/* Circular Luxury Icon Container */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FAF9F6] border border-neutral-100 group-hover:border-gold-500/30 group-hover:bg-gold-500/10 flex items-center justify-center mb-3 transition-all duration-300">
                    {getCategoryIcon(cat.icon)}
                  </div>

                  {/* Name */}
                  <h3 className="text-[11px] sm:text-xs font-bold text-neutral-800 group-hover:text-gold-600 transition-colors line-clamp-1 leading-snug tracking-wide">
                    {cat.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        )}

        {/* Mobile View More Toggle */}
        <div className="mt-6 text-center md:hidden">
          <button
            onClick={() => setShowAllMobile(!showAllMobile)}
            className="inline-flex items-center gap-2 text-xs font-bold text-obsidian-950 bg-white border border-neutral-300 px-5 py-2.5 rounded-xl shadow-xs"
          >
            <span>{showAllMobile ? "Show Less" : "View All Collections"}</span>
            {showAllMobile ? <ChevronUp className="w-3.5 h-3.5 text-gold-600" /> : <ChevronDown className="w-3.5 h-3.5 text-gold-600" />}
          </button>
        </div>
      </div>
    </section>
  );
};
