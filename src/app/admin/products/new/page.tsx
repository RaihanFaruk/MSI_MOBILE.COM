"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Save,
  Package,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { DbCategory } from "@/types";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("50");
  const [specs, setSpecs] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);
  };

  // Fetch categories for dropdown
  useEffect(() => {
    async function loadCategories() {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (data && !error) {
          setCategories(data);
          if (data.length > 0) {
            setCategoryId(String(data[0].id));
            setCategoryName(data[0].name);
          }
        }
      } catch (e) {
        console.log("Could not load categories dropdown:", e);
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!name.trim()) {
      setErrorMsg("Product name is required.");
      setLoading(false);
      return;
    }

    if (!price || Number(price) <= 0) {
      setErrorMsg("Valid product price is required.");
      setLoading(false);
      return;
    }

    try {
      // 1. Verify active admin session (ensures JWT with auth.uid() is attached)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("No active session found. Please log in as an administrator.");
      }

      // 2. Build schema-compliant payload (only real products table columns)
      const cleanImg = imageUrl.trim() || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80";
      
      const payload: Record<string, unknown> = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/\s+/g, "-"),
        brand: brand.trim().toUpperCase() || "GENERIC",
        price: parseFloat(price),
        stock: parseInt(stock, 10) || 0,
        specs: specs.trim() || null,
        description: description.trim() || null,
        images: [cleanImg],
        is_featured: isFeatured,
        category_id: categoryId && categoryId.trim() !== "" ? categoryId.trim() : null,
      };

      if (discountPrice && parseFloat(discountPrice) > 0) {
        payload.discount_price = parseFloat(discountPrice);
      }

      const { error } = await supabase.from("products").insert([payload]);

      if (error) throw error;

      router.push("/admin/products");
    } catch (err: unknown) {
      console.error("Save product error:", err);
      const postgrestErr = err as { message?: string; code?: string; details?: string };
      const msg = postgrestErr?.message || (err instanceof Error ? err.message : "Failed to create product in Supabase database.");
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Add New Product
            </h1>
            <p className="text-xs text-slate-400">
              Create a new tech item in your Supabase database catalog
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-400 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Main Info */}
          <div className="lg:col-span-2 space-y-5 bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Apple iPhone 16 Pro Max 256GB"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Slug & Brand (2 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. iphone-16-pro-max"
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-brand-primary rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Brand <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Apple, Samsung, MSI"
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 uppercase focus:outline-none"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Category
              </label>
              {categories.length > 0 ? (
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    const selected = categories.find((c) => String(c.id) === e.target.value);
                    if (selected) setCategoryName(selected.name);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-white focus:outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Smartphones, Laptops, Audio"
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              )}
            </div>

            {/* Specs Line */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Key Specifications Line
              </label>
              <input
                type="text"
                value={specs}
                onChange={(e) => setSpecs(e.target.value)}
                placeholder="e.g. 256GB • 8GB RAM • 50MP OIS • 5000mAh"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Product Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Full product overview, warranty information, and package contents..."
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Featured toggle */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-brand-primary focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="featured" className="text-xs text-slate-300 cursor-pointer">
                Mark as Featured Product (Display in Top Deals & Highlights)
              </label>
            </div>
          </div>

          {/* Right 1 Column: Pricing, Stock & Image Preview */}
          <div className="space-y-5">
            {/* Pricing & Stock Box */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                Pricing & Stock
              </h3>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Regular Price (BDT ৳) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="189999"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-white font-bold placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Discount / Original Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Original / Strikethrough Price (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="206000"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-brand-primary rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Available Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-brand-primary rounded-xl text-xs text-white font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* Image Preview Box */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Product Image</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-700 focus:border-brand-primary rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Preview Thumbnail */}
              <div className="relative w-full h-36 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="text-center text-slate-600 text-xs">
                    <Package className="w-8 h-8 mx-auto mb-1 stroke-1" />
                    <span>No image URL entered</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-primary hover:bg-brand-primary-dark active:scale-98 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Supabase...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Publish Product</span>
                  </>
                )}
              </button>

              <Link
                href="/admin/products"
                className="block text-center w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
