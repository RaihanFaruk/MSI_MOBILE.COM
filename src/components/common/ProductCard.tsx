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
        return "bg-emerald-600 text-white";
      case "hot":
        return "bg-rose-500 text-white animate-pulse";
      case "discount":
      default:
        return "bg-brand-accent text-white";
    }
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden">
      {/* Top Image Container */}
      <div className="relative aspect-square w-full bg-slate-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden">
        {/* Badge (Top Left) */}
        {badge && (
          <div className="absolute top-2 left-2 z-10">
            <span
              className={`inline-block px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-md uppercase tracking-wider shadow-sm ${getBadgeStyle()}`}
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
          className="absolute top-2 right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-slate-500 hover:text-rose-500 hover:scale-110 active:scale-95 transition-all duration-200"
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
            className="hidden lg:flex absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 items-center gap-1 bg-slate-900/80 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm shadow-md"
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
            className="object-contain p-2 group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          {/* Brand */}
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            {brand}
          </span>

          {/* Product Name */}
          <h3
            onClick={() => onQuickView?.(productObj)}
            className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 hover:text-brand-primary cursor-pointer transition-colors leading-snug mt-0.5"
            title={name}
          >
            {name}
          </h3>

          {/* Star Rating & Review Count */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-700">{rating.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400 font-normal">({reviewsCount})</span>
          </div>

          {/* Specs Line */}
          {specs && (
            <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 mt-1 font-normal">
              {specs}
            </p>
          )}

          {/* Optional Stock Progress Bar (for flash sale) */}
          {typeof stockPercentage === "number" && (
            <div className="mt-2">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-rose-500 h-1.5 rounded-full"
                  style={{ width: `${stockPercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {stockPercentage}% Claimed
              </span>
            </div>
          )}
        </div>

        {/* Pricing and Cart Button */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-extrabold text-brand-primary leading-tight">
              {formatBDT(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through font-normal leading-tight">
                {formatBDT(originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button (Desktop: Rounded Cart with Icon, Mobile: Compact + Button) */}
          <button
            onClick={() => onAddToCart(productObj)}
            aria-label={`Add ${name} to Cart`}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-brand-primary hover:bg-brand-primary-dark active:scale-95 text-white flex items-center justify-center shadow-sm hover:shadow-md hover:shadow-blue-500/20 transition-all duration-200"
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
