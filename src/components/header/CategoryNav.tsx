"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Menu,
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
  Flame,
  ChevronDown,
} from "lucide-react";
import { Category, DbCategory } from "@/types";

const getCategoryIcon = (iconName?: string, className = "w-3.5 h-3.5") => {
  switch (iconName) {
    case "Smartphone":
      return <Smartphone className={className} />;
    case "Laptop":
      return <Laptop className={className} />;
    case "Tablet":
      return <Tablet className={className} />;
    case "Watch":
      return <Watch className={className} />;
    case "Headphones":
      return <Headphones className={className} />;
    case "Headset":
      return <Headset className={className} />;
    case "Volume2":
      return <Volume2 className={className} />;
    case "Zap":
      return <Zap className={className} />;
    case "Shield":
      return <Shield className={className} />;
    case "Gamepad2":
      return <Gamepad2 className={className} />;
    case "Camera":
      return <Camera className={className} />;
    case "Cpu":
    default:
      return <Cpu className={className} />;
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
];

export const CategoryNav: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug, icon")
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
      } catch {
        // Fallback to static category icons
      }
    }

    fetchCategories();
  }, []);

  return (
    <nav className="hidden lg:block bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Left: Browse All Categories Button */}
        <div className="relative group/menu py-2.5">
          <Link
            href="/products"
            className="flex items-center gap-2 bg-brand-primary text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-brand-primary-dark transition-colors shadow-xs"
          >
            <Menu className="w-4 h-4" />
            <span>ALL CATEGORIES</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </Link>

          {/* Hover dropdown list */}
          <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 hidden group-hover/menu:block z-50 animate-in fade-in-50 duration-150">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="flex items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-primary transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-500">{getCategoryIcon(cat.icon)}</span>
                  <span>{cat.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded-full">
                  {cat.itemCount}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Categories Horizontal Bar */}
        <div className="flex items-center gap-1 xl:gap-2 overflow-x-auto no-scrollbar py-2 text-xs font-semibold text-slate-700">
          {categories.slice(0, 7).map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:text-brand-primary hover:bg-blue-50/70 transition-all whitespace-nowrap"
            >
              <span className="text-slate-400">
                {getCategoryIcon(category.icon, "w-3.5 h-3.5")}
              </span>
              <span>{category.name}</span>
            </Link>
          ))}
        </div>

        {/* Right: Flash Deals Link */}
        <div className="flex items-center">
          <Link
            href="/products?sort=discount"
            className="flex items-center gap-1.5 text-xs font-extrabold text-brand-accent bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors border border-rose-200/60"
          >
            <Flame className="w-3.5 h-3.5 fill-brand-accent animate-pulse" />
            <span>Flash Deals</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
