"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ShoppingBag, Eye, Plus, AlertCircle } from "lucide-react";
import { formatBDT } from "@/utils/formatters";
import { Product } from "@/types";

export interface ProductCardProps {
  id: string | number;
  slug?: string;
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
  inStock?: boolean;
  stock?: number;
  isWishlisted?: boolean;
  onAddToCart: (product: Product) => void;
  onToggleWishlist?: (id: string | number) => void;
  onQuickView?: (product: Product) => void;
  stockPercentage?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  slug,
  name,
  brand,
  image,
  price,
  originalPrice,
  rating,
  reviewsCount,
  specs,
  badge,
  inStock,
  stock,
  isWishlisted = false,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  stockPercentage,
}) => {
  const isOutOfStock = inStock === false || (typeof stock === "number" && stock <= 0);

  const productObj: Product = {
    id: String(id),
    slug,
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
    inStock: !isOutOfStock,
    stock,
  };

  const productUrl = `/products/${slug || id}`;

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
        {/* Badges (Top Left) */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 max-w-[62%] pointer-events-none">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-md bg-slate-900 text-rose-400 border border-rose-500/40 shadow-sm truncate">
              <AlertCircle className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">Out of Stock</span>
            </span>
          ) : badge ? (
            <span
              className={`inline-block px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold rounded-md uppercase tracking-wider shadow-sm truncate ${getBadgeStyle()}`}
            >
              {badge.text}
            </span>
          ) : null}
        </div>

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
            className="hidden lg:flex absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 items-center gap-1 bg-slate-900/80 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm shadow-md cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        )}

        {/* Product Image Link */}
        <Link
          href={productUrl}
          className="relative w-full h-full flex items-center justify-center cursor-pointer"
        >
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-contain p-2 group-hover:scale-108 transition-transform duration-500 ease-out ${
              isOutOfStock ? "grayscale opacity-70" : ""
            }`}
            loading="lazy"
          />
        </Link>
      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          {/* Brand */}
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            {brand}
          </span>

          {/* Product Name */}
          <Link
            href={productUrl}
            className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] hover:text-brand-primary cursor-pointer transition-colors leading-snug mt-0.5 block"
            title={name}
          >
            {name}
          </Link>

          {/* Star Rating & Review Count */}
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-700">{rating.toFixed(1)}</span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal">({reviewsCount})</span>
          </div>

          {/* Specs Line */}
          {specs && (
            <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 mt-1 font-normal">
              {specs}
            </p>
          )}

          {/* Optional Stock Progress Bar (for flash sale) */}
          {typeof stockPercentage === "number" && !isOutOfStock && (
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

          {/* Add to Cart Button */}
          <button
            onClick={() => !isOutOfStock && onAddToCart(productObj)}
            disabled={isOutOfStock}
            title={isOutOfStock ? "Out of Stock" : `Add ${name} to Cart`}
            aria-label={isOutOfStock ? "Out of Stock" : `Add ${name} to Cart`}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200 ${
              isOutOfStock
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-brand-primary hover:bg-brand-primary-dark active:scale-95 text-white shadow-sm hover:shadow-md hover:shadow-blue-500/20 cursor-pointer"
            }`}
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
