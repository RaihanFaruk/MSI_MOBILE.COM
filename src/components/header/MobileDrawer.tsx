"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  X,
  User,
  Package,
  Heart,
  Phone,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Headset,
  Volume2,
  Zap,
  Shield,
  Gamepad2,
  Camera,
  Cpu,
} from "lucide-react";
import { Category, DbCategory } from "@/types";

const getCategoryIcon = (iconName?: string) => {
  switch (iconName) {
    case "Smartphone":
      return <Smartphone className="w-4 h-4" />;
    case "Laptop":
      return <Laptop className="w-4 h-4" />;
    case "Tablet":
      return <Tablet className="w-4 h-4" />;
    case "Watch":
      return <Watch className="w-4 h-4" />;
    case "Headphones":
      return <Headphones className="w-4 h-4" />;
    case "Headset":
      return <Headset className="w-4 h-4" />;
    case "Volume2":
      return <Volume2 className="w-4 h-4" />;
    case "Zap":
      return <Zap className="w-4 h-4" />;
    case "Shield":
      return <Shield className="w-4 h-4" />;
    case "Gamepad2":
      return <Gamepad2 className="w-4 h-4" />;
    case "Camera":
      return <Camera className="w-4 h-4" />;
    case "Cpu":
    default:
      return <Cpu className="w-4 h-4" />;
  }
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Smartphones", slug: "smartphones", itemCount: 142, icon: "Smartphone" },
  { id: "2", name: "Laptops", slug: "laptops", itemCount: 89, icon: "Laptop" },
  { id: "3", name: "Tablets", slug: "tablets", itemCount: 44, icon: "Tablet" },
  { id: "4", name: "Smart Watches", slug: "smart-watches", itemCount: 65, icon: "Watch" },
  { id: "5", name: "Earbuds", slug: "earbuds", itemCount: 72, icon: "Headphones" },
  { id: "6", name: "Headphones", slug: "headphones", itemCount: 38, icon: "Headset" },
  { id: "7", name: "Speakers", slug: "speakers", itemCount: 49, icon: "Volume2" },
  { id: "8", name: "Chargers & Power Banks", slug: "chargers", itemCount: 55, icon: "Zap" },
];

export const MobileDrawer: React.FC = () => {
  const { isMobileMenuOpen, setIsMobileMenuOpen, wishlist } =
    useStore();
  const { user, profile, signOut } = useAuth();
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug, icon")
          .order("id", { ascending: true });

        if (data && data.length > 0 && !error) {
          const mapped: Category[] = data.map((c: DbCategory) => ({
            id: String(c.id),
            name: c.name,
            slug: c.slug,
            itemCount: 20,
            icon: c.icon || "Cpu",
          }));
          setCategories(mapped);
        }
      } catch {
        // Fallback
      }
    }

    fetchCategories();
  }, []);

  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-sm animate-in fade-in"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-obsidian-900 border-r border-amber-500/20 text-white h-full shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 bg-obsidian-950 border-b border-amber-500/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 text-obsidian-950 font-black text-xs px-2 py-0.5 rounded shadow-sm">
              MSI
            </span>
            <span className="font-bold text-sm tracking-wide text-white">
              MOBILE<span className="text-gold-500">.COM</span>
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories & Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Shortcuts */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/products?featured=true"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-gold-500/10 text-gold-400 text-xs font-bold border border-gold-500/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>VIP Deals</span>
            </Link>

            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-neutral-800/80 text-white text-xs font-bold border border-neutral-700"
            >
              <Package className="w-4 h-4 text-gold-500" />
              <span>Catalog</span>
            </Link>
          </div>

          {/* Categories Title */}
          <div>
            <span className="text-[10px] font-bold text-gold-400/90 uppercase tracking-widest block mb-2 px-1">
              Curated Collections
            </span>
            <div className="space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-800/60 text-xs font-medium text-neutral-300 hover:text-gold-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-gold-500">{getCategoryIcon(cat.icon)}</span>
                    <span>{cat.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                </Link>
              ))}
            </div>
          </div>

          {/* Account / Support Section */}
          <div className="pt-3 border-t border-neutral-800 space-y-1">
            <span className="text-[10px] font-bold text-gold-400/90 uppercase tracking-widest block mb-2 px-1">
              Client Portal
            </span>

            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-neutral-800/60 text-xs font-medium text-neutral-200"
                >
                  <User className="w-4 h-4 text-gold-500" />
                  <span>Account ({profile?.full_name || user.email})</span>
                </Link>
                <Link
                  href="/account/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-neutral-800/60 text-xs font-medium text-neutral-200"
                >
                  <Package className="w-4 h-4 text-gold-500" />
                  <span>Track Orders</span>
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-neutral-800/60 text-xs font-medium text-rose-400"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Wishlist ({wishlist.length})</span>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-rose-950/30 text-xs font-medium text-rose-400"
                >
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-neutral-800/60 text-xs font-medium text-neutral-200"
              >
                <User className="w-4 h-4 text-gold-500" />
                <span>Sign In / Register</span>
              </Link>
            )}

            <a
              href="tel:+8801999674662"
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-neutral-800/60 text-xs font-medium text-gold-400"
            >
              <Phone className="w-4 h-4 text-gold-500" />
              <span>Concierge: +880 1999-MSIMOB</span>
            </a>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-obsidian-950 border-t border-neutral-800 text-center text-[10px] text-neutral-500 space-y-1">
          <div className="flex items-center justify-center gap-1.5 font-bold text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
            <span>100% Genuine Luxury Tech • Official Warranty</span>
          </div>
          <p>© 2026 MSI MOBILE.COM • Flagship Dhaka</p>
        </div>
      </div>
    </div>
  );
};
