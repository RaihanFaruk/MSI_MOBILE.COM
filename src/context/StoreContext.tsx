"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product, CartItem } from "@/types";
import { formatBDT } from "@/utils/formatters";

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning";
}

export interface AppliedCoupon {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  discount_amount: number;
  message?: string;
}

interface StoreContextType {
  cart: CartItem[];
  wishlist: string[];
  appliedCoupon: AppliedCoupon | null;
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  searchQuery: string;
  quickViewProduct: Product | null;
  toasts: ToastNotification[];
  cartCount: number;
  cartSubtotal: number;
  discountAmount: number;
  shippingCharge: number;
  cartTotal: number;
  addToCart: (
    product: Product,
    quantity?: number,
    variationId?: string | number | null,
    maxStock?: number,
    color?: string,
    storage?: string
  ) => void;
  removeFromCart: (cartKey: string) => void;
  updateCartQuantity: (cartKey: string, delta: number, maxStock?: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  toggleWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  setIsCartOpen: (open: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setQuickViewProduct: (product: Product | null) => void;
  showToast: (title: string, message: string, type?: "success" | "info" | "warning") => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Initial Load from localStorage & Supabase
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("msi_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      const savedWishlist = localStorage.getItem("msi_wishlist");
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }

      const savedCoupon = localStorage.getItem("msi_coupon");
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch {
      // LocalStorage unavailable or parsing fallback
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 2. Sync to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("msi_cart", JSON.stringify(cart));
    } catch {
      // Ignore quota exceeded errors
    }
  }, [cart, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("msi_wishlist", JSON.stringify(wishlist));
    } catch {
      // Ignore quota exceeded errors
    }
  }, [wishlist, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem("msi_coupon", JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem("msi_coupon");
      }
    } catch {
      // Ignore storage errors
    }
  }, [appliedCoupon, isLoaded]);

  // Calculations
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const shippingCharge = cartSubtotal > 50000 || cartSubtotal === 0 ? 0 : 120; // Free over ৳50,000

  // Recalculate coupon discount if subtotal changed
  let discountAmount = 0;
  if (appliedCoupon && cartSubtotal > 0) {
    if (appliedCoupon.discount_type === "percentage") {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.discount_value) / 100);
    } else {
      discountAmount = Math.min(cartSubtotal, appliedCoupon.discount_value);
    }
  }

  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingCharge);

  const showToast = useCallback((title: string, message: string, type: "success" | "info" | "warning" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cart Operations
  const addToCart = (
    product: Product,
    quantity = 1,
    variationId?: string | number | null,
    maxStock = 999,
    color?: string,
    storage?: string
  ) => {
    const uniqueKey = variationId ? `${product.id}-${variationId}` : `${product.id}-std`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => (item.cartItemId || item.product.id) === uniqueKey
      );

      if (existingIndex > -1) {
        const currentQty = prevCart[existingIndex].quantity;
        const newQty = Math.min(maxStock, currentQty + quantity);
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      }

      return [
        ...prevCart,
        {
          cartItemId: uniqueKey,
          product,
          quantity: Math.min(quantity, maxStock),
          selectedVariationId: variationId || null,
          selectedColor: color,
          selectedStorage: storage,
        },
      ];
    });

    showToast("Added to Cart!", `${product.name} added to your shopping cart.`);
  };

  const removeFromCart = (cartKey: string) => {
    setCart((prev) =>
      prev.filter((item) => (item.cartItemId || item.product.id) !== cartKey && item.product.id !== cartKey)
    );
    showToast("Item Removed", "Product removed from cart.", "info");
  };

  const updateCartQuantity = (cartKey: string, delta: number, maxStock = 999) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          const itemKey = item.cartItemId || item.product.id;
          if (itemKey === cartKey || item.product.id === cartKey) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: Math.min(newQty, maxStock),
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Coupon Validation
  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: cartSubtotal }),
      });

      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({
          code: data.code,
          discount_type: data.discount_type,
          discount_value: data.discount_value,
          discount_amount: data.discount_amount,
          message: data.message,
        });
        showToast("Coupon Applied!", `Saved ${formatBDT(data.discount_amount)} with code ${data.code}`);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || "Invalid coupon code." };
      }
    } catch {
      return { success: false, message: "Failed to validate coupon." };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast("Coupon Removed", "Discount code has been cleared.", "info");
  };

  // Wishlist Operations
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast("Wishlist Updated", "Item removed from wishlist.", "info");
        return prev.filter((id) => id !== productId);
      } else {
        showToast("Added to Wishlist", "Item saved to your wishlist!");
        return [...prev, productId];
      }
    });
  };

  const clearWishlist = () => {
    setWishlist([]);
    showToast("Wishlist Cleared", "All items have been removed from your wishlist.", "info");
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        clearWishlist,
        appliedCoupon,
        isCartOpen,
        isMobileMenuOpen,
        searchQuery,
        quickViewProduct,
        toasts,
        cartCount,
        cartSubtotal,
        discountAmount,
        shippingCharge,
        cartTotal,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        toggleWishlist,
        isInWishlist,
        setIsCartOpen,
        setIsMobileMenuOpen,
        setSearchQuery,
        setQuickViewProduct,
        showToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
