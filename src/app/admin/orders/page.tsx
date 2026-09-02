"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  user_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: Record<string, unknown> | string;
  items?: OrderItem[];
  total_amount: number;
  payment_method?: string;
  payment_status?: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | string;
  created_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [editStatusOrder, setEditStatusOrder] = useState<OrderRow | null>(null);
  const [newStatus, setNewStatus] = useState<string>("pending");
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>("unpaid");
  const [statusLoading, setStatusLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error && error.code !== "PGRST116") {
        throw error;
      }
      setOrders(data || []);
    } catch (err: unknown) {
      console.error("Orders fetch error:", err);
      const msg = err instanceof Error ? err.message : "Failed to load orders from Supabase.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          payment_status: newPaymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editStatusOrder.id);

      if (error) throw error;

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

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      String(o.id).toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q) ||
      o.customer_phone?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "shipped":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
      case "processing":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "cancelled":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "pending":
      default:
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    }
  };

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
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Name, Email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700 focus:border-brand-primary rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-700 focus:border-brand-primary rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="all">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-semibold">
          Showing <strong className="text-white">{filteredOrders.length}</strong> of{" "}
          <strong className="text-white">{orders.length}</strong> orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-primary" />
            <p>Loading orders from database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 space-y-3 px-4">
            <ShoppingCart className="w-12 h-12 text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">
              {searchQuery || statusFilter !== "all" ? "No matching orders found" : "No orders in database yet"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When customers complete checkouts through SSLCOMMERZ or Cash on Delivery, their orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
                <tr>
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
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      #{order.id}
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
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenStatusModal(order)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
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
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
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
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
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

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Close
            </button>
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
              <button onClick={() => setEditStatusOrder(null)} className="text-slate-400 hover:text-white">
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
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-white focus:outline-none"
                >
                  <option value="pending">Pending (Awaiting Verification)</option>
                  <option value="processing">Processing (Packaging in Warehouse)</option>
                  <option value="shipped">Shipped (Dispatched with Courier)</option>
                  <option value="delivered">Delivered (Completed)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Payment Status
                </label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-white focus:outline-none"
                >
                  <option value="unpaid">Unpaid (Awaiting Cash or Gateway)</option>
                  <option value="paid">Paid (Verified in bKash/Nagad/SSLCOMMERZ)</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditStatusOrder(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusLoading}
                  className="flex-1 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-60"
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
