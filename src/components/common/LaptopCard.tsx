"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, Heart, Cpu, HardDrive, Monitor, Zap, AlertCircle } from "lucide-react";
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
}) => {
  const isOutOfStock = laptop.inStock === false || (typeof laptop.stock === "number" && laptop.stock <= 0);
  const productUrl = `/products/${laptop.slug || laptop.id}`;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col sm:flex-row">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-slate-900 text-rose-400 border border-rose-500/40 shadow-md">
            <AlertCircle className="w-3 h-3" />
            <span>Out of Stock</span>
          </span>
        ) : laptop.badge ? (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider bg-slate-900 text-white shadow-md">
            {laptop.badge.text}
          </span>
        ) : null}
      </div>

      {/* Wishlist button */}
      <button
        onClick={() => onToggleWishlist?.(laptop.id)}
        aria-label="Wishlist"
        className="absolute top-3 right-3 sm:right-auto sm:left-3 sm:top-10 z-10 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-slate-500 hover:text-rose-500 hover:scale-110 transition-all cursor-pointer"
      >
        <Heart
          className={`w-4 h-4 ${
            isWishlisted ? "fill-rose-500 text-rose-500" : "hover:text-rose-500"
          }`}
        />
      </button>

      {/* Image Container (Left on desktop/tablet, Top on mobile) */}
      <Link
        href={productUrl}
        className="relative w-full sm:w-5/12 min-h-[200px] sm:min-h-[240px] bg-slate-50 flex items-center justify-center p-4 cursor-pointer overflow-hidden"
      >
        <Image
          src={laptop.image}
          alt={laptop.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
          className={`object-contain p-4 group-hover:scale-105 transition-transform duration-500 ${
            isOutOfStock ? "grayscale opacity-70" : ""
          }`}
          loading="lazy"
        />
      </Link>

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
          <Link
            href={productUrl}
            className="font-bold text-base sm:text-lg text-slate-900 mt-1 hover:text-brand-primary cursor-pointer transition-colors leading-snug block"
          >
            {laptop.name}
          </Link>

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
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
          <div>
            <span className="text-base sm:text-lg lg:text-xl font-extrabold text-brand-primary block leading-tight">
              {formatBDT(laptop.price)}
            </span>
            {laptop.originalPrice && laptop.originalPrice > laptop.price && (
              <span className="block text-[11px] sm:text-xs text-slate-400 line-through">
                {formatBDT(laptop.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={() => !isOutOfStock && onAddToCart(laptop)}
            disabled={isOutOfStock}
            title={isOutOfStock ? "Out of Stock" : `Add ${laptop.name} to Cart`}
            className={`w-full xs:w-auto flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 min-h-[40px] ${
              isOutOfStock
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-brand-primary hover:bg-brand-primary-dark active:scale-95 text-white shadow-sm hover:shadow-md hover:shadow-blue-500/25 cursor-pointer"
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>{isOutOfStock ? "Out of Stock" : "Add To Cart"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
