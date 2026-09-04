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
  switch (iconName) {
    case "Smartphone":
      return <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />;
    case "Laptop":
      return <Laptop className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />;
    case "Tablet":
      return <Tablet className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />;
    case "Watch":
      return <Watch className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />;
    case "Headphones":
      return <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />;
    case "Headset":
      return <Headset className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />;
    case "Volume2":
      return <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />;
    case "Zap":
      return <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />;
    case "Shield":
      return <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />;
    case "Gamepad2":
      return <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />;
    case "Camera":
      return <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />;
    case "Cpu":
    default:
      return <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />;
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
    <section className="py-8 sm:py-12 bg-bg-light border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-navy-dark tracking-tight">
              Shop by Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Explore authentic tech products curated by department
            </p>
          </div>

          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-primary hover:text-brand-primary-dark transition-colors"
          >
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        {loading && categories.length === 0 ? (
          <div className="py-12 flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            <span className="text-xs font-semibold">Loading departments...</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-6 gap-2 sm:gap-4 lg:gap-5">
            {categories.map((cat, index) => {
              const isHiddenOnMobile = !showAllMobile && index >= 6;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.slug)}`}
                  className={`group flex flex-col items-center text-center p-2.5 sm:p-4 rounded-xl bg-white border border-slate-100 hover:border-blue-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${
                    isHiddenOnMobile ? "hidden sm:flex" : "flex"
                  }`}
                >
                  {/* Circular Icon Container */}
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-blue-50/80 group-hover:bg-brand-primary/10 flex items-center justify-center mb-2 transition-colors duration-300 shadow-2xs">
                    {getCategoryIcon(cat.icon)}
                  </div>

                  {/* Name */}
                  <h3 className="text-[10px] sm:text-xs font-bold text-slate-800 group-hover:text-brand-primary transition-colors line-clamp-2 leading-tight">
                    {cat.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        )}

        {/* Mobile View More Toggle */}
        <div className="mt-4 text-center md:hidden">
          <button
            onClick={() => setShowAllMobile(!showAllMobile)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs"
          >
            <span>{showAllMobile ? "Show Less" : "View All Categories"}</span>
            {showAllMobile ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </section>
  );
};
