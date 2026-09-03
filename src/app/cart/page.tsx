"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { formatBDT } from "@/utils/formatters";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Tag,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";

export default function CartPage() {
  const {
    cart,
    cartCount,
    cartSubtotal,
    discountAmount,
    shippingCharge,
    cartTotal,
    appliedCoupon,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError(null);

    const res = await applyCoupon(couponInput.trim());
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput("");
    }
    setCouponLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-7 h-7 text-brand-primary" />
              <span>Shopping Cart</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review your selected tech devices, apply discount coupons & proceed to secure checkout
            </p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-md mx-auto space-y-5 shadow-xs animate-in fade-in">
            <div className="w-20 h-20 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center mx-auto border border-blue-100">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Looks like you haven&apos;t added any smartphones, laptops, or accessories to your cart yet.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark active:scale-95 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Content Layout: Items List (8 cols) + Summary (4 cols) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Items Column (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs divide-y divide-slate-100">
                {cart.map((item) => {
                  const itemKey = item.cartItemId || item.product.id;
                  return (
                    <div
                      key={itemKey}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Image & Title */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shrink-0 flex items-center justify-center">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {item.product.brand}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2">
                            {item.product.name}
                          </h3>
                          {(item.selectedColor || item.selectedStorage) && (
                            <span className="text-[11px] font-semibold text-slate-500 block">
                              {[item.selectedColor, item.selectedStorage].filter(Boolean).join(" • ")}
                            </span>
                          )}
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-extrabold text-brand-primary">
                              {formatBDT(item.product.price)}
                            </span>
                            {item.product.originalPrice && (
                              <span className="text-[11px] text-slate-400 line-through">
                                {formatBDT(item.product.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Selector & Line Total */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* Qty Pill */}
                        <div className="flex items-center border border-slate-200 bg-slate-50 rounded-xl p-1">
                          <button
                            onClick={() => updateCartQuantity(itemKey, -1)}
                            aria-label={`Decrease quantity for ${item.product.name}`}
                            title="Decrease quantity"
                            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(itemKey, 1)}
                            aria-label={`Increase quantity for ${item.product.name}`}
                            title="Increase quantity"
                            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line Subtotal */}
                        <div className="text-right min-w-24">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                            {formatBDT(item.product.price * item.quantity)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {item.quantity} × {formatBDT(item.product.price)}
                          </span>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(itemKey)}
                          aria-label={`Remove ${item.product.name} from cart`}
                          title="Remove item"
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Box */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-brand-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Apply Promo Coupon
                  </h3>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold text-emerald-800 font-mono">
                          {appliedCoupon.code} applied!
                        </p>
                        <span className="text-[11px] text-emerald-700">
                          Discount: {formatBDT(discountAmount)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
                      title="Remove Coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        aria-label="Enter promotional or discount coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Try coupon 'MSIFIRST'"
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-800 uppercase font-mono placeholder-slate-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        aria-label="Apply discount coupon"
                        disabled={couponLoading || !couponInput.trim()}
                        className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {couponLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span>Apply</span>
                        )}
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[11px] font-semibold text-rose-600 animate-in fade-in">
                        {couponError}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* Right Summary Column (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 sticky top-24">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Order Summary ({cartCount} {cartCount === 1 ? "item" : "items"})
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">{formatBDT(cartSubtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Coupon Discount</span>
                      <span>-{formatBDT(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <div className="flex items-center gap-1">
                      <span>Shipping Charge</span>
                      {shippingCharge === 0 && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                          FREE
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-slate-900">
                      {shippingCharge === 0 ? "৳0 (Free Delivery)" : formatBDT(shippingCharge)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <span className="text-sm font-extrabold text-slate-900">Estimated Total</span>
                    <div className="text-right">
                      <span className="text-xl font-black text-brand-primary block leading-tight">
                        {formatBDT(cartTotal)}
                      </span>
                      <span className="text-[10px] text-slate-400">VAT & Taxes Included</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <Link
                    href="/checkout"
                    className="w-full bg-brand-primary hover:bg-brand-primary-dark active:scale-98 text-white font-bold py-3.5 px-6 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all text-center"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/products"
                    className="block text-center w-full py-2 text-xs text-slate-500 hover:text-brand-primary font-semibold transition-colors"
                  >
                    ← Continue Shopping
                  </Link>
                </div>

                {/* Assurance Badges */}
                <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>256-Bit Encrypted Bank Grade Security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>7 Days Replacement Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
