"use client";

import React from "react";
import Image from "next/image";
import { Star, Heart, ShoppingBag, Eye, Plus } from "lucide-react";
import { formatBDT } from "@/utils/formatters";
import { Product } from "@/types";

export interface ProductCardProps {
  id: string | number;
  name: string;
  brand: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  specs?: string;
  badge?: {
    text: string;
    type: "discount" | "new" | "hot";
  };
  isWishlisted?: boolean;
  onAddToCart: (product: Product) => void;
  onToggleWishlist?: (id: string | number) => void;
  onQuickView?: (product: Product) => void;
  stockPercentage?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  brand,
  image,
  price,
  originalPrice,
  rating,
  reviewsCount,
  specs,
  badge,
  isWishlisted = false,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  stockPercentage,
}) => {
  const productObj: Product = {
    id: String(id),
    name,
    brand,
    category: "tech",
    image,
    price,
    originalPrice,
    rating,
    reviewsCount,
    specs,
    badge,
  };

  const getBadgeStyle = () => {
    if (!badge) return "";
    switch (badge.type) {
      case "new":
        return "bg-gold-500 text-obsidian-950 font-black tracking-wider";
      case "hot":
        return "bg-rose-950/90 text-rose-200 border border-rose-500/40";
      case "discount":
      default:
        return "bg-obsidian-950 text-gold-400 border border-gold-500/30 tracking-wider";
    }
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-2xl border border-neutral-200/80 shadow-xs hover:shadow-xl hover:shadow-black/8 hover:border-gold-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Top Image Container */}
      <div className="relative aspect-square w-full bg-[#FAF9F6] flex items-center justify-center p-3 sm:p-4 overflow-hidden border-b border-neutral-100">
        {/* Luxury Badge (Top Left) */}
        {badge && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span
              className={`inline-block px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-md uppercase shadow-sm ${getBadgeStyle()}`}
            >
              {badge.text}
            </span>
          </div>
        )}

        {/* Wishlist Heart Button (Top Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(id);
          }}
          aria-label="Wishlist"
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 border border-neutral-200/80 shadow-sm flex items-center justify-center text-neutral-400 hover:text-rose-500 hover:border-rose-300 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isWishlisted ? "fill-rose-500 text-rose-500" : "hover:text-rose-500"
            }`}
          />
        </button>

        {/* Quick View Button (Desktop Hover) */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(productObj);
            }}
            className="hidden lg:flex absolute bottom-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 items-center gap-1.5 bg-obsidian-950/90 hover:bg-obsidian-950 text-gold-400 text-xs font-semibold px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-lg border border-gold-500/30 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        )}

        {/* Product Image */}
        <div
          className="relative w-full h-full flex items-center justify-center cursor-pointer"
          onClick={() => onQuickView?.(productObj)}
        >
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Brand */}
          <span className="text-[9px] sm:text-[10px] font-bold text-neutral-400 tracking-[0.16em] uppercase block">
            {brand}
          </span>

          {/* Product Name */}
          <h3
            onClick={() => onQuickView?.(productObj)}
            className="font-bold text-xs sm:text-sm text-neutral-900 line-clamp-2 hover:text-gold-600 cursor-pointer transition-colors leading-snug mt-0.5"
            title={name}
          >
            {name}
          </h3>

          {/* Star Rating & Review Count */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-gold-500">
              <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
            </div>
            <span className="text-xs font-bold text-neutral-800">{rating.toFixed(1)}</span>
            <span className="text-[11px] text-neutral-400 font-normal">({reviewsCount})</span>
          </div>

          {/* Specs Line */}
          {specs && (
            <p className="text-[11px] sm:text-xs text-neutral-500 line-clamp-1 mt-1 font-normal">
              {specs}
            </p>
          )}

          {/* Optional Stock Progress Bar (for flash sale) */}
          {typeof stockPercentage === "number" && (
            <div className="mt-2.5">
              <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-gold-500 to-amber-600 h-1.5 rounded-full"
                  style={{ width: `${stockPercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-neutral-400 font-medium mt-0.5 block">
                {stockPercentage}% Claimed
              </span>
            </div>
          )}
        </div>

        {/* Pricing and Cart Button */}
        <div className="flex items-center justify-between mt-2 pt-2.5 border-t border-neutral-100">
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-black text-neutral-950 leading-tight">
              {formatBDT(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-[10px] sm:text-xs text-neutral-400 line-through font-normal leading-tight">
                {formatBDT(originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button (Luxury Obsidian & Gold Pill) */}
          <button
            onClick={() => onAddToCart(productObj)}
            aria-label={`Add ${name} to Cart`}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-obsidian-900 hover:bg-gold-500 text-gold-400 hover:text-obsidian-950 border border-amber-500/30 hover:border-gold-500 active:scale-95 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            {/* Desktop icon */}
            <ShoppingBag className="w-4 h-4 hidden sm:block" />
            {/* Mobile icon */}
            <Plus className="w-4 h-4 sm:hidden font-bold" />
          </button>
        </div>
      </div>
    </div>
  );
};
