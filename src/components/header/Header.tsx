"use client";

import React, { useState, useEffect } from "react";
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
  Sparkles,
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
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <header className={`sticky top-0 z-40 bg-obsidian-900 border-b transition-all duration-300 ${
      isScrolled
        ? "border-amber-500/25 shadow-2xl shadow-black/80 bg-obsidian-950/95 backdrop-blur-md"
        : "border-amber-500/15 shadow-md shadow-black/40"
    }`}>
      {/* Tier 2: Main Luxury Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Mobile Left: Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open Navigation Menu"
          className="lg:hidden p-2 -ml-2 text-neutral-300 hover:text-gold-400 rounded-lg hover:bg-neutral-800/60 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Brand Logo - Luxury Gold & Obsidian Typography */}
        <div className="flex items-center gap-1.5 cursor-pointer select-none">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 text-obsidian-950 font-black text-lg sm:text-xl px-2.5 py-1 rounded-md tracking-wider shadow-md shadow-gold-500/20 flex items-center justify-center font-serif">
              MSI
            </span>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg text-white tracking-wider leading-none group-hover:text-gold-300 transition-colors">
                MOBILE<span className="text-gold-500">.COM</span>
              </span>
              <span className="text-[8px] sm:text-[9px] text-gold-400/90 font-medium tracking-[0.2em] uppercase leading-tight mt-0.5">
                Haute Tech Boutique
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop / Laptop Search Bar with Dark Obsidian & Gold Border */}
        <div className="hidden lg:flex flex-1 max-w-2xl mx-6">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full flex items-center bg-obsidian-800/90 border border-amber-500/25 focus-within:border-gold-500 focus-within:ring-1 focus-within:ring-gold-500/30 rounded-xl overflow-hidden transition-all shadow-inner"
          >
            {/* Category Dropdown */}
            <div className="relative border-r border-neutral-800 hidden xl:flex items-center bg-obsidian-950/60">
              <select
                aria-label="Filter by product category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-transparent py-2.5 pl-3.5 pr-8 text-xs font-semibold text-neutral-300 focus:outline-none cursor-pointer tracking-wider"
              >
                <option value="All" className="bg-obsidian-900 text-white">All Collections</option>
                <option value="Smartphones" className="bg-obsidian-900 text-white">Smartphones</option>
                <option value="Laptops" className="bg-obsidian-900 text-white">Laptops</option>
                <option value="Gadgets" className="bg-obsidian-900 text-white">Gadgets</option>
                <option value="Audio" className="bg-obsidian-900 text-white">High-End Audio</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gold-500/80 absolute right-2.5 pointer-events-none" />
            </div>

            {/* Input field */}
            <div className="flex-1 flex items-center px-3.5">
              <Search className="w-4 h-4 text-neutral-400 shrink-0 mr-2.5" />
              <input
                type="text"
                aria-label="Search for products, brands and accessories"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flagships, luxury workstations, audio..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-neutral-500 py-2.5 focus:outline-none tracking-wide"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search input"
                  title="Clear search"
                  onClick={() => setSearchQuery("")}
                  className="text-neutral-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Gold Search Button */}
            <button
              type="submit"
              aria-label="Execute search"
              title="Search"
              className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 active:scale-95 text-obsidian-950 text-xs sm:text-sm font-bold px-6 py-2.5 transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-md shadow-gold-500/15"
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
              <div className="flex items-center gap-2.5 text-neutral-300 hover:text-gold-400 cursor-pointer p-1.5 rounded-lg hover:bg-neutral-800/60 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gold-500/15 border border-gold-500/40 text-gold-400 font-bold flex items-center justify-center text-xs shadow-inner">
                  {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider leading-none">
                    Welcome
                  </span>
                  <span className="text-xs font-bold text-white group-hover/user:text-gold-400 leading-tight truncate max-w-[100px]">
                    {profile?.full_name?.split(" ")[0] || "Client"}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-neutral-400 group-hover/user:text-gold-400 transition-transform group-hover/user:rotate-180" />
              </div>

              {/* User Dropdown */}
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-obsidian-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-500/20 py-2 hidden group-hover/user:block z-50 animate-in fade-in-50">
                <div className="px-4 py-2.5 border-b border-neutral-800">
                  <p className="text-xs font-bold text-white truncate">{profile?.full_name || "Client"}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                  {profile?.role === "admin" && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded uppercase tracking-wider">
                      Administrator
                    </span>
                  )}
                </div>

                <Link
                  href="/account"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800/80 hover:text-gold-400 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-gold-500" />
                  <span>My Account</span>
                </Link>

                <Link
                  href="/account/orders"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800/80 hover:text-gold-400 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-gold-500" />
                  <span>My Orders</span>
                </Link>

                <Link
                  href="/wishlist"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800/80 hover:text-rose-400 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Wishlist ({wishlist.length})</span>
                </Link>

                {profile?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-gold-400 hover:bg-gold-500/10 transition-colors border-t border-neutral-800/80 mt-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={() => signOut()}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 transition-colors border-t border-neutral-800 mt-1 cursor-pointer"
                >
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden lg:flex items-center gap-2.5 text-neutral-300 hover:text-gold-400 cursor-pointer p-1.5 rounded-lg hover:bg-neutral-800/60 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700/80 flex items-center justify-center text-neutral-300 group-hover:border-gold-500">
                <User className="w-4 h-4 text-gold-400" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider leading-none">Welcome</span>
                <span className="text-xs font-bold text-white leading-tight">Sign In</span>
              </div>
            </Link>
          )}

          {/* Wishlist Icon Link */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative p-2 text-neutral-300 hover:text-gold-400 rounded-xl hover:bg-neutral-800/60 transition-colors"
          >
            <Heart className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold-500 text-obsidian-950 text-[10px] font-black flex items-center justify-center shadow-md shadow-gold-500/30">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Icon & Total (Desktop shows price, Mobile shows icon+badge) */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Shopping Cart"
            className="flex items-center gap-2.5 bg-obsidian-800/90 hover:bg-neutral-800 border border-amber-500/25 hover:border-gold-500/60 p-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all group cursor-pointer shadow-sm"
          >
            <div className="relative text-neutral-300 group-hover:text-gold-400">
              <ShoppingBag className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-gold-500 text-obsidian-950 text-[10px] font-black flex items-center justify-center shadow-md shadow-gold-500/30">
                  {cartCount}
                </span>
              )}
            </div>

            {/* Desktop / Laptop: Cart Total */}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-widest leading-none">
                Shopping Bag
              </span>
              <span className="text-xs sm:text-sm font-black text-gold-400 leading-tight">
                {formatBDT(cartTotal)}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Row (Under header on mobile/tablet) */}
      <div className="lg:hidden px-4 pb-3 pt-1">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            aria-label="Search for products, brands and accessories"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search flagships, audio, laptops..."
            className="w-full bg-obsidian-800/90 border border-amber-500/20 focus:border-gold-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none shadow-inner"
          />
          <Search className="w-4 h-4 text-gold-500/80 absolute left-3 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </header>
  );
};
