"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/lib/auth-context";
import { formatBDT } from "@/utils/formatters";
import {
  Star,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Share2,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  Loader2,
} from "lucide-react";
import { DbProduct, Product, DbProductVariation, DbReview } from "@/types";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";

interface Props {
  product: DbProduct;
  relatedProducts: Product[];
}

export default function ProductDetailsClient({ product, relatedProducts }: Props) {
  const { addToCart, toggleWishlist, isInWishlist, setIsCartOpen } = useStore();
  const { user, profile } = useAuth();

  // Variations handling
  const variations: DbProductVariation[] = product.product_variations || [];
  const [selectedVariation, setSelectedVariation] = useState<DbProductVariation | null>(
    variations.length > 0 ? variations[0] : null
  );

  // Available unique colors and storages
  const availableColors = Array.from(
    new Set(variations.map((v) => v.color).filter(Boolean))
  ) as string[];

  const availableStorages = Array.from(
    new Set(variations.map((v) => v.storage).filter(Boolean))
  ) as string[];

  const [selectedColor, setSelectedColor] = useState<string>(
    selectedVariation?.color || availableColors[0] || "Standard"
  );
  const [selectedStorage, setSelectedStorage] = useState<string>(
    selectedVariation?.storage || availableStorages[0] || "Standard"
  );

  // When color or storage changes, find matching variation
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const match = variations.find(
      (v) => v.color === color && (selectedStorage ? v.storage === selectedStorage : true)
    ) || variations.find((v) => v.color === color);

    if (match) setSelectedVariation(match);
  };

  const handleStorageSelect = (storage: string) => {
    setSelectedStorage(storage);
    const match = variations.find(
      (v) => v.storage === storage && (selectedColor ? v.color === selectedColor : true)
    ) || variations.find((v) => v.storage === storage);

    if (match) setSelectedVariation(match);
  };

  // Pricing & Stock calculated live from variation or base product
  const baseRegularPrice = Number(product.price) || 0;
  const baseDiscountPrice = product.discount_price ? Number(product.discount_price) : null;
  const baseHasDiscount = baseDiscountPrice !== null && baseDiscountPrice > 0 && baseDiscountPrice < baseRegularPrice;

  // Selected variation pricing
  const varRegularPrice = selectedVariation?.price ? Number(selectedVariation.price) : baseRegularPrice;
  const varDiscountPrice = selectedVariation?.discount_price 
    ? Number(selectedVariation.discount_price) 
    : (selectedVariation ? null : (baseHasDiscount ? baseDiscountPrice : null));
  const varHasDiscount = varDiscountPrice !== null && varDiscountPrice > 0 && varDiscountPrice < varRegularPrice;

  const currentSellingPrice = varHasDiscount ? varDiscountPrice : varRegularPrice;
  const currentOriginalPrice = varHasDiscount ? varRegularPrice : undefined;
  const currentStock = selectedVariation !== null && selectedVariation.stock !== undefined 
    ? Number(selectedVariation.stock) 
    : (product.stock !== undefined && product.stock !== null ? Number(product.stock) : 0);
  const isOutOfStock = currentStock <= 0;

  // Image Gallery state - prioritize variation image if available
  const baseImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80"];

  const imagesList = selectedVariation?.image_url && !baseImages.includes(selectedVariation.image_url)
    ? [selectedVariation.image_url, ...baseImages]
    : baseImages;

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [copiedLink, setCopiedLink] = useState(false);

  // Reviews State - only approved reviews
  const approvedInitialReviews = (product.reviews || []).filter(
    (r: DbReview) => (r as unknown as { is_approved?: boolean }).is_approved !== false
  );
  const [reviewsList, setReviewsList] = useState<DbReview[]>(approvedInitialReviews);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(false);

    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      setReviewError("Please write at least 5 characters in your review comment.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: String(product.id),
          user_id: user?.id || null,
          user_name: profile?.full_name || user?.email?.split("@")[0] || "Verified Buyer",
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit review");
      }

      setReviewsList((prev) => [data.review, ...prev]);
      setReviewSuccess(true);
      setReviewComment("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit review.";
      setReviewError(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const isWishlisted = isInWishlist(String(product.id));

  // Convert to Store product for cart with correct selling price & original price
  const cartProductFormat: Product = {
    id: String(product.id),
    name: `${product.name} ${selectedColor !== "Standard" ? `(${selectedColor})` : ""} ${selectedStorage !== "Standard" ? selectedStorage : ""}`.trim(),
    brand: product.brand,
    category: product.category || "Smartphones",
    image: imagesList[0],
    price: currentSellingPrice,
    originalPrice: currentOriginalPrice,
    rating: product.rating ? Number(product.rating) : 5,
    reviewsCount: product.reviews_count || reviewsList.length || 10,
    inStock: !isOutOfStock,
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(
      cartProductFormat,
      quantity,
      selectedVariation?.id ? String(selectedVariation.id) : undefined,
      currentStock,
      selectedColor !== "Standard" ? selectedColor : undefined,
      selectedStorage !== "Standard" ? selectedStorage : undefined
    );
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart();
    setIsCartOpen(true);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="container mx-auto px-4 max-w-7xl space-y-10">
        {/* Breadcrumb Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-brand-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <Link href="/products" className="hover:text-brand-primary transition-colors">
              Products
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">
              {product.name}
            </span>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-primary font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? "Link Copied!" : "Share"}</span>
          </button>
        </div>

        {/* Product Overview: Gallery + Options Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Gallery with Magnifier Lens & Mobile Pinch-to-Zoom Lightbox (5 cols) */}
          <div className="lg:col-span-5">
            <ProductImageGallery
              images={imagesList}
              productName={product.name}
              isWishlisted={isWishlisted}
              onToggleWishlist={() => toggleWishlist(String(product.id))}
              isOutOfStock={isOutOfStock}
            />
          </div>

          {/* Product Purchase Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Brand, Title & Rating */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-blue-50 text-brand-primary border border-blue-100">
                  {product.brand}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Official Warranty BD
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews counter */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating ? Number(product.rating) : 5)
                          ? "fill-amber-400"
                          : "text-slate-200 fill-slate-200"
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-1">
                    {product.rating ? Number(product.rating).toFixed(1) : "5.0"}
                  </span>
                </div>
                <span className="text-xs text-slate-400">•</span>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className="text-xs font-semibold text-brand-primary hover:underline"
                >
                  {product.reviews_count || product.reviews?.length || 12} Verified Reviews
                </button>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-brand-primary">
                  {formatBDT(currentSellingPrice)}
                </span>
                {currentOriginalPrice && currentOriginalPrice > currentSellingPrice && (
                  <>
                    <span className="text-sm sm:text-base text-slate-400 line-through">
                      {formatBDT(currentOriginalPrice)}
                    </span>
                    <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      Save {formatBDT(currentOriginalPrice - currentSellingPrice)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Prices include all VAT & taxes. Official cash memo included.
              </p>
            </div>

            {/* Variations Selector: Color & Storage */}
            <div className="space-y-4">
              {/* Color Swatches */}
              {availableColors.length > 0 && availableColors[0] !== "Standard" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Select Color: <strong className="text-slate-900">{selectedColor}</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {availableColors.map((color) => {
                      const isSelected = selectedColor === color;
                      const variationObj = variations.find((v) => v.color === color);
                      return (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {variationObj?.color_code && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/40"
                              style={{ backgroundColor: variationObj.color_code }}
                            />
                          )}
                          <span>{color}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Storage Capacities */}
              {availableStorages.length > 0 && availableStorages[0] !== "Standard" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Internal Storage: <strong className="text-slate-900">{selectedStorage}</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {availableStorages.map((storage) => {
                      const isSelected = selectedStorage === storage;
                      const varObj = variations.find((v) => v.storage === storage);
                      return (
                        <button
                          key={storage}
                          onClick={() => handleStorageSelect(storage)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span>{storage}</span>
                          {varObj?.price && (
                            <span className="block text-[10px] opacity-80">
                              {formatBDT(varObj.price)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Live Stock & Availability Indicator */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-500">Availability:</span>
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Out of Stock in Warehouse</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>In Stock ({currentStock} units ready to dispatch)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quantity & CTA Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Quantity Pill */}
                <div className="flex items-center justify-between border border-slate-200 bg-white rounded-xl p-1 w-full sm:w-32">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    disabled={quantity >= currentStock || isOutOfStock}
                    className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 w-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold py-3.5 px-6 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all min-h-[44px] disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                </button>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 w-full bg-brand-primary hover:bg-brand-primary-dark active:scale-95 text-white font-bold py-3.5 px-6 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all min-h-[44px] disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-200 text-center">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                <Truck className="w-4 h-4 text-brand-primary mx-auto" />
                <h5 className="text-[11px] font-bold text-slate-800">Fast Delivery</h5>
                <p className="text-[10px] text-slate-400">24-48 hrs in BD</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto" />
                <h5 className="text-[11px] font-bold text-slate-800">100% Genuine</h5>
                <p className="text-[10px] text-slate-400">Brand Sealed</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                <RotateCcw className="w-4 h-4 text-amber-500 mx-auto" />
                <h5 className="text-[11px] font-bold text-slate-800">7 Days Return</h5>
                <p className="text-[10px] text-slate-400">Replacement Guarantee</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content: Overview / Specs / Reviews */}
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-100 bg-slate-50/70 overflow-x-auto">
            <button
              onClick={() => setActiveTab("desc")}
              className={`px-6 py-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === "desc"
                  ? "border-brand-primary text-brand-primary bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Description & Highlights
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-6 py-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === "specs"
                  ? "border-brand-primary text-brand-primary bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === "reviews"
                  ? "border-brand-primary text-brand-primary bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Customer Reviews ({product.reviews?.length || 2})
            </button>
          </div>

          {/* Tab Body */}
          <div className="p-6 sm:p-8">
            {activeTab === "desc" && (
              <div className="space-y-4 max-w-4xl">
                <h3 className="text-lg font-bold text-slate-900">Product Overview</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description ||
                    `${product.name} is engineered for next-level computing, combining cutting-edge processor efficiency, ultra-responsive tactile controls, and all-day battery endurance. Guaranteed official Bangladesh inventory.`}
                </p>
                {product.specs && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                    <strong>Key Features Line:</strong> {product.specs}
                  </div>
                )}
              </div>
            )}

            {activeTab === "specs" && (
              <div className="max-w-3xl space-y-3">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Detailed Specifications</h3>
                <table className="w-full text-xs text-left border-collapse">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-600 w-1/3">Brand</td>
                      <td className="py-2.5 px-4 text-slate-900 font-semibold">{product.brand}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-600">Model Name</td>
                      <td className="py-2.5 px-4 text-slate-900 font-semibold">{product.name}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-600">Category</td>
                      <td className="py-2.5 px-4 text-slate-900">{product.category || "Smartphones"}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-600">Configuration Highlights</td>
                      <td className="py-2.5 px-4 text-slate-900">{product.specs || "Standard Official Build"}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-600">Warranty Coverage</td>
                      <td className="py-2.5 px-4 text-slate-900">1 Year Official Brand Warranty</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-8 max-w-4xl">
                {/* Rating Breakdown Header */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-center sm:border-r sm:border-slate-200 sm:pr-8">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900">
                      {product.rating ? Number(product.rating).toFixed(1) : "5.0"}
                    </span>
                    <div className="flex items-center justify-center gap-1 text-amber-400 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">
                      Based on verified purchases
                    </span>
                  </div>

                  <div className="flex-1 space-y-1.5 w-full text-xs">
                    {[
                      { star: 5, pct: 90 },
                      { star: 4, pct: 8 },
                      { star: 3, pct: 2 },
                      { star: 2, pct: 0 },
                      { star: 1, pct: 0 },
                    ].map((row) => (
                      <div key={row.star} className="flex items-center gap-2">
                        <span className="w-6 text-slate-500 font-semibold">{row.star}★</span>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-slate-400 text-[10px]">
                          {row.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Write a Review Section */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-primary" />
                    <span>Write a Product Review</span>
                  </h4>

                  {user ? (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      {reviewSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Thank you! Your verified review has been submitted successfully.</span>
                        </div>
                      )}

                      {reviewError && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{reviewError}</span>
                        </div>
                      )}

                      {/* Star Rating Picker */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">Your Rating</label>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setReviewRating(star)}
                              className="p-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= reviewRating ? "text-amber-400 fill-amber-400" : "text-slate-300"
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-xs font-bold text-slate-600 ml-2">
                            {reviewRating} out of 5 Stars
                          </span>
                        </div>
                      </div>

                      {/* Comment */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">Your Review</label>
                        <textarea
                          rows={3}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience with this device (battery, camera, performance, delivery)..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-primary resize-none placeholder-slate-400"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/15 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {submittingReview ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Submitting Review...</span>
                          </>
                        ) : (
                          <span>Submit Verified Review</span>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <span>Please sign in to your MSI Mobile account to write a review for this product.</span>
                      <Link
                        href="/login"
                        className="px-4 py-2 rounded-lg bg-brand-primary text-white font-bold text-xs hover:bg-blue-600 transition-colors shrink-0"
                      >
                        Sign In to Review
                      </Link>
                    </div>
                  )}
                </div>

                {/* Reviews List */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Customer Reviews ({reviewsList.length})
                  </h4>

                  {reviewsList.length > 0 ? (
                    reviewsList.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl border border-slate-100 bg-white shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-brand-primary font-bold flex items-center justify-center text-xs">
                              {rev.user_name ? rev.user_name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-slate-800">{rev.user_name || "Verified Customer"}</h5>
                              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified Buyer</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: Number(rev.rating) || 5 }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed pt-1">
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No reviews yet for this product. Be the first to review!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary" />
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Related Products
                </h3>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-brand-primary hover:underline"
              >
                View All Catalog
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
              {relatedProducts.map((rel) => {
                const relSlug = rel.name
                  .toLowerCase()
                  .replace(/[^\w\s-]/g, "")
                  .replace(/[\s_-]+/g, "-")
                  .replace(/^-+|-+$/g, "");

                return (
                  <div
                    key={rel.id}
                    className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col justify-between hover:border-brand-primary hover:shadow-md transition-all"
                  >
                    <Link
                      href={`/products/${relSlug}`}
                      className="relative w-full h-32 sm:h-36 mb-2 flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden"
                    >
                      <Image src={rel.image} alt={rel.name} fill className="object-contain p-2" />
                    </Link>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {rel.brand}
                      </span>
                      <Link href={`/products/${relSlug}`}>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1 hover:text-brand-primary">
                          {rel.name}
                        </h4>
                      </Link>
                      <span className="text-xs font-extrabold text-slate-900 block mt-1">
                        {formatBDT(rel.price)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
