"use client";

import React from "react";
import Link from "next/link";
import { Award } from "lucide-react";

export const BRANDS_LIST = [
  { name: "Apple", logo: "🍎" },
  { name: "Samsung", logo: "📱" },
  { name: "Xiaomi", logo: "⚡" },
  { name: "OnePlus", logo: "🔴" },
  { name: "Realme", logo: "🟡" },
  { name: "OPPO", logo: "🟢" },
  { name: "Vivo", logo: "🔵" },
  { name: "Sony", logo: "🎧" },
  { name: "JBL", logo: "🔊" },
  { name: "Anker", logo: "🔋" },
  { name: "Baseus", logo: "🔌" },
  { name: "MSI", logo: "💻" },
  { name: "ASUS", logo: "🎮" },
  { name: "Lenovo", logo: "⚡" },
];

export const BrandsRow: React.FC = () => {
  return (
    <section className="py-6 sm:py-8 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-primary" />
            <h2 className="text-lg sm:text-xl font-extrabold text-navy-dark tracking-tight">
              Popular Brands
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Official Authorized Brand Partners in Bangladesh
          </span>
        </div>

        {/* Brand pills row */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
          {BRANDS_LIST.map((brand, index) => (
            <Link
              key={index}
              href={`/products?brand=${encodeURIComponent(brand.name.toUpperCase())}`}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-300 text-slate-700 hover:text-brand-primary text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 shadow-2xs hover:shadow-sm shrink-0 active:scale-95"
            >
              <span>{brand.logo}</span>
              <span>{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
