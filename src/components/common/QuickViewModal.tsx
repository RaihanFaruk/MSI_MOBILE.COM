"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { X, Star, ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, Plus, Minus } from "lucide-react";
import { formatBDT } from "@/utils/formatters";

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
  } = useStore();

  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const isWish = isInWishlist(quickViewProduct.id);

  const handleAddToCart = () => {
    addToCart(quickViewProduct, quantity);
    setQuickViewProduct(null);
    setQuantity(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gold-500/30 overflow-hidden max-h-[90vh] flex flex-col md:flex-row animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Image Area */}
        <div className="relative w-full md:w-1/2 min-h-[260px] md:min-h-[380px] bg-[#FAF9F6] flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-neutral-100">
          {quickViewProduct.badge && (
            <span className="absolute top-4 left-4 z-10 px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider bg-obsidian-950 text-gold-400 border border-gold-500/30 shadow-sm">
              {quickViewProduct.badge.text}
            </span>
          )}
          <div className="relative w-4/5 h-4/5">
            <Image
              src={quickViewProduct.image}
              alt={quickViewProduct.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />
          </div>
        </div>

        {/* Product Details Area */}
        <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between overflow-y-auto">
          <div>
            <span className="text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase">
              {quickViewProduct.brand} PROVENANCE
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-neutral-900 mt-1 leading-snug">
              {quickViewProduct.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex items-center text-gold-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(quickViewProduct.rating)
                        ? "fill-gold-500 text-gold-500"
                        : "text-neutral-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-neutral-800">
                {quickViewProduct.rating.toFixed(1)}
              </span>
              <span className="text-xs text-neutral-400">
                ({quickViewProduct.reviewsCount} client reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-2xl font-black text-neutral-950">
                {formatBDT(quickViewProduct.price)}
              </span>
              {quickViewProduct.originalPrice && (
                <span className="text-sm text-neutral-400 line-through">
                  {formatBDT(quickViewProduct.originalPrice)}
                </span>
              )}
            </div>

            {/* Specs / Info */}
            {quickViewProduct.specs && (
              <div className="mt-4 p-3.5 bg-[#FAF9F6] rounded-2xl border border-neutral-200/80">
                <span className="text-[10px] font-bold text-gold-600 uppercase tracking-wider block">
                  Bespoke Specifications
                </span>
                <p className="text-xs text-neutral-700 mt-1 font-medium leading-relaxed">
                  {quickViewProduct.specs}
                </p>
              </div>
            )}

            {/* Trust Points */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] text-neutral-600">
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#FAF9F6] border border-neutral-100">
                <ShieldCheck className="w-4 h-4 text-gold-500 mb-1" />
                <span className="font-semibold">Official Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#FAF9F6] border border-neutral-100">
                <Truck className="w-4 h-4 text-gold-500 mb-1" />
                <span className="font-semibold">White Glove</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#FAF9F6] border border-neutral-100">
                <RefreshCw className="w-4 h-4 text-gold-500 mb-1" />
                <span className="font-semibold">7 Days Return</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-neutral-600 hover:bg-neutral-200 active:bg-neutral-300 transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-sm font-bold text-neutral-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-neutral-600 hover:bg-neutral-200 active:bg-neutral-300 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-obsidian-950 hover:bg-gold-500 text-gold-400 hover:text-obsidian-950 border border-gold-500/40 hover:border-gold-500 active:scale-98 font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add To Bag</span>
              </button>

              {/* Wishlist Heart */}
              <button
                onClick={() => toggleWishlist(quickViewProduct.id)}
                className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                  isWish
                    ? "border-rose-300 bg-rose-50 text-rose-500"
                    : "border-neutral-200 text-neutral-500 hover:border-rose-300 hover:text-rose-500"
                }`}
              >
                <Heart className={`w-4 h-4 ${isWish ? "fill-rose-500" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
