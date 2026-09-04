"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatBDT } from "@/utils/formatters";
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Truck,
  User,
  Phone,
  Mail,
  MapPin,
  Save,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Printer,
} from "lucide-react";

interface OrderItem {
  id?: string | number;
  name?: string;
  title?: string;
  price?: number;
  quantity?: number;
}

interface OrderRow {
  id: string | number;
  order_number?: string;
  user_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: Record<string, unknown> | string;
  items?: OrderItem[];
  total_amount: number;
  payment_method?: string;
  payment_status?: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "returned"
    | string;
  created_at: string;
}

const PAGE_SIZE = 25;

function AdminOrdersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL search params
  const initialStatus = searchParams.get("status") || "all";
  const initialSearch = searchParams.get("q") || "";
  const initialFrom = searchParams.get("from") || "";
  const initialTo = searchParams.get("to") || "";
  const initialPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Modals & Single Status Update
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [editStatusOrder, setEditStatusOrder] = useState<OrderRow | null>(null);
  const [newStatus, setNewStatus] = useState<string>("pending");
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>("unpaid");
  const [statusLoading, setStatusLoading] = useState(false);

  // Bulk Selection States
  const [selectedOrderIds, setSelectedOrderIds] = useState<(string | number)[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("confirmed");
  const [bulkPaymentStatus, setBulkPaymentStatus] = useState<string>("unpaid");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync state to URL params
  const updateUrlParams = useCallback(
    (params: { q?: string; status?: string; from?: string; to?: string; page?: number }) => {
      const sp = new URLSearchParams();
      const q = params.q !== undefined ? params.q : searchQuery;
      const status = params.status !== undefined ? params.status : statusFilter;
      const from = params.from !== undefined ? params.from : fromDate;
      const to = params.to !== undefined ? params.to : toDate;
      const page = params.page !== undefined ? params.page : currentPage;

      if (q.trim()) sp.set("q", q.trim());
      if (status && status !== "all") sp.set("status", status);
      if (from) sp.set("from", from);
      if (to) sp.set("to", to);
      if (page > 1) sp.set("page", String(page));

      const queryStr = sp.toString();
      router.replace(`${pathname}${queryStr ? `?${queryStr}` : ""}`, { scroll: false });
    },
    [router, pathname, searchQuery, statusFilter, fromDate, toDate, currentPage]
  );

  // Direct Supabase Server Query with Filters & Pagination
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("orders")
        .select("*", { count: "exact" });

      // 1. Status filter (all 8 enum values)
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      // 2. Date Range filters
      if (fromDate) {
        const startIso = new Date(`${fromDate}T00:00:00.000Z`).toISOString();
        query = query.gte("created_at", startIso);
      }
      if (toDate) {
        const endIso = new Date(`${toDate}T23:59:59.999Z`).toISOString();
        query = query.lte("created_at", endIso);
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        const isNum = !isNaN(Number(q)) && !q.includes("-");
        if (isNum) {
          query = query.or(
            `order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%,customer_email.ilike.%${q}%,id.eq.${q}`
          );
        } else {
          query = query.or(
            `order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%,customer_email.ilike.%${q}%`
          );
        }
      }

      // 4. Pagination
      const fromIndex = (currentPage - 1) * PAGE_SIZE;
      const toIndex = fromIndex + PAGE_SIZE - 1;

      query = query
        .order("created_at", { ascending: false })
        .range(fromIndex, toIndex);

      const { data, count, error } = await query;

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setOrders(data || []);
      setTotalCount(count || 0);
    } catch (err: unknown) {
      console.error("Orders server fetch error:", err);
      showToast("Failed to load customer orders. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, fromDate, toDate, searchQuery, currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      updateUrlParams({ q: searchQuery, page: 1 });
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery, updateUrlParams]);

  // Handle Filter Changes
  const handleStatusFilterChange = (newStatusVal: string) => {
    setStatusFilter(newStatusVal);
    setCurrentPage(1);
    updateUrlParams({ status: newStatusVal, page: 1 });
  };

  const handleFromDateChange = (date: string) => {
    setFromDate(date);
    setCurrentPage(1);
    updateUrlParams({ from: date, page: 1 });
  };

  const handleToDateChange = (date: string) => {
    setToDate(date);
    setCurrentPage(1);
    updateUrlParams({ to: date, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
    router.replace(pathname, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateUrlParams({ page: newPage });
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  // Bulk Selection Handlers
  const allFilteredSelected =
    orders.length > 0 && orders.every((o) => selectedOrderIds.includes(o.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      const currentIds = new Set(orders.map((o) => o.id));
      setSelectedOrderIds((prev) => prev.filter((id) => !currentIds.has(id)));
    } else {
      const currentIds = orders.map((o) => o.id);
      setSelectedOrderIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleToggleSelectOne = (id: string | number) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkUpdate = async () => {
    if (selectedOrderIds.length === 0) return;
    setBulkLoading(true);

    // Optimistic UI update
    const previousOrders = [...orders];
    setOrders((prev) =>
      prev.map((o) =>
        selectedOrderIds.includes(o.id)
          ? { ...o, status: bulkStatus, payment_status: bulkPaymentStatus }
          : o
      )
    );

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/admin/orders/bulk-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: session?.access_token ? `Bearer ${session.access_token}` : "",
        },
        body: JSON.stringify({
          orderIds: selectedOrderIds,
          status: bulkStatus,
          payment_status: bulkPaymentStatus,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || "Bulk status update failed.");
      }

      showToast(`Successfully updated ${selectedOrderIds.length} order(s) to ${bulkStatus}.`);
      setSelectedOrderIds([]);
      fetchOrders();
    } catch (err: unknown) {
      console.error("Bulk update error:", err);
      // Revert optimistic update
      setOrders(previousOrders);
      const msg = err instanceof Error ? err.message : "Failed to update orders in batch.";
      showToast(msg, "error");
    } finally {
      setBulkLoading(false);
    }
  };

  // Single Order Status Update
  const handleOpenStatusModal = (order: OrderRow) => {
    setEditStatusOrder(order);
    setNewStatus(order.status || "pending");
    setNewPaymentStatus(order.payment_status || "unpaid");
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStatusOrder) return;

    setStatusLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`/api/admin/orders/${editStatusOrder.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: session?.access_token ? `Bearer ${session.access_token}` : "",
        },
        body: JSON.stringify({
          status: newStatus,
          payment_status: newPaymentStatus,
          tracking_note: `Fulfillment status changed to ${newStatus} (${newPaymentStatus}) by Administrator`,
        }),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        throw new Error(resData.message || "Failed to update order status via admin API.");
      }

      showToast(`Order #${editStatusOrder.id} status updated to ${newStatus}.`);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === editStatusOrder.id
            ? { ...o, status: newStatus, payment_status: newPaymentStatus }
            : o
        )
      );
      setEditStatusOrder(null);
    } catch (err: unknown) {
      console.error("Update status error:", err);
      const msg = err instanceof Error ? err.message : "Failed to update order status.";
      showToast(msg, "error");
    } finally {
      setStatusLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "shipped":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
      case "out_for_delivery":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "confirmed":
        return "bg-teal-500/15 text-teal-400 border-teal-500/30";
      case "processing":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "cancelled":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "returned":
        return "bg-orange-500/15 text-orange-400 border-orange-500/30";
      case "pending":
      default:
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    }
  };

  const isFilterActive =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    fromDate !== "" ||
    toDate !== "";

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
            Orders & Shipments
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track customer checkouts, SSLCOMMERZ payments, and delivery fulfillment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (Visible when ≥1 order is selected) */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-gradient-to-r from-blue-950/90 to-slate-900 border border-blue-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="font-extrabold text-xs text-blue-400 bg-blue-500/20 px-3 py-1.5 rounded-xl border border-blue-500/30">
              {selectedOrderIds.length} Order{selectedOrderIds.length > 1 ? "s" : ""} Selected
            </span>
            <span className="text-xs text-slate-300 hidden md:inline">
              Choose bulk order updates:
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="px-3.5 py-2 bg-slate-950 border border-slate-700 focus:border-brand-primary rounded-xl text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>

            <select
              value={bulkPaymentStatus}
              onChange={(e) => setBulkPaymentStatus(e.target.value)}
              className="px-3.5 py-2 bg-slate-950 border border-slate-700 focus:border-brand-primary rounded-xl text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="unpaid">Payment Unpaid</option>
              <option value="paid">Payment Paid</option>
              <option value="refunded">Payment Refunded</option>
            </select>

            <button
              onClick={handleBulkUpdate}
              disabled={bulkLoading}
              className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60 shadow-md"
            >
              {bulkLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Apply Updates</span>
                </>
              )}
            </button>

            <button
              onClick={() => setSelectedOrderIds([])}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
              title="Deselect All"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Advanced Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Name, Phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-brand-primary rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Status Dropdown (8 real enum values) */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-brand-primary rounded-xl text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Order Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          {/* From Date */}
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => handleFromDateChange(e.target.value)}
              title="From Date"
              className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 focus:border-brand-primary rounded-xl text-xs text-white focus:outline-none [color-scheme:dark]"
            />
          </div>

          {/* To Date */}
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="date"
              value={toDate}
              onChange={(e) => handleToDateChange(e.target.value)}
              title="To Date"
              className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 focus:border-brand-primary rounded-xl text-xs text-white focus:outline-none [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Filter Stats & Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
          <div className="text-slate-400 font-medium">
            Found <strong className="text-white">{totalCount}</strong> matching order{totalCount !== 1 ? "s" : ""}
          </div>

          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-primary" />
            <p>Fetching orders from database...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 space-y-3 px-4">
            <ShoppingCart className="w-12 h-12 text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">
              {isFilterActive ? "No matching orders found" : "No orders in database yet"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isFilterActive
                ? "Try adjusting your search query, status dropdown, or date filters."
                : "When customers complete checkouts, their orders will appear here automatically."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all orders"
                      checked={allFilteredSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-brand-primary accent-blue-600 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Fulfillment</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`transition-colors ${
                      selectedOrderIds.includes(order.id)
                        ? "bg-blue-950/30 hover:bg-blue-950/40"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4 w-10">
                      <input
                        type="checkbox"
                        aria-label={`Select order #${order.id}`}
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={() => handleToggleSelectOne(order.id)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-brand-primary accent-blue-600 cursor-pointer"
                      />
                    </td>

                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white text-xs">
                      {order.order_number || `#${order.id}`}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">
                          {order.customer_name || "Guest Customer"}
                        </p>
                        <span className="text-[11px] text-slate-500 truncate block">
                          {order.customer_email || order.customer_phone || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-bold text-blue-400">
                      {formatBDT(order.total_amount || 0)}
                    </td>

                    {/* Payment */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-slate-300">
                          {order.payment_method || "COD"}
                        </span>
                        <span
                          className={`inline-block text-[9px] font-extrabold uppercase ${
                            order.payment_status === "paid" ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {order.payment_status || "unpaid"}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/orders/${order.id}/invoice`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Print Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="View Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenStatusModal(order)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Update Status"
                        >
                          <Truck className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Server Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Showing{" "}
              <strong className="text-white">{(currentPage - 1) * PAGE_SIZE + 1}</strong> to{" "}
              <strong className="text-white">
                {Math.min(currentPage * PAGE_SIZE, totalCount)}
              </strong>{" "}
              of <strong className="text-white">{totalCount}</strong> orders
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-brand-primary" />
                <h3 className="text-base font-bold text-white">Order Details #{selectedOrder.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Info Box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>{selectedOrder.customer_name || "Guest Customer"}</span>
              </div>
              {selectedOrder.customer_email && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{selectedOrder.customer_email}</span>
                </div>
              )}
              {selectedOrder.customer_phone && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedOrder.customer_phone}</span>
                </div>
              )}
              {selectedOrder.shipping_address && (
                <div className="flex items-start gap-2 text-slate-400 pt-1 border-t border-slate-800 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    {typeof selectedOrder.shipping_address === "string"
                      ? selectedOrder.shipping_address
                      : JSON.stringify(selectedOrder.shipping_address)}
                  </span>
                </div>
              )}
            </div>

            {/* Items Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Purchased Products
              </h4>
              {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                <div className="space-y-2">
                  {selectedOrder.items.map((item: OrderItem, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{item.name || item.title || "Product Item"}</p>
                        <span className="text-[10px] text-slate-400">Qty: {item.quantity || 1}</span>
                      </div>
                      <span className="font-bold text-blue-400">
                        {formatBDT(item.price || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No item list payload recorded</p>
              )}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-extrabold text-white">
              <span>Total Gross Amount</span>
              <span className="text-blue-400 text-base">{formatBDT(selectedOrder.total_amount)}</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href={`/admin/orders/${selectedOrder.id}/invoice`}
                target="_blank"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </Link>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Status Modal */}
      {editStatusOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-primary" />
                <span>Update Order #{editStatusOrder.id}</span>
              </h3>
              <button
                onClick={() => setEditStatusOrder(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Fulfillment Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-white focus:outline-none cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Payment Status
                </label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-white focus:outline-none cursor-pointer"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditStatusOrder(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusLoading}
                  className="flex-1 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {statusLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-20 text-slate-400 text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
          <span>Loading orders dashboard...</span>
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
