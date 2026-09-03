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
    <div className="group relative bg-white rounded-2xl border border-neutral-200/80 shadow-xs hover:shadow-xl hover:shadow-black/8 hover:border-gold-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col sm:flex-row">
      {/* Luxury Badge */}
      {laptop.badge && (
        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider bg-obsidian-950 text-gold-400 border border-gold-500/30 shadow-md">
          {laptop.badge.text}
        </span>
      )}

      {/* Wishlist button */}
      <button
        onClick={() => onToggleWishlist?.(laptop.id)}
        aria-label="Wishlist"
        className="absolute top-3 right-3 sm:right-auto sm:left-3 sm:top-12 z-10 w-8 h-8 rounded-full bg-white/95 border border-neutral-200/80 shadow-sm flex items-center justify-center text-neutral-400 hover:text-rose-500 hover:border-rose-300 hover:scale-110 transition-all cursor-pointer"
      >
        <Heart
          className={`w-4 h-4 ${
            isWishlisted ? "fill-rose-500 text-rose-500" : "hover:text-rose-500"
          }`}
        />
      </button>

      {/* Image Container */}
      <div
        className="relative w-full sm:w-5/12 min-h-[200px] sm:min-h-[240px] bg-[#FAF9F6] flex items-center justify-center p-4 cursor-pointer overflow-hidden border-b sm:border-b-0 sm:border-r border-neutral-100"
        onClick={() => onQuickView?.(laptop)}
      >
        <Image
          src={laptop.image}
          alt={laptop.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
          className="object-contain p-4 group-hover:scale-106 transition-transform duration-500 ease-out"
          loading="lazy"
        />
      </div>

      {/* Content Container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-neutral-400 tracking-[0.16em] uppercase">
              {laptop.brand} FLAGSHIP PERFORMANCE
            </span>
            <div className="flex items-center gap-1 text-gold-500">
              <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
              <span className="text-xs font-bold text-neutral-800">{laptop.rating.toFixed(1)}</span>
              <span className="text-[11px] text-neutral-400">({laptop.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onQuickView?.(laptop)}
            className="font-bold text-base sm:text-lg text-neutral-900 mt-1 hover:text-gold-600 cursor-pointer transition-colors leading-snug"
          >
            {laptop.name}
          </h3>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-600">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-gold-600 shrink-0" />
              <span className="truncate">{laptop.processor}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{laptop.graphics}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="truncate">{laptop.ram} • {laptop.storage}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="truncate">{laptop.display}</span>
            </div>
          </div>
        </div>

        {/* Price & Add to Cart button */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
          <div>
            <span className="text-lg sm:text-xl font-black text-neutral-950">
              {formatBDT(laptop.price)}
            </span>
            {laptop.originalPrice && (
              <span className="block text-xs text-neutral-400 line-through">
                {formatBDT(laptop.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={() => onAddToCart(laptop)}
            className="flex items-center gap-2 bg-obsidian-900 hover:bg-gold-500 text-gold-400 hover:text-obsidian-950 border border-amber-500/30 hover:border-gold-500 active:scale-95 text-xs sm:text-sm font-bold tracking-wider uppercase px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add To Bag</span>
          </button>
        </div>
      </div>
    </div>
  );
};
