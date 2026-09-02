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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Image Area */}
        <div className="relative w-full md:w-1/2 min-h-[260px] md:min-h-[380px] bg-slate-50 flex items-center justify-center p-6">
          {quickViewProduct.badge && (
            <span className="absolute top-4 left-4 z-10 px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider bg-brand-accent text-white shadow-sm">
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
        <div className="p-6 md:w-1/2 flex flex-col justify-between overflow-y-auto">
          <div>
            <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
              {quickViewProduct.brand} OFFICIAL
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1 leading-snug">
              {quickViewProduct.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(quickViewProduct.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">
                {quickViewProduct.rating.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">
                ({quickViewProduct.reviewsCount} customer reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-2xl font-extrabold text-brand-primary">
                {formatBDT(quickViewProduct.price)}
              </span>
              {quickViewProduct.originalPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {formatBDT(quickViewProduct.originalPrice)}
                </span>
              )}
            </div>

            {/* Specs / Info */}
            {quickViewProduct.specs && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Key Specifications
                </span>
                <p className="text-xs text-slate-700 mt-1 font-medium">
                  {quickViewProduct.specs}
                </p>
              </div>
            )}

            {/* Trust Points */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-[11px] text-slate-600">
              <div className="flex flex-col items-center text-center p-2 rounded-lg bg-slate-50">
                <ShieldCheck className="w-4 h-4 text-brand-primary mb-1" />
                <span>100% Genuine</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-lg bg-slate-50">
                <Truck className="w-4 h-4 text-emerald-600 mb-1" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-lg bg-slate-50">
                <RefreshCw className="w-4 h-4 text-amber-600 mb-1" />
                <span>7 Days Return</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-sm font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-brand-primary hover:bg-brand-primary-dark active:scale-98 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add To Cart</span>
              </button>

              {/* Wishlist Heart */}
              <button
                onClick={() => toggleWishlist(quickViewProduct.id)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isWish
                    ? "border-rose-200 bg-rose-50 text-rose-500"
                    : "border-slate-200 text-slate-600 hover:border-rose-200 hover:text-rose-500"
                }`}
              >
                <Heart className={`w-5 h-5 ${isWish ? "fill-rose-500" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
