"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Star,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface AdminReview {
  id: string;
  product_id: number;
  user_name: string;
  user_id?: string;
  rating: number;
  title?: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
  products?: {
    name: string;
    slug: string;
  } | {
    name: string;
    slug: string;
  }[];
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [reviewToDelete, setReviewToDelete] = useState<AdminReview | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          product_id,
          user_name,
          user_id,
          rating,
          title,
          comment,
          is_approved,
          created_at,
          products (
            name,
            slug
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Reviews fetch note:", error.message);
      } else if (data) {
        // Default is_approved to true if null
        const normalized = data.map((r: AdminReview) => ({
          ...r,
          is_approved: r.is_approved ?? true,
        }));
        setReviews(normalized);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (review: AdminReview) => {
    setActionLoadingId(review.id);
    const newStatus = !review.is_approved;

    try {
      const { error } = await supabase
        .from("reviews")
        .update({ is_approved: newStatus })
        .eq("id", review.id);

      if (error) {
        showToast("Failed to update status: " + error.message, "error");
      } else {
        setReviews((prev) =>
          prev.map((r) => (r.id === review.id ? { ...r, is_approved: newStatus } : r))
        );
        showToast(`Review ${newStatus ? "Approved" : "Hidden"} successfully!`);
      }
    } catch {
      showToast("Network error while updating review.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewToDelete.id);

      if (error) {
        showToast("Failed to delete review: " + error.message, "error");
      } else {
        setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
        showToast("Review deleted permanently.");
        setReviewToDelete(null);
      }
    } catch {
      showToast("Network error while deleting review.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    const pName = Array.isArray(r.products) ? r.products[0]?.name : r.products?.name || "";
    const matchesSearch =
      r.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.comment && r.comment.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "approved" && r.is_approved) ||
      (statusFilter === "pending" && !r.is_approved);

    const matchesRating =
      ratingFilter === "all" || r.rating === Number(ratingFilter);

    return matchesSearch && matchesStatus && matchesRating;
  });

  const totalReviews = reviews.length;
  const approvedCount = reviews.filter((r) => r.is_approved).length;
  const pendingCount = totalReviews - approvedCount;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / totalReviews).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-top-3 ${
            toastMsg.type === "success"
              ? "bg-emerald-950/90 border-emerald-600 text-emerald-200"
              : "bg-rose-950/90 border-rose-600 text-rose-200"
          }`}
        >
          {toastMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Customer Reviews & Moderation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
              {totalReviews} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage customer feedback, ratings, and moderate public product testimonials.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-1">
          <span className="text-xs text-slate-400 font-semibold block">Total Reviews</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-white">{totalReviews}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-1">
          <span className="text-xs text-slate-400 font-semibold block">Average Score</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-amber-400 flex items-center gap-1">
              {avgRating} <Star className="w-4 h-4 fill-amber-400" />
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-1">
          <span className="text-xs text-slate-400 font-semibold block">Approved / Live</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-400">{approvedCount}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-1">
          <span className="text-xs text-slate-400 font-semibold block">Pending / Hidden</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-purple-400">{pendingCount}</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Search reviews by customer or product"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, product, or keywords..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === "all"
                  ? "bg-brand-primary text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === "approved"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === "pending"
                  ? "bg-purple-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Hidden
            </button>
          </div>

          {/* Rating Dropdown */}
          <select
            aria-label="Filter by star rating"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-brand-primary cursor-pointer"
          >
            <option value="all">All Ratings (⭐ 1-5)</option>
            <option value="5">5 Stars only</option>
            <option value="4">4 Stars only</option>
            <option value="3">3 Stars only</option>
            <option value="2">2 Stars only</option>
            <option value="1">1 Star only</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            <p className="text-xs">Loading customer reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No reviews found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all" || ratingFilter !== "all"
                ? "No customer reviews match your active filter criteria."
                : "Customer reviews will appear here once submitted on product pages."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Rating & Review</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredReviews.map((rev) => {
                  const productObj = Array.isArray(rev.products)
                    ? rev.products[0]
                    : rev.products;
                  const productName = productObj?.name || `Product #${rev.product_id}`;
                  const productSlug = productObj?.slug || "";

                  return (
                    <tr key={rev.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                            {rev.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-100 block">{rev.user_name}</span>
                            <span className="text-[10px] text-slate-500">Verified Buyer</span>
                          </div>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="px-5 py-4">
                        {productSlug ? (
                          <Link
                            href={`/products/${productSlug}`}
                            target="_blank"
                            className="font-medium text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 max-w-xs truncate"
                          >
                            <span className="truncate">{productName}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </Link>
                        ) : (
                          <span className="font-medium text-slate-400">{productName}</span>
                        )}
                      </td>

                      {/* Rating & Content */}
                      <td className="px-5 py-4 max-w-sm">
                        <div className="space-y-1">
                          {/* Stars */}
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= rev.rating
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-slate-700"
                                }`}
                              />
                            ))}
                            <span className="text-[11px] font-bold text-slate-300 ml-1">
                              {rev.rating}.0
                            </span>
                          </div>

                          {rev.title && (
                            <h4 className="font-bold text-slate-200 text-xs">{rev.title}</h4>
                          )}
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            &ldquo;{rev.comment}&rdquo;
                          </p>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 whitespace-nowrap text-[11px] text-slate-400">
                        {rev.created_at
                          ? new Date(rev.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recently"}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            rev.is_approved
                              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                              : "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                          }`}
                        >
                          {rev.is_approved ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approved</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Hidden</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                        {/* Toggle Approval Button */}
                        <button
                          onClick={() => handleToggleApproval(rev)}
                          disabled={actionLoadingId === rev.id}
                          aria-label={rev.is_approved ? "Hide Review" : "Approve Review"}
                          title={rev.is_approved ? "Hide from public store" : "Approve & Show on store"}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            rev.is_approved
                              ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white"
                          }`}
                        >
                          {actionLoadingId === rev.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                          ) : rev.is_approved ? (
                            "Hide"
                          ) : (
                            "Approve"
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setReviewToDelete(rev)}
                          aria-label={`Delete review by ${rev.user_name}`}
                          title="Delete review permanently"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer inline-flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Review Deletion */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">Delete Customer Review?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to permanently remove this review by{" "}
                <strong className="text-white">{reviewToDelete.user_name}</strong>? This action
                cannot be undone.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 italic">
              &ldquo;{reviewToDelete.comment}&rdquo;
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setReviewToDelete(null)}
                disabled={deleting}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
