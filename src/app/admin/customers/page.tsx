"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { formatBDT } from "@/utils/formatters";
import {
  Users,
  Search,
  RefreshCw,
  Phone,
  Mail,
  ShoppingCart,
  TrendingUp,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CustomerRow {
  customer_phone: string;
  customer_name: string | null;
  customer_email: string | null;
  total_orders: number;
  total_spent: number;
  last_order_at: string;
  first_order_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 25;

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ── Debounce search input ──────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Fetch from admin_customers view ───────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("admin_customers")
        .select("*", { count: "exact" })
        .order("total_spent", { ascending: false })
        .range(from, to);

      // Apply search filter across name and phone
      if (debouncedQuery) {
        query = query.or(
          `customer_name.ilike.%${debouncedQuery}%,customer_phone.ilike.%${debouncedQuery}%`
        );
      }

      const { data, count, error: dbErr } = await query;

      if (dbErr) {
        // View may not exist yet — fall back to manual grouping from orders
        if (
          dbErr.code === "42P01" || // relation does not exist
          dbErr.message?.includes("admin_customers")
        ) {
          // ── Inline fallback: group client-side from orders ─────────────
          try {
            const { data: ordersData, error: ordErr } = await supabase
              .from("orders")
              .select("customer_phone, customer_name, customer_email, total_amount, created_at")
              .not("customer_phone", "is", null)
              .neq("customer_phone", "");

            if (ordErr) throw ordErr;

            // Group by phone
            const map = new Map<string, CustomerRow>();
            for (const o of ordersData || []) {
              const phone = o.customer_phone as string;
              if (!phone) continue;
              const existing = map.get(phone);
              if (existing) {
                existing.total_orders += 1;
                existing.total_spent += Number(o.total_amount) || 0;
                if (o.created_at > existing.last_order_at) {
                  existing.last_order_at = o.created_at;
                  existing.customer_name = o.customer_name ?? existing.customer_name;
                  existing.customer_email = o.customer_email ?? existing.customer_email;
                }
                if (o.created_at < existing.first_order_at) {
                  existing.first_order_at = o.created_at;
                }
              } else {
                map.set(phone, {
                  customer_phone: phone,
                  customer_name: o.customer_name,
                  customer_email: o.customer_email,
                  total_orders: 1,
                  total_spent: Number(o.total_amount) || 0,
                  last_order_at: o.created_at,
                  first_order_at: o.created_at,
                });
              }
            }

            let results = Array.from(map.values()).sort((a, b) => b.total_spent - a.total_spent);

            // Filter
            if (debouncedQuery) {
              const q = debouncedQuery.toLowerCase();
              results = results.filter(
                (c) =>
                  c.customer_phone.includes(q) ||
                  (c.customer_name || "").toLowerCase().includes(q)
              );
            }

            setTotalCount(results.length);
            setCustomers(results.slice(from, to + 1));
          } catch (fallbackErr: unknown) {
            const msg = fallbackErr instanceof Error ? fallbackErr.message : "Failed to load customers from orders.";
            setError(msg);
          } finally {
            setLoading(false);
          }
          return;
        }
        throw dbErr;
      }

      setCustomers((data as CustomerRow[]) || []);
      setTotalCount(count ?? 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load customers.";
      setError(msg);
      console.error("Customers fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const isFilterActive = debouncedQuery !== "";

  const handleReset = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-brand-primary" />
            Customers
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            All customers grouped by phone — including guest checkouts.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Failed to load customers</p>
            <p className="text-slate-400 mt-0.5">{error}</p>
            <p className="text-slate-500 mt-1">
              Make sure the <code className="bg-slate-800 px-1 rounded">admin_customers</code> view is created in Supabase
              (run the migration in <code className="bg-slate-800 px-1 rounded">supabase/migrations/20260907_admin_customers_view.sql</code>).
            </p>
          </div>
        </div>
      )}

      {/* ── Search / Filter Bar ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or phone number..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-brand-primary rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {isFilterActive && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer transition-colors px-3 py-2 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-3 text-xs text-slate-400">
          <span>
            Found{" "}
            <strong className="text-white">{totalCount}</strong> unique customer
            {totalCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Customers Table ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-primary" />
            <p>Grouping customers from orders...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 space-y-3 px-4">
            <Users className="w-12 h-12 text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">
              {isFilterActive ? "No matching customers" : "No customer data yet"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isFilterActive
                ? "Try a different name or phone number."
                : "Customers will appear here once orders are placed."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4 text-center">Orders</th>
                  <th className="py-3.5 px-4 text-right">Total Spent</th>
                  <th className="py-3.5 px-4">First Order</th>
                  <th className="py-3.5 px-4">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customers.map((customer) => (
                  <tr
                    key={customer.customer_phone}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Name + Email */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-600/30 text-blue-400 font-black text-xs flex items-center justify-center shrink-0 uppercase">
                          {(customer.customer_name || customer.customer_phone)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate max-w-[180px]">
                            {customer.customer_name || (
                              <span className="text-slate-500 italic font-normal">Unknown</span>
                            )}
                          </p>
                          {customer.customer_email && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px]">
                              <Mail className="w-3 h-3 shrink-0" />
                              {customer.customer_email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1.5 font-mono text-slate-300 text-[11px]">
                        <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                        {customer.customer_phone}
                      </span>
                    </td>

                    {/* Total Orders */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <ShoppingCart className="w-3 h-3" />
                        {customer.total_orders}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="py-3.5 px-4 text-right">
                      <div>
                        <span className="font-extrabold text-emerald-400 text-xs">
                          {formatBDT(customer.total_spent)}
                        </span>
                        {customer.total_orders > 1 && (
                          <span className="block text-[10px] text-slate-500 mt-0.5">
                            avg {formatBDT(Math.round(customer.total_spent / customer.total_orders))}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* First Order */}
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock className="w-3 h-3 shrink-0" />
                        {formatDate(customer.first_order_at)}
                      </span>
                    </td>

                    {/* Last Order */}
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <TrendingUp className="w-3 h-3 shrink-0 text-emerald-500" />
                        {formatDate(customer.last_order_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Showing{" "}
              <strong className="text-white">
                {(currentPage - 1) * PAGE_SIZE + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-white">
                {Math.min(currentPage * PAGE_SIZE, totalCount)}
              </strong>{" "}
              of <strong className="text-white">{totalCount}</strong> customers
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
    </div>
  );
}
