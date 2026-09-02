"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/lib/auth-context";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  ChevronDown,
  X,
} from "lucide-react";
import { formatBDT } from "@/utils/formatters";

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const {
    cartCount,
    cartTotal,
    wishlist,
    setIsCartOpen,
    setIsMobileMenuOpen,
    searchQuery,
    setSearchQuery,
    showToast,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-100">
      {/* Tier 2: Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Mobile Left: Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open Navigation Menu"
          className="lg:hidden p-2 -ml-2 text-slate-700 hover:text-brand-primary rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Brand Logo */}
        <div className="flex items-center gap-1.5 cursor-pointer select-none">
          <a href="#" className="flex items-center gap-2">
            <span className="bg-brand-accent text-white font-extrabold text-lg sm:text-xl px-2.5 py-1 rounded-md tracking-wider shadow-sm flex items-center justify-center">
              MSI
            </span>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg text-navy-dark tracking-tight leading-none">
                MOBILE<span className="text-brand-primary">.COM</span>
              </span>
              <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase leading-tight hidden sm:block">
                Premium Tech BD
              </span>
            </div>
          </a>
        </div>

        {/* Desktop / Laptop Search Bar (Hidden on Mobile & Tablet) */}
        <div className="hidden lg:flex flex-1 max-w-2xl mx-6">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full flex items-center bg-slate-50 border-2 border-slate-200 focus-within:border-brand-primary rounded-xl overflow-hidden transition-all shadow-inner"
          >
            {/* Category Dropdown */}
            <div className="relative border-r border-slate-200 hidden xl:flex items-center bg-slate-100/70">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-transparent py-2.5 pl-3 pr-8 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">All Tech</option>
                <option value="Smartphones">Smartphones</option>
                <option value="Laptops">Laptops</option>
                <option value="Gadgets">Gadgets</option>
                <option value="Audio">Audio</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
            </div>

            {/* Input field */}
            <div className="flex-1 flex items-center px-3">
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for smartphones, laptops, audio, accessories..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 py-2.5 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Blue Search Button */}
            <button
              type="submit"
              className="bg-brand-primary hover:bg-brand-primary-dark active:scale-95 text-white text-xs sm:text-sm font-bold px-6 py-2.5 transition-all duration-150 flex items-center gap-1.5"
            >
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Right Action Icons: Account, Wishlist, Cart */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Account (Desktop Only) */}
          {user ? (
            <div className="relative group/user hidden lg:block">
              <div className="flex items-center gap-2 text-slate-700 hover:text-brand-primary cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-brand-primary font-bold flex items-center justify-center text-xs">
                  {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-slate-400 leading-none">
                    {profile?.role === "admin" ? "Admin" : "Hello"}
                  </span>
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                    {profile?.full_name || user.email?.split("@")[0]}
                  </span>
                </div>
              </div>

              {/* User Dropdown */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 hidden group-hover/user:block z-50 animate-in fade-in-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate">{profile?.full_name || "User"}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  {profile?.role === "admin" && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-extrabold bg-blue-100 text-brand-primary rounded uppercase">
                      Admin
                    </span>
                  )}
                </div>

                <Link
                  href="/account"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-primary transition-colors"
                >
                  <span>My Profile</span>
                </Link>

                <Link
                  href="/account/orders"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-primary transition-colors"
                >
                  <span>My Orders</span>
                </Link>

                {profile?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-brand-primary hover:bg-blue-50 transition-colors"
                  >
                    <span>⚡ Admin Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={() => signOut()}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 mt-1"
                >
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden lg:flex items-center gap-2.5 text-slate-700 hover:text-brand-primary cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] text-slate-400 leading-none">Welcome</span>
                <span className="text-xs font-bold text-slate-800 leading-tight">Sign In</span>
              </div>
            </Link>
          )}

          {/* Wishlist Icon */}
          <button
            onClick={() => showToast("Wishlist", `You have ${wishlist.length} items in wishlist`, "info")}
            aria-label="Wishlist"
            className="relative p-2 text-slate-700 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-accent text-white text-[10px] font-extrabold flex items-center justify-center animate-scaleIn">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Icon & Total (Desktop shows price, Mobile shows icon+badge) */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Shopping Cart"
            className="flex items-center gap-2.5 bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-200 p-1.5 sm:px-3 sm:py-2 rounded-xl transition-all group"
          >
            <div className="relative text-slate-700 group-hover:text-brand-primary">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-brand-primary text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>

            {/* Desktop / Laptop: Cart Total */}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] text-slate-400 font-medium uppercase leading-none">
                My Cart
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-brand-primary leading-tight">
                {formatBDT(cartTotal)}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Dedicated Search Bar Row (Below main header) */}
      <div className="lg:hidden px-4 pb-3 pt-1 border-t border-slate-100 bg-slate-50/60">
        <form
          onSubmit={handleSearchSubmit}
          className="w-full flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs focus-within:border-brand-primary"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search tech and accessories..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>
    </header>
  );
};
