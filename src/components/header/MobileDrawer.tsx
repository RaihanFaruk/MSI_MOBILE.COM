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
  Flame,
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
        // Fallback to static category navigation
      }
    }

    fetchCategories();
  }, []);

  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 bg-navy-dark text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-brand-accent text-white font-extrabold text-sm px-2 py-0.5 rounded">
              MSI
            </span>
            <span className="font-bold text-sm tracking-tight">
              MOBILE<span className="text-blue-400">.COM</span>
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Status Bar in Drawer */}
        {user ? (
          <div className="bg-slate-900 px-4 py-3 border-t border-slate-800 flex items-center justify-between">
            <Link
              href="/account"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 min-w-0 hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-brand-primary text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
                {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{profile?.full_name || "My Account"}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </Link>
            <button
              onClick={() => {
                signOut();
                setIsMobileMenuOpen(false);
              }}
              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 shrink-0 ml-2 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Welcome to MSI Mobile</span>
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-bold text-blue-400 hover:text-blue-300"
            >
              Sign In →
            </Link>
          </div>
        )}

        {/* Categories & Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Shortcuts */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/products?sort=discount"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-rose-50 text-brand-accent text-xs font-bold border border-rose-100 shadow-2xs"
            >
              <Flame className="w-4 h-4 fill-brand-accent" />
              <span>Flash Deals</span>
            </Link>

            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-blue-50 text-brand-primary text-xs font-bold border border-blue-100 shadow-2xs"
            >
              <Package className="w-4 h-4" />
              <span>All Tech</span>
            </Link>
          </div>

          {/* Categories Title */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
              Shop Categories
            </span>
            <div className="space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-brand-primary transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400">{getCategoryIcon(cat.icon)}</span>
                    <span>{cat.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Account / Support Section */}
          <div className="pt-2 border-t border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
              User & Support
            </span>

            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700"
                >
                  <User className="w-4 h-4 text-brand-primary" />
                  <span>My Account ({profile?.full_name || user.email})</span>
                </Link>
                <Link
                  href="/account/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700"
                >
                  <Package className="w-4 h-4 text-slate-500" />
                  <span>Order History</span>
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-rose-600"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>My Wishlist ({wishlist.length})</span>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-rose-50 text-xs font-semibold text-rose-600"
                >
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Sign In / Register</span>
              </Link>
            )}

            <a
              href="tel:+8801999600222"
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Customer Helpline: +880 1999-600222</span>
            </a>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center justify-center gap-1 font-bold text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
            <span>100% Genuine Tech with Official Warranty</span>
          </div>
          <p>© 2026 MSI MOBILE.COM • Bangladesh</p>
        </div>
      </div>
    </div>
  );
};
