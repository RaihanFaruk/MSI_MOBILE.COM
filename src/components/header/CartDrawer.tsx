"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
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
        className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-obsidian-900 border-l border-amber-500/20 text-white h-full shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-amber-500/15 flex items-center justify-between bg-obsidian-950">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-gold-500" />
            <h3 className="font-bold text-white text-base tracking-wide font-serif">Shopping Bag</h3>
            <span className="text-xs font-black text-obsidian-950 bg-gold-500 px-2 py-0.5 rounded-full shadow-sm">
              {cartCount}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free VIP Delivery Bar */}
        <div className="bg-gold-500/10 px-4 py-2.5 border-b border-gold-500/20">
          <div className="flex items-center justify-between text-xs font-semibold text-gold-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Complimentary White-Glove Delivery</span>
            </span>
            <span className="text-gold-300 font-bold uppercase text-[10px] tracking-wider">Unlocked</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-gold-400 to-gold-600 h-1.5 rounded-full w-full" />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
              <div className="w-20 h-20 rounded-full bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-gold-500/70 stroke-1" />
              </div>
              <h4 className="font-bold text-white text-lg font-serif">Your Bag is Empty</h4>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
                Discover our curated collection of authentic flagships, high-performance laptops, and luxury accessories.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-6 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-obsidian-950 text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg shadow-gold-500/20 transition-all cursor-pointer"
              >
                Explore Collections
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const itemKey = item.cartItemId || item.product.id;
              return (
                <div
                  key={itemKey}
                  className="flex items-center gap-3 p-3 bg-obsidian-800/80 rounded-2xl border border-amber-500/15 hover:border-amber-500/40 transition-all"
                >
                  {/* Product Image */}
                  <div className="relative w-16 h-16 bg-neutral-900 rounded-xl shrink-0 overflow-hidden p-1 border border-neutral-800">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-gold-400/90 uppercase tracking-widest block">
                      {item.product.brand}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate" title={item.product.name}>
                      {item.product.name}
                    </h4>
                    {(item.selectedColor || item.selectedStorage) && (
                      <span className="text-[10px] text-neutral-400 block mt-0.5">
                        {[item.selectedColor, item.selectedStorage].filter(Boolean).join(" • ")}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-black text-gold-400">
                        {formatBDT(item.product.price)}
                      </span>
                      {item.product.originalPrice && (
                        <span className="text-[10px] text-neutral-500 line-through">
                          {formatBDT(item.product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls & Delete */}
                  <div className="flex flex-col items-end gap-1.5">
                    <button
                      onClick={() => removeFromCart(itemKey)}
                      className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center border border-neutral-700 rounded-lg overflow-hidden bg-neutral-900">
                      <button
                        onClick={() => updateCartQuantity(itemKey, -1)}
                        className="px-1.5 py-0.5 text-neutral-300 hover:bg-neutral-800 text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(itemKey, 1)}
                        className="px-1.5 py-0.5 text-neutral-300 hover:bg-neutral-800 text-xs"
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
          <div className="p-4 bg-obsidian-950 border-t border-amber-500/20 space-y-3">
            <div className="space-y-1.5 text-xs text-neutral-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-white">{formatBDT(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>VIP Express Delivery</span>
                <span className="text-gold-400 font-bold uppercase text-[10px] tracking-wider">COMPLIMENTARY</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-neutral-800">
                <span>Total Amount</span>
                <span className="text-gold-400 text-base font-black">{formatBDT(cartTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 active:scale-98 text-obsidian-950 font-black tracking-wider uppercase py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-gold-500/20 transition-all text-xs cursor-pointer"
            >
              <span>Proceed to VIP Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/cart"
              onClick={() => setIsCartOpen(false)}
              className="block text-center w-full py-2.5 rounded-xl border border-neutral-800 hover:border-gold-500/40 hover:bg-neutral-900 text-xs font-bold text-neutral-300 transition-colors tracking-wide"
            >
              View Full Bag & Apply Privileges
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
              <span>SSLCOMMERZ 256-Bit Encrypted Bank Grade Security</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
