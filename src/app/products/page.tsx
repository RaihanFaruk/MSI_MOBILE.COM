"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/context/StoreContext";
import { formatBDT } from "@/utils/formatters";
import {
  Search,
  SlidersHorizontal,
  Star,
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  ArrowUpDown,
  Check,
  Package,
  Loader2,
} from "lucide-react";
import { DbProduct, Product } from "@/types";
import { ProductGridSkeleton } from "@/components/common/Skeleton";

const BRANDS = [
  { name: "APPLE" },
  { name: "SAMSUNG" },
  { name: "XIAOMI" },
  { name: "ONEPLUS" },
  { name: "MSI" },
  { name: "ASUS" },
  { name: "LENOVO" },
  { name: "SONY" },
  { name: "JBL" },
  { name: "ANKER" },
  { name: "DJI" },
  { name: "MARSHALL" },
];

function ProductsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart, toggleWishlist, isInWishlist } = useStore();

  // URL States
  const initialCategory = searchParams.get("category") || "all";
  const initialBrand = searchParams.get("brand") || "all";
  const initialSearch = searchParams.get("q") || "";
  const initialSort = searchParams.get("sort") || "newest";
  const initialMinPrice = searchParams.get("min") || "";
  const initialMaxPrice = searchParams.get("max") || "";
  const initialRating = searchParams.get("rating") || "all";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [selectedRating, setSelectedRating] = useState(initialRating);
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 12;

  // Debounce Search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync state to URL
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedBrand !== "all") params.set("brand", selectedBrand);
    if (minPrice) params.set("min", minPrice);
    if (maxPrice) params.set("max", maxPrice);
    if (selectedRating !== "all") params.set("rating", selectedRating);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", String(currentPage));

    const newUrl = params.toString() ? `/products?${params.toString()}` : "/products";
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearch, selectedCategory, selectedBrand, minPrice, maxPrice, selectedRating, sortBy, currentPage, router]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Fetch Categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const { data: catData } = await supabase
          .from("categories")
          .select("id, name, slug")
          .order("name");

        if (catData && catData.length > 0) {
          setCategoriesList(catData.map((c) => ({ id: String(c.id), name: c.name, slug: c.slug })));
        }
      } catch {
        // Fallback to static category filters
      }
    }
    loadCategories();
  }, []);

  // Fetch Products from Supabase using database-level query filtering
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let query = selectedCategory !== "all"
          ? supabase.from("products").select("*, categories!inner(id, name, slug)", { count: "exact" }).eq("categories.slug", selectedCategory)
          : supabase.from("products").select("*, categories(id, name, slug)", { count: "exact" });

        // Brand filter
        if (selectedBrand !== "all") {
          query = query.ilike("brand", `%${selectedBrand}%`);
        }

        // Price filters
        if (minPrice && !isNaN(Number(minPrice))) {
          query = query.gte("price", Number(minPrice));
        }
        if (maxPrice && !isNaN(Number(maxPrice))) {
          query = query.lte("price", Number(maxPrice));
        }

        // Rating filter
        if (selectedRating !== "all" && !isNaN(Number(selectedRating))) {
          query = query.gte("rating", Number(selectedRating));
        }

        // Search Query
        if (debouncedSearch.trim()) {
          const q = debouncedSearch.trim();
          query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%,specs.ilike.%${q}%,description.ilike.%${q}%`);
        }

        // Sorting
        if (sortBy === "price_asc") {
          query = query.order("price", { ascending: true });
        } else if (sortBy === "price_desc") {
          query = query.order("price", { ascending: false });
        } else if (sortBy === "rating") {
          query = query.order("rating", { ascending: false });
        } else if (sortBy === "discount") {
          query = query.order("discount_price", { ascending: false, nullsFirst: false });
        } else {
          query = query.order("id", { ascending: true });
        }

        // Pagination
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        query = query.range(from, to);

        const { data: dbProds, count, error } = await query;

        if (dbProds && !error) {
          const mapped: Product[] = dbProds.map((p: DbProduct) => {
            const firstImg = Array.isArray(p.images) && p.images.length > 0
              ? p.images[0]
              : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80";

            return {
              id: String(p.id),
              name: p.name,
              brand: p.brand,
              category: p.categories?.name || "Smartphones",
              image: firstImg,
              price: Number(p.price),
              originalPrice: p.discount_price ? Number(p.discount_price) : undefined,
              rating: p.rating ? Number(p.rating) : 4.8,
              reviewsCount: p.reviews_count || 12,
              specs: p.specs || undefined,
              inStock: (p.stock || 0) > 0,
              badge: p.is_featured ? { text: "FEATURED", type: "hot" } : undefined,
              description: p.description,
            };
          });
          setProducts(mapped);
          setTotalCount(count || mapped.length);
        } else {
          setProducts([]);
          setTotalCount(0);
        }
      } catch (e) {
        console.error("Products load error:", e);
        setProducts([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [debouncedSearch, selectedCategory, selectedBrand, minPrice, maxPrice, selectedRating, sortBy, currentPage]);

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  const resetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setMinPrice("");
    setMaxPrice("");
    setSelectedRating("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedBrand !== "all" ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (selectedRating !== "all" ? 1 : 0) +
    (debouncedSearch ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumbs & Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link href="/" className="hover:text-brand-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Store Catalog</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                All Electronics & Gadgets
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Explore official smartphones, laptops, smartwatches and accessories with Bangladesh warranty
              </p>
            </div>

            {/* Mobile Filter Trigger */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
              >
                <SlidersHorizontal className="w-4 h-4 text-brand-primary" />
                <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top Controls Bar: Search & Sort */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Search catalog products by model, brand, or specs"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search products by model, brand, or specs..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear catalog search"
                title="Clear search"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown & Counter */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Showing <strong>{products.length}</strong> of <strong>{totalCount}</strong> items
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="newest">Sort by: Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
                <option value="discount">Biggest Discounts</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-primary" />
                <h3 className="text-sm font-bold text-slate-900">Filter Products</h3>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] font-bold text-rose-600 hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Categories Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Categories
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedCategory === "all"
                      ? "bg-blue-50 text-brand-primary font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>All Categories</span>
                  {selectedCategory === "all" && <Check className="w-3.5 h-3.5" />}
                </button>
                {categoriesList.map((cat) => {
                  const isSelected =
                    selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
                    selectedCategory.toLowerCase() === cat.slug.toLowerCase();
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-blue-50 text-brand-primary font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands Filter */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Popular Brands
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    setSelectedBrand("all");
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedBrand === "all"
                      ? "bg-blue-50 text-brand-primary font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>All Brands</span>
                  {selectedBrand === "all" && <Check className="w-3.5 h-3.5" />}
                </button>
                {BRANDS.map((b) => {
                  const isSelected = selectedBrand.toUpperCase() === b.name.toUpperCase();
                  return (
                    <button
                      key={b.name}
                      onClick={() => {
                        setSelectedBrand(b.name);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-blue-50 text-brand-primary font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>{b.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Price Range (BDT ৳)
              </h4>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <input
                  type="number"
                  aria-label="Minimum price in Bangladeshi Taka"
                  placeholder="Min ৳"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-brand-primary"
                />
                <input
                  type="number"
                  aria-label="Maximum price in Bangladeshi Taka"
                  placeholder="Max ৳"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Price Range Pills */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("20000");
                    setCurrentPage(1);
                  }}
                  className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  Under ৳20K
                </button>
                <button
                  onClick={() => {
                    setMinPrice("20000");
                    setMaxPrice("50000");
                    setCurrentPage(1);
                  }}
                  className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  ৳20K - ৳50K
                </button>
                <button
                  onClick={() => {
                    setMinPrice("50000");
                    setMaxPrice("100000");
                    setCurrentPage(1);
                  }}
                  className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  ৳50K - ৳100K
                </button>
                <button
                  onClick={() => {
                    setMinPrice("100000");
                    setMaxPrice("");
                    setCurrentPage(1);
                  }}
                  className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  Above ৳100K
                </button>
              </div>
            </div>

            {/* Customer Rating */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Customer Rating
              </h4>
              <div className="space-y-1">
                {[
                  { value: "all", label: "All Ratings" },
                  { value: "4.8", label: "4.8 Stars & Above" },
                  { value: "4.5", label: "4.5 Stars & Above" },
                  { value: "4.0", label: "4.0 Stars & Above" },
                ].map((r) => (
                  <button
                    key={r.value}
                    onClick={() => {
                      setSelectedRating(r.value);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                      selectedRating === r.value
                        ? "bg-blue-50 text-brand-primary font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{r.label}</span>
                    {selectedRating === r.value && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Product Grid Column */}
          <div className="lg:col-span-3">
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No matching products found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn&apos;t find any devices matching your exact filter criteria. Try adjusting your search query or reset your filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-3.5 sm:gap-4">
                  {products.map((product) => {
                    const isWishlisted = isInWishlist(product.id);
                    const productSlug = product.name
                      .toLowerCase()
                      .replace(/[^\w\s-]/g, "")
                      .replace(/[\s_-]+/g, "-")
                      .replace(/^-+|-+$/g, "");

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-3.5 flex flex-col justify-between group transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 relative overflow-hidden"
                      >
                        {/* Badges */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          {product.badge ? (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100">
                              {product.badge.text}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {product.brand}
                            </span>
                          )}

                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="p-1.5 rounded-full hover:bg-rose-50 transition-colors"
                            title="Add to Wishlist"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isWishlisted
                                  ? "fill-rose-600 text-rose-600"
                                  : "text-slate-400 hover:text-rose-500"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Image Link */}
                        <Link
                          href={`/products/${productSlug}`}
                          className="relative w-full h-40 sm:h-48 my-1 flex items-center justify-center bg-slate-50/60 rounded-xl overflow-hidden group-hover:scale-102 transition-transform duration-300"
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-3"
                          />
                        </Link>

                        {/* Specs & Title */}
                        <div className="mt-2 space-y-1">
                          <Link href={`/products/${productSlug}`}>
                            <h3
                              className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 hover:text-brand-primary transition-colors min-h-8 sm:min-h-10"
                              title={product.name}
                            >
                              {product.name}
                            </h3>
                          </Link>

                          {product.specs && (
                            <p className="text-[11px] text-slate-400 truncate">{product.specs}</p>
                          )}

                          {/* Rating */}
                          <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{product.rating}</span>
                            <span className="text-slate-400 font-normal">
                              ({product.reviewsCount})
                            </span>
                          </div>
                        </div>

                        {/* Price & Add to Cart */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight">
                              {formatBDT(product.price)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[10px] text-slate-400 line-through">
                                {formatBDT(product.originalPrice)}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => addToCart(product)}
                            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                            title="Add to Cart"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Add</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                            currentPage === page
                              ? "bg-brand-primary text-white shadow-md shadow-blue-500/20"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters Slide-over Modal */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col justify-between p-5 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-primary" />
                  <h3 className="text-sm font-bold text-slate-900">Filters</h3>
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Filter Options */}
              <div className="space-y-4 flex-1">
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Category</h4>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="all">All Categories</option>
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Brand</h4>
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="all">All Brands</option>
                    {BRANDS.map((b) => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => {
                    resetFilters();
                    setMobileFiltersOpen(false);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 py-2.5 bg-brand-primary text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Loading catalog...</p>
          </div>
        </div>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  );
}
