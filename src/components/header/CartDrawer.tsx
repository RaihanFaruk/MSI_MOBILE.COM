"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { formatBDT } from "@/utils/formatters";

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartSubtotal,
    cartTotal,
    cartCount,
    removeFromCart,
    updateCartQuantity,
  } = useStore();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-primary" />
            <h3 className="font-bold text-slate-800 text-base">Shopping Cart</h3>
            <span className="text-xs font-bold text-white bg-brand-primary px-2 py-0.5 rounded-full">
              {cartCount}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div className="bg-blue-50/80 px-4 py-2.5 border-b border-blue-100/60">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-primary mb-1">
            <span>🎉 Free Express Delivery in Dhaka</span>
            <span>Unlocked</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
            <div className="bg-brand-primary h-1.5 rounded-full w-full" />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag className="w-16 h-16 text-slate-200 stroke-1 mb-3" />
              <h4 className="font-bold text-slate-700 text-base">Your cart is empty</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Explore our premium smartphones, laptops, and gadgets to add items to your cart.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const itemKey = item.cartItemId || item.product.id;
              return (
                <div
                  key={itemKey}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-2xs hover:border-slate-200 transition-colors"
                >
                  {/* Product Image */}
                  <div className="relative w-16 h-16 bg-slate-50 rounded-lg shrink-0 overflow-hidden p-1 border border-slate-100">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {item.product.brand}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 truncate" title={item.product.name}>
                      {item.product.name}
                    </h4>
                    {(item.selectedColor || item.selectedStorage) && (
                      <span className="text-[10px] text-slate-500 block">
                        {[item.selectedColor, item.selectedStorage].filter(Boolean).join(" • ")}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-extrabold text-brand-primary">
                        {formatBDT(item.product.price)}
                      </span>
                      {item.product.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatBDT(item.product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls & Delete */}
                  <div className="flex flex-col items-end gap-1.5">
                    <button
                      onClick={() => removeFromCart(itemKey)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => updateCartQuantity(itemKey, -1)}
                        className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-200 text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-700">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(itemKey, 1)}
                        className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-200 text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">{formatBDT(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="text-emerald-600 font-bold">FREE (Dhaka Express)</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-brand-primary text-base">{formatBDT(cartTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-brand-primary hover:bg-brand-primary-dark active:scale-98 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all text-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/cart"
              onClick={() => setIsCartOpen(false)}
              className="block text-center w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
            >
              View Full Cart & Apply Coupon
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SSLCOMMERZ 256-Bit Encrypted Secure Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
