"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { formatBDT } from "@/utils/formatters";
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  Plus,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Clock,
  Layers,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { DbProduct } from "@/types";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    productsCount: 0,
    usersCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
    todayOrdersCount: 0,
    todayRevenue: 0,
    pendingOrdersCount: 0,
    weekSales: 0,
    lowStockCount: 0,
  });
  const [recentProducts, setRecentProducts] = useState<DbProduct[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // Dates calculation
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // 1. Total Products & Low Stock
      const { count: prodCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      const { count: lowStockCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .lt("stock", 5);

      // 2. Users / Profiles
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // 3. Orders analytics
      let totalOrdersCount = 0;
      let totalRevenue = 0;
      let todayOrdersCount = 0;
      let todayRevenue = 0;
      let pendingOrdersCount = 0;
      let weekSales = 0;

      const { data: allOrders, count: ordCount } = await supabase
        .from("orders")
        .select("total_amount, status, created_at", { count: "exact" });

      totalOrdersCount = ordCount || 0;

      if (allOrders && allOrders.length > 0) {
        for (const order of allOrders) {
          const amount = Number(order.total_amount) || 0;
          const status = (order.status || "").toLowerCase();
          const isSuccessful = status !== "cancelled" && status !== "returned";

          if (isSuccessful) {
            totalRevenue += amount;
          }

          if (status === "pending") {
            pendingOrdersCount += 1;
          }

          if (order.created_at >= todayStart) {
            todayOrdersCount += 1;
            if (isSuccessful) {
              todayRevenue += amount;
            }
          }

          if (order.created_at >= sevenDaysAgo && isSuccessful) {
            weekSales += amount;
          }
        }
      }

      setStats({
        productsCount: prodCount ?? 0,
        usersCount: userCount ?? 0,
        ordersCount: totalOrdersCount,
        totalRevenue,
        todayOrdersCount,
        todayRevenue,
        pendingOrdersCount,
        weekSales,
        lowStockCount: lowStockCount ?? 0,
      });

      // 4. Recent 5 Products
      const { data: prodsData, error: recentErr } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentErr) {
        const { data: rawProds } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentProducts(rawProds || []);
      } else {
        setRecentProducts(prodsData || []);
      }
    } catch (err: unknown) {
      console.error("Dashboard fetch error:", err);
      setErrorMsg("Failed to load dashboard statistics. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time analytics, daily revenue & inventory status for MSI MOBILE.COM
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/products/new"
            className="bg-brand-primary hover:bg-brand-primary-dark active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Low Stock Alert Box / Summary Banner */}
      {!loading && stats.lowStockCount > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>Inventory Alert:</span>
                <span className="text-amber-400 font-black">
                  {stats.lowStockCount} Product{stats.lowStockCount > 1 ? "s" : ""} Running Low
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                These items have less than 5 units left in stock. Review inventory and restock promptly.
              </p>
            </div>
          </div>

          <Link
            href="/admin/products?stock=low"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold rounded-xl text-xs transition-all whitespace-nowrap"
          >
            <span>Review Low Stock Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Today's Orders */}
        <Link
          href="/admin/orders"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-blue-500/40 transition-colors flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-400 transition-colors">
              Today&apos;s Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? "..." : stats.todayOrdersCount}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-blue-400 font-semibold mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Created Today</span>
            </div>
          </div>
        </Link>

        {/* Card 2: Today's Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today&apos;s Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {loading ? "..." : formatBDT(stats.todayRevenue)}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-1">
              <span>Non-cancelled orders</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Orders */}
        <Link
          href="/admin/orders?status=pending"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-amber-500/40 transition-colors flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-400 transition-colors">
              Pending Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {loading ? "..." : stats.pendingOrdersCount}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold mt-1">
              <span>Action required</span>
            </div>
          </div>
        </Link>

        {/* Card 4: This Week's Sales */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              7-Day Total Sales
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? "..." : formatBDT(stats.weekSales)}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-purple-400 font-semibold mt-1">
              <span>Last 7 days volume</span>
            </div>
          </div>
        </div>

        {/* Card 5: Total Products & Low Stock */}
        <Link
          href="/admin/products"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-blue-500/40 transition-colors flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">
              Total Catalog Products
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? "..." : stats.productsCount}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold mt-1">
              {stats.lowStockCount > 0 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{stats.lowStockCount} low on stock</span>
                </>
              ) : (
                <span className="text-emerald-400">All in healthy stock</span>
              )}
            </div>
          </div>
        </Link>

        {/* Card 6: All-time Total Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              All-Time Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-teal-400">
              {loading ? "..." : formatBDT(stats.totalRevenue)}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-1">
              <span>{stats.ordersCount} total orders placed</span>
            </div>
          </div>
        </div>

        {/* Card 7: Registered Customers */}
        <Link
          href="/admin/customers"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-emerald-500/40 transition-colors flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-400 transition-colors">
              Customers &amp; Profiles
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? "..." : stats.usersCount}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-1">
              <span>View customer directory →</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Products Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-primary" />
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              Recent Products in Database
            </h2>
          </div>

          <Link
            href="/admin/products"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Loading recent products from database...
          </div>
        ) : recentProducts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl space-y-3">
            <Package className="w-12 h-12 text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No products found in catalog</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your store product catalog is currently empty. Click the button below to add your first smartphone, laptop, or gadget!
            </p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Product</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shrink-0 flex items-center justify-center">
                          {p.images?.[0] ? (
                            <Image
                              src={p.images[0]}
                              alt={p.name}
                              fill
                              className="object-contain p-1"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate max-w-xs">{p.name}</p>
                          <span className="text-[10px] text-slate-500">
                            {p.slug || "no-slug"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-semibold uppercase">
                      {p.brand || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-400">
                      {formatBDT(p.price || 0)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          (p.stock || 0) > 10
                            ? "bg-emerald-500/10 text-emerald-400"
                            : (p.stock || 0) > 0
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {p.stock ?? 0} in stock
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 mr-3"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
