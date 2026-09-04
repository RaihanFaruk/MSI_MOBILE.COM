"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { formatBDT } from "@/utils/formatters";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense } from "react";
import { DbProduct, DbCategory } from "@/types";

function AdminProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const stockParam = searchParams.get("stock") || "all";

  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedStock, setSelectedStock] = useState(stockParam);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [deleteModalId, setDeleteModalId] = useState<string | number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchProductsAndCategories = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Categories
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      if (catData) setCategories(catData);

      // 2. Products
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });

      if (error) {
        const { data: rawData, error: rawErr } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (rawErr) throw rawErr;
        setProducts(rawData || []);
      } else {
        setProducts(data || []);
      }
    } catch (err: unknown) {
      console.error("Products fetch error:", err);
      const msg = err instanceof Error ? err.message : "Failed to load products.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductsAndCategories();
  }, [fetchProductsAndCategories]);

  const handleDelete = async (id: string | number) => {
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      showToast("Product deleted successfully.", "success");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteModalId(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete product.";
      showToast(msg, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Distinct Brands
  const uniqueBrands = Array.from(
    new Set(products.map((p) => p.brand).filter(Boolean))
  ) as string[];

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === "all" ||
      String(p.category_id) === selectedCategory ||
      p.category === selectedCategory;

    const matchesBrand =
      selectedBrand === "all" || p.brand?.toUpperCase() === selectedBrand.toUpperCase();

    const currentStock = p.stock ?? 0;
    const matchesStock =
      selectedStock === "all"
        ? true
        : selectedStock === "low"
        ? currentStock < 5
        : selectedStock === "out"
        ? currentStock === 0
        : selectedStock === "in_stock"
        ? currentStock >= 5
        : true;

    return matchesSearch && matchesCategory && matchesBrand && matchesStock;
  });

  // Pagination Calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold animate-in fade-in ${
            toastMessage.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/15 border border-rose-500/30 text-rose-400"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Products Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage inventory, pricing, specifications & stock
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProductsAndCategories}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/products/new"
            className="bg-brand-primary hover:bg-brand-primary-dark active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, brand, slug..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700 focus:border-brand-primary rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-700 focus:border-brand-primary rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Brand Filter */}
          {uniqueBrands.length > 0 && (
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-700 focus:border-brand-primary rounded-xl text-xs text-white focus:outline-none uppercase"
            >
              <option value="all">All Brands</option>
              {uniqueBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}

          {/* Stock Filter */}
          <select
            value={selectedStock}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedStock(val);
              setCurrentPage(1);
              const sp = new URLSearchParams(window.location.search);
              if (val !== "all") sp.set("stock", val);
              else sp.delete("stock");
              const qs = sp.toString();
              router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
            }}
            className="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-700 focus:border-brand-primary rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="all">All Stock Status</option>
            <option value="low">⚠️ Low Stock (&lt; 5)</option>
            <option value="out">❌ Out of Stock (0)</option>
            <option value="in_stock">✅ In Stock (≥ 5)</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-semibold">
          Showing <strong className="text-white">{paginatedProducts.length}</strong> of{" "}
          <strong className="text-white">{filteredProducts.length}</strong> filtered products
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-primary" />
            <p>Loading products catalog...</p>
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="text-center py-16 space-y-3 px-4">
            <Package className="w-12 h-12 text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">
              {searchQuery || selectedCategory !== "all" || selectedBrand !== "all"
                ? "No matching products found"
                : "No products in database yet"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? "Try adjusting your search filters to find what you're looking for."
                : "Get started by adding your first smartphone, laptop, or gadget into the store catalog."}
            </p>
            {!searchQuery && (
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Product</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Brand</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price (৳)</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedProducts.map((product) => {
                  const currentStock = product.stock ?? 0;
                  const isLowStock = currentStock < 5;

                  return (
                    <tr
                      key={product.id}
                      className={`transition-colors ${
                        currentStock === 0
                          ? "bg-rose-950/20 hover:bg-rose-950/30"
                          : isLowStock
                          ? "bg-amber-950/15 hover:bg-amber-950/25"
                          : "hover:bg-slate-800/40"
                      }`}
                    >
                      {/* Image & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-11 h-11 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shrink-0 flex items-center justify-center">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-contain p-1"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-600" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <p className="font-bold text-white truncate" title={product.name}>
                              {product.name}
                            </p>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {product.slug || `id: ${product.id}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase text-[10px]">
                          {product.brand || "—"}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-300">
                        {product.categories?.name || product.category || "General Tech"}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-bold text-blue-400">
                        {formatBDT(product.price || 0)}
                        {product.discount_price && (
                          <span className="block text-[10px] text-slate-500 line-through">
                            {formatBDT(product.discount_price)}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              currentStock > 10
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : currentStock > 0
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {currentStock} in stock
                          </span>
                          {isLowStock && (
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                                currentStock === 0
                                  ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                  : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              }`}
                            >
                              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                              <span>{currentStock === 0 ? "Out of Stock" : "Low Stock"}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteModalId(product.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Page <strong className="text-white">{currentPage}</strong> of{" "}
              <strong className="text-white">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/30">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete this product?</h3>
              <p className="text-xs text-slate-400 mt-1">
                This action will permanently delete the item from your store inventory.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalId(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModalId)}
                disabled={deleteLoading}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-20 text-slate-400 text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
          <span>Loading products catalog...</span>
        </div>
      }
    >
      <AdminProductsContent />
    </Suspense>
  );
}
