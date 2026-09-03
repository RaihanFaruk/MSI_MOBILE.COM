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
  ChevronDown,
  Sparkles,
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
        // Fallback
      }
    }

    fetchCategories();
  }, []);

  return (
    <nav className="hidden lg:block bg-obsidian-950 border-b border-amber-500/15 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Left: Browse All Categories Button */}
        <div className="relative group/menu py-2">
          <Link
            href="/products"
            className="flex items-center gap-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-obsidian-950 font-bold text-xs uppercase tracking-wider py-2 px-4 rounded-lg transition-all shadow-md shadow-gold-500/15 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>All Collections</span>
            <ChevronDown className="w-3.5 h-3.5 ml-1 transition-transform group-hover/menu:rotate-180" />
          </Link>

          {/* Mega Dropdown */}
          <div className="absolute left-0 top-full mt-1 w-64 bg-obsidian-900/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-500/20 py-2.5 hidden group-hover/menu:block z-50 animate-in fade-in-50">
            <div className="px-4 py-2 border-b border-neutral-800">
              <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">
                Curated Departments
              </span>
            </div>
            <div className="py-1 max-h-[70vh] overflow-y-auto">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="flex items-center justify-between px-4 py-2.5 text-xs text-neutral-300 hover:text-gold-300 hover:bg-neutral-800/70 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-gold-500 group-hover:scale-110 transition-transform">
                      {getCategoryIcon(cat.icon)}
                    </span>
                    <span className="font-medium tracking-wide">{cat.name}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 group-hover:text-gold-400">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Horizontal Category Nav Links */}
        <ul className="flex items-center gap-1 xl:gap-2">
          {categories.slice(0, 7).map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/products?category=${cat.slug}`}
                className="group relative flex items-center gap-1.5 py-3 px-3 text-xs font-medium text-neutral-300 hover:text-white transition-colors tracking-wide"
              >
                <span className="text-gold-500/80 group-hover:text-gold-400 transition-colors">
                  {getCategoryIcon(cat.icon, "w-3.5 h-3.5")}
                </span>
                <span>{cat.name}</span>
                {/* Gold Hairline Active Indicator */}
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-gold-400 to-gold-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
              </Link>
            </li>
          ))}
        </ul>

        {/* Right: VIP Exclusive Offer Link */}
        <div className="flex items-center gap-2 pl-3 border-l border-neutral-800">
          <Link
            href="/products?featured=true"
            className="flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300 py-1.5 px-3 rounded-lg bg-gold-500/10 border border-gold-500/20 hover:border-gold-500/40 transition-all tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>VIP Editions</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
