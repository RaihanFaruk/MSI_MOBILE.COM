"use client";

import React from "react";
import Image from "next/image";
import { Star, ShoppingBag, Heart, Cpu, HardDrive, Monitor, Zap } from "lucide-react";
import { LaptopProduct } from "@/types";
import { formatBDT } from "@/utils/formatters";

interface LaptopCardProps {
  laptop: LaptopProduct;
  isWishlisted?: boolean;
  onAddToCart: (product: LaptopProduct) => void;
  onToggleWishlist?: (id: string) => void;
  onQuickView?: (product: LaptopProduct) => void;
}

export const LaptopCard: React.FC<LaptopCardProps> = ({
  laptop,
  isWishlisted = false,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
}) => {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col sm:flex-row">
      {/* Badge */}
      {laptop.badge && (
        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider bg-slate-900 text-white shadow-md">
          {laptop.badge.text}
        </span>
      )}

      {/* Wishlist button */}
      <button
        onClick={() => onToggleWishlist?.(laptop.id)}
        aria-label="Wishlist"
        className="absolute top-3 right-3 sm:right-auto sm:left-3 sm:top-10 z-10 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-slate-500 hover:text-rose-500 hover:scale-110 transition-all"
      >
        <Heart
          className={`w-4 h-4 ${
            isWishlisted ? "fill-rose-500 text-rose-500" : "hover:text-rose-500"
          }`}
        />
      </button>

      {/* Image Container (Left on desktop/tablet, Top on mobile) */}
      <div
        className="relative w-full sm:w-5/12 min-h-[200px] sm:min-h-[240px] bg-slate-50 flex items-center justify-center p-4 cursor-pointer overflow-hidden"
        onClick={() => onQuickView?.(laptop)}
      >
        <Image
          src={laptop.image}
          alt={laptop.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Content Container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider">
              {laptop.brand} PERFORMANCE
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="text-xs font-bold text-slate-700">{laptop.rating.toFixed(1)}</span>
              <span className="text-[11px] text-slate-400">({laptop.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onQuickView?.(laptop)}
            className="font-bold text-base sm:text-lg text-slate-900 mt-1 hover:text-brand-primary cursor-pointer transition-colors leading-snug"
          >
            {laptop.name}
          </h3>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{laptop.processor}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{laptop.graphics}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{laptop.ram} • {laptop.storage}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate">{laptop.display}</span>
            </div>
          </div>
        </div>

        {/* Price & Add to Cart button */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <div>
            <span className="text-lg sm:text-xl font-extrabold text-brand-primary">
              {formatBDT(laptop.price)}
            </span>
            {laptop.originalPrice && (
              <span className="block text-xs text-slate-400 line-through">
                {formatBDT(laptop.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={() => onAddToCart(laptop)}
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark active:scale-95 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add To Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
