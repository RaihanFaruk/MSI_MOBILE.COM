"use client";

import React from "react";
import Link from "next/link";
import { Crown } from "lucide-react";

export const BRANDS_LIST = [
  { name: "Apple", logo: "🍎" },
  { name: "Samsung", logo: "📱" },
  { name: "Sony", logo: "🎧" },
  { name: "MSI", logo: "💻" },
  { name: "ASUS ROG", logo: "🎮" },
  { name: "Xiaomi", logo: "⚡" },
  { name: "OnePlus", logo: "🔴" },
  { name: "Lenovo Legion", logo: "⚡" },
  { name: "JBL", logo: "🔊" },
  { name: "Anker", logo: "🔋" },
  { name: "Baseus", logo: "🔌" },
  { name: "Realme", logo: "🟡" },
];

export const BrandsRow: React.FC = () => {
  return (
    <section className="py-8 sm:py-10 bg-white border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-gold-600" />
            <h2 className="text-base sm:text-lg font-serif text-neutral-900 tracking-tight">
              Authorized <span className="italic font-serif">Brand Maisons</span>
            </h2>
          </div>
          <span className="text-xs text-neutral-400 font-light hidden sm:inline">
            Official Authorized Partners & Importers in Bangladesh
          </span>
        </div>

        {/* Brand pills row */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
          {BRANDS_LIST.map((brand, index) => (
            <Link
              key={index}
              href={`/products?brand=${encodeURIComponent(brand.name.toUpperCase())}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF9F6] hover:bg-obsidian-950 border border-neutral-200/80 hover:border-gold-500/50 text-neutral-800 hover:text-gold-400 text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap transition-all duration-300 shadow-2xs hover:shadow-md shrink-0 active:scale-95 group"
            >
              <span className="text-base">{brand.logo}</span>
              <span className="group-hover:text-gold-300 transition-colors">{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
