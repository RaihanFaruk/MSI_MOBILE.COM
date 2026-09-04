"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  ChevronDown,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { formatBDT } from "@/utils/formatters";

interface SearchSuggestion {
  id: string | number;
  slug?: string;
  name: string;
  brand: string;
  price: number;
  discount_price?: number | null;
  stock?: number;
  image: string;
}

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
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Live search suggestion query with 250ms debounce
  useEffect(() => {
    const cleanQ = searchQuery.trim();
    if (cleanQ.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const query = supabase
          .from("products")
          .select("id, name, slug, brand, price, discount_price, stock, images")
          .or(`name.ilike.%${cleanQ}%,brand.ilike.%${cleanQ}%`)
          .limit(5);

        const { data } = await query;
        if (data && data.length > 0) {
          const items: SearchSuggestion[] = data.map((p) => {
            const firstImg = Array.isArray(p.images) && p.images.length > 0
              ? p.images[0]
              : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80";

            return {
              id: p.id,
              slug: p.slug,
              name: p.name,
              brand: p.brand,
              price: Number(p.price),
              discount_price: p.discount_price ? Number(p.discount_price) : null,
              stock: p.stock !== undefined && p.stock !== null ? Number(p.stock) : 0,
              image: firstImg,
            };
          });
          setSuggestions(items);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Search suggestions error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  const handleSuggestionClick = (slugOrId: string) => {
    setShowDropdown(false);
    router.push(`/products/${slugOrId}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-100">
      {/* Tier 2: Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Mobile Left: Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open Navigation Menu"
          className="lg:hidden p-2 -ml-2 text-slate-700 hover:text-brand-primary rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Brand Logo */}
        <div className="flex items-center gap-1.5 cursor-pointer select-none">
          <Link href="/" className="flex items-center gap-2">
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
          </Link>
        </div>

        {/* Desktop / Laptop Search Bar (Hidden on Mobile & Tablet) */}
        <div ref={searchContainerRef} className="hidden lg:flex flex-1 max-w-2xl mx-6 relative">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full flex items-center bg-slate-50 border-2 border-slate-200 focus-within:border-brand-primary rounded-xl overflow-hidden transition-all shadow-inner"
          >
            {/* Category Dropdown */}
            <div className="relative border-r border-slate-200 hidden xl:flex items-center bg-slate-100/70">
              <select
                aria-label="Filter by product category"
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
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-brand-primary animate-spin shrink-0 mr-2" />
              ) : (
                <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
              )}
              <input
                type="text"
                aria-label="Search for products, brands and accessories"
                value={searchQuery}
                onFocus={() => {
                  if (suggestions.length > 0) setShowDropdown(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for smartphones, laptops, audio, accessories..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 py-2.5 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search input"
                  title="Clear search"
                  onClick={() => {
                    setSearchQuery("");
                    setShowDropdown(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Blue Search Button */}
            <button
              type="submit"
              aria-label="Execute search"
              title="Search"
              className="bg-brand-primary hover:bg-brand-primary-dark active:scale-95 text-white text-xs sm:text-sm font-bold px-6 py-2.5 transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Search</span>
            </button>
          </form>

          {/* Search Suggestions Dropdown (Desktop) */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden z-50 animate-in fade-in-50 duration-150">
              {suggestions.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  <div className="p-2 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Matching Products</span>
                    <span>{suggestions.length} results</span>
                  </div>

                  {suggestions.map((item) => {
                    const regularPrice = item.price;
                    const discountPrice = item.discount_price ? Number(item.discount_price) : null;
                    const hasValidDisc = discountPrice !== null && discountPrice > 0 && discountPrice < regularPrice;
                    const sellingPrice = hasValidDisc ? discountPrice : regularPrice;
                    const originalPrice = hasValidDisc ? regularPrice : undefined;
                    const isOut = item.stock !== undefined && item.stock <= 0;
                    const itemSlug = item.slug || String(item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSuggestionClick(itemSlug)}
                        className="p-3 flex items-center gap-3 hover:bg-blue-50/50 cursor-pointer transition-colors"
                      >
                        <div className="relative w-12 h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {item.brand}
                            </span>
                            {isOut && (
                              <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 truncate">
                            {item.name}
                          </h4>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-extrabold text-slate-900 block">
                            {formatBDT(sellingPrice)}
                          </span>
                          {originalPrice && (
                            <span className="text-[10px] text-slate-400 line-through">
                              {formatBDT(originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full p-2.5 bg-slate-50 hover:bg-blue-50 text-center text-xs font-bold text-brand-primary flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View all results for &ldquo;{searchQuery}&rdquo;</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">No products found for &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-[11px] text-slate-400">Try searching by brand (e.g. Apple, Samsung, MSI) or model name.</p>
                </div>
              )}
            </div>
          )}
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

                <Link
                  href="/wishlist"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition-colors"
                >
                  <span>My Wishlist ({wishlist.length})</span>
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

          {/* Mobile User Icon / Indicator (Mobile & Tablet) */}
          {user ? (
            <Link
              href="/account"
              aria-label="My Account"
              title={`Logged in as ${profile?.full_name || user.email}`}
              className="lg:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 text-brand-primary font-extrabold text-xs border border-blue-200 shadow-2xs active:scale-95 transition-all"
            >
              {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
            </Link>
          ) : (
            <Link
              href="/login"
              aria-label="Sign In"
              title="Sign In"
              className="lg:hidden p-2 text-slate-700 hover:text-brand-primary rounded-lg hover:bg-slate-50 transition-colors"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
          )}

          {/* Wishlist Icon Link */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative p-2 text-slate-700 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-accent text-white text-[10px] font-extrabold flex items-center justify-center animate-scaleIn">
                {wishlist.length}
              </span>
            )}
          </Link>

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
      <div ref={mobileSearchRef} className="lg:hidden px-4 pb-3 pt-1 border-t border-slate-100 bg-slate-50/60 relative">
        <form
          onSubmit={handleSearchSubmit}
          className="w-full flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs focus-within:border-brand-primary"
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-brand-primary animate-spin shrink-0 mr-2" />
          ) : (
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
          )}
          <input
            type="text"
            aria-label="Search mobile catalog"
            value={searchQuery}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search tech and accessories..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear mobile search"
              title="Clear search"
              onClick={() => {
                setSearchQuery("");
                setShowDropdown(false);
              }}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Mobile Search Suggestions Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-4 right-4 mt-1 bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden z-50 animate-in fade-in-50 duration-150 max-h-80 overflow-y-auto">
            {suggestions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {suggestions.map((item) => {
                  const regularPrice = item.price;
                  const discountPrice = item.discount_price ? Number(item.discount_price) : null;
                  const hasValidDisc = discountPrice !== null && discountPrice > 0 && discountPrice < regularPrice;
                  const sellingPrice = hasValidDisc ? discountPrice : regularPrice;
                  const originalPrice = hasValidDisc ? regularPrice : undefined;
                  const isOut = item.stock !== undefined && item.stock <= 0;
                  const itemSlug = item.slug || String(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSuggestionClick(itemSlug)}
                      className="p-2.5 flex items-center gap-2.5 hover:bg-blue-50/50 cursor-pointer transition-colors"
                    >
                      <div className="relative w-10 h-10 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-0.5"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">
                          {item.brand}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 truncate">
                          {item.name}
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-slate-900 block">
                          {formatBDT(sellingPrice)}
                        </span>
                        {originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through block">
                            {formatBDT(originalPrice)}
                          </span>
                        )}
                        {isOut && (
                          <span className="text-[9px] text-rose-500 font-bold block">
                            Out of stock
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full p-2.5 bg-slate-50 hover:bg-blue-50 text-center text-xs font-bold text-brand-primary flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>View all results for &ldquo;{searchQuery}&rdquo;</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No products found for &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
